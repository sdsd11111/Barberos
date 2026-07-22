import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";

// Verificar autenticación por header Authorization O por query param ?secret=
function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET || "cron_secret_desarrollo_local";
  // Opción 1: Authorization header (para Vercel Cron u otros servicios)
  const authHeader = request.headers.get("Authorization");
  if (authHeader === `Bearer ${cronSecret}`) return true;
  // Opción 2: Query param ?secret= (para cPanel cron jobs con curl)
  const urlSecret = request.nextUrl.searchParams.get("secret");
  if (urlSecret === cronSecret) return true;
  return false;
}

// Lógica principal del cron (compartida entre GET y POST)
async function runCron(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
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

    // 4. PROCESAR TAREAS DEMORADAS (DelayedTask) p.ej. enviar reseña de Google a las 2 horas
    const now = new Date();
    const pendingTasks = await prisma.delayedTask.findMany({
      where: {
        processed: false,
        scheduledFor: { lt: now },
      },
    });

    let processedTasksCount = 0;

    for (const task of pendingTasks) {
      try {
        const customer = await prisma.barberCustomer.findUnique({
          where: { id: task.customerId },
          include: { barbershop: true },
        });

        if (customer) {
          const { barbershop } = customer;
          // Generar la url acortada dinámica redirigiendo al Google Review de la barbería
          // El host vendrá del header host o por configuración de entorno
          const host = request.headers.get("host") || "barberos-teal.vercel.app";
          const proto = host.includes("localhost") ? "http" : "https";
          const shortUrl = `${proto}://${host}/r/${barbershop.id}`;

          const reviewMessage = `👋 ¡Hola, ${customer.name || "bro"}! Gracias por visitarnos hoy en ${barbershop.name}. ✂️\n\nTu opinión es súper valiosa para nosotros. ¿Nos ayudarías dejando una reseña en Google? Solo te tomará 1 minuto y nos ayuda a seguir mejorando:\n\n👉 ${shortUrl}`;

          await sendWhatsAppMessage({
            instance: barbershop.evolutionInstance,
            apiKey: barbershop.evolutionApiKey,
            to: customer.whatsapp,
            message: reviewMessage,
          });
        }

        // Marcar la tarea como procesada
        await prisma.delayedTask.update({
          where: { id: task.id },
          data: { processed: true },
        });

        processedTasksCount++;
      } catch (taskErr) {
        console.error(`[Cron DelayedTask] Error procesando tarea ${task.id}:`, taskErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron completado exitosamente. Reactivaciones enviadas: ${sentCount}. Reseñas enviadas: ${processedTasksCount}`,
    });
  } catch (error) {
    console.error("[Cron Reactivación] Error general:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// GET: para cPanel cron jobs (curl simple)
export async function GET(request: NextRequest) {
  return runCron(request);
}

// POST: para Vercel Cron u otros servicios
export async function POST(request: NextRequest) {
  return runCron(request);
}
