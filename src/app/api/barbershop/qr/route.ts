import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getFreshQR } from "@/lib/evolution";

export async function GET(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: { evolutionInstance: true },
    });

    if (!barbershop) {
      return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    }

    const qrResult = await getFreshQR(barbershop.evolutionInstance);
    if (!qrResult.success) {
      return NextResponse.json({ error: "No se pudo generar el código QR. Revisa la instancia." }, { status: 500 });
    }

    return NextResponse.json({
      qrcode: qrResult.qrcode, // base64
      code: qrResult.code,     // pairing code opcional
    });
  } catch (error) {
    console.error("[GET /api/barbershop/qr] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
