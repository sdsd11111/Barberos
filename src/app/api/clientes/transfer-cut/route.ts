import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const TransferSchema = z.object({
  fromProfileId: z.string().min(1, "fromProfileId es requerido"),
  toProfileId: z.string().min(1, "toProfileId es requerido"),
});

/**
 * POST /api/clientes/transfer-cut
 * Transfiere 1 corte del contador del cliente A (fromProfile) al cliente B (toProfile).
 * - Valida que ambos pertenezcan a la misma barbería autenticada.
 * - Valida que fromProfile tenga al menos 1 corte.
 * - Valida que no exista ya una transferencia entre ese par.
 * - Decrementa cutsCount del origen e incrementa cutsCount del destino.
 */
export async function POST(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = TransferSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { fromProfileId, toProfileId } = parsed.data;

    if (fromProfileId === toProfileId) {
      return NextResponse.json(
        { success: false, error: "No puedes transferir un corte al mismo perfil" },
        { status: 400 }
      );
    }

    // Validar que ambos perfiles existan y pertenezcan a esta barbería
    const [fromProfile, toProfile] = await Promise.all([
      prisma.customerProfile.findFirst({
        where: { id: fromProfileId, barbershopId, isActive: true },
        include: { customer: true },
      }),
      prisma.customerProfile.findFirst({
        where: { id: toProfileId, barbershopId, isActive: true },
        include: { customer: true },
      }),
    ]);

    if (!fromProfile) {
      return NextResponse.json(
        { success: false, error: "Perfil de origen no encontrado o no pertenece a tu barbería" },
        { status: 404 }
      );
    }

    if (!toProfile) {
      return NextResponse.json(
        { success: false, error: "Perfil de destino no encontrado o no pertenece a tu barbería" },
        { status: 404 }
      );
    }

    // Verificar que el origen tenga al menos 1 corte
    // Usar el loyaltyMode de la barbería para saber qué contador consultar
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: { loyaltyMode: true },
    });

    const isByAccount = barbershop?.loyaltyMode === "BY_ACCOUNT";
    const fromCutsCount = isByAccount ? fromProfile.customer.cutsCount : fromProfile.cutsCount;

    if (fromCutsCount < 1) {
      return NextResponse.json(
        { success: false, error: "El cliente de origen no tiene cortes para transferir" },
        { status: 400 }
      );
    }

    // Verificar que no exista una transferencia previa entre este par
    const existingTransfer = await prisma.cutTransfer.findUnique({
      where: {
        barbershopId_fromProfileId_toProfileId: {
          barbershopId,
          fromProfileId,
          toProfileId,
        },
      },
    });

    if (existingTransfer) {
      return NextResponse.json(
        { success: false, error: "Ya existe una transferencia de este cliente al destino. Solo se permite 1 por par." },
        { status: 409 }
      );
    }

    // Ejecutar transferencia en transacción
    await prisma.$transaction(async (tx) => {
      // Decrementar origen
      if (isByAccount) {
        await tx.barberCustomer.update({
          where: { id: fromProfile.customerId },
          data: { cutsCount: { decrement: 1 } },
        });
      } else {
        await tx.customerProfile.update({
          where: { id: fromProfileId },
          data: { cutsCount: { decrement: 1 } },
        });
      }

      // Incrementar destino
      if (isByAccount) {
        await tx.barberCustomer.update({
          where: { id: toProfile.customerId },
          data: { cutsCount: { increment: 1 } },
        });
      } else {
        await tx.customerProfile.update({
          where: { id: toProfileId },
          data: { cutsCount: { increment: 1 } },
        });
      }

      // Registrar la transferencia
      await tx.cutTransfer.create({
        data: {
          barbershopId,
          fromProfileId,
          toProfileId,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Corte transferido de "${fromProfile.name || "Sin Nombre"}" a "${toProfile.name || "Sin Nombre"}"`,
    });
  } catch (error) {
    console.error("[Transfer Cut API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
