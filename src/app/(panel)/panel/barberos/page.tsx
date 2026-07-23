import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import BarberosView from "@/components/panel/BarberosView";

export default async function BarberosPage() {
  const session = await verifySession();
  const barbershopId = session.barbershopId;

  // Obtener staff de la barbería
  const staff = await prisma.barberStaff.findMany({
    where: { barbershopId },
    orderBy: { name: "asc" },
  });

  // Obtener todos los clientes de esta barbería
  const customers = await prisma.barberCustomer.findMany({
    where: { barbershopId },
    select: { id: true, name: true, whatsapp: true },
  });
  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const customerIds = customers.map((c) => c.id);

  // Obtener todas las visitas aprobadas con calificación
  const visits = await prisma.barberVisit.findMany({
    where: {
      customerId: { in: customerIds },
      status: "APPROVED",
      rating: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calificación general (todas las visitas con rating)
  const allRatings = visits.filter((v) => v.rating !== null);
  const generalAvg =
    allRatings.length > 0
      ? allRatings.reduce((sum, v) => sum + (v.rating ?? 0), 0) / allRatings.length
      : 0;
  const generalCount = allRatings.length;

  // Distribución de estrellas general
  const generalDistribution = [0, 0, 0, 0, 0];
  allRatings.forEach((v) => {
    if (v.rating && v.rating >= 1 && v.rating <= 5) {
      generalDistribution[v.rating - 1]++;
    }
  });

  // Calificación por barbero
  const staffStats = staff.map((member) => {
    const staffVisits = visits.filter((v) => v.staffId === member.id && v.rating !== null);
    const avg =
      staffVisits.length > 0
        ? staffVisits.reduce((sum, v) => sum + (v.rating ?? 0), 0) / staffVisits.length
        : 0;

    const distribution = [0, 0, 0, 0, 0];
    staffVisits.forEach((v) => {
      if (v.rating && v.rating >= 1 && v.rating <= 5) {
        distribution[v.rating - 1]++;
      }
    });

    const reviews = staffVisits.map((v) => {
      const cust = customerMap.get(v.customerId);
      return {
        id: v.id,
        rating: v.rating!,
        createdAt: v.createdAt.toISOString(),
        customerName: cust?.name || "Cliente Registrado",
        customerWhatsapp: cust?.whatsapp || "",
      };
    });

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      avgRating: avg,
      totalRatings: staffVisits.length,
      distribution,
      reviews,
    };
  });

  // Visitas sin barbero asignado (antes de implementar la selección de staff)
  const unassignedVisits = visits.filter((v) => !v.staffId && v.rating !== null);
  const unassignedCount = unassignedVisits.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] mb-1">
            Rendimiento
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-light">Barberos</h2>
        </div>
        <div className="font-mono text-xs text-[#5c554c]">
          {generalCount} calificaciones totales
        </div>
      </header>

      <BarberosView
        generalAvg={generalAvg}
        generalCount={generalCount}
        generalDistribution={generalDistribution}
        staffStats={staffStats}
        unassignedCount={unassignedCount}
      />
    </div>
  );
}
