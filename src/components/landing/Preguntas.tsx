"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";

const preguntas = [
  "¿Cuántos clientes tienes que han venido solo una vez?",
  "¿Cuánto dinero perdiste este mes porque no volvieron?",
  "¿Cuánto tiempo llevas pensando en hacer seguimiento?",
  "¿Qué pasaría si el 30% de tus clientes volviera más seguido?",
  "¿Por qué esperar a que los clientes te recuerden?",
];

export default function Preguntas() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="bg-[#131110] py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Reveal>
          <p
            className="tracking-[0.4em] uppercase text-[#5c554c] mb-4"
            style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
          >
            06 — Las preguntas
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2
            className="font-light text-[#f3ece1] mb-20"
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              letterSpacing: "-0.02em",
            }}
          >
            No respondemos.{" "}
            <em className="text-[#d97644]" style={{ fontStyle: "italic" }}>
              Solo preguntamos.
            </em>
          </h2>
        </Reveal>

        {/* Lista de preguntas interactivas */}
        <div className="flex flex-col border-t border-[#2a2520]">
          {preguntas.map((pregunta, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="border-b border-[#2a2520] py-8 cursor-default flex items-start gap-6"
              style={{
                paddingLeft: hoveredIdx === i ? "2rem" : "0",
                transition: "padding-left 0.4s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <span
                className="text-[#2a2520] flex-shrink-0 mt-1"
                style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.3em" }}
              >
                0{i + 1}
              </span>
              <p
                className="font-light leading-tight transition-colors duration-300"
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "clamp(1.3rem, 3vw, 2.2rem)",
                  color: hoveredIdx === i ? "#d97644" : "#f3ece1",
                  letterSpacing: "-0.01em",
                }}
              >
                {pregunta}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
