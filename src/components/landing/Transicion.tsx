"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";

const frases = [
  {
    text: "No necesitas más clientes.",
    size: "clamp(2.2rem, 5vw, 4rem)",
    color: "#f3ece1",
    italic: false,
  },
  {
    text: "Necesitas que vuelvan.",
    size: "clamp(2.8rem, 6.5vw, 5rem)",
    color: "#d97644",
    italic: true,
  },
  {
    text: "BarberOS fue diseñado para eso.",
    size: "clamp(1.6rem, 3.5vw, 2.5rem)",
    color: "#a89e90",
    italic: false,
  },
];

export default function Transicion() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

  return (
    <section
      id="demo"
      ref={ref}
      className="bg-black min-h-screen flex flex-col items-center justify-center px-6 py-32"
      style={{ gap: "3.5rem" }}
    >
      {/* Decorador */}
      <div className="flex items-center gap-4 opacity-25 mb-4">
        <div className="h-px w-12 bg-[#2a2520]" />
        <span
          className="tracking-[0.4em] uppercase text-[#5c554c]"
          style={{ fontFamily: FONT_MONO, fontSize: "0.6rem" }}
        >
          La verdad incómoda
        </span>
        <div className="h-px w-12 bg-[#2a2520]" />
      </div>

      {frases.map((frase, i) => (
        <motion.p
          key={i}
          className="text-center font-light leading-tight max-w-4xl"
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: frase.size,
            color: frase.color,
            fontStyle: frase.italic ? "italic" : "normal",
          }}
          initial={{ opacity: 0, y: 56 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 56 }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
            delay: 0.15 * i,
          }}
        >
          {frase.text}
        </motion.p>
      ))}
    </section>
  );
}
