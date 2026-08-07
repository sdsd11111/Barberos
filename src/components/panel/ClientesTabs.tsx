"use client";

import { useState, useEffect } from "react";
import { getTenantTerms } from "@/lib/tenant-dictionary";

interface VisitHistoryItem {
  id: string;
  createdAt: string;
  status: string;
  rating: number | null;
  comment: string | null;
  staffName: string | null;
}

interface RedemptionItem {
  id: string;
  cutsAtRedemption: number;
  redeemedAt: string;
}

interface TransferItem {
  id: string;
  toProfileId?: string;
  fromProfileId?: string;
  createdAt: string;
}

interface EnrichedCustomer {
  id: string;
  whatsapp: string;
  name: string | null;
  customerName: string | null;
  cutsCount: number;
  sessionState: string;
  lastVisitAt: Date | string | null;
  avgRating: number | null;
  isNewThisMonth: boolean;
  isRecurrent: boolean;
  totalVisits: number;
  history: VisitHistoryItem[];
  redemptions?: RedemptionItem[];
  transfersGiven?: TransferItem[];
  transfersReceived?: TransferItem[];
}

interface ClientesTabsProps {
  customers: EnrichedCustomer[];
  initialTab: string;
  requiredCuts: number;
  loyaltyMode: string;
  vertical?: string | null;
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
  accentColor = "#d97644",
}: {
  cutsCount: number;
  requiredCuts: number;
  accentColor?: string;
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
          <span style={{ color: accentColor }} className="font-mono text-[10px]">
            🎁 {completedCycles}x completado
          </span>
        )}
      </div>
      <div className="h-1 bg-[#2a2520] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${progress}%`, backgroundColor: accentColor }}
        />
      </div>
    </div>
  );
}

