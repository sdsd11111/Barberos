import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import ApprovalQueue from "@/components/ApprovalQueue";
import RegisterVisitButton from "@/components/RegisterVisitButton";
import DownloadQRButton from "@/components/DownloadQRButton";
import ExportDataButton from "@/components/panel/ExportDataButton";
import MotorSummaryWidget from "@/components/panel/MotorSummaryWidget";
import DirectorWidget from "@/components/panel/DirectorWidget";

import { isPremiumBarbershop } from "@/lib/plan-guard";

import { calculateCustomerMetrics } from "@/lib/customer-intervals";

export default async function DashboardPage() {
  const session = await verifySession();
  const barbershopId = session.barbershopId;
  const isPremium = await isPremiumBarbershop(barbershopId);

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
  });

  if (!barbershop) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl text-[#d97644]">Error: Barbería no encontrada</h2>
      </div>
    );
  }

  const customers = await prisma.barberCustomer.findMany({
    where: { barbershopId },
    orderBy: { cutsCount: "desc" },
  });
  const customerIds = customers.map((c) => c.id);

  // Obtener todas las visitas aprobadas para calcular frecuencia de cada cliente
  const allApprovedVisits = await prisma.barberVisit.findMany({
    where: {
      barbershopId,
      status: "APPROVED",
      customerId: { not: null },
    },
    select: {
      customerId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Mapear fechas de visita por cliente
  const customerVisitsMap = new Map<string, Date[]>();
  allApprovedVisits.forEach((v) => {
    if (v.customerId) {
      if (!customerVisitsMap.has(v.customerId)) customerVisitsMap.set(v.customerId, []);
      customerVisitsMap.get(v.customerId)!.push(new Date(v.createdAt));
    }
  });

  // Enriquecer clientes con sus intervalos (0.8x preventivo, 1.2x recuperacion)
  const customersWithMetrics = customers.map((cust) => {
    const dates = customerVisitsMap.get(cust.id) || [];
    const metrics = calculateCustomerMetrics(dates, cust.lastVisitAt);
    return {
      ...cust,
      metrics,
    };
  });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Visitas y métricas
  const cutsToday = await prisma.barberVisit.count({
    where: {
      barbershopId,
      status: "APPROVED",
      createdAt: { gte: startOfDay },
    },
  });

  const totalCustomers = customers.length;

  const newCustomersThisMonth = await prisma.barberCustomer.count({
    where: {
      barbershopId,
      lastVisitAt: { gte: startOfMonth },
    },
  });

  const recurrentCustomers = customers.filter((c) => c.cutsCount >= 2).length;
  const retentionRate = totalCustomers > 0 ? Math.round((recurrentCustomers / totalCustomers) * 100) : 0;

  // Reseñas y reputación
  const ratedVisits = await prisma.barberVisit.findMany({
    where: {
      barbershopId,
      status: "APPROVED",
      rating: { not: null },
    },
    select: { rating: true, createdAt: true },
  });

  const totalRatings = ratedVisits.length;
  const avgRating = totalRatings > 0
    ? ratedVisits.reduce((acc, v) => acc + (v.rating || 0), 0) / totalRatings
    : 5.0;

  const ratingsThisMonth = ratedVisits.filter(v => new Date(v.createdAt) >= startOfMonth).length;

  // Clientes en alerta (OVERDUE 1.2x o PRE_CUT_DUE 0.8x)
  const overdueCustomers = customersWithMetrics.filter((c) => c.metrics.status === "OVERDUE");
  const preCutCustomers = customersWithMetrics.filter((c) => c.metrics.status === "PRE_CUT_DUE");

  // Todos los clientes a recuperar (combinando overdue y pre_cut)
  const customersToRecover = [...overdueCustomers, ...preCutCustomers];

  // Cálculo del Score de Salud (0 - 100)
  const repScore = (avgRating / 5) * 25;
  const retScore = (retentionRate / 100) * 30;
  const newScore = Math.min(newCustomersThisMonth / 10, 1) * 20;
  const inactiveRatio = totalCustomers > 0 ? overdueCustomers.length / totalCustomers : 0;
  const inactiveScore = Math.max(0, 15 - inactiveRatio * 30);
  const revScore = Math.min(totalRatings / 5, 1) * 10;

  const rawHealthScore = Math.round(repScore + retScore + newScore + inactiveScore + revScore);
  const healthScore = Math.min(100, Math.max(0, rawHealthScore));

  let healthStatus = "Excelente";
  let healthColor = "text-emerald-400 bg-emerald-950/40 border-emerald-800";
  let healthDot = "bg-emerald-400";
  let healthMessage = `Tu barbería está muy saludable. Esta semana registraste un alto retorno de clientes.`;

  if (healthScore < 60) {
    healthStatus = "En Atención";
    healthColor = "text-red-400 bg-red-950/40 border-red-800";
    healthDot = "bg-red-400";
    healthMessage = `Atención requerida: tienes ${overdueCustomers.length} clientes que han superado su frecuencia habitual de corte (límite 1.2x).`;
  } else if (healthScore < 80) {
    healthStatus = "Estable";
    healthColor = "text-amber-400 bg-amber-950/40 border-amber-800";
    healthDot = "bg-amber-400";
    healthMessage = `Tu barbería está estable. Te recomendamos recordarles su corte a los clientes en límite 0.8x.`;
  }

  // Top 5 VIPs y Top 5 por recuperar
  const vipCustomers = customers.slice(0, 5);
  const inactiveToRecover = customersToRecover.slice(0, 5);

  // Historial diario reciente
  const recentVisitsData = await prisma.barberVisit.findMany({
    where: {
      barbershopId,
      createdAt: { gte: startOfDay },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const recentVisits = recentVisitsData.map((visit) => {
    const customer = visit.customerId ? customers.find((c) => c.id === visit.customerId) : null;
    return {
      ...visit,
      customerName: customer ? customer.name || "Cliente Registrado" : "Consumidor Final (CF)",
      customerWhatsapp: customer ? customer.whatsapp : "CF",
      cutsCount: customer ? customer.cutsCount : 1,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">

      {/* HERO SUPERIOR CON REGISTRAR CORTE Y SALUD */}
      <div className="bg-[#131110] border border-[#2a2520] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#d97644]">
                ESPEJO DEL NEGOCIO
              </span>
              {isPremium && (
                <span className="bg-[#d97644]/10 text-[#d97644] border border-[#d97644]/30 px-2 py-0.5 text-[9px] font-mono rounded">
                  PLAN PREMIUM
                </span>
              )}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-light text-[#f3ece1]">
              {barbershop.name}
            </h1>
            <p className="text-sm text-[#a89e90] max-w-xl leading-relaxed">
              {healthMessage}
            </p>
          </div>

          {/* Salud del Negocio (Score 0-100) + Registrar Corte */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {/* Widget Salud 0-100 */}
            <div className={`p-4 border rounded flex items-center gap-4 ${healthColor}`}>
              <div className="text-center">
                <span className="font-display text-3xl font-bold tracking-tight block">
                  {healthScore}<span className="text-xs font-normal text-[#a89e90]">/100</span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-wider opacity-80">
                  Salud
                </span>
              </div>
              <div className="border-l border-current/20 pl-3">
                <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                  <span className={`w-2 h-2 rounded-full ${healthDot} animate-pulse`} />
                  {healthStatus}
                </div>
                <p className="font-mono text-[9px] opacity-75 mt-0.5">
                  Basado en reputación y retención
                </p>
              </div>
            </div>

            {/* BOTÓN REGISTRAR CORTE PRIMORDIAL */}
            <div className="flex items-center">
              <RegisterVisitButton barbershopId={barbershopId} />
            </div>
          </div>
        </div>
      </div>

      {/* LAS 4 TARJETAS PRINCIPALES ENORMES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ⭐ Reputación */}
        <div className="bg-[#131110] border border-[#2a2520] p-6 space-y-3 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[#5c554c] font-mono text-[10px] uppercase tracking-wider">
            <span>Reputación</span>
            <span className="text-amber-400">★ ★ ★ ★ ★</span>
          </div>
          <div>
            <p className="font-display text-4xl sm:text-5xl font-light text-[#f3ece1]">
              {avgRating.toFixed(1)}
            </p>
            <p className="font-mono text-xs text-[#a89e90] mt-1">
              {totalRatings} reseñas registradas
            </p>
          </div>
          <div className="pt-2 border-t border-[#2a2520] font-mono text-[10px] text-emerald-400 flex items-center gap-1">
            <span>↑</span> +{ratingsThisMonth} este mes
          </div>
        </div>

        {/* 2. 👥 Clientes */}
        <a href="/panel/clientes?tab=todos" className="bg-[#131110] border border-[#2a2520] p-6 space-y-3 flex flex-col justify-between group hover:border-[#d97644]/50 transition-colors">
          <div className="flex justify-between items-center text-[#5c554c] font-mono text-[10px] uppercase tracking-wider group-hover:text-[#d97644]">
            <span>Clientes</span>
            <span>↗</span>
          </div>
          <div>
            <p className="font-display text-4xl sm:text-5xl font-light text-[#f3ece1] group-hover:text-[#d97644] transition-colors">
              {totalCustomers}
            </p>
            <p className="font-mono text-xs text-[#a89e90] mt-1">
              Base de clientes activos
            </p>
          </div>
          <div className="pt-2 border-t border-[#2a2520] font-mono text-[10px] text-[#d97644] flex items-center gap-1">
            <span>+</span>{newCustomersThisMonth} nuevos este mes
          </div>
        </a>

        {/* 3. 🔁 Retención (% Clientes que regresan) */}
        <a href="/panel/clientes?tab=recurrentes" className="bg-[#131110] border border-[#2a2520] p-6 space-y-3 flex flex-col justify-between group hover:border-[#d97644]/50 transition-colors">
          <div className="flex justify-between items-center text-[#5c554c] font-mono text-[10px] uppercase tracking-wider group-hover:text-[#d97644]">
            <span>Retención</span>
            <span>↗</span>
          </div>
          <div>
            <p className="font-display text-4xl sm:text-5xl font-light text-[#f3ece1] group-hover:text-[#d97644] transition-colors">
              {retentionRate}%
            </p>
            <p className="font-mono text-xs text-[#a89e90] mt-1">
              de tus clientes regresan
            </p>
          </div>
          <div className="pt-2 border-t border-[#2a2520] font-mono text-[10px] text-[#a89e90]">
            {recurrentCustomers} clientes recurrentes
          </div>
        </a>

        {/* 4. 🚨 Recupera Clientes */}
        <a href="/panel/clientes?tab=recurrentes" className="bg-[#131110] border border-[#2a2520] p-6 space-y-3 flex flex-col justify-between group hover:border-amber-500/50 transition-colors">
          <div className="flex justify-between items-center text-[#5c554c] font-mono text-[10px] uppercase tracking-wider group-hover:text-amber-400">
            <span className="text-amber-400 flex items-center gap-1">🚨 Recupera</span>
            <span>↗</span>
          </div>
          <div>
            <p className="font-display text-4xl sm:text-5xl font-light text-amber-400">
              {overdueCustomers.length}
            </p>
            <p className="font-mono text-xs text-[#a89e90] mt-1">
              clientes superaron límite 1.2x
            </p>
          </div>
          <div className="pt-2 border-t border-[#2a2520] font-mono text-[10px] text-amber-400 flex items-center justify-between">
            <span>+{preCutCustomers.length} en alerta 0.8x</span>
            <span className="text-[9px] text-[#5c554c]">PWA 8:00 AM</span>
          </div>
        </a>
      </div>

      {/* COLA DE APROBACIONES */}
      <ApprovalQueue barbershopId={barbershopId} />

      {/* MOTOR DE CONOCIMIENTO (PREMIUM) */}
      <MotorSummaryWidget barbershopId={barbershopId} />

      {/* DIRECTOR IA — EXCLUSIVO SOLO PARA PLAN PREMIUM */}
      {isPremium && <DirectorWidget />}

      {/* SECCIONES DE ACCIÓN RÁPIDA: TOP VIPs Y RECUPERACIÓN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TUS MEJORES CLIENTES (VIPs) */}
        <div className="bg-[#131110] border border-[#2a2520] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#2a2520] pb-3">
            <h3 className="font-display text-lg text-[#f3ece1] font-light flex items-center gap-2">
              <span>⭐</span> Tus Mejores Clientes (VIPs)
            </h3>
            <span className="font-mono text-[10px] text-[#5c554c] uppercase">Top 5</span>
          </div>
          
          {vipCustomers.length === 0 ? (
            <p className="font-mono text-xs text-[#5c554c] italic">Aún no hay suficientes registros.</p>
          ) : (
            <div className="space-y-3">
              {vipCustomers.map((cust) => (
                <div key={cust.id} className="flex justify-between items-center p-3 bg-[#0a0807] border border-[#1c1917] hover:border-[#2a2520] transition-colors">
                  <div>
                    <p className="font-display text-sm text-[#f3ece1] font-light flex items-center gap-2">
                      {cust.name || "Cliente Registrado"}
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-800/40">VIP</span>
                    </p>
                    <p className="font-mono text-[10px] text-[#5c554c] mt-0.5">
                      {cust.cutsCount} visitas realizadas
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${cust.whatsapp}?text=${encodeURIComponent(`¡Hola ${cust.name || ""}! Gracias por ser uno de nuestros clientes VIP en ${barbershop.name}. Te esperamos pronto.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 border border-emerald-800 px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 shrink-0"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CLIENTES QUE TE EXTRAÑAN (RECUPERACIÓN INTELIGENTE 0.8x y 1.2x) */}
        <div className="bg-[#131110] border border-[#2a2520] p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#2a2520] pb-3">
            <div>
              <h3 className="font-display text-lg text-[#f3ece1] font-light flex items-center gap-2">
                <span className="text-amber-400">🚨</span> Clientes que te extrañan
              </h3>
              <p className="font-mono text-[9px] text-[#5c554c]">Frecuencia Inteligente (0.8x / 1.2x)</p>
            </div>
            <span className="font-mono text-[10px] text-amber-400 uppercase">Sugerencias PWA 8am</span>
          </div>

          {inactiveToRecover.length === 0 ? (
            <p className="font-mono text-xs text-emerald-400 italic">¡Excelente! Todos tus clientes están dentro de su ciclo habitual de corte.</p>
          ) : (
            <div className="space-y-3">
              {inactiveToRecover.map((cust) => {
                const isOverdue = cust.metrics.status === "OVERDUE";
                const days = cust.metrics.daysSinceLastVisit || 0;
                const pattern = cust.metrics.avgIntervalDays;

                const msgText = isOverdue
                  ? `¡Hola ${cust.name || ""}! Te extrañamos en ${barbershop.name}. Tu tiempo habitual de corte es cada ${pattern} días y han pasado ${days} días. ¡Te esperamos para renovar tu estilo!`
                  : `¡Hola ${cust.name || ""}! En ${barbershop.name} recordamos que ya casi se cumple tu ciclo habitual de corte (hace ${days} días). ¿Te agendamos un espacio?`;

                return (
                  <div key={cust.id} className="flex justify-between items-center p-3 bg-[#0a0807] border border-[#1c1917] hover:border-[#2a2520] transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-sm text-[#f3ece1] font-light">
                          {cust.name || "Cliente Registrado"}
                        </p>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                          isOverdue 
                            ? "bg-red-950/40 text-red-400 border-red-800" 
                            : "bg-amber-950/40 text-amber-400 border-amber-800"
                        }`}>
                          {isOverdue ? "1.2x Excedido" : "0.8x Pre-corte"}
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-[#5c554c] mt-0.5">
                        ⚠️ Hace {days}d (Patrón habitual: c/{pattern}d)
                      </p>
                    </div>
                    <a
                      href={`https://wa.me/${cust.whatsapp}?text=${encodeURIComponent(msgText)}`}
                      target="_blank"
                      rel="noreferrer"
                      className={`font-mono text-[10px] px-2.5 py-1.5 rounded transition-colors flex items-center gap-1 shrink-0 ${
                        isOverdue
                          ? "text-red-400 hover:text-red-300 bg-red-950/40 border border-red-800"
                          : "text-amber-400 hover:text-amber-300 bg-amber-950/40 border border-amber-800"
                      }`}
                    >
                      {isOverdue ? "📩 Invitar" : "⏰ Avisar"}
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* LIBRO DIARIO / ACTIVIDAD RECIENTE DEL DÍA */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="font-display text-xl sm:text-2xl font-light text-[#f3ece1]">
            Libro Diario{" "}
            <span className="text-[#5c554c] text-sm font-mono">/ Historial de Hoy</span>
          </h3>
          <div className="flex items-center gap-3">
            {isPremium && <ExportDataButton variant="compact" />}
          </div>
        </div>

        {recentVisits.length === 0 ? (
          <div className="border border-[#2a2520] bg-[#131110] p-8 text-center">
            <p className="font-display italic text-lg text-[#5c554c] mb-2">
              No hay visitas registradas el día de hoy
            </p>
            <p className="font-mono text-[10px] text-[#5c554c] tracking-widest uppercase">
              Usa el botón "Registrar corte" arriba para añadir un registro manual.
            </p>
          </div>
        ) : (
          <div className="border border-[#2a2520] bg-[#131110] overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-[#a89e90]">
              <thead>
                <tr className="border-b border-[#2a2520] text-[#5c554c] uppercase bg-[#0a0807]">
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">WhatsApp</th>
                  <th className="py-3 px-4">Cortes</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Calificación</th>
                  <th className="py-3 px-4 text-right">Hora</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.map((visit) => (
                  <tr key={visit.id} className="border-b border-[#1c1917] hover:bg-[#0a0807]/50 transition-colors">
                    <td className="py-3 px-4 font-display text-base text-[#f3ece1] font-light">
                      {visit.customerName}
                    </td>
                    <td className="py-3 px-4">+{visit.customerWhatsapp}</td>
                    <td className="py-3 px-4">{visit.cutsCount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          visit.status === "APPROVED"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800"
                            : visit.status === "PENDING"
                            ? "bg-amber-950/40 text-amber-400 border border-amber-800 animate-pulse"
                            : "bg-red-950/40 text-red-400 border border-red-800"
                        }`}
                      >
                        {visit.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-amber-400">
                      {visit.rating
                        ? "★".repeat(visit.rating) + "☆".repeat(5 - visit.rating)
                        : "Sin calificar"}
                    </td>
                    <td className="py-3 px-4 text-right text-[#5c554c]">
                      {new Date(visit.createdAt).toLocaleTimeString("es-EC", {
                        timeZone: "America/Guayaquil",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

