import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";
const FONT_SANS = "var(--font-grotesk), sans-serif";

export default function Problema() {
  return (
    <section className="bg-[#0a0807] py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Número de sección */}
        <Reveal>
          <p
            className="tracking-[0.4em] uppercase text-[#5c554c] mb-16"
            style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
          >
            01 — El problema
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Izquierda: Texto */}
          <div className="flex flex-col gap-8">
            <Reveal delay={0.1}>
              <h2
                className="font-light leading-[1.1] text-[#f3ece1]"
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: "clamp(2rem, 4.5vw, 3.8rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                Mientras tus clientes salen por esa puerta...{" "}
                <em
                  className="not-italic"
                  style={{ color: "#d97644", fontStyle: "italic" }}
                >
                  empiezas a perder dinero.
                </em>
              </h2>
            </Reveal>

            <Reveal delay={0.2}>
              <p
                className="text-[#a89e90] leading-relaxed"
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: "clamp(1rem, 2vw, 1.15rem)",
                }}
              >
                No porque tu trabajo sea malo. No porque no les guste.{" "}
                <strong className="text-[#f3ece1] font-normal">
                  Sino porque nadie hace seguimiento.
                </strong>{" "}
                El cliente se va, la vida sigue, y tu barbería queda en el
                olvido hasta que recuerde que necesita un corte.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-col gap-4 border-l-2 border-[#d97644] pl-6">
                {[
                  "El 73% de los clientes no regresa por falta de seguimiento",
                  "Un cliente leal vale 5x más que uno nuevo",
                  "Recuperar un cliente cuesta 7x menos que conseguir uno",
                ].map((stat, i) => (
                  <p
                    key={i}
                    className="text-[#5c554c]"
                    style={{ fontFamily: FONT_MONO, fontSize: "0.72rem" }}
                  >
                    — {stat}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Derecha: Imagen con play */}
          <Reveal delay={0.2} direction="right">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#131110] group cursor-pointer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1200&auto=format&fit=crop"
                alt="Barbería"
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500"
              />
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(10,8,7,0.9) 0%, rgba(10,8,7,0.2) 60%)",
                }}
              />
              {/* Botón Play */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center border border-[#d97644] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d97644]"
                  style={{ backgroundColor: "rgba(217,118,68,0.15)" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 text-[#d97644] ml-1 group-hover:text-[#0a0807] transition-colors duration-300"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Caption */}
              <p
                className="absolute bottom-6 left-6 text-[#a89e90]"
                style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.3em" }}
              >
                VER DEMO · 90 SEGUNDOS
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
