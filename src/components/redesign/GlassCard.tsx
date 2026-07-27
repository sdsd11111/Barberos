// filepath: src/components/redesign/GlassCard.tsx
"use client";

import { type ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Padding interno. Default "md". */
  padding?: "sm" | "md" | "lg";
  /** Borde más marcado para cards sobre imágenes hero. */
  elevated?: boolean;
}

/**
 * Tarjeta con efecto vidrio sobre fondo oscuro.
 * Misma paleta de marca (#d97644, #e8a33d, #0D0D0D).
 */
export default function GlassCard({
  children,
  className = "",
  padding = "md",
  elevated = false,
}: GlassCardProps) {
  const padMap = { sm: "p-3 sm:p-4", md: "p-5 sm:p-6", lg: "p-6 sm:p-8" };

  return (
    <div
      className={[
        "relative rounded-2xl",
        "bg-[#1a1614]/70 border border-[#3a2f25]/80",
        "shadow-[0_8px_30px_rgba(0,0,0,0.55)]",
        padMap[padding],
        elevated ? "ring-1 ring-[#d97644]/15" : "",
        className,
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f3ece1]/15 to-transparent"
      />
      {children}
    </div>
  );
}
