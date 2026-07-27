import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WHATSAPP_NUMBER = "593963425323";

// Genera código único de 8 caracteres
function generateCodigoUnico(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// GET /api/referidos - Listar todos (requiere auth)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const adminSecret = authHeader?.replace("Bearer ", "");
    
    // Verificar auth (usar misma que admin)
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const vendedores = await prisma.referralVendedor.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(vendedores);
  } catch (error) {
    console.error("Error fetching referidos:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// POST /api/referidos - Crear vendedor (público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, celular, celularNegocio, negocio, direccion } = body;

    if (!nombre || !celular || !celularNegocio || !negocio || !direccion) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    // Generar código único
    let codigoUnico = generateCodigoUnico();
    
    // Asegurar que sea único
    let attempts = 0;
    while (attempts < 10) {
      const existing = await prisma.referralVendedor.findUnique({
        where: { codigoUnico },
      });
      if (!existing) break;
      codigoUnico = generateCodigoUnico();
      attempts++;
    }

    const vendedor = await prisma.referralVendedor.create({
      data: {
        nombre,
        celular,
        celularNegocio,
        negocio,
        direccion,
        codigoUnico,
      },
    });

    return NextResponse.json(vendedor);
  } catch (error) {
    console.error("Error creating referido:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
