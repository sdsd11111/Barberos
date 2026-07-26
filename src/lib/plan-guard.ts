/**
 * Auth Guard de Plan Premium
 *
 * Helper reutilizable para proteger endpoints del Motor y del Director IA.
 * Toda API relacionada con el Motor o con la IA DEBE llamar a checkPremiumAccess()
 * antes de procesar nada.
 *
 * Uso:
 *   const guard = await checkPremiumAccess(barbershopId);
 *   if (guard) return guard; // Devuelve 403 JSON si no es Premium
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Verifica que la barbería tiene planType === "PREMIUM" y planStatus activo.
 * Devuelve null si el acceso está permitido.
 * Devuelve un NextResponse 403 si el acceso está denegado.
 */
export async function checkPremiumAccess(
  barbershopId: string
): Promise<NextResponse | null> {
  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
    select: { planType: true, planStatus: true, name: true },
  });

  if (!barbershop) {
    return NextResponse.json(
      { error: "Barbería no encontrada", code: "BARBERSHOP_NOT_FOUND" },
      { status: 404 }
    );
  }

  const isActivePlan = ["ACTIVE", "TRIAL"].includes(barbershop.planStatus);
  const isPremium = barbershop.planType === "PREMIUM";

  if (!isPremium || !isActivePlan) {
    return NextResponse.json(
      {
        error: "Esta funcionalidad requiere el plan BarberOS Premium.",
        code: "PREMIUM_REQUIRED",
        currentPlan: barbershop.planType,
        planStatus: barbershop.planStatus,
        upgradeUrl: "/precios",
      },
      { status: 403 }
    );
  }

  return null; // Acceso permitido
}

/**
 * Verifica si una barbería tiene acceso Premium.
 * Versión booleana para uso en Server Components (RSC).
 */
export async function isPremiumBarbershop(barbershopId: string): Promise<boolean> {
  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
    select: { planType: true, planStatus: true },
  });

  if (!barbershop) return false;
  return (
    barbershop.planType === "PREMIUM" &&
    ["ACTIVE", "TRIAL"].includes(barbershop.planStatus)
  );
}
