import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runMotorForBarbershop, persistMotorResults } from "@/lib/motor";
import type { ProfileFrequency } from "@/lib/motor";
import { generateDirectorRecommendations, MotorSnapshotData } from "@/lib/director-ai";
import webpush from "web-push";

// Configurar llaves VAPID para notificaciones push PWA
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:soporte@barberos.app";

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET || "cron_secret_desarrollo_local";
  const authHeader = request.headers.get("Authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;
  const urlSecret = request.nextUrl.searchParams.get("secret");
  if (urlSecret === cronSecret) return true;
  return false;
}

async function runMotorCron() {
  const startTime = Date.now();
  console.log("[Motor Cron] Iniciando cálculo nocturno del Motor de Conocimiento...");

  // 1. Obtener todas las barberías con plan PREMIUM activo
  // (El Motor es una feature Premium — solo se ejecuta para ellas)
  const barbershops = await prisma.barbershop.findMany({
    where: {
      planType: "PREMIUM",
      planStatus: { in: ["ACTIVE", "TRIAL"] },
    },
    select: { id: true, name: true },
  });

  console.log(`[Motor Cron] Barberías Premium encontradas: ${barbershops.length}`);

  const results: {
    barbershopId: string;
    name: string;
    status: "ok" | "error";
    error?: string;
    durationMs?: number;
  }[] = [];

  // 2. Procesar cada barbería de forma secuencial para no saturar la BD
  for (const barbershop of barbershops) {
    const t0 = Date.now();
    try {
      console.log(`[Motor Cron] Calculando: ${barbershop.name} (${barbershop.id})`);

      const snapshot = await runMotorForBarbershop(prisma as any, barbershop.id);

      // Calcular perfiles para persistir el contexto individual
      // (runMotorForBarbershop ya los calcula internamente; aquí recalculamos de forma
      // simplificada para persistirlos — en V2 refactorizar para que el runner los devuelva)
      const customers = await prisma.barberCustomer.findMany({
        where: { barbershopId: barbershop.id },
        include: {
          profiles: { where: { isActive: true } },
        },
      });

      const barbershopConfig = await prisma.barbershop.findUnique({
        where: { id: barbershop.id },
        select: { riskThresholdNormal: true, riskThresholdAt: true, testExclusions: true },
      });
      if (!barbershopConfig) continue;

      const excludedNumbers = new Set(
        barbershopConfig.testExclusions
          .filter((e) => !e.validUntil || new Date() < e.validUntil)
          .map((e) => e.whatsapp)
          .filter(Boolean) as string[]
      );

      const profileFrequencies: ProfileFrequency[] = [];

      for (const customer of customers) {
        if (excludedNumbers.has(customer.whatsapp)) continue;

        const customerVisits = await prisma.barberVisit.findMany({
          where: { customerId: customer.id },
          select: { createdAt: true, status: true, checkinMethod: true, profileId: true },
        });

        for (const profile of customer.profiles) {
          const profileVisits = customerVisits.filter((v) => v.profileId === profile.id);
          const visitsToUse =
            profileVisits.length > 0
              ? profileVisits
              : customerVisits.filter((v) => !v.profileId);

          const now = new Date();
          const validDates = visitsToUse
            .filter((v) => v.status === "APPROVED" && v.checkinMethod !== "BARBER_ASSISTED_ANONYMOUS")
            .map((v) => v.createdAt);

          const sorted = [...validDates].sort((a, b) => a.getTime() - b.getTime());
          const window = sorted.slice(-8);
          let avgDays: number | null = null;
          if (window.length >= 3) {
            const gaps: number[] = [];
            for (let i = 1; i < window.length; i++) {
              gaps.push((window[i].getTime() - window[i - 1].getTime()) / (1000 * 60 * 60 * 24));
            }
            avgDays = Math.round((gaps.reduce((s, g) => s + g, 0) / gaps.length) * 10) / 10;
          }

          const daysSinceLast = customer.lastVisitAt
            ? Math.floor((now.getTime() - customer.lastVisitAt.getTime()) / (1000 * 60 * 60 * 24))
            : null;

          const isContextSuppressed = profile.notesValidUntil ? now < profile.notesValidUntil : false;

          let riskLevel: ProfileFrequency["riskLevel"] = "INSUFFICIENT_DATA";
          if (!isContextSuppressed && avgDays !== null && daysSinceLast !== null) {
            const ratio = daysSinceLast / avgDays;
            if (ratio <= barbershopConfig.riskThresholdNormal) riskLevel = "NORMAL";
            else if (ratio <= barbershopConfig.riskThresholdAt) riskLevel = "DELAYED";
            else riskLevel = "AT_RISK";
          } else if (isContextSuppressed) {
            riskLevel = "NORMAL";
          }

          profileFrequencies.push({
            profileId: profile.id,
            avgDaysBetweenVisits: avgDays,
            daysSinceLastVisit: daysSinceLast,
            totalApprovedVisits: validDates.length,
            riskLevel,
            isContextSuppressed,
          });
        }
      }

      await persistMotorResults(prisma as any, snapshot, profileFrequencies);

      // -----------------------------------------------------------------------
      // DISPARADOR DE RECOMENDACIONES PUSH PWA DEL DIRECTOR IA
      // Se genera la recomendación principal y se envía al celular del dueño
      // -----------------------------------------------------------------------
      try {
        const atRiskContexts = await prisma.profileMotorContext.findMany({
          where: {
            barbershopId: barbershop.id,
            riskLevel: { in: ["AT_RISK", "DELAYED"] },
          },
          take: 5,
          include: {
            profile: { include: { customer: true } },
          },
          orderBy: { daysSinceLastVisit: "desc" },
        });

        const criticalProfiles = atRiskContexts.map((ctx) => ({
          profileId: ctx.profileId,
          profileName: ctx.profile.name || "Sin Nombre",
          whatsapp: ctx.profile.customer.whatsapp,
          riskLevel: ctx.riskLevel,
          avgDaysBetweenVisits: ctx.avgDaysBetweenVisits,
          daysSinceLastVisit: ctx.daysSinceLastVisit,
        }));

        const snapshotData: MotorSnapshotData = {
          barbershopId: snapshot.barbershopId,
          calculatedAt: new Date(),
          snapshotDate: new Date(),
          totalVisitsApproved: snapshot.totalVisitsApproved,
          totalAnonymousVisits: snapshot.totalAnonymousVisits,
          visitsByHour: (snapshot.visitsByHour as unknown as Record<string, number>) || {},
          profiles: {
            normal: snapshot.profilesNormal,
            delayed: snapshot.profilesDelayed,
            atRisk: snapshot.profilesAtRisk,
            insufficient: snapshot.profilesInsufficient,
            total:
              snapshot.profilesNormal +
              snapshot.profilesDelayed +
              snapshot.profilesAtRisk +
              snapshot.profilesInsufficient,
          },
          staffMetrics: (snapshot.staffMetrics || []).map((m: any) => ({
            staffId: m.id || m.staffId || "",
            staffName: m.nombre || m.name || m.staffName || "",
            totalCuts: m.cortesRealizados ?? m.totalCuts ?? 0,
            avgRating: m.promedioEstrellas ?? m.avgRating ?? null,
          })),
          criticalProfiles,
          scheduleGaps: snapshot.scheduleGaps || [],
        };

        const directorResult = await generateDirectorRecommendations(snapshotData);

        if (directorResult.recommendations && directorResult.recommendations.length > 0) {
          const topRec = directorResult.recommendations[0]; // La sugerencia más importante
          const subs = await prisma.pushSubscription.findMany({
            where: { barbershopId: barbershop.id },
          });

          if (subs.length > 0) {
            const pushPayload = JSON.stringify({
              title: `🧠 Director IA: ${topRec.title}`,
              body: topRec.description,
              url: "/panel",
            });

            subs.forEach((sub) => {
              webpush
                .sendNotification(
                  {
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth },
                  },
                  pushPayload
                )
                .catch((err) => {
                  if (err.statusCode === 410 || err.statusCode === 404) {
                    prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
                  }
                });
            });
            console.log(`[Motor Cron] 📲 Notificación Push enviada a ${subs.length} dispositivos para ${barbershop.name}`);
          }
        }
      } catch (recErr) {
        console.error(`[Motor Cron] Error generando notificaciones push del Director para ${barbershop.name}:`, recErr);
      }

      const durationMs = Date.now() - t0;
      results.push({ barbershopId: barbershop.id, name: barbershop.name, status: "ok", durationMs });
      console.log(`[Motor Cron] ✓ ${barbershop.name} — ${durationMs}ms`);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.error(`[Motor Cron] ✗ Error en ${barbershop.name}:`, error);
      results.push({ barbershopId: barbershop.id, name: barbershop.name, status: "error", error });
    }
  }

  const totalMs = Date.now() - startTime;
  const successful = results.filter((r) => r.status === "ok").length;
  const failed = results.filter((r) => r.status === "error").length;

  console.log(`[Motor Cron] Completado en ${totalMs}ms — OK: ${successful}, Errores: ${failed}`);

  return {
    success: true,
    message: `Motor completado. Barberías procesadas: ${successful}/${barbershops.length}. Tiempo: ${totalMs}ms`,
    results,
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const result = await runMotorCron();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Motor Cron] Error general:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const result = await runMotorCron();
    return NextResponse.json(result);
  } catch (error) {
    console.error("[Motor Cron] Error general:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
