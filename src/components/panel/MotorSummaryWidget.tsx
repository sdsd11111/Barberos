import { prisma } from "@/lib/prisma";
import { isPremiumBarbershop } from "@/lib/plan-guard";
import UpgradeBanner from "@/components/panel/UpgradeBanner";

interface MotorSummaryWidgetProps {
  barbershopId: string;
}

/**
 * MotorSummaryWidget
 *
 * Server Component que muestra el resumen del Motor de Conocimiento en el Dashboard.
 *
 * - Si la barbería es PRO: muestra UpgradeBanner (nunca pantalla rota ni error).
 * - Si es PREMIUM pero sin datos aún: muestra estado pendiente.
 * - Si es PREMIUM con datos: muestra el snapshot en cards.
 *
 * Lee SOLO de MotorSnapshot (resultado ya calculado), nunca de tablas de visitas/clientes.
 * Esto es obligatorio por la arquitectura del Motor (doc 19, Sección 1).
 */
export default async function MotorSummaryWidget({ barbershopId }: MotorSummaryWidgetProps) {
  // 🔒 Gate de Plan — render condicional por planType
  const isPremium = await isPremiumBarbershop(barbershopId);
  if (!isPremium) {
    return null;
  }

  // Premium: leer el snapshot más reciente
  const snapshot = await prisma.motorSnapshot.findFirst({
    where: { barbershopId },
    orderBy: { calculatedAt: "desc" },
  });

  // Premium pero sin datos todavía (primer día)
  if (!snapshot) {
    return (
      <div className="border border-[#2a2520] bg-[#131110] p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#d97644]">
            Motor de Conocimiento
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/40 text-amber-400 border border-amber-700/50 font-mono">
            PREMIUM
          </span>
        </div>
        <div className="flex items-center gap-4 text-[#5c554c]">
          <div className="w-10 h-10 border border-[#2a2520] flex items-center justify-center text-xl">
            ⏳
          </div>
          <div>
            <p className="font-display text-lg font-light text-[#f3ece1] mb-1">
              Calculando por primera vez
            </p>
            <p className="font-mono text-xs text-[#5c554c]">
              El Motor ejecuta su primer cálculo a las 3am. Vuelve mañana para ver tus métricas de conocimiento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const staffMetrics = snapshot.staffMetrics ? JSON.parse(snapshot.staffMetrics) : [];
  const totalProfiles =
    snapshot.profilesNormal +
    snapshot.profilesDelayed +
    snapshot.profilesAtRisk +
    snapshot.profilesInsufficient;

  const calculatedAt = new Date(snapshot.calculatedAt).toLocaleDateString("es-EC", {
    timeZone: "America/Guayaquil",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="border border-[#2a2520] bg-[#131110] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#d97644]">
            Motor de Conocimiento
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/40 text-amber-400 border border-amber-700/50 font-mono">
            👑 PREMIUM
          </span>
        </div>
        <span className="font-mono text-[9px] text-[#5c554c]">
          Actualizado: {calculatedAt}
        </span>
      </div>

      {/* Dimensión Clientes — Mapa de Riesgo */}
      <div>
        <p className="font-mono text-[10px] tracking-widest uppercase text-[#5c554c] mb-3">
          Mapa de Frecuencia de Clientes
        </p>
        {totalProfiles === 0 ? (
          <p className="font-mono text-xs text-[#5c554c]">
            Sin perfiles con historial suficiente todavía.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#2a2520]">
            {/* Normal */}
            <div className="bg-[#0a0807] p-4">
              <p className="font-display text-3xl font-light text-green-400">
                {snapshot.profilesNormal}
              </p>
              <p className="font-mono text-[10px] text-[#5c554c] mt-1 uppercase tracking-wider">
                Normal
              </p>
              <p className="font-mono text-[9px] text-[#5c554c] mt-0.5">
                Dentro del ritmo habitual
              </p>
            </div>
            {/* Atrasado */}
            <div className="bg-[#0a0807] p-4">
              <p className="font-display text-3xl font-light text-amber-400">
                {snapshot.profilesDelayed}
              </p>
              <p className="font-mono text-[10px] text-[#5c554c] mt-1 uppercase tracking-wider">
                Atrasado
              </p>
              <p className="font-mono text-[9px] text-[#5c554c] mt-0.5">
                Ligeramente fuera del ritmo
              </p>
            </div>
            {/* En Riesgo */}
            <div className="bg-[#0a0807] p-4">
              <p className="font-display text-3xl font-light text-red-400">
                {snapshot.profilesAtRisk}
              </p>
              <p className="font-mono text-[10px] text-[#5c554c] mt-1 uppercase tracking-wider">
                En Riesgo
              </p>
              <p className="font-mono text-[9px] text-[#5c554c] mt-0.5">
                Puede estar yendo a otra parte
              </p>
            </div>
            {/* Sin datos */}
            <div className="bg-[#0a0807] p-4">
              <p className="font-display text-3xl font-light text-[#5c554c]">
                {snapshot.profilesInsufficient}
              </p>
              <p className="font-mono text-[10px] text-[#5c554c] mt-1 uppercase tracking-wider">
                Sin datos
              </p>
              <p className="font-mono text-[9px] text-[#5c554c] mt-0.5">
                Aún construyendo patrón
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dimensión Negocio */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#0a0807] border border-[#2a2520] p-4">
          <p className="font-display text-4xl font-light">{snapshot.totalVisitsApproved}</p>
          <p className="font-mono text-[10px] text-[#5c554c] mt-1 uppercase tracking-wider">
            Visitas Identificadas
          </p>
        </div>
        <div className="bg-[#0a0807] border border-[#2a2520] p-4">
          <p className="font-display text-4xl font-light text-[#a89e90]">
            {snapshot.totalAnonymousVisits}
          </p>
          <p className="font-mono text-[10px] text-[#5c554c] mt-1 uppercase tracking-wider">
            Consumidor Final (CF)
          </p>
        </div>
      </div>

      {/* Dimensión Equipo */}
      {staffMetrics.length > 0 && (
        <div>
          <p className="font-mono text-[10px] tracking-widest uppercase text-[#5c554c] mb-3">
            Métricas de Equipo
          </p>
          <div className="space-y-2">
            {staffMetrics.map((s: { staffId: string; name: string; avgRating: number | null; totalRated: number; totalVisits: number }) => (
              <div
                key={s.staffId}
                className="flex items-center justify-between bg-[#0a0807] border border-[#2a2520] px-4 py-3"
              >
                <span className="font-display text-sm font-light text-[#f3ece1]">
                  {s.name}
                </span>
                <div className="flex items-center gap-4 font-mono text-xs text-[#5c554c]">
                  <span>{s.totalVisits} visitas</span>
                  {s.avgRating !== null ? (
                    <span className="text-amber-400">
                      {"★".repeat(Math.round(s.avgRating))}
                      {"☆".repeat(5 - Math.round(s.avgRating))}{" "}
                      <span className="text-[#a89e90]">({s.avgRating.toFixed(1)})</span>
                    </span>
                  ) : (
                    <span>Sin calificaciones</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
