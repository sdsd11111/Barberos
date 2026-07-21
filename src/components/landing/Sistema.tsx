import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";
const FONT_SANS = "var(--font-grotesk), sans-serif";

const items = [
  {
    icon: "█░░░░",
    titulo: "Progreso visible",
    desc: "El cliente ve cuánto le falta. Eso lo motiva a volver.",
  },
  {
    icon: "★",
    titulo: "Recompensas reales",
    desc: "No puntos virtuales. Un corte gratis que se gana.",
  },
  {
    icon: "↩",
    titulo: "Seguimiento automático",
    desc: "WhatsApp cuando se aleja demasiado sin volver.",
  },
  {
    icon: "⏱",
    titulo: "Momento justo",
    desc: "El mensaje llega cuando el cliente está listo para escuchar.",
  },
  {
    icon: "◎",
    titulo: "Curiosidad activada",
    desc: "La barra incompleta crea un bucle abierto. El cerebro quiere cerrarlo.",
  },
];

export default function Sistema() {
  return (
    <section className="bg-[#131110] py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-20 text-center flex flex-col items-center gap-4">
          <Reveal>
            <p
              className="tracking-[0.4em] uppercase text-[#5c554c]"
              style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
            >
              05 — El sistema
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="font-light text-[#f3ece1] max-w-3xl leading-tight"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(1.8rem, 4vw, 3.2rem)",
                letterSpacing: "-0.02em",
              }}
            >
              No hemos programado una herramienta.{" "}
              <em className="text-[#d97644]" style={{ fontStyle: "italic" }}>
                Hemos modelado comportamiento humano.
              </em>
            </h2>
          </Reveal>
        </div>

        {/* Grid 5 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-0 border border-[#2a2520]">
          {items.map((item, i) => (
            <Reveal key={i} delay={0.08 * i}>
              <div
                className={`flex flex-col gap-4 p-8 h-full border-[#2a2520] ${
                  i < items.length - 1 ? "border-b lg:border-b-0 lg:border-r" : ""
                }`}
              >
                <p
                  className="text-[#d97644]"
                  style={{
                    fontFamily: FONT_MONO,
                    fontSize: i === 0 ? "1.1rem" : "1.5rem",
                    letterSpacing: i === 0 ? "0.05em" : "0",
                  }}
                >
                  {item.icon}
                </p>
                <h4
                  className="font-light text-[#f3ece1]"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "1.1rem",
                  }}
                >
                  {item.titulo}
                </h4>
                <p
                  className="text-[#5c554c] leading-relaxed"
                  style={{ fontFamily: FONT_SANS, fontSize: "0.85rem" }}
                >
                  {item.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
