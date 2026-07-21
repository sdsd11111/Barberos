import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { getProgressBar } from "@/lib/progress";

const VisitSchema = z.object({
  barbershopId: z.string().min(1, "barbershopId es requerido"),
  customerWhatsapp: z.string().min(1, "customerWhatsapp es requerido"),
  staffId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = VisitSchema.safeParse(body);

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

    const { barbershopId, customerWhatsapp, staffId } = parsed.data;
    const whatsapp = customerWhatsapp.replace(/\D/g, "");

    // Buscar barbería
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: {
        requiredCuts: true,
        evolutionInstance: true,
        evolutionApiKey: true,
      },
    });

    if (!barbershop) {
      return NextResponse.json(
        { success: false, error: "Barbería no encontrada" },
        { status: 404 }
      );
    }

    // Upsert cliente y obtener nuevo conteo
    const customer = await prisma.barberCustomer.upsert({
      where: {
        barbershopId_whatsapp: {
          barbershopId,
          whatsapp,
        },
      },
      update: {
        cutsCount: { increment: 1 },
        lastVisitAt: new Date(),
        sessionState: "AWAITING_RATING",
      },
      create: {
        barbershopId,
        whatsapp,
        cutsCount: 1,
        sessionState: "AWAITING_RATING",
        lastVisitAt: new Date(),
      },
    });

    // Crear registro de visita
    await prisma.barberVisit.create({
      data: {
        customerId: customer.id,
        staffId: staffId ?? null,
        rating: null,
      },
    });

    const { requiredCuts, evolutionInstance, evolutionApiKey } = barbershop;
    const progressBar = getProgressBar(customer.cutsCount, requiredCuts);
    const remaining = requiredCuts - customer.cutsCount;

    let message = "";
    if (customer.cutsCount >= requiredCuts) {
      message = `✂️ ¡Corte registrado!\n\nTu progreso: ${progressBar}\n\n🎉 ¡Felicidades! Has ganado tu premio. Menciónalo en tu próxima visita.\n\nPor favor, responde del 1 al 5 para calificar la atención de hoy.`;
    } else {
      message = `✂️ ¡Corte registrado!\n\nTu progreso: ${progressBar}\n\n¡Te faltan ${remaining} cortes para tu premio!\n\nPor favor, responde del 1 al 5 para calificar la atención de hoy.`;
    }

    await sendWhatsAppMessage({
      instance: evolutionInstance,
      apiKey: evolutionApiKey,
      to: whatsapp,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        customer: {
          cutsCount: customer.cutsCount,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Visits API] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
