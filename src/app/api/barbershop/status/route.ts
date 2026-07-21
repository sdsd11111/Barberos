import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEvolutionStatus } from "@/lib/evolution";

export async function GET(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");
    if (!barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: { evolutionInstance: true, connectionStatus: true, whatsappConnected: true },
    });

    if (!barbershop) {
      return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    }

    // Consultar el estado real directo de Evolution API
    const realStatus = await getEvolutionStatus(barbershop.evolutionInstance);

    // Mapear estado al enum interno
    let internalStatus = "DISCONNECTED";
    if (realStatus === "open" || realStatus === "connected") {
      internalStatus = "CONNECTED";
    } else if (realStatus === "connecting" || realStatus === "qrcode") {
      internalStatus = "WAITING_QR";
    }

    // Sincronizar en DB si difiere
    if (internalStatus !== barbershop.connectionStatus) {
      await prisma.barbershop.update({
        where: { id: barbershopId },
        data: { connectionStatus: internalStatus },
      });
    }

    return NextResponse.json({
      status: internalStatus,
      whatsappConnected: barbershop.whatsappConnected,
      barbershopId: barbershopId,
    });
  } catch (error) {
    console.error("[GET /api/barbershop/status] Error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
