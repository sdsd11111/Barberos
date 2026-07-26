import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPremiumAccess } from "@/lib/plan-guard";

/**
 * GET /api/motor/snapshot
 *
 * Devuelve el último MotorSnapshot calculado para la barbería autenticada.
 * Solo accesible para barberías PREMIUM.
 *
 * El Dashboard de IA consume este endpoint — nunca lee directamente las tablas
 * de visitas o clientes (Regla arquitectónica del Motor, doc 19).
 */
export async function GET(request: NextRequest) {
  const barbershopId = request.headers.get("x-barbershop-id");
  if (!barbershopId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // 🔒 GATE DE PLAN — El Motor solo existe en PREMIUM
  const guard = await checkPremiumAccess(barbershopId);
  if (guard) return guard;

  // Obtener el snapshot más reciente para esta barbería
  const snapshot = await prisma.motorSnapshot.findFirst({
    where: { barbershopId },
    orderBy: { calculatedAt: "desc" },
  });

  if (!snapshot) {
    return NextResponse.json(
      {
        available: false,
        message: "El Motor aún no ha calculado datos para esta barbería. El primer cálculo se ejecuta a las 3am.",
        calculatedAt: null,
      },
      { status: 200 }
    );
  }

  // Parsear los campos JSON
  const visitsByHour = snapshot.visitsByHour
    ? JSON.parse(snapshot.visitsByHour)
    : {};
  const staffMetrics = snapshot.staffMetrics
    ? JSON.parse(snapshot.staffMetrics)
    : [];

  return NextResponse.json({
    available: true,
    barbershopId: snapshot.barbershopId,
    calculatedAt: snapshot.calculatedAt,
    snapshotDate: snapshot.snapshotDate,
    // Dimensión Negocio
    totalVisitsApproved: snapshot.totalVisitsApproved,
    totalAnonymousVisits: snapshot.totalAnonymousVisits,
    visitsByHour,
    // Dimensión Clientes
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
    // Dimensión Equipo
    staffMetrics,
  });
}
