"use client";

import { useState } from "react";

interface EnrichedCustomer {
  id: string;
  whatsapp: string;
  name: string | null;
  cutsCount: number;
  sessionState: string;
  lastVisitAt: Date | null;
  lastReactivationSentAt: Date | null;
  avgRating: number | null;
  isNewThisMonth: boolean;
  isRecurrent: boolean;
  totalVisits: number;
}

interface ClientesTabsProps {
  customers: EnrichedCustomer[];
  initialTab: string;
  requiredCuts: number;
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="text-[#5c554c] text-xs">Sin calificar</span>;
  }
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {"★".repeat(full)}
      {half ? "⯨" : ""}
      <span className="text-[#2a2520]">{"★".repeat(empty)}</span>
      <span className="text-[#5c554c] font-mono text-[10px] ml-1">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

function LoyaltyBar({
  cutsCount,
  requiredCuts,
}: {
  cutsCount: number;
  requiredCuts: number;
}) {
  const progress = Math.min((cutsCount % requiredCuts) / requiredCuts, 1) * 100;
  const completedCycles = Math.floor(cutsCount / requiredCuts);

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[10px] text-[#5c554c]">
          {cutsCount % requiredCuts}/{requiredCuts} para premio
        </span>
        {completedCycles > 0 && (
          <span className="font-mono text-[10px] text-[#d97644]">
            🎁 {completedCycles}x completado
          </span>
        )}
      </div>
      <div className="h-1 bg-[#2a2520] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#d97644] rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function CustomerCard({
  customer,
  requiredCuts,
}: {
  customer: EnrichedCustomer;
  requiredCuts: number;
}) {
  const lastVisitStr = customer.lastVisitAt
    ? new Date(customer.lastVisitAt).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "America/Guayaquil",
      })
    : "Sin visitas";

  const daysSinceVisit = customer.lastVisitAt
    ? Math.floor(
        (Date.now() - new Date(customer.lastVisitAt).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="bg-[#131110] border border-[#2a2520] p-5 hover:border-[#d97644]/40 transition-colors group">
      {/* Header del cliente */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-light text-[#f3ece1] truncate group-hover:text-[#d97644] transition-colors">
            {customer.name || "Cliente Anónimo"}
          </p>
          <p className="font-mono text-xs text-[#5c554c] mt-0.5">
            +{customer.whatsapp}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
          {customer.isNewThisMonth && (
            <span className="px-2 py-0.5 bg-green-950/40 border border-green-800 text-green-400 font-mono text-[9px] uppercase tracking-wider">
              Nuevo
            </span>
          )}
          {customer.isRecurrent && (
            <span className="px-2 py-0.5 bg-[#d97644]/10 border border-[#d97644]/40 text-[#d97644] font-mono text-[9px] uppercase tracking-wider">
              Recurrente
            </span>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3 mb-4 text-center">
        <div className="bg-[#0a0807] p-2.5">
          <p className="font-display text-2xl font-light text-[#f3ece1]">
            {customer.cutsCount}
          </p>
          <p className="font-mono text-[9px] uppercase text-[#5c554c] tracking-wider">
            Cortes
          </p>
        </div>
        <div className="bg-[#0a0807] p-2.5">
          <div className="flex items-center justify-center pt-1">
            <StarRating rating={customer.avgRating} />
          </div>
          <p className="font-mono text-[9px] uppercase text-[#5c554c] tracking-wider mt-1">
            Rating
          </p>
        </div>
        <div className="bg-[#0a0807] p-2.5">
          <p className="font-display text-2xl font-light text-[#f3ece1]">
            {customer.totalVisits}
          </p>
          <p className="font-mono text-[9px] uppercase text-[#5c554c] tracking-wider">
            Visitas
          </p>
        </div>
      </div>

      {/* Último corte */}
      <div className="flex justify-between items-center mb-3 font-mono text-[10px]">
        <span className="text-[#5c554c]">Último corte:</span>
        <span className="text-[#a89e90]">
          {lastVisitStr}
          {daysSinceVisit !== null && (
            <span className="ml-1 text-[#5c554c]">
              ({daysSinceVisit === 0
                ? "hoy"
                : daysSinceVisit === 1
                ? "ayer"
                : `hace ${daysSinceVisit}d`})
            </span>
          )}
        </span>
      </div>

      {/* Barra de fidelidad */}
      <LoyaltyBar cutsCount={customer.cutsCount} requiredCuts={requiredCuts} />
    </div>
  );
}

function EmptyState({ tab }: { tab: string }) {
  const messages: Record<string, { title: string; subtitle: string }> = {
    todos: {
      title: "Aún no hay clientes registrados",
      subtitle: "Los clientes aparecerán aquí cuando hagan su primer check-in por WhatsApp.",
    },
    nuevos: {
      title: "Ningún cliente nuevo este mes",
      subtitle: "Los clientes que visiten por primera vez este mes aparecerán aquí.",
    },
    recurrentes: {
      title: "Ningún cliente recurrente todavía",
      subtitle: "Los clientes con 2 o más visitas registradas aparecerán aquí.",
    },
  };
  const msg = messages[tab] ?? messages.todos;

  return (
    <div className="border border-[#2a2520] bg-[#131110] p-16 text-center">
      <p className="font-display italic text-xl text-[#5c554c] mb-3">{msg.title}</p>
      <p className="font-mono text-xs text-[#5c554c] tracking-wider max-w-sm mx-auto leading-relaxed">
        {msg.subtitle}
      </p>
    </div>
  );
}

export default function ClientesTabs({
  customers,
  initialTab,
  requiredCuts,
}: ClientesTabsProps) {
  const [activeTab, setActiveTab] = useState<"todos" | "nuevos" | "recurrentes">(
    (["todos", "nuevos", "recurrentes"].includes(initialTab)
      ? initialTab
      : "todos") as "todos" | "nuevos" | "recurrentes"
  );

  const tabs = [
    {
      id: "todos" as const,
      label: "Todos",
      count: customers.length,
    },
    {
      id: "nuevos" as const,
      label: "Nuevos este mes",
      count: customers.filter((c) => c.isNewThisMonth).length,
    },
    {
      id: "recurrentes" as const,
      label: "Recurrentes",
      count: customers.filter((c) => c.isRecurrent).length,
    },
  ];

  const filtered = customers.filter((c) => {
    if (activeTab === "nuevos") return c.isNewThisMonth;
    if (activeTab === "recurrentes") return c.isRecurrent;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-0 border border-[#2a2520] overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 font-mono text-xs tracking-wider uppercase transition-colors ${
              activeTab === tab.id
                ? "bg-[#d97644] text-[#0a0807] font-bold"
                : "bg-[#0a0807] text-[#5c554c] hover:text-[#f3ece1] hover:bg-[#131110]"
            }`}
          >
            {tab.label}
            <span
              className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id
                  ? "bg-[#0a0807]/20 text-[#0a0807]"
                  : "bg-[#2a2520] text-[#a89e90]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Ordenamiento y búsqueda */}
      {filtered.length > 0 && (
        <div className="font-mono text-[10px] text-[#5c554c]">
          Mostrando <span className="text-[#f3ece1]">{filtered.length}</span>{" "}
          {activeTab === "todos" ? "clientes" : activeTab === "nuevos" ? "clientes nuevos este mes" : "clientes recurrentes"}
        </div>
      )}

      {/* Grid de tarjetas */}
      {filtered.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              requiredCuts={requiredCuts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
