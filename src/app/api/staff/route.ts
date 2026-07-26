import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const barbershopId = searchParams.get("barbershopId");

    if (!barbershopId) {
      return NextResponse.json(
        { success: false, error: "barbershopId es requerido" },
        { status: 400 }
      );
    }

    const staff = await prisma.barberStaff.findMany({
      where: { barbershopId },
      select: { id: true, name: true, role: true, photoUrl: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, staff });
  } catch (err) {
    console.error("[Staff API Error]", err);
    return NextResponse.json(
      { success: false, error: "Error al obtener lista de barberos" },
      { status: 500 }
    );
  }
}
