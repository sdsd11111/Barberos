import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { generateBoxCode } from "@/lib/boxcode";
import webpush from "web-push";

// Configurar credenciales VAPID globales para el envío de notificaciones push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:soporte@barberosoftware.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface WebhookPayload {
  event: string;
  instance?: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
    };
    message: {
      conversation?: string;
      extendedTextMessage?: {
        text?: string;
      };
      imageMessage?: {
        caption?: string;
      };
    };
  };
}

async function processMessage(payload: WebhookPayload) {
  // Validar evento y mensaje
  if (payload.event !== "messages.upsert") {
    return;
  }

  const message = payload.data?.message;
  if (!message) {
    return;
  }

  const messageText = (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    ""
  ).trim();

  if (!messageText) {
    return;
  }

  // Extraer número de teléfono
  const remoteJid = payload.data.key.remoteJid;
  const whatsapp = remoteJid.replace("@s.whatsapp.net", "");

  // Buscar barbería usando la instancia del webhook, con fallback
  const evolutionInstance = payload.instance;
  const barbershop = evolutionInstance
    ? await prisma.barbershop.findFirst({ where: { evolutionInstance } })
    : await prisma.barbershop.findFirst();

  if (!barbershop) {
    console.error("[Webhook WhatsApp] No se encontró ninguna barbería para la instancia:", evolutionInstance);
    return;
  }

  // Buscar o crear cliente para esta barbería específica (multi-tenant)
  let customer = await prisma.barberCustomer.findUnique({
    where: {
      barbershopId_whatsapp: {
        barbershopId: barbershop.id,
        whatsapp,
      },
    },
    include: {
      barbershop: true,
    },
  });

  // --- FLUJO DE CHECK-IN ---
  // Validar que el mensaje contenga EXACTAMENTE el código de caja activo de la barbería
  const currentCode = barbershop.currentBoxCode?.toUpperCase() || "";
  const upperMessage = messageText.toUpperCase();
  const isCheckInMessage = currentCode.length > 0 && upperMessage.includes(currentCode);

  // Detectar mensajes genéricos de check-in (ej: desde QR impreso fijo en la mesa)
  const CHECKIN_KEYWORDS = ["registrar mi corte", "registrar corte", "quiero registrar", "checkin", "check-in"];
  const isGenericCheckIn = CHECKIN_KEYWORDS.some((kw) => messageText.toLowerCase().includes(kw));

  // Extraer nombre público del perfil de WhatsApp (pushName)
  const pushName = (payload.data as any)?.pushName || null;

  // --- PASO 1: Mensaje genérico de check-in (QR fijo impreso en mesa) ---
  // El cliente escanea el QR impreso → su WhatsApp envía "Hola, quiero registrar mi corte"
  // El bot le pide el código de 4 dígitos que ve en la pantalla de la caja
  if (isGenericCheckIn && !isCheckInMessage) {
    // Crear/actualizar cliente si no existe
    if (!customer) {
      customer = await prisma.barberCustomer.create({
        data: {
          barbershopId: barbershop.id,
          whatsapp,
          name: pushName,
          cutsCount: 0,
          sessionState: "AWAITING_BOXCODE",
        },
        include: { barbershop: true },
      });
    } else {
      // Limpiar visitas PENDING anteriores y resetear estado
      await prisma.barberVisit.deleteMany({
        where: { customerId: customer.id, status: "PENDING" },
      });
      await prisma.barberCustomer.update({
        where: { id: customer.id },
        data: {
          sessionState: "AWAITING_BOXCODE",
          ...((!customer.name && pushName) ? { name: pushName } : {}),
        },
      });
      customer.sessionState = "AWAITING_BOXCODE";
    }

    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: whatsapp,
      message: "¡Hola! 👋 Para registrar tu corte, envíame el código de 4 dígitos que ves en la pantalla de la caja (ej: NK21).",
    });
    return;
  }

  // --- PASO 2: El cliente está en AWAITING_BOXCODE y envía el código ---
  if (customer?.sessionState === "AWAITING_BOXCODE") {
    if (isCheckInMessage) {
      // El código es correcto → proceder con el check-in normal (cae al bloque de abajo)
      // Primero resetear el estado para que no entre aquí de nuevo
      await prisma.barberCustomer.update({
        where: { id: customer.id },
        data: { sessionState: "IDLE" },
      });
      customer.sessionState = "IDLE";
      // No hacer return — dejar que caiga al flujo normal de check-in abajo
    } else {
      // El código no coincide → pedir de nuevo
      await sendWhatsAppMessage({
        instance: barbershop.evolutionInstance,
        apiKey: barbershop.evolutionApiKey,
        to: whatsapp,
        message: "❌ Ese código no coincide. Por favor, mira la pantalla de la caja y envíame los 4 dígitos que ves ahí.",
      });
      return;
    }
  }

  if (isCheckInMessage) {
    if (!customer) {
      customer = await prisma.barberCustomer.create({
        data: {
          barbershopId: barbershop.id,
          whatsapp,
          name: pushName,
          cutsCount: 0,
          sessionState: "IDLE",
        },
        include: {
          barbershop: true,
        },
      });
    } else if (!customer.name && pushName) {
      // Si el cliente ya existía pero no tenía nombre asignado, lo actualizamos
      customer = await prisma.barberCustomer.update({
        where: { id: customer.id },
        data: { name: pushName },
        include: { barbershop: true },
      });
    }

    // Si el cliente envía el código de caja, el check-in TIENE PRIORIDAD ABSOLUTA.
    // Limpiar cualquier visita PENDING anterior no procesada por el barbero
    await prisma.barberVisit.deleteMany({
      where: {
        customerId: customer.id,
        status: "PENDING",
      },
    });

    // Resetear cualquier estado de sesión previo congelado (ej: si no respondió una calificación previa)
    if (customer.sessionState !== "IDLE") {
      await prisma.barberCustomer.update({
        where: { id: customer.id },
        data: { sessionState: "IDLE" },
      });
      customer.sessionState = "IDLE";
    }

    // Crear visita + regenerar código EN PARALELO (no dependen entre sí)
    const newCode = generateBoxCode();
    await Promise.all([
      prisma.barberVisit.create({
        data: {
          customerId: customer.id,
          status: "PENDING",
          rating: null,
        },
      }),
      prisma.barbershop.update({
        where: { id: barbershop.id },
        data: { currentBoxCode: newCode },
      }),
    ]);

    // PRIORIDAD 1: Enviar respuesta por WhatsApp PRIMERO (latencia mínima para el cliente)
    sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: whatsapp,
      message: "¡Gracias! Avisándole a tu barbero para registrar tu corte. ✂️",
    }).catch((err) => console.error("[WA Reply] Error:", err));

    // PRIORIDAD 2: Enviar notificaciones push al barbero en segundo plano (no bloquea)
    prisma.pushSubscription
      .findMany({
        where: { barbershopId: barbershop.id },
      })
      .then((subs) => {
        const customerName = customer?.name || "Cliente Frecuente";
        const pushPayload = JSON.stringify({
          title: "✂️ ¡Nuevo Check-In!",
          body: `El cliente "${customerName}" (+${whatsapp}) ha solicitado registrar su corte.`,
          url: "/panel",
        });

        subs.forEach((sub) => {
          webpush
            .sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              pushPayload
            )
            .catch((err) => {
              console.error("[WebPush] Fallo al notificar a endpoint:", sub.endpoint, err.message);
              if (err.statusCode === 410 || err.statusCode === 404) {
                prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
              }
            });
        });
      })
      .catch((e) => console.error("[WebPush] Error buscando suscripciones:", e));

    return;
  }

  // Si no es CHECKIN ni genérico, validamos que el cliente exista en el sistema
  if (!customer) {
    return;
  }

  // Máquina de estados para selección de profesional o calificaciones
  if (customer.sessionState === "AWAITING_STAFF") {
    const staffMembers = await prisma.barberStaff.findMany({
      where: { barbershopId: barbershop.id },
      orderBy: { name: "asc" },
    });

    let selectedStaff = null;
    const inputNumber = parseInt(messageText.trim(), 10);

    if (!isNaN(inputNumber) && inputNumber >= 1 && inputNumber <= staffMembers.length) {
      selectedStaff = staffMembers[inputNumber - 1];
    } else {
      // Intentar coincidir por nombre
      selectedStaff = staffMembers.find((s) =>
        messageText.toLowerCase().includes(s.name.toLowerCase())
      );
    }

    if (!selectedStaff && staffMembers.length > 0) {
      const optionsText = staffMembers
        .map((s, idx) => `${idx + 1}. ${s.name}`)
        .join("\n");
      await sendWhatsAppMessage({
        instance: barbershop.evolutionInstance,
        apiKey: barbershop.evolutionApiKey,
        to: whatsapp,
        message: `Por favor, elige el número de la persona que te atendió hoy:\n\n${optionsText}`,
      });
      return;
    }

    // Buscar la última visita del cliente
    const lastVisit = await prisma.barberVisit.findFirst({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });

    if (lastVisit && selectedStaff) {
      await prisma.barberVisit.update({
        where: { id: lastVisit.id },
        data: { staffId: selectedStaff.id },
      });
    }

    // Transicionar al estado de calificación AWAITING_RATING
    await prisma.barberCustomer.update({
      where: { id: customer.id },
      data: { sessionState: "AWAITING_RATING" },
    });

    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: whatsapp,
      message: `¡Excelente! Por último, del 1 al 5, ¿cómo calificas tu servicio con ${selectedStaff ? selectedStaff.name : "nosotros"} hoy? ⭐`,
    });
    return;
  }

  if (customer.sessionState === "AWAITING_RATING") {
    // Extraer rating (primer dígito numérico)
    const ratingMatch = messageText.match(/\d/);
    if (!ratingMatch) {
      await sendWhatsAppMessage({
        instance: barbershop.evolutionInstance,
        apiKey: barbershop.evolutionApiKey,
        to: whatsapp,
        message: "Por favor, envía un número del 1 al 5 para calificar tu experiencia.",
      });
      return;
    }

    const rating = parseInt(ratingMatch[0], 10);
    if (rating < 1 || rating > 5) {
      await sendWhatsAppMessage({
        instance: barbershop.evolutionInstance,
        apiKey: barbershop.evolutionApiKey,
        to: whatsapp,
        message: "La calificación debe ser del 1 al 5. Intenta de nuevo.",
      });
      return;
    }

    // Buscar última visita aprobada sin rating
    const lastVisit = await prisma.barberVisit.findFirst({
      where: {
        customerId: customer.id,
        status: "APPROVED",
        rating: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (lastVisit) {
      await prisma.barberVisit.update({
        where: { id: lastVisit.id },
        data: { rating },
      });
    }

    // Actualizar estado del cliente
    await prisma.barberCustomer.update({
      where: { id: customer.id },
      data: { sessionState: "IDLE" },
    });

    // Programar la solicitud de reseña de Google si es la primera vez que el cliente califica
    if (!customer.firstReviewSent) {
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
      await prisma.delayedTask.create({
        data: {
          type: "SEND_GOOGLE_REVIEW",
          customerId: customer.id,
          scheduledFor: twoHoursFromNow,
        },
      });

      // Marcar de una vez que ya tiene la tarea agendada para evitar duplicaciones
      await prisma.barberCustomer.update({
        where: { id: customer.id },
        data: { firstReviewSent: true },
      });
    }

    await sendWhatsAppMessage({
      instance: barbershop.evolutionInstance,
      apiKey: barbershop.evolutionApiKey,
      to: whatsapp,
      message: "¡Gracias por tu calificación! Nos vemos en el próximo corte.",
    });
  }
}

export async function POST(request: NextRequest) {
  // Parsear el payload lo más rápido posible
  let payload: any;
  try {
    payload = await request.json();
  } catch (error) {
    console.error("[Webhook WhatsApp] Error parsing JSON:", error);
    return NextResponse.json({ success: false }, { status: 400 });
  }

  // Procesar ANTES de retornar para garantizar que Vercel no mate el proceso
  // Con delay eliminado y DB ops en paralelo, esto toma <500ms
  try {
    if (payload.event === "connection.update") {
      const evolutionInstance = payload.instance;
      const connectionState = payload.data?.state;
      const whatsappConnectedNumber = payload.data?.statusReason || payload.data?.phone || null;

      if (evolutionInstance) {
        let connectionStatus = "DISCONNECTED";
        if (connectionState === "open" || connectionState === "connected") {
          connectionStatus = "CONNECTED";
        } else if (connectionState === "connecting" || connectionState === "qrcode") {
          connectionStatus = "WAITING_QR";
        }

        const barbershop = await prisma.barbershop.findFirst({ where: { evolutionInstance } });
        if (barbershop) {
          await prisma.barbershop.update({
            where: { id: barbershop.id },
            data: {
              connectionStatus,
              whatsappConnected: whatsappConnectedNumber ? String(whatsappConnectedNumber).replace(/\D/g, "") : barbershop.whatsappConnected,
            },
          });
        }
      }
    } else {
      // Mensajes regulares — procesar completo antes de retornar
      await processMessage(payload);
    }
  } catch (err) {
    console.error("[Webhook WhatsApp] Error en procesamiento:", err);
  }

  // Retornar 200 a Evolution API
  return NextResponse.json({ success: true });
}
