"use client";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";

const slides = [
  {
    img: "https://images.unsplash.com/photo-1596728325488-58c87691e9af?q=80&w=1600&auto=format&fit=crop",
    label: "01 — El primer corte",
    titulo: "Cliente entra por primera vez.",
    subtitulo: "Todo comienza con un corte.",
  },
  {
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1600&auto=format&fit=crop",
    label: "02 — El mensaje",
    titulo: "Su teléfono vibra.",
    subtitulo: '"Tu progreso: [█░░░░] 1 de 5"',
  },
  {
    img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1600&auto=format&fit=crop",
    label: "03 — La duda",
    titulo: "¿Volverá?",
    subtitulo: "Esa pregunta ya no te corresponde a ti.",
  },
  {
    img: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1600&auto=format&fit=crop",
    label: "04 — El regreso",
    titulo: "Vuelve.",
    subtitulo: "No porque le llamaste. Sino porque lo esperaba.",
  },
  {
    img: "https://images.unsplash.com/photo-1512864084360-7c0c4d0a0f8e?q=80&w=1600&auto=format&fit=crop",
    label: "05 — El premio",
    titulo: "El quinto corte.",
    subtitulo: "Gratis. Ganado. Recordado.",
  },
];

export default function Storytelling() {
  return (
    <section className="bg-[#0a0807] py-20">
      {/* Header */}
      <div className="px-6 mb-12 max-w-6xl mx-auto">
        <p
          className="tracking-[0.4em] uppercase text-[#5c554c] mb-3"
          style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
        >
          04 — La historia
        </p>
        <p
          className="font-light text-[#f3ece1]"
          style={{
            fontFamily: FONT_DISPLAY,
            fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Una visita. Cinco capítulos.
        </p>
      </div>

      {/* Scroll horizontal */}
      <div
        className="overflow-x-auto flex"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: "grab",
        }}
      >
        <style>{`
          .storytelling-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="storytelling-scroll flex">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative flex-shrink-0 flex items-end justify-start"
              style={{
                width: "min(80vw, 600px)",
                height: "70vh",
                scrollSnapAlign: "start",
                marginRight: i < slides.length - 1 ? "1.5rem" : "0",
                marginLeft: i === 0 ? "1.5rem" : "0",
              }}
            >
              {/* Imagen de fondo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slide.img}
                alt={slide.titulo}
                className="absolute inset-0 w-full h-full object-cover opacity-55"
              />
              {/* Overlay degradado */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,8,7,0.98) 0%, rgba(10,8,7,0.3) 60%, rgba(10,8,7,0.05) 100%)",
                }}
              />
              {/* Texto */}
              <div className="relative z-10 p-8 flex flex-col gap-2">
                <p
                  className="text-[#d97644] mb-2"
                  style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.4em" }}
                >
                  {slide.label}
                </p>
                <p
                  className="font-light text-[#f3ece1] leading-tight"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {slide.titulo}
                </p>
                <p
                  className="text-[#a89e90]"
                  style={{ fontFamily: FONT_MONO, fontSize: "0.78rem", letterSpacing: "0.05em" }}
                >
                  {slide.subtitulo}
                </p>
              </div>
            </div>
          ))}
          {/* Padding final */}
          <div style={{ width: "1.5rem", flexShrink: 0 }} />
        </div>
      </div>

      {/* Hint de scroll */}
      <div className="px-6 mt-6 max-w-6xl mx-auto">
        <p
          className="text-[#5c554c]"
          style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.3em" }}
        >
          ← DESLIZA →
        </p>
      </div>
    </section>
  );
}
