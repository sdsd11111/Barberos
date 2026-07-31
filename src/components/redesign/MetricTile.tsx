// filepath: src/components/redesign/MetricTile.tsx
"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type Accent = "orange" | "amber" | "green" | "neutral";

interface MetricTileProps {
  label: string;
  /** Valor principal grande (ej. "5.0", "15", "13%"). */
  value: string | number;
  /** Subtítulo descriptivo debajo del número. */
  caption?: string;
  /** Footer pequeño (ej. "+1 este mes"). */
  footer?: ReactNode;
  /** Color de acento del valor. Default "neutral". */
  accent?: Accent;
  /** Icono/emoji del header. */
  icon?: ReactNode;
  /** Si es link, hace la card entera clickable. */
  href?: string;
  /** Click handler (alternativa a href). */
  onClick?: () => void;
  /** Contenido opcional a la derecha del header. */
  headerExtra?: ReactNode;
  className?: string;
}

const accentMap: Record<
  Accent,
  { value: string; ring: string; footerText: string; bg: string; border: string }
> = {
  orange: {
    value: "text-[#d97644]",
    ring: "from-[#e89263] to-[#d97644]",
    footerText: "text-[#d97644]",
    bg: "bg-[#d97644]/10",
    border: "border-[#d97644]/30",
  },
  amber: {
    value: "text-[#e8a33d]",
    ring: "from-[#f0b04e] to-[#e8a33d]",
    footerText: "text-[#e8a33d]",
    bg: "bg-[#e8a33d]/10",
    border: "border-[#e8a33d]/30",
  },
  green: {
    value: "text-emerald-400",
    ring: "from-emerald-300 to-emerald-500",
    footerText: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  neutral: {
    value: "text-[#f3ece1]",
    ring: "from-[#a89e90] to-[#5c554c]",
    footerText: "text-[#a89e90]",
    bg: "bg-[#f3ece1]/5",
    border: "border-[#3a2f25]/80",
  },
};

/**
 * Tarjeta glassmórfica para mostrar una métrica. Reemplaza los bloques sólidos
 * apilados del dashboard con sensación de profundidad y aire.
 */
export default function MetricTile({
  label,
  value,
  caption,
  footer,
  accent = "neutral",
  accentOverride,
  icon,
  href,
  onClick,
  headerExtra,
  className = "",
}: MetricTileProps & { accentOverride?: string }) {
  const a = accentMap[accent];

  // Si se provee accentOverride, generamos estilos inline que sobrescriben la clase
  const overrideStyles = accentOverride ? {
    valueColor: accentOverride,
    footerColor: accentOverride,
    bgColor: `${accentOverride}18`,
    borderColor: `${accentOverride}4D`,
    iconColor: accentOverride,
  } : null;

  const content = (
    <div
      className={[
        "group relative rounded-2xl p-5 sm:p-6 h-full",
        "bg-[#1a1614]/70 border backdrop-blur-md",
        "shadow-[0_8px_30px_rgba(0,0,0,0.45)]",
        "transition-all duration-200 ease-out",
        href || onClick
          ? "hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.55)] cursor-pointer"
          : "",
        overrideStyles ? "" : a.border,
        className,
      ].join(" ")}
      style={overrideStyles ? { borderColor: overrideStyles.borderColor } : undefined}
    >
      {/* Línea superior sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f3ece1]/15 to-transparent"
      />

      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {icon && (
            <span
              className={[
                "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm shrink-0",
                overrideStyles ? "" : a.bg,
              ].join(" ")}
              style={overrideStyles ? { backgroundColor: overrideStyles.bgColor, color: overrideStyles.iconColor } : undefined}
            >
              {icon}
            </span>
          )}
          <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#a89e90] truncate">
            {label}
          </span>
        </div>
        {headerExtra}
      </div>

      {/* VALOR */}
      <div className="space-y-1">
        <p
          className={[
            "font-display text-4xl sm:text-5xl font-light leading-none",
            "group-hover:scale-[1.02] transition-transform",
            overrideStyles ? "" : a.value,
          ].join(" ")}
          style={overrideStyles ? { color: overrideStyles.valueColor } : undefined}
        >
          {value}
        </p>
        {caption && (
          <p className="font-mono text-xs text-[#a89e90] leading-relaxed">{caption}</p>
        )}
      </div>

      {/* FOOTER */}
      {footer && (
        <div
          className={[
            "mt-4 pt-3 border-t border-[#3a2f25]/60",
            "font-mono text-[10px] flex items-center gap-1.5",
            overrideStyles ? "" : a.footerText,
          ].join(" ")}
          style={overrideStyles ? { color: overrideStyles.footerColor } : undefined}
        >
          {footer}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      type="button"
      className="block w-full text-left h-full"
    >
      {content}
    </button>
  );
}