function CustomerDetailModal({
  customer,
  requiredCuts,
  allCustomers,
  onClose,
  onRefresh,
}: {
  customer: EnrichedCustomer;
  requiredCuts: number;
  allCustomers: EnrichedCustomer[];
  onClose: () => void;
  onRefresh?: () => void;
}) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [targetProfileId, setTargetProfileId] = useState("");
  const [searchTarget, setSearchTarget] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const canRedeem = customer.cutsCount >= requiredCuts;
  const canTransfer = customer.cutsCount > 0 && customer.id !== "cf-profile-synthetic";

  const handleRedeem = async () => {
    if (!canRedeem || isRedeeming) return;
    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      const res = await fetch("/api/clientes/redeem-loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileId: customer.id }),
      });
      const data = await res.json();
      if (!data.success) {
        setRedeemError(data.error || "Error al procesar el reclamo");
      } else {
        setRedeemSuccess(data.message || "¡Premio reclamado con éxito!");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setRedeemError("Error de conexión con el servidor");
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleTransfer = async () => {
    if (!targetProfileId || isTransferring) return;
    setIsTransferring(true);
    setTransferError(null);
    setTransferSuccess(null);

    try {
      const res = await fetch("/api/clientes/transfer-cut", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromProfileId: customer.id,
          toProfileId: targetProfileId,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setTransferError(data.error || "Error al transferir corte");
      } else {
        setTransferSuccess(data.message || "Corte transferido con éxito");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setTransferError("Error de conexión con el servidor");
    } finally {
      setIsTransferring(false);
    }
  };

  const possibleTargets = allCustomers.filter(
    (c) =>
      c.id !== customer.id &&
      c.id !== "cf-profile-synthetic" &&
      ((c.name || "").toLowerCase().includes(searchTarget.toLowerCase()) ||
        (c.whatsapp || "").includes(searchTarget))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-[#131110] border border-[#2a2520] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden rounded-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header del Modal */}
        <div className="p-6 border-b border-[#2a2520] flex items-start justify-between bg-[#0a0807]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-2xl font-light text-[#f3ece1]">
                {customer.name || "Perfil Sin Nombre"}
              </h3>
              {canRedeem && (
                <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-mono text-[9px] uppercase tracking-wider font-bold animate-pulse">
                  🎁 PREMIO DISPONIBLE
                </span>
              )}
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
            <div className="flex flex-col">
              {customer.whatsapp && customer.whatsapp !== "CF" && customer.whatsapp !== "N/A" ? (
                <a
                  href={`https://wa.me/${customer.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-xs text-[#d97644] hover:underline"
                >
                  <span>📱 +{customer.whatsapp}</span>
                  <span className="text-[10px] opacity-70">↗ WhatsApp</span>
                </a>
              ) : (
                <span className="font-mono text-xs text-[#5c554c]">
                  🛒 Consumidor Final (Sin WhatsApp)
                </span>
              )}
              <span className="font-mono text-[10px] text-[#5c554c] mt-1">
                Cuenta: {customer.customerName || "Sin Nombre"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#5c554c] hover:text-[#f3ece1] p-1 font-mono text-lg transition-colors"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Resumen rápido de estadísticas */}
        <div className="grid grid-cols-3 gap-px bg-[#2a2520] border-b border-[#2a2520] text-center">
          <div className="bg-[#0a0807] p-3">
            <p className="font-display text-2xl font-light text-[#f3ece1]">
              {customer.cutsCount}
            </p>
            <p className="font-mono text-[9px] uppercase text-[#5c554c] tracking-wider">
              Cortes Acumulados
            </p>
          </div>
          <div className="bg-[#0a0807] p-3">
            <div className="flex items-center justify-center pt-0.5">
              <StarRating rating={customer.avgRating} />
            </div>
            <p className="font-mono text-[9px] uppercase text-[#5c554c] tracking-wider mt-1">
              Promedio Stars
            </p>
          </div>
          <div className="bg-[#0a0807] p-3">
            <p className="font-display text-2xl font-light text-[#f3ece1]">
              {customer.totalVisits}
            </p>
            <p className="font-mono text-[9px] uppercase text-[#5c554c] tracking-wider">
              Visitas Aprobadas
            </p>
          </div>
        </div>

        {/* Barra de Fidelidad y Acciones Rápidas */}
        <div className="p-4 bg-[#0a0807]/50 border-b border-[#2a2520] space-y-3">
          <LoyaltyBar cutsCount={customer.cutsCount} requiredCuts={requiredCuts} />

          <div className="flex flex-wrap gap-2 pt-2">
            {canRedeem && (
              <button
                onClick={handleRedeem}
                disabled={isRedeeming}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs py-2 px-3 rounded uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
              >
                {isRedeeming ? "Procesando..." : "🎁 Reclamar Corte Gratuito"}
              </button>
            )}

            {canTransfer && (
              <button
                onClick={() => setShowTransferModal(true)}
                className="bg-[#2a2520] hover:bg-[#3a3530] text-[#f3ece1] font-mono text-xs py-2 px-3 rounded uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <span>🔄</span> Transferir 1 Corte (Referidos)
              </button>
            )}
          </div>

          {redeemSuccess && (
            <p className="text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2 border border-emerald-800 rounded">
              ✓ {redeemSuccess}
            </p>
          )}
          {redeemError && (
            <p className="text-xs font-mono text-red-400 bg-red-950/40 p-2 border border-red-800 rounded">
              ✕ {redeemError}
            </p>
          )}
        </div>

        {/* Modal Secundario: Selección de Referidor para Transferir Corte */}
        {showTransferModal && (
          <div className="p-4 bg-[#1a1715] border-b border-[#3a332c] space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-mono text-xs uppercase tracking-wider text-[#d97644] font-bold flex items-center gap-1.5">
                <span>🔄</span> Buscar cliente referidor (a quien se sumará el corte)
              </h4>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-xs font-mono text-[#5c554c] hover:text-[#f3ece1]"
              >
                ✕ Cancelar
              </button>
            </div>
            <p className="text-xs font-sans text-[#a89e90]">
              Escribe el nombre o WhatsApp del cliente que lo recomendó. Elige al cliente de la lista de coincidentes para darle su corte.
            </p>

            <div className="relative">
              <input
                type="text"
                placeholder="Escribe nombre o número (ej: Carlos o 593...)"
                value={searchTarget}
                onChange={(e) => {
                  setSearchTarget(e.target.value);
                  setTargetProfileId("");
                }}
                className="w-full bg-[#0a0807] border border-[#2a2520] focus:border-[#d97644] px-3 py-2 text-xs font-mono text-[#f3ece1] outline-none rounded"
              />
            </div>

            {/* Lista de Coincidentes en Tiempo Real */}
            <div className="max-h-40 overflow-y-auto space-y-1.5 bg-[#0a0807] border border-[#2a2520] p-2 rounded">
              {possibleTargets.length === 0 ? (
                <p className="text-[11px] font-mono text-[#5c554c] p-2 italic text-center">
                  {searchTarget ? "No se encontraron clientes coincidentes" : "Escribe para buscar o selecciona de la lista completa abajo..."}
                </p>
              ) : (
                possibleTargets.map((pt) => {
                  const isSelected = targetProfileId === pt.id;
                  return (
                    <div
                      key={pt.id}
                      onClick={() => setTargetProfileId(pt.id)}
                      className={`p-2.5 rounded border text-xs font-mono cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#d97644]/20 border-[#d97644] text-[#f3ece1]"
                          : "bg-[#131110] border-[#2a2520] text-[#a89e90] hover:border-[#3a3530] hover:text-[#f3ece1]"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-[#f3ece1]">
                          {pt.name || "Perfil sin nombre"}
                        </p>
                        <p className="text-[10px] text-[#5c554c]">
                          📱 +{pt.whatsapp} {pt.customerName && `(${pt.customerName})`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 bg-[#2a2520] rounded text-[#d97644]">
                          {pt.cutsCount} cortes
                        </span>
                        {isSelected && <span className="ml-2 text-emerald-400">✓ Seleccionado</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleTransfer}
                disabled={!targetProfileId || isTransferring}
                className="bg-[#d97644] hover:bg-[#c86533] text-white font-mono text-xs py-2 px-5 rounded uppercase tracking-wider font-bold transition-colors disabled:opacity-40"
              >
                {isTransferring ? "Transferiendo..." : "Confirmar Transferencia"}
              </button>
            </div>

            {transferSuccess && (
              <p className="text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2 border border-emerald-800 rounded">
                ✓ {transferSuccess}
              </p>
            )}
            {transferError && (
              <p className="text-xs font-mono text-red-400 bg-red-950/40 p-2 border border-red-800 rounded">
                ✕ {transferError}
              </p>
            )}
          </div>
        )}

        {/* Contenido: Historial Cronológico y Premios Reclamados */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Historial de Canjes de Premio */}
          {customer.redemptions && customer.redemptions.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-emerald-400 font-bold">
                🎁 Premios Reclamados ({customer.redemptions.length})
              </p>
              <div className="space-y-1.5">
                {customer.redemptions.map((r) => (
                  <div
                    key={r.id}
                    className="bg-emerald-950/20 border border-emerald-900/50 p-2.5 rounded text-xs font-mono flex justify-between items-center"
                  >
                    <span className="text-emerald-300">
                      ✓ Corte Gratuito Reclamado (tenía {r.cutsAtRedemption} cortes)
                    </span>
                    <span className="text-[#a89e90] text-[10px]">
                      {new Date(r.redeemedAt).toLocaleDateString("es-EC", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        timeZone: "America/Guayaquil",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Historial de Visitas */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#5c554c]">
              Historial de Visitas ({customer.history.length})
            </p>

            {customer.history.length === 0 ? (
              <div className="text-center py-8 border border-[#2a2520] bg-[#0a0807]">
                <p className="font-mono text-xs text-[#5c554c] italic">
                  No hay visitas registradas para este cliente aún.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {customer.history.map((v, index) => {
                  const dateFormatted = new Date(v.createdAt).toLocaleDateString("es-EC", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "America/Guayaquil",
                  });

                  return (
                    <div
                      key={v.id}
                      className="bg-[#0a0807] border border-[#2a2520] p-4 space-y-2 hover:border-[#3a3530] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-[#d97644] font-bold">#{customer.history.length - index}</span>
                          <span className="text-[#a89e90]">{dateFormatted}</span>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded-full ${
                            v.status === "APPROVED"
                              ? "bg-green-950/40 text-green-400 border border-green-800"
                              : v.status === "PENDING"
                              ? "bg-amber-950/40 text-amber-400 border border-amber-800"
                              : "bg-red-950/40 text-red-400 border border-red-800"
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1c1917]">
                        {/* Barbero */}
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="text-[#5c554c]">✂️ Atendido por:</span>
                          <span className="text-[#f3ece1] font-medium">
                            {v.staffName || "Sin asignar"}
                          </span>
                        </div>

                        {/* Calificación */}
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-[#5c554c]">Calificación:</span>
                          <StarRating rating={v.rating} />
                        </div>
                      </div>

                      {/* Comentario si dejó feedback */}
                      {v.comment && (
                        <div className="mt-2 bg-[#131110] border border-[#2a2520] p-3 rounded-sm">
                          <p className="font-mono text-[10px] text-[#5c554c] uppercase tracking-wider mb-1">
                            💬 Comentario del cliente:
                          </p>
                          <p className="font-sans text-xs text-[#a89e90] italic">
                            &quot;{v.comment}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="p-4 border-t border-[#2a2520] bg-[#0a0807] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 font-mono text-xs tracking-widest uppercase bg-[#2a2520] text-[#f3ece1] hover:bg-[#3a3530] transition-colors rounded-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerCard({
  customer,
  requiredCuts,
  onClick,
}: {
  customer: EnrichedCustomer;
  requiredCuts: number;
  onClick: () => void;
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

  const canRedeem = customer.cutsCount >= requiredCuts;

  return (
    <div
      onClick={onClick}
      className={`bg-[#131110] border ${canRedeem ? "border-emerald-700/80 shadow-[0_0_15px_rgba(16,185,129,0.15)]" : "border-[#2a2520]"} p-5 hover:border-[#d97644] transition-all cursor-pointer group hover:bg-[#181513] relative rounded-lg`}
    >
      {/* Header del cliente */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-light text-[#f3ece1] truncate group-hover:text-[#d97644] transition-colors">
            {customer.name || "Perfil Sin Nombre"}
          </p>
          <div className="flex flex-col mt-0.5">
            <p className="font-mono text-xs text-[#5c554c]">
              {customer.whatsapp === "CF" || customer.whatsapp === "N/A"
                ? "Consumidor Final (Sin WhatsApp)"
                : `+${customer.whatsapp}`}
            </p>
            <p className="font-mono text-[9px] text-[#5c554c]/70 truncate uppercase">
              {customer.customerName || "Cuenta sin nombre"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
          {canRedeem && (
            <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-[9px] uppercase tracking-wider font-bold animate-pulse">
              🎁 Premio Listo
            </span>
          )}
          {customer.cutsCount >= 8 && (
            <span className="px-2 py-0.5 bg-amber-950/40 border border-amber-800 text-amber-400 font-mono text-[9px] uppercase tracking-wider font-bold">
              ⭐⭐⭐⭐⭐ VIP
            </span>
          )}
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

          {/* Semáforo de Actividad */}
          {daysSinceVisit !== null ? (
            daysSinceVisit < 30 ? (
              <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-800 text-emerald-400 font-mono text-[9px] uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                🟢 Activo
              </span>
            ) : daysSinceVisit <= 60 ? (
              <span className="px-2 py-0.5 bg-amber-950/40 border border-amber-800 text-amber-400 font-mono text-[9px] uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                🟡 Hace {daysSinceVisit}d
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-red-950/40 border border-red-800 text-red-400 font-mono text-[9px] uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                🔴 +60d sin venir
              </span>
            )
          ) : (
            <span className="px-2 py-0.5 bg-[#1c1917] border border-[#2a2520] text-[#5c554c] font-mono text-[9px] uppercase tracking-wider">
              Sin Visita
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

      {/* Indicador de ver historial */}
      <div className="mt-3 pt-2 border-t border-[#2a2520]/50 flex justify-between items-center font-mono text-[9px] text-[#5c554c] group-hover:text-[#d97644] transition-colors">
        <span>Ver historial / Reclamar premio</span>
        <span>🔍 Ver detalle →</span>
      </div>
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
  loyaltyMode,
  vertical,
}: ClientesTabsProps) {
  const terms = getTenantTerms(vertical);
  const [activeTab, setActiveTab] = useState<"todos" | "nuevos" | "recurrentes">(
    (["todos", "nuevos", "recurrentes"].includes(initialTab)
      ? initialTab
      : "todos") as "todos" | "nuevos" | "recurrentes"
  );
  const [selectedCustomer, setSelectedCustomer] = useState<EnrichedCustomer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    // Filtro por tab
    if (activeTab === "nuevos" && !c.isNewThisMonth) return false;
    if (activeTab === "recurrentes" && !c.isRecurrent) return false;

    // Buscador global
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = (c.name || "").toLowerCase().includes(q);
      const matchCustomerName = (c.customerName || "").toLowerCase().includes(q);
      const matchWhatsapp = (c.whatsapp || "").includes(q);
      return matchName || matchCustomerName || matchWhatsapp;
    }

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
            style={activeTab === tab.id ? { backgroundColor: terms.accentColor, borderColor: terms.accentColor } : undefined}
            className={`flex-1 py-3 px-4 font-mono text-xs tracking-wider uppercase transition-colors ${
              activeTab === tab.id
                ? "text-[#0a0807] font-bold"
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

      {/* Buscador Global de Clientes */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#5c554c]">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, cuenta o WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#131110] border border-[#2a2520] focus:border-[#d97644] pl-9 pr-8 py-2 text-xs font-mono text-[#f3ece1] outline-none rounded-lg transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5c554c] hover:text-[#f3ece1]"
            >
              ✕
            </button>
          )}
        </div>
        <div className="font-mono text-[10px] text-[#5c554c] shrink-0">
          Mostrando <span className="text-[#f3ece1]">{filtered.length}</span> perfiles
        </div>
      </div>

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
              onClick={() => setSelectedCustomer(customer)}
            />
          ))}
        </div>
      )}

      {/* Modal Desplegable de Historial */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          requiredCuts={requiredCuts}
          allCustomers={customers}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
