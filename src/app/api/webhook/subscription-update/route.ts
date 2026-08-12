import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone-normalizer";

const WEBHOOK_API_KEY = process.env.REFERRAL_WEBHOOK_KEY || "default_key";

/**
 * POST /api/webhook/subscription-update
 * 
 * Permite al CRM Financiero (barberosplus.com) actualizar en tiempo real
 * el estado del plan de una barbería cuando un cliente paga, suspende o cancela.
 * 
 * Headers requeridos:
 * - x-api-key: Debe coincidir con REFERRAL_WEBHOOK_KEY
 * 
 * Body:
 * {
 *   "event": "subscription_updated",
 *   "whatsappNumber": "593991234567", // o barbershopId
 *   "planStatus": "ACTIVE",           // ACTIVE | TRIAL | PAST_DUE | SUSPENDED | CANCELLED
 *   "planType": "PRO",                // PRO | PREMIUM
 *   "trialEndsAt": "2026-09-12T00:00:00Z" // Opcional (para extender trials)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar API key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== WEBHOOK_API_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event, whatsappNumber, barbershopId, planStatus, planType, trialEndsAt } = body;

    if (event !== "subscription_updated") {
      return NextResponse.json({ 
        success: false, 
        error: "Evento no soportado. Se esperaba 'subscription_updated'" 
      }, { status: 400 });
    }

    if (!whatsappNumber && !barbershopId) {
      return NextResponse.json({ 
        success: false, 
        error: "Se requiere 'whatsappNumber' o 'barbershopId'" 
      }, { status: 400 });
    }

    // 2. Buscar barbería por ID o por WhatsApp normalizado
    let targetId = barbershopId;

    if (!targetId && whatsappNumber) {
      const normalized = normalizePhone(whatsappNumber);
      const shop = await prisma.barbershop.findFirst({
        where: {
          OR: [
            { whatsappNumber: normalized },
            { ownerPhone: normalized }
          ]
        },
        select: { id: true }
      });

      if (!shop) {
        return NextResponse.json({ 
          success: false, 
          error: `No se encontró ninguna barbería registrada con el teléfono ${whatsappNumber}` 
        }, { status: 404 });
      }

      targetId = shop.id;
    }

    // 3. Preparar datos a actualizar
    const updateData: {
      planStatus?: string;
      planType?: string;
      trialEndsAt?: Date | null;
    } = {};

    if (planStatus) {
      const validStatuses = ["ACTIVE", "TRIAL", "PAST_DUE", "SUSPENDED", "CANCELLED"];
      if (!validStatuses.includes(planStatus.toUpperCase())) {
        return NextResponse.json({ 
          success: false, 
          error: `planStatus inválido. Valores permitidos: ${validStatuses.join(", ")}` 
        }, { status: 400 });
      }
      updateData.planStatus = planStatus.toUpperCase();
    }

    if (planType) {
      const validTypes = ["PRO", "PREMIUM"];
      if (!validTypes.includes(planType.toUpperCase())) {
        return NextResponse.json({ 
          success: false, 
          error: `planType inválido. Valores permitidos: ${validTypes.join(", ")}` 
        }, { status: 400 });
      }
      updateData.planType = planType.toUpperCase();
    }

    if (trialEndsAt !== undefined) {
      updateData.trialEndsAt = trialEndsAt ? new Date(trialEndsAt) : null;
    }

    // 4. Ejecutar actualización en DB
    const updated = await prisma.barbershop.update({
      where: { id: targetId },
      data: updateData,
      select: {
        id: true,
        name: true,
        whatsappNumber: true,
        planStatus: true,
        planType: true,
        trialEndsAt: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Estado de suscripción actualizado con éxito para '${updated.name}'`,
      barbershop: updated
    });

  } catch (error) {
    console.error("[Webhook Subscription Update] Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Error interno procesando la actualización de suscripción" 
    }, { status: 500 });
  }
}
