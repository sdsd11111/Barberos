import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPremiumAccess } from "@/lib/plan-guard";
import { generateDirectorRecommendations, MotorSnapshotData } from "@/lib/director-ai";
import { calculateScheduleGaps } from "@/lib/motor";

/**
 * GET /api/director/recommendations
 *
 * Endpoint del Director IA.
 * Consume el último MotorSnapshot y devuelve recomendaciones accionables en JSON.
 * Solo disponible para barberías PREMIUM.
 */
export async function GET(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 🔒 GATE DE PLAN — El Director IA solo existe en PREMIUM
    const guard = await checkPremiumAccess(barbershopId);
    if (guard) return guard;

    // Obtener el snapshot más reciente
    const snapshot = await prisma.motorSnapshot.findFirst({
      where: { barbershopId },
      orderBy: { calculatedAt: "desc" },
    });

    if (!snapshot) {
      return NextResponse.json({
        available: false,
        message: "El Director IA requiere que el Motor haya calculado su primer snapshot.",
        recommendations: [],
      });
    }

    // Obtener perfiles críticos (en riesgo o atrasados) con sus contextos del Motor
    const atRiskContexts = await prisma.profileMotorContext.findMany({
      where: {
        barbershopId,
        riskLevel: { in: ["AT_RISK", "DELAYED"] },
      },
      take: 5,
      include: {
        profile: {
          include: {
            customer: true,
          },
        },
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

    // Calcular huecos horarios en tiempo real
    const barbershopConfig = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: { visitDurationMin: true, staff: { select: { id: true } } },
    });

    let scheduleGaps: ReturnType<typeof calculateScheduleGaps> = [];
    if (barbershopConfig?.visitDurationMin) {
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const customerIds = await prisma.barberCustomer.findMany({
        where: { barbershopId },
        select: { id: true },
      });
      const recentVisits = await prisma.barberVisit.findMany({
        where: {
          customerId: { in: customerIds.map(c => c.id) },
          createdAt: { gte: fourteenDaysAgo },
          status: "APPROVED",
        },
        select: { createdAt: true, status: true, checkinMethod: true, staffId: true },
      });
      scheduleGaps = calculateScheduleGaps(
        recentVisits,
        barbershopConfig.visitDurationMin,
        barbershopConfig.staff.length
      );
    }

    // Formatear payload para el Director IA
    const snapshotData: MotorSnapshotData = {
      barbershopId: snapshot.barbershopId,
      calculatedAt: snapshot.calculatedAt,
      snapshotDate: snapshot.snapshotDate,
      totalVisitsApproved: snapshot.totalVisitsApproved,
      totalAnonymousVisits: snapshot.totalAnonymousVisits,
      visitsByHour: snapshot.visitsByHour ? JSON.parse(snapshot.visitsByHour) : {},
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
      staffMetrics: snapshot.staffMetrics ? JSON.parse(snapshot.staffMetrics) : [],
      criticalProfiles,
      scheduleGaps,
    };

    const directorResult = await generateDirectorRecommendations(snapshotData);

    return NextResponse.json({
      available: true,
      calculatedAt: snapshot.calculatedAt,
      isGenerativeLLM: directorResult.isGenerativeLLM,
      modelUsed: directorResult.modelUsed,
      recommendations: directorResult.recommendations,
    });
  } catch (error) {
    console.error("[Director IA API Error]:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al consultar el Director IA" },
      { status: 500 }
    );
  }
}
