import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/evolution";
import { normalizeWhatsapp } from "@/lib/phone";
import crypto from "crypto";

const RequestLinkSchema = z.object({
  whatsapp: z.string().min(1, "El número de WhatsApp es requerido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RequestLinkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const rawWhatsapp = parsed.data.whatsapp;
    const whatsapp = normalizeWhatsapp(rawWhatsapp);

    console.log(`[request-link] raw="${rawWhatsapp}" → normalizado="${whatsapp}"`);

    // Buscar la barbería por el número de WhatsApp asociado
    const barbershop = await prisma.barbershop.findUnique({
      where: { whatsappNumber: whatsapp },
    });

    if (!barbershop) {
      return NextResponse.json(
        { success: false, error: "No se encontró ninguna barbería asociada a ese número de WhatsApp." },
        { status: 404 }
      );
    }

    // Generar un MagicToken válido por 15 minutos
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.magicToken.create({
      data: {
        barbershopId: barbershop.id,
        token,
        expiresAt,
      },
    });

    // Envío del enlace por WhatsApp
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const authLink = `${protocol}://${host}/api/auth/verify?token=${token}`;
    const message = `🔑 ¡Hola, bro! Aquí tienes tu enlace mágico de acceso para entrar a tu panel de BarberOS. Vence en 15 minutos:\n\n${authLink}\n\nNo compartas este enlace con nadie.`;

    try {
      // Envía el enlace de acceso usando la instancia global del SuperAdmin (que ya está conectada)
      await sendWhatsAppMessage({
        instance: process.env.EVOLUTION_INSTANCE || barbershop.evolutionInstance,
        apiKey: process.env.EVOLUTION_API_KEY || barbershop.evolutionApiKey,
        to: whatsapp,
        message,
      });
      return NextResponse.json({ success: true, message: "Enlace mágico enviado por WhatsApp." });
    } catch (whatsappError) {
      console.warn("\n🚨 [ALERTA LOGS DESARROLLO] No se pudo enviar el mensaje por la instancia maestra global.");
      console.warn("🔗 ENLACE MÁGICO DE ACCESO DIRECTO:");
      console.warn(`👉 ${authLink}\n`);

      if (host.includes("localhost") || host.includes("127.0.0.1")) {
        return NextResponse.json({
          success: true,
          message: "No se pudo enviar por WhatsApp (Error en instancia maestra). Usa el enlace de la consola o accede directamente aquí.",
          debugLink: authLink
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: "No se pudo enviar el mensaje de verificación por WhatsApp. Contacta al soporte técnico." 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Request Link API] Error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Error interno al procesar el enlace mágico.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
