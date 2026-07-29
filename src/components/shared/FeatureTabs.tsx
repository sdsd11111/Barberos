"use client";

import { useState } from "react";
import Image from "next/image";

export interface FeatureTab {
  id: string;
  /** Título corto del feature (lo que se ve en la barra de tabs) */
  titulo: string;
  /** Descripción breve cuando se abre */
  descripcion: string;
  /** Imagen screenshot del feature */
  screenshot: string;
  /** Alt text de la imagen */
  alt: string;
  /** Orden visual del tab (menor = primero). Default: orden de inserción */
  orden?: number;
}

interface FeatureTabsProps {
  /** Etiqueta superior (mono uppercase) */
  label: string;
  /** Título de la sección */
  titulo: React.ReactNode;
  /** Subtítulo opcional */
  subtitulo?: React.ReactNode;
  /** Lista de tabs */
  items: FeatureTab[];
  /** Si es true, marca visualmente como "incluido en Pro" (texto discreto) */
  badgeIncluido?: string;
  /** ID opcional para usar como anchor target (ej. "features") */
  sectionId?: string;
}

/**
 * FeatureTabs — Acordeón horizontal de features con screenshot.
 *
 * UX: el usuario ve una barra con tabs como píldoras/labels. Al hacer clic en uno,
 * se expande debajo mostrando la descripción + screenshot.
 *
 * Reglas:
 * - Una sola sección expandida a la vez (UX limpia).
 * - El screenshot es lo primero que se ve al expandir (ratio 16:9).
 * - Animación suave de entrada/salida.
 *
 * Usado en /pro y /premium para detallar las features sin volver la página infinita.
 */
export default function FeatureTabs({
  label,
  titulo,
  subtitulo,
  items,
  badgeIncluido,
  sectionId,
}: FeatureTabsProps) {
  // Ordenar por `orden` ascendente (los que no tengan `orden` van al final en su orden de inserción).
  const sortedItems = [...items].sort((a, b) => {
    const ao = a.orden ?? Number.MAX_SAFE_INTEGER;
    const bo = b.orden ?? Number.MAX_SAFE_INTEGER;
    return ao - bo;
  });

  const [openId, setOpenId] = useState<string | null>(sortedItems[0]?.id ?? null);

  const toggle = (id: string) => setOpenId(openId === id ? null : id);

  return (
    <section
      id={sectionId}
      className="py-24 px-6 border-t border-[#2a2520] scroll-mt-20"
      aria-labelledby="feature-tabs-titulo"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <p
          id="feature-tabs-titulo"
          className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-6"
        >
          {label}
        </p>
        <h2 className="font-display text-3xl md:text-5xl font-light text-[#f3ece1] mb-4 leading-tight">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="font-display italic text-lg text-[#a89e90] font-light max-w-2xl mb-12 leading-relaxed">
            {subtitulo}
          </p>
        )}

        {/* Tabs (horizontal scroll en móvil, grid 3 cols en desktop) */}
        <div
          role="tablist"
          aria-orientation="horizontal"
          className="flex overflow-x-auto md:grid md:grid-cols-3 gap-2 md:gap-3 mb-10 pb-2 -mx-6 px-6 md:mx-0 md:px-0 border-b border-[#2a2520]"
        >
          {sortedItems.map((item) => {
            const isOpen = openId === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isOpen}
                aria-controls={`feature-panel-${item.id}`}
                id={`feature-tab-${item.id}`}
                onClick={() => toggle(item.id)}
                className={`shrink-0 md:w-full text-left font-mono text-xs tracking-[0.2em] uppercase px-4 py-3 border transition-colors ${
                  isOpen
                    ? "border-[#d97644] text-[#d97644] bg-[#d97644]/5"
                    : "border-[#2a2520] text-[#a89e90] hover:text-[#f3ece1] hover:border-[#5c554c]"
                }`}
              >
                <span className="block md:inline">{item.titulo}</span>
              </button>
            );
          })}
        </div>

        {/* Panels */}
        {sortedItems.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div
              key={item.id}
              role="tabpanel"
              id={`feature-panel-${item.id}`}
              aria-labelledby={`feature-tab-${item.id}`}
              hidden={!isOpen}
              className="grid md:grid-cols-[280px_1fr] gap-8 md:gap-12 items-center justify-center"
            >
              {/* Screenshot modo celular (ratio 9:16 portrait) — object-contain para ver la imagen completa */}
              <div className="relative w-full max-w-[280px] mx-auto bg-[#0a0807] border border-[#2a2520] rounded-md order-1" style={{ aspectRatio: "9/16" }}>
                <Image
                  src={item.screenshot}
                  alt={item.alt}
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 100vw, 280px"
                />
                <div className="absolute inset-0 border border-[#d97644]/10 rounded-md pointer-events-none" />
                {/* REC marker */}
                <div className="absolute bottom-2 left-2 font-mono text-[10px] text-[#5c554c] tracking-widest bg-[#0a0807]/80 px-2 py-1 rounded">
                  REC // {item.id.toUpperCase()}
                </div>
              </div>

              {/* Descripción */}
              <div className="order-2">
                <div className="flex items-center gap-3 mb-4">
                  <p className="font-mono text-xs text-[#d97644] tracking-widest">
                    {item.id.toUpperCase()}
                  </p>
                  {badgeIncluido && (
                    <span className="font-mono text-[10px] text-[#5c554c] tracking-widest border border-[#2a2520] px-2 py-1">
                      {badgeIncluido}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-light text-[#f3ece1] mb-4 leading-snug">
                  {item.titulo}
                </h3>
                <p className="font-display italic text-[#a89e90] font-light leading-relaxed">
                  {item.descripcion}
                </p>
              </div>
            </div>
          );
        })}

        {/* Hint deslizar en móvil */}
        <div className="flex md:hidden items-center justify-center gap-2 mt-8 text-[#a89e90]">
          <span className="font-mono text-xs uppercase tracking-wider">Desliza los tabs</span>
          <svg
            className="w-4 h-4 animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </section>
  );
}