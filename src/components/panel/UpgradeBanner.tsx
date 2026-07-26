"use client";

/**
 * UpgradeBanner
 *
 * Se muestra en lugar de las secciones del Motor/Director IA cuando la barbería
 * tiene planType === "PRO". No lanza errores, no falla en carga — simplemente
 * comunica el upgrade con claridad y elegancia.
 */

interface UpgradeBannerProps {
  feature?: string;
}

export default function UpgradeBanner({
  feature = "Motor de Conocimiento e IA",
}: UpgradeBannerProps) {
  return (
    <div className="relative overflow-hidden border border-[#2a2520] bg-[#131110] p-8">
      {/* Decoración de fondo */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #d97644 0, #d97644 1px, transparent 0, transparent 50%)",
          backgroundSize: "12px 12px",
        }}
      />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Ícono */}
        <div className="shrink-0 w-14 h-14 flex items-center justify-center border border-[#d97644]/30 bg-[#d97644]/10 text-3xl">
          👑
        </div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#d97644] mb-1">
            Plan Premium
          </p>
          <h3 className="font-display text-xl font-light text-[#f3ece1] mb-2">
            {feature}
          </h3>
          <p className="font-mono text-xs text-[#5c554c] leading-relaxed">
            Esta sección está disponible en <strong className="text-[#a89e90]">BarberOS Premium</strong>.
            Incluye análisis de frecuencia de visitas, alertas de clientes en riesgo, métricas de equipo y el Director IA — tu consultor especializado 24/7.
          </p>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <a
            href="/precios"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 bg-[#d97644] text-[#0a0807] font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-[#e8854f] transition-colors"
          >
            Ver planes ↗
          </a>
        </div>
      </div>
    </div>
  );
}
