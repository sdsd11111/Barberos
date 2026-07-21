import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";
const FONT_SANS = "var(--font-grotesk), sans-serif";

export default function VideoFundador() {
  return (
    <section className="bg-[#0a0807] py-32 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-16 items-center">
        {/* Izquierda — Video nativo optimizado para Bunny.net */}
        <Reveal className="order-2 lg:order-1">
          <div className="relative aspect-video w-full bg-[#131110] border border-[#2a2520] overflow-hidden group">
            <video
              src="https://iframe.mediadelivery.net/play/132174/db29a7de-7fa2-46a4-9467-f3c7e4ffc059" // Este es un placeholder de Bunny.net que se puede actualizar
              poster="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop"
              controls
              playsInline
              className="w-full h-full object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-300"
            />
          </div>
        </Reveal>

        {/* Derecha — Texto */}
        <div className="order-1 lg:order-2 flex flex-col gap-6">
          <Reveal>
            <p
              className="tracking-[0.4em] uppercase text-[#5c554c]"
              style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
            >
              07 — Los fundadores
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="font-light text-[#f3ece1] leading-tight"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Creamos esto porque{" "}
              <em className="text-[#d97644]" style={{ fontStyle: "italic" }}>
                entendemos el negocio.
              </em>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p
              className="text-[#a89e90] leading-relaxed"
              style={{ fontFamily: FONT_SANS, fontSize: "0.95rem" }}
            >
              César Reyes ha dedicado más de 31 años a emprender. Sabe perfectamente que atraer a un cliente nuevo es extremadamente costoso, pero perder al que ya confió en ti por no hacer seguimiento es un error crítico. Para él, fidelizar es la clave de todo.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p
              className="text-[#5c554c] leading-relaxed"
              style={{ fontFamily: FONT_SANS, fontSize: "0.9rem" }}
            >
              Su hijo, ingeniero de desarrollo, transforma esa experiencia real en software robusto. Juntos diseñaron BarberOS para resolver un dolor latente: que ningún dueño de barbería pierda ingresos por falta de retención sistemática.
            </p>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="flex items-center gap-4 mt-4">
              <div className="w-12 h-12 rounded-full bg-[#1a1715] border border-[#2a2520] flex items-center justify-center">
                <span
                  className="text-[#d97644]"
                  style={{ fontFamily: FONT_MONO, fontSize: "0.75rem", fontWeight: "bold" }}
                >
                  R&R
                </span>
              </div>
              <div>
                <p
                  className="text-[#f3ece1]"
                  style={{ fontFamily: FONT_DISPLAY, fontSize: "1rem" }}
                >
                  César Reyes & Christopher Reyes
                </p>
                <p
                  className="text-[#5c554c]"
                  style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.2em" }}
                >
                  EMPRESARIO & INGENIERO DE SISTEMAS
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
