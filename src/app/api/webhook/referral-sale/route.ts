import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePhones } from "@/lib/phone-normalizer";

const WEBHOOK_API_KEY = process.env.REFERRAL_WEBHOOK_KEY || "default_key";

export async function POST(request: NextRequest) {
  try {
    // Validar API key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== WEBHOOK_API_KEY) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event, transaction_id, client } = body;

    if (event !== "sale_completed") {
      return NextResponse.json({ 
        success: false, 
        error: "Event not supported" 
      }, { status: 400 });
    }

    if (!transaction_id || !client?.phones) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

    // Verificar si la transacción ya fue procesada
    const existingSale = await prisma.referralComision.findFirst({
      where: { transactionId: transaction_id },
    });

    if (existingSale) {
      return NextResponse.json({ 
        success: false, 
        error: "Transaction already processed" 
      }, { status: 409 });
    }

    // Normalizar teléfonos
    const normalizedPhones = normalizePhones(client.phones);

    // Buscar lead con First Touch (30 días de ventana)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Buscar leads que coincidan con alguno de los teléfonos
    const matchingLeads = await prisma.referralLead.findMany({
      where: {
        telefono: { in: normalizedPhones },
        capturedAt: { gte: thirtyDaysAgo },
        converted: false,
      },
      include: {
        vendedor: true,
      },
      orderBy: { capturedAt: "asc" }, // First touch - el más antiguo
    });

    // Si no hay match
    if (matchingLeads.length === 0) {
      return NextResponse.json({
        success: true,
        matched: false,
        message: "No se encontró ningún referidor activo en los últimos 30 días",
      });
    }

    // Tomar el primer lead (first touch)
    const winningLead = matchingLeads[0];

    // Marcar lead como convertido
    await prisma.referralLead.update({
      where: { id: winningLead.id },
      data: { converted: true, convertedAt: new Date() },
    });

    // Crear registro de comisión
    const comision = await prisma.referralComision.create({
      data: {
        vendedorId: winningLead.vendedorId,
        leadId: winningLead.id,
        transactionId: transaction_id,
        clienteNombre: client.name || "Desconocido",
        telefonos: JSON.stringify(normalizedPhones),
      },
    });

    return NextResponse.json({
      success: true,
      matched: true,
      referrer: {
        id: winningLead.vendedor.id,
        businessName: winningLead.vendedor.negocio,
        representative: winningLead.vendedor.nombre,
        whatsapp: winningLead.vendedor.celular,
      },
      message: `Comisión asignada exitosamente a ${winningLead.vendedor.negocio}`,
    });

  } catch (error) {
    console.error("Error processing referral sale:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
