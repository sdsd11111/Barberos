import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { getProgressBar } from "@/lib/progress";

const VisitSchema = z.object({
  barbershopId: z.string().min(1, "barbershopId es requerido"),
  customerWhatsapp: z.string().optional(), // Opcional para visitas anónimas (CF)
  customerName: z.string().optional(),
  staffId: z.string().optional(),
  // Motor: método de check-in
  checkinMethod: z.enum(["SELF", "BARBER_ASSISTED_KNOWN", "BARBER_ASSISTED_ANONYMOUS"]).optional(),
  // Motor: servicios prestados (lista de etiquetas, sin precio)
  services: z.array(z.string()).optional(),
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

    const { barbershopId, customerWhatsapp, customerName, staffId, checkinMethod, services } = parsed.data;
    const isAnonymous = checkinMethod === "BARBER_ASSISTED_ANONYMOUS" || !customerWhatsapp;
    const whatsapp = customerWhatsapp ? customerWhatsapp.replace(/\D/g, "") : null;

    // Si es anónima y falta el número, es válido — se registra como CF
    if (!isAnonymous && !whatsapp) {
      return NextResponse.json(
        { success: false, error: "customerWhatsapp es requerido para visitas identificadas" },
        { status: 400 }
      );
    }

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

    // ======================================================
    // FLUJO A: Visita anónima — Consumidor Final (CF)
    // El barbero registra una visita sin identificar al cliente
    // ======================================================
    if (isAnonymous) {
      await prisma.barberVisit.create({
        data: {
          customerId: null,            // CF: sin cliente identificado
          barbershopId,                // Siempre requerido para scoping
          staffId: staffId ?? null,
          rating: null,
          status: "APPROVED",
          checkinMethod: "BARBER_ASSISTED_ANONYMOUS",
          visitHour: new Date().getHours(),
          services: services ? JSON.stringify(services) : null,
        },
      });
      await prisma.barbershop.update({
        where: { id: barbershopId },
        data: { anonymousVisitCounter: { increment: 1 } },
      });
      return NextResponse.json({ success: true, anonymous: true }, { status: 201 });
    }

    // ======================================================
    // FLUJO B: Visita identificada — el barbero conoce al cliente
    // ======================================================

    // Upsert cliente y obtener nuevo conteo
    const nameToUse = customerName && customerName.trim() ? customerName.trim() : undefined;
    const customer = await prisma.barberCustomer.upsert({
      where: {
        barbershopId_whatsapp: {
          barbershopId,
          whatsapp: whatsapp!,
        },
      },
      update: {
        cutsCount: { increment: 1 },
        lastVisitAt: new Date(),
        sessionState: "AWAITING_RATING",
        ...(nameToUse ? { name: nameToUse } : {}),
      },
      create: {
        barbershopId,
        whatsapp: whatsapp!,
        name: nameToUse || "Sin Nombre",
        cutsCount: 1,
        sessionState: "AWAITING_RATING",
        lastVisitAt: new Date(),
        profiles: {
          create: {
            barbershopId,
            name: nameToUse || "Sin Nombre",
            cutsCount: 1,
          }
        }
      },
      include: {
        profiles: true
      }
    });

    let profileIdToUse = customer.activeProfileId;
    if (!profileIdToUse && customer.profiles && customer.profiles.length > 0) {
      profileIdToUse = customer.profiles[0].id;
      // Auto-reparar activeProfileId si estaba nulo
      await prisma.barberCustomer.update({
        where: { id: customer.id },
        data: { activeProfileId: profileIdToUse }
      });
    }

    // Crear registro de visita con checkinMethod y hora
    await prisma.barberVisit.create({
      data: {
        customerId: customer.id,
        barbershopId,                  // Siempre incluir para scoping multi-tenant
        profileId: profileIdToUse,     // <- INYECTADO AHORA
        staffId: staffId ?? null,
        rating: null,
        status: "APPROVED",
        checkinMethod: checkinMethod ?? "BARBER_ASSISTED_KNOWN",
        visitHour: new Date().getHours(),
        services: services ? JSON.stringify(services) : null,
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
      to: whatsapp!, // garantizado no-null en Flujo B (validado antes con isAnonymous check)
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
