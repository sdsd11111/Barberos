import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";

export async function POST(request: NextRequest) {
  try {
    // 1. Proteger el endpoint con un secreto de cron
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET || "cron_secret_desarrollo_local";

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Calcular la fecha límite (hace 30 días)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 2. Query de clientes inactivos
    const inactiveCustomers = await prisma.barberCustomer.findMany({
      where: {
        lastVisitAt: {
          lt: thirtyDaysAgo,
        },
        OR: [
          { lastReactivationSentAt: null },
          { lastReactivationSentAt: { lt: thirtyDaysAgo } },
        ],
      },
      include: {
        barbershop: true,
      },
    });

    let sentCount = 0;

    // 3. Envío de mensajes y actualización
    for (const customer of inactiveCustomers) {
      try {
        const { barbershop } = customer;
        
        // Mensaje personalizado de reactivación "Te extrañamos"
        const message = `👋 ¡Hola, ${customer.name || "bro"}! Hace un tiempo que no te vemos por ${barbershop.name}. ✂️\n\nQueremos recordarte que tienes acumulados ${customer.cutsCount} cortes en tu tarjeta de fidelidad virtual. ¡Te faltan pocos para tu premio!\n\nTe esperamos pronto para dejarte nítido. ¡Reserva hoy mismo!`;

        await sendWhatsAppMessage({
          instance: barbershop.evolutionInstance,
          apiKey: barbershop.evolutionApiKey,
          to: customer.whatsapp,
          message,
        });

        // Actualizar fecha del último envío de reactivación
        await prisma.barberCustomer.update({
          where: { id: customer.id },
          data: { lastReactivationSentAt: new Date() },
        });

        sentCount++;
      } catch (err) {
        console.error(`[Cron Reactivación] Error enviando a cliente ${customer.whatsapp}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron completado exitosamente. Reactivaciones enviadas: ${sentCount}`,
    });
  } catch (error) {
    console.error("[Cron Reactivación] Error general:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
