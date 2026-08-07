import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RedeemSchema = z.object({
  profileId: z.string().min(1, "profileId es requerido"),
});

/**
 * POST /api/clientes/redeem-loyalty
 * Marca que un cliente ha reclamado su corte gratuito (premio de fidelidad).
 * - Valida que el perfil pertenezca a la barbería autenticada.
 * - Valida que cutsCount >= requiredCuts.
 * - Resetea cutsCount a 0 (en customer o profile según loyaltyMode).
 * - Guarda registro histórico de la redención.
 */
export async function POST(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = RedeemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { profileId } = parsed.data;

    // Buscar perfil y barbería
    const profile = await prisma.customerProfile.findFirst({
      where: { id: profileId, barbershopId, isActive: true },
      include: { customer: true },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Perfil no encontrado o no pertenece a tu barbería" },
        { status: 404 }
      );
    }

    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: { requiredCuts: true, loyaltyMode: true },
    });

    if (!barbershop) {
      return NextResponse.json(
        { success: false, error: "Barbería no encontrada" },
        { status: 404 }
      );
    }

    const isByAccount = barbershop.loyaltyMode === "BY_ACCOUNT";
    const currentCuts = isByAccount ? profile.customer.cutsCount : profile.cutsCount;

    if (currentCuts < barbershop.requiredCuts) {
      return NextResponse.json(
        {
          success: false,
          error: `El cliente tiene ${currentCuts} cortes pero necesita ${barbershop.requiredCuts} para reclamar su premio`,
        },
        { status: 400 }
      );
    }

    // Ejecutar redención en transacción
    await prisma.$transaction(async (tx) => {
      await tx.loyaltyRedemption.create({
        data: {
          barbershopId,
          profileId,
          customerId: profile.customerId,
          cutsAtRedemption: currentCuts,
        },
      });

      const newCutsVal = Math.max(0, currentCuts - barbershop.requiredCuts);
      if (isByAccount) {
        await tx.barberCustomer.update({
          where: { id: profile.customerId },
          data: { cutsCount: newCutsVal },
        });
      } else {
        await tx.customerProfile.update({
          where: { id: profileId },
          data: { cutsCount: newCutsVal },
        });
      }
    });

    const newCuts = Math.max(0, currentCuts - barbershop.requiredCuts);

    return NextResponse.json({
      success: true,
      message: `Premio reclamado. Contador reseteado a ${newCuts}.`,
      newCutsCount: newCuts,
    });
  } catch (error) {
    console.error("[Redeem Loyalty API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
