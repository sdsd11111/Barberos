import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Verificar auth
    const authHeader = request.headers.get("authorization");
    const adminSecret = authHeader?.replace("Bearer ", "");
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendedorId = searchParams.get("vendedorId");
    const pagada = searchParams.get("pagada");

    // Construir filtros
    const where: any = {};
    if (vendedorId) where.vendedorId = vendedorId;
    if (pagada !== null) where.pagada = pagada === "true";

    const comisiones = await prisma.referralComision.findMany({
      where,
      include: {
        vendedor: {
          select: {
            id: true,
            nombre: true,
            negocio: true,
            celular: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.referralComision.count({ where });

    return NextResponse.json({ comisiones, total });
  } catch (error) {
    console.error("Error fetching comisiones:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
