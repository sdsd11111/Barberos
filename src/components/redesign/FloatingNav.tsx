// filepath: src/components/redesign/FloatingNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

export interface FloatingTab {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
}

interface FloatingNavProps {
  tabs: FloatingTab[];
}

/**
 * Barra de navegación inferior flotante con tabs circulares (estilo referencia fitness).
 * Se superpone al contenido principal en móvil/tablet. En desktop sigue visible.
 */
export default function FloatingNav({ tabs }: FloatingNavProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40"
    >
      <div
        className={[
          "flex items-center gap-1.5 p-2 rounded-full",
          "bg-[#1a1614]/80 border border-[#3a2f25]/80",
          "backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.65)]",
        ].join(" ")}
      >
        {tabs.map((tab) => {
          const isActive = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className="group relative"
            >
              <span
                className={[
                  "flex items-center justify-center w-12 h-12 rounded-full",
                  "transition-all duration-200 ease-out",
                  isActive
                    ? "bg-gradient-to-b from-[#e89263] to-[#d97644] text-[#1a0f08] shadow-[0_6px_18px_-3px_rgba(217,118,68,0.7)] scale-110"
                    : "text-[#a89e90] hover:text-[#f3ece1] hover:bg-[#f3ece1]/5",
                ].join(" ")}
              >
                {tab.icon}
              </span>
              {/* Tooltip */}
              <span
                className={[
                  "pointer-events-none absolute left-1/2 -translate-x-1/2 -top-9",
                  "px-2 py-1 rounded-md font-mono text-[9px] tracking-[0.2em] uppercase",
                  "bg-[#0a0807]/95 border border-[#3a2f25] text-[#f3ece1]",
                  "opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                ].join(" ")}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}