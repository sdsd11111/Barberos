import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WHATSAPP_NUMBER = "593963425323";
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=`;

// GET /api/referidos/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminSecret = authHeader?.replace("Bearer ", "");
    
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    
    const vendedor = await prisma.referralVendedor.findUnique({
      where: { id },
    });

    if (!vendedor) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    // Incluir URL de WhatsApp
    const whatsappUrl = `${WHATSAPP_BASE_URL}Hola,%20me%20interesa,%20soy%20${vendedor.codigoUnico}`;

    return NextResponse.json({ ...vendedor, whatsappUrl });
  } catch (error) {
    console.error("Error fetching referido:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// PATCH /api/referidos/[id] - Editar
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminSecret = authHeader?.replace("Bearer ", "");
    
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nombre, celular, negocio, direccion, activo } = body;

    const updateData: any = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (celular !== undefined) updateData.celular = celular;
    if (negocio !== undefined) updateData.negocio = negocio;
    if (direccion !== undefined) updateData.direccion = direccion;
    if (activo !== undefined) updateData.activo = activo;

    const vendedor = await prisma.referralVendedor.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(vendedor);
  } catch (error) {
    console.error("Error updating referido:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE /api/referidos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminSecret = authHeader?.replace("Bearer ", "");
    
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    
    await prisma.referralVendedor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting referido:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
