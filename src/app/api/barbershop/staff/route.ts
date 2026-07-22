import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateStaffSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

export async function GET(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const staff = await prisma.barberStaff.findMany({
      where: { barbershopId },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[GET /api/barbershop/staff] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateStaffSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const newStaff = await prisma.barberStaff.create({
      data: {
        barbershopId,
        name: parsed.data.name,
      },
    });

    return NextResponse.json(newStaff);
  } catch (error) {
    console.error("[POST /api/barbershop/staff] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de miembro requerido" }, { status: 400 });
    }

    await prisma.barberStaff.deleteMany({
      where: {
        id,
        barbershopId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/barbershop/staff] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
