import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar auth
    const authHeader = request.headers.get("authorization");
    const adminSecret = authHeader?.replace("Bearer ", "");
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { pagada, monto } = body;

    const updateData: any = {};
    if (pagada !== undefined) {
      updateData.pagada = pagada;
      if (pagada) {
        updateData.pagadaAt = new Date();
      }
    }
    if (monto !== undefined) {
      updateData.monto = monto;
    }

    const comision = await prisma.referralComision.update({
      where: { id },
      data: updateData,
      include: {
        vendedor: {
          select: {
            id: true,
            nombre: true,
            negocio: true,
          },
        },
      },
    });

    return NextResponse.json(comision);
  } catch (error) {
    console.error("Error updating comision:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
