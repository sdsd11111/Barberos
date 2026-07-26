import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { checkDbRateLimit } from "@/lib/rate-limit";

// Zod schema para los datos esperados
const registrationSchema = z.object({
  barbershopId: z.string().min(1),
  whatsapp: z.string().regex(/^[0-9]{9,15}$/, "WhatsApp inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(50),
  birthDay: z.number().min(1).max(31),
  birthMonth: z.number().min(1).max(12),
  notes: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    
    // Rate limiter en MySQL: Max 5 intentos por IP en 10 minutos
    const rateLimit = await checkDbRateLimit({
      key: `reg:ip:${ip}`,
      maxAttempts: 5,
      windowMs: 10 * 60 * 1000,
    });

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Demasiados intentos de registro. Por favor, intenta de nuevo en unos minutos." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { barbershopId, whatsapp, name, birthDay, birthMonth, notes } = parsed.data;

    // Verificar si la barbería existe
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
    });

    if (!barbershop) {
      return NextResponse.json(
        { error: "Barbería no encontrada" },
        { status: 404 }
      );
    }

    // Transacción atómica
    await prisma.$transaction(async (tx) => {
      let customer = await tx.barberCustomer.findUnique({
        where: {
          barbershopId_whatsapp: {
            barbershopId,
            whatsapp,
          },
        },
        include: { profiles: true },
      });

      if (!customer) {
        customer = await tx.barberCustomer.create({
          data: {
            barbershopId,
            whatsapp,
            name: name,
            cutsCount: 0,
            sessionState: "IDLE",
          },
          include: { profiles: true },
        });
      }

      const birthDateObj = new Date(Date.UTC(2004, birthMonth - 1, birthDay));

      const newProfile = await tx.customerProfile.create({
        data: {
          customerId: customer.id,
          barbershopId,
          name: name,
          cutsCount: 0,
          isActive: true,
          birthDate: birthDateObj,
          notes,
        },
      });

      if (!customer.activeProfileId) {
        await tx.barberCustomer.update({
          where: { id: customer.id },
          data: { activeProfileId: newProfile.id },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Registro Cliente] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
