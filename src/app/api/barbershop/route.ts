import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: {
        id: true,
        name: true,
        whatsappNumber: true,
        requiredCuts: true,
        googleMapsUrl: true,
      },
    });

    if (!barbershop) {
      return NextResponse.json(
        { error: "No se encontró la barbería" },
        { status: 404 }
      );
    }

    console.log("[GET /api/barbershop] Buscando barbería activa. ID devuelto:", barbershop.id);
    return NextResponse.json(barbershop);
  } catch (error) {
    console.error("[API /barbershop] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
