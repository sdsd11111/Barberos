import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const barbershopId = request.headers.get("x-barbershop-id");

    if (!barbershopId) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    // Obtener visitas PENDING en los últimos 15 minutos
    const pendingVisits = await prisma.barberVisit.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          gte: fifteenMinutesAgo,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const customerIds = pendingVisits.map((v) => v.customerId);

    // Obtener información de los clientes filtrados por barbería (seguridad multi-tenant)
    const customers = await prisma.barberCustomer.findMany({
      where: {
        id: { in: customerIds },
        barbershopId,
      },
    });

    const customersMap = new Map(customers.map((c) => [c.id, c]));

    // Mapear resultados finales filtrando visitas que no pertenecen a esta barbería
    const results = pendingVisits
      .map((v) => {
        const customer = customersMap.get(v.customerId);
        if (!customer) return null;
        return {
          id: v.id,
          createdAt: v.createdAt,
          customer: {
            id: customer.id,
            whatsapp: customer.whatsapp,
            name: customer.name || "Cliente Nuevo",
          },
        };
      })
      .filter((v) => v !== null);

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Pending Visits API] Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
