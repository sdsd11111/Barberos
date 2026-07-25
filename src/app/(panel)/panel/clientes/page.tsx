import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import ClientesTabs from "@/components/panel/ClientesTabs";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await verifySession();
  const barbershopId = session.barbershopId;
  const { tab } = await searchParams;

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
  });

  // Obtener todos los clientes con datos completos
  const customers = await prisma.barberCustomer.findMany({
    where: { barbershopId },
    orderBy: { lastVisitAt: { sort: "desc", nulls: "last" } },
  });

  const customerIds = customers.map((c) => c.id);

  // Obtener todas las visitas aprobadas para calcular ratings y estadísticas
  const allVisits = await prisma.barberVisit.findMany({
    where: {
      customerId: { in: customerIds },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Enriquecer cada cliente con sus estadísticas
  const enrichedCustomers = customers.map((customer) => {
    const visits = allVisits.filter((v) => v.customerId === customer.id);
    const approvedVisits = visits.filter((v) => v.status === "APPROVED");
    const ratedVisits = approvedVisits.filter((v) => v.rating !== null);
    const avgRating =
      ratedVisits.length > 0
        ? ratedVisits.reduce((acc, v) => acc + (v.rating ?? 0), 0) / ratedVisits.length
        : null;

    const lastVisit = approvedVisits[0] ?? null;
    const isNewThisMonth =
      customer.lastVisitAt !== null && customer.lastVisitAt >= startOfMonth;
    const isRecurrent = customer.cutsCount >= 2;

    return {
      ...customer,
      avgRating,
      lastVisitAt: lastVisit?.createdAt ?? null,
      isNewThisMonth,
      isRecurrent,
      totalVisits: approvedVisits.length,
    };
  });

  const requiredCuts = barbershop?.requiredCuts ?? 5;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] mb-1">
            Gestión
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-light">Clientes</h2>
        </div>
        <div className="font-mono text-xs text-[#5c554c]">
          {enrichedCustomers.length} clientes registrados
        </div>
      </header>

      <ClientesTabs
        customers={enrichedCustomers}
        initialTab={tab ?? "todos"}
        requiredCuts={requiredCuts}
      />
    </div>
  );
}
