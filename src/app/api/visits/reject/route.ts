import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";

const RejectSchema = z.object({
  visitId: z.string().min(1, "visitId es requerido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RejectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { visitId } = parsed.data;

    // Buscar visita
    const visit = await prisma.barberVisit.findUnique({
      where: { id: visitId },
    });

    if (!visit) {
      return NextResponse.json(
        { success: false, error: "Visita no encontrada" },
        { status: 404 }
      );
    }

    // Debe estar en estado PENDING
    if (visit.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: `La visita ya está en estado ${visit.status}` },
        { status: 400 }
      );
    }

    // Obtener cliente y barbería
    const customer = await prisma.barberCustomer.findFirst({
      where: { 
        id: visit.customerId,
        barbershopId
      },
      include: { barbershop: true },
    });

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Cliente no encontrado o no pertenece a su barbería" },
        { status: 403 }
      );
    }

    const { barbershop } = customer;

    // Actualizar visita
    await prisma.barberVisit.update({
      where: { id: visitId },
      data: {
        status: "REJECTED",
      },
    });

    // Enviar mensaje de rechazo
    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: customer.whatsapp,
      message: "No pudimos validar tu check-in. Por favor, acércate a la caja. ✂️",
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[Reject API] Error:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
