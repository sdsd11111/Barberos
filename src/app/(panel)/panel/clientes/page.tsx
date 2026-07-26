import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { isPremiumBarbershop } from "@/lib/plan-guard";
import ClientesTabs from "@/components/panel/ClientesTabs";
import ExportDataButton from "@/components/panel/ExportDataButton";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await verifySession();
  const barbershopId = session.barbershopId;
  const isPremium = await isPremiumBarbershop(barbershopId);
  const { tab } = await searchParams;

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
  });

  // Obtener todos los PERFILES con datos completos
  const profiles = await prisma.customerProfile.findMany({
    where: { barbershopId, isActive: true },
    include: {
      customer: true, // Para obtener el whatsapp y cutsCount de la cuenta
    },
    orderBy: { createdAt: "desc" }, // Idealmente ordenar por lastVisit, pero requiere join complejo, ordenamos por creación de perfil base
  });

  const profileIds = profiles.map((p) => p.id);

  // Obtener el equipo de la barbería para mapear los nombres de los profesionales
  const staffList = await prisma.barberStaff.findMany({
    where: { barbershopId },
    select: { id: true, name: true },
  });
  const staffMap = new Map(staffList.map((s) => [s.id, s.name]));

  // Obtener todas las visitas aprobadas de la barbería
  const allVisits = await prisma.barberVisit.findMany({
    where: {
      barbershopId,
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Enriquecer cada PERFIL con sus estadísticas e historial detallado de visitas
  const enrichedProfiles = profiles.map((profile) => {
    const visits = allVisits.filter((v) => v.profileId === profile.id);
    const approvedVisits = visits.filter((v) => v.status === "APPROVED");
    const ratedVisits = approvedVisits.filter((v) => v.rating !== null);
    const avgRating =
      ratedVisits.length > 0
        ? ratedVisits.reduce((acc, v) => acc + (v.rating ?? 0), 0) / ratedVisits.length
        : null;

    const lastVisit = approvedVisits[0] ?? null;
    const isNewThisMonth =
      lastVisit !== null && lastVisit.createdAt >= startOfMonth;
    
    // Loyalty logic
    const activeCutsCount = barbershop?.loyaltyMode === "BY_ACCOUNT" ? profile.customer.cutsCount : profile.cutsCount;
    const isRecurrent = activeCutsCount >= 2;

    const history = visits.map((v) => ({
      id: v.id,
      createdAt: v.createdAt.toISOString(),
      status: v.status,
      rating: v.rating,
      comment: v.comment,
      staffName: v.staffId ? staffMap.get(v.staffId) || "Profesional no encontrado" : null,
    }));

    return {
      id: profile.id,
      whatsapp: profile.customer.whatsapp,
      name: profile.name,
      customerName: profile.customer.name,
      cutsCount: activeCutsCount,
      avgRating,
      sessionState: profile.customer.sessionState,
      lastVisitAt: lastVisit?.createdAt ?? null,
      isNewThisMonth,
      isRecurrent,
      totalVisits: approvedVisits.length,
      history,
    };
  });

  // Agrupar todas las visitas de Consumidor Final (CF) en una única entrada consolidada
  const cfVisits = allVisits.filter((v) => !v.customerId || !v.profileId);
  if (cfVisits.length > 0) {
    const lastCfVisit = cfVisits[0];
    enrichedProfiles.unshift({
      id: "cf-profile-synthetic",
      whatsapp: "CF",
      name: "Consumidor Final (CF)",
      customerName: "Consumidor Final (CF)",
      cutsCount: cfVisits.length,
      avgRating: null,
      sessionState: "CF",
      lastVisitAt: lastCfVisit.createdAt,
      isNewThisMonth: false,
      isRecurrent: false,
      totalVisits: cfVisits.length,
      history: cfVisits.map((v) => ({
        id: v.id,
        createdAt: v.createdAt.toISOString(),
        status: v.status,
        rating: v.rating,
        comment: v.comment,
        staffName: v.staffId ? staffMap.get(v.staffId) || "Sin asignar" : "Sin asignar",
      })),
    });
  }

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
        <div className="flex items-center gap-3">
          {isPremium && <ExportDataButton variant="compact" />}
          <div className="font-mono text-xs text-[#5c554c]">
            {enrichedProfiles.length} perfiles registrados
          </div>
        </div>
      </header>

      <ClientesTabs
        customers={enrichedProfiles}
        initialTab={tab ?? "todos"}
        requiredCuts={requiredCuts}
        loyaltyMode={barbershop?.loyaltyMode ?? "BY_PROFILE"}
      />
    </div>
  );
}
