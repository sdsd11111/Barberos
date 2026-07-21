"use client";

/**
 * MarqueeDivisor — Componente divisor con texto en movimiento infinito.
 * Emula la segunda captura de la landing original.
 *
 * PROPS:
 * - text: El texto o frase a repetir en el carrusel.
 */

interface MarqueeDivisorProps {
  text?: string;
}

export default function MarqueeDivisor({
  text = "Cliente entra. / Se corta. / Se ríe. / Sale. / Silencio. / WhatsApp. / Sonríe. / Tres semanas. / Regresa. /",
}: MarqueeDivisorProps) {
  // Dividimos la cadena por las barras "/" para estructurar el contenido con sus respectivos estilos y separadores
  const parts = text.split("/").map((part) => part.trim()).filter(Boolean);

  return (
    <section className="py-6 border-y border-[#2a2520] overflow-hidden bg-[#0a0807] relative w-full select-none">
      <div className="flex w-[200%] gap-12 animate-marquee whitespace-nowrap">
        {/* Renderizamos el track dos veces para lograr el scroll infinito sin saltos */}
        <div className="flex items-center gap-12 shrink-0 min-w-full justify-around">
          {parts.map((part, i) => (
            <span key={i} className="flex items-center gap-12 font-display italic text-2xl text-[#5c554c]">
              <span>{part}</span>
              <span className="text-[#d97644] font-mono text-xl">/</span>
            </span>
          ))}
        </div>
        <div className="flex items-center gap-12 shrink-0 min-w-full justify-around" aria-hidden="true">
          {parts.map((part, i) => (
            <span key={`clone-${i}`} className="flex items-center gap-12 font-display italic text-2xl text-[#5c554c]">
              <span>{part}</span>
              <span className="text-[#d97644] font-mono text-xl">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
