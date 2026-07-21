import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEvolutionStatus } from "@/lib/evolution";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const cronSecret = process.env.CRON_SECRET || "cron_secret_desarrollo_local";

    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener todas las barberías activas
    const barbershops = await prisma.barbershop.findMany({
      select: { id: true, evolutionInstance: true, connectionStatus: true },
    });

    let updatedCount = 0;

    for (const shop of barbershops) {
      try {
        const realState = await getEvolutionStatus(shop.evolutionInstance);

        let connectionStatus = "DISCONNECTED";
        if (realState === "open" || realState === "connected") {
          connectionStatus = "CONNECTED";
        } else if (realState === "connecting" || realState === "qrcode") {
          connectionStatus = "WAITING_QR";
        }

        if (connectionStatus !== shop.connectionStatus) {
          await prisma.barbershop.update({
            where: { id: shop.id },
            data: { connectionStatus },
          });
          updatedCount++;
        }
      } catch (err) {
        console.error(`[Cron Check Connections] Error con instancia ${shop.evolutionInstance}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización de estados completada. Instancias actualizadas: ${updatedCount}`,
    });
  } catch (error) {
    console.error("[Cron Check Connections] Error general:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
