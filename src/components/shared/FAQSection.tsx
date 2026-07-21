"use client";

import { useState } from "react";

interface FAQItem {
  pregunta: string;
  respuesta: string;
}

interface FAQSectionProps {
  titulo?: string;
  items: FAQItem[];
}

/**
 * FAQSection — Acordeón de preguntas frecuentes.
 * Reutilizable en: Inicio, Precios, Cómo Funciona, Reseñas.
 * Incluye JSON-LD FAQPage inline vía script tag.
 */
export default function FAQSection({
  titulo = "Preguntas frecuentes",
  items,
}: FAQSectionProps) {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section className="py-24 px-6 border-t border-[#2a2520]" aria-labelledby="faq-titulo">
      <div className="max-w-3xl mx-auto">
        <p
          id="faq-titulo"
          className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-16"
        >
          {titulo}
        </p>

        <dl className="space-y-0">
          {items.map((item, i) => (
            <div key={i} className="border-b border-[#2a2520]">
              <dt>
                <button
                  onClick={() => toggle(i)}
                  className="w-full text-left py-6 flex justify-between items-start gap-6 group"
                  aria-expanded={open === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  <span className="font-display text-lg font-light text-[#f3ece1] group-hover:text-[#d97644] transition-colors">
                    {item.pregunta}
                  </span>
                  <span
                    className={`font-mono text-[#5c554c] text-xl mt-1 shrink-0 transition-transform duration-300 ${
                      open === i ? "rotate-45 text-[#d97644]" : ""
                    }`}
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
              </dt>
              <dd
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-question-${i}`}
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? "max-h-96 pb-6" : "max-h-0"
                }`}
              >
                <p className="font-display italic text-[#a89e90] text-base font-light leading-relaxed">
                  {item.respuesta}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
