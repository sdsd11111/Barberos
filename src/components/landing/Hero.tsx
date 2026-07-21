"use client";

import { motion } from "framer-motion";
import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";
const FONT_SANS = "var(--font-grotesk), sans-serif";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden">
      {/* Ken Burns background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1 }}
        animate={{ scale: 1.08 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2400&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center top",
        }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,8,7,0.65) 0%, rgba(10,8,7,0.82) 55%, rgba(10,8,7,1) 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 flex flex-col items-center gap-8">
        <Reveal delay={0.1}>
          <p
            className="tracking-[0.45em] uppercase text-[#d97644]"
            style={{ fontFamily: FONT_MONO, fontSize: "0.7rem" }}
          >
            Una historia sobre barberías
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <h1
            className="font-light leading-[1.05] text-[#f3ece1]"
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(2.8rem, 7vw, 6rem)",
              letterSpacing: "-0.025em",
            }}
          >
            Tu barbería no necesita{" "}
            <em className="not-italic text-[#d97644]">más clientes.</em>
          </h1>
        </Reveal>

        <Reveal delay={0.5}>
          <p
            className="max-w-2xl text-[#a89e90] leading-relaxed"
            style={{
              fontFamily: FONT_SANS,
              fontSize: "clamp(1rem, 2vw, 1.2rem)",
            }}
          >
            Necesita que los que ya confían en ti vuelvan una y otra vez.
            Mientras tú haces el siguiente corte, BarberOS trabaja para que el
            anterior regrese.
          </p>
        </Reveal>

        <Reveal delay={0.7}>
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href="/panel"
              className="inline-block px-8 py-4 font-light tracking-[0.25em] uppercase transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
              style={{
                backgroundColor: "#d97644",
                color: "#0a0807",
                fontFamily: FONT_MONO,
                fontSize: "0.7rem",
              }}
            >
              Quiero ver cómo funciona
            </a>
            <a
              href="#demo"
              className="inline-block px-8 py-4 font-light tracking-[0.25em] uppercase border transition-all duration-200 hover:bg-[#1a1715] active:scale-[0.97]"
              style={{
                borderColor: "#2a2520",
                color: "#f3ece1",
                fontFamily: FONT_MONO,
                fontSize: "0.7rem",
              }}
            >
              Ver demostración · 90s
            </a>
          </div>
        </Reveal>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-35 z-20">
        <p
          className="tracking-[0.35em] uppercase"
          style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", color: "#f3ece1" }}
        >
          scroll
        </p>
        <motion.div
          className="w-px bg-[#f3ece1]"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 48, opacity: 1 }}
          transition={{ duration: 1.2, delay: 1.5, ease: "easeOut" }}
        />
      </div>
    </section>
  );
}
