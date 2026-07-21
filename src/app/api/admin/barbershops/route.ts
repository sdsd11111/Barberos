import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { normalizeWhatsapp } from "@/lib/phone";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "SUPER_ADMIN_PASSWORD_LOCAL_TEST";

function validateAdmin(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SECRET}`) {
    return false;
  }
  return true;
}

import { createEvolutionInstance, configureEvolutionWebhook, deleteEvolutionInstance } from "@/lib/evolution";

const CreateBarbershopSchema = z.object({
  name: z.string().min(1),
  whatsappNumber: z.string().min(1),
  requiredCuts: z.number().default(5),
  googleMapsUrl: z.string().optional(),
});

// GET /api/admin/barbershops - Listar todas las barberías
export async function GET(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const barbershops = await prisma.barbershop.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(barbershops);
  } catch (error) {
    console.error("[Admin GET API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/admin/barbershops - Crear barbería (14 días trial por defecto) + Creación dinámica de WhatsApp
export async function POST(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = CreateBarbershopSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const whatsapp = normalizeWhatsapp(data.whatsappNumber);

    // Nombre dinámico de la instancia basada en el nombre de la barbería
    const evolutionInstanceName = `barber_${whatsapp}`;

    // Intentar crear la instancia en Evolution API
    const instanceCreated = await createEvolutionInstance(evolutionInstanceName);
    if (!instanceCreated) {
      return NextResponse.json(
        { error: "No se pudo inicializar la instancia de WhatsApp en el servidor. Revisa credenciales de Evolution API." },
        { status: 500 }
      );
    }

    // Configurar webhook automático apuntando a producción
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const host = request.headers.get("host") || "barberos-rho-henna.vercel.app";
    const webhookUrl = `${protocol}://${host}/api/webhook/whatsapp`;
    await configureEvolutionWebhook(evolutionInstanceName, webhookUrl);

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 días en el futuro

    // Generar un PIN aleatorio numérico único de 6 dígitos
    const loginPin = Math.floor(100000 + Math.random() * 900000).toString();

    const barbershop = await prisma.barbershop.create({
      data: {
        name: data.name,
        whatsappNumber: whatsapp,
        evolutionInstance: evolutionInstanceName,
        evolutionApiKey: "", // Se usará la global por defecto
        requiredCuts: data.requiredCuts,
        googleMapsUrl: data.googleMapsUrl || null,
        planStatus: "TRIAL",
        trialEndsAt,
        connectionStatus: "DISCONNECTED",
        loginPin,
      },
    });

    return NextResponse.json(barbershop, { status: 201 });
  } catch (error) {
    console.error("[Admin POST API] Error:", error);
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "El número de WhatsApp ya está registrado." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

const UpdateStatusSchema = z.object({
  barbershopId: z.string().min(1),
  planStatus: z.enum(["TRIAL", "ACTIVE", "SUSPENDED"]),
});

// PATCH /api/admin/barbershops - Cambiar planStatus manualmente
export async function PATCH(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = UpdateStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { barbershopId, planStatus } = parsed.data;

    const updated = await prisma.barbershop.update({
      where: { id: barbershopId },
      data: { planStatus },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[Admin PATCH API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// DELETE /api/admin/barbershops - Eliminar barbería + instancia Evolution
export async function DELETE(request: NextRequest) {
  if (!validateAdmin(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const barbershopId = searchParams.get("id");

    if (!barbershopId) {
      return NextResponse.json({ error: "Se requiere el ID de la barbería" }, { status: 400 });
    }

    // Buscar la barbería para obtener la instancia de Evolution
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
    });

    if (!barbershop) {
      return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    }

    // Eliminar la instancia de Evolution API
    await deleteEvolutionInstance(barbershop.evolutionInstance);

    // Obtener los IDs de clientes asociados a la barbería para borrar sus visitas
    const customers = await prisma.barberCustomer.findMany({
      where: { barbershopId },
      select: { id: true },
    });
    const customerIds = customers.map((c) => c.id);

    // Eliminar datos relacionados en orden
    await prisma.barberVisit.deleteMany({
      where: {
        customerId: {
          in: customerIds,
        },
      },
    });
    await prisma.barberCustomer.deleteMany({ where: { barbershopId } });
    await prisma.barberStaff.deleteMany({ where: { barbershopId } });
    await prisma.magicToken.deleteMany({ where: { barbershopId } });

    // Eliminar la barbería
    await prisma.barbershop.delete({ where: { id: barbershopId } });

    return NextResponse.json({ success: true, message: `Barbería "${barbershop.name}" eliminada correctamente.` });
  } catch (error) {
    console.error("[Admin DELETE API] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

