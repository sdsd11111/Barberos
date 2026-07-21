import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";
const FONT_SANS = "var(--font-grotesk), sans-serif";

const ellos = [
  "Tarjetas de cartulina que se pierden",
  "Códigos QR que nadie escanea",
  "Sellos de papel que se olvidan",
  "Apps que nadie descarga",
  "Recompensas que nunca llegan",
];

const nosotros = [
  "Clientes que regresan solos",
  "Más reseñas de Google automáticas",
  "Seguimiento sin que tú hagas nada",
  "Solo funciona con WhatsApp",
  "Premio real cuando llega el momento",
];

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="w-4 h-4 text-[#d97644] flex-shrink-0 mt-0.5"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function Creencia() {
  return (
    <section className="bg-[#0a0807] py-0">
      {/* ─ Split screen ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
        {/* Izquierda — Lo que todos venden */}
        <div className="bg-[#131110] flex flex-col justify-center px-12 py-20 gap-6 border-b lg:border-b-0 lg:border-r border-[#2a2520]">
          <Reveal>
            <p
              className="tracking-[0.4em] uppercase text-[#5c554c] mb-4"
              style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
            >
              02 — Lo que todos venden
            </p>
            <h3
              className="font-light text-[#a89e90] mb-8"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(1.6rem, 3vw, 2.5rem)",
              }}
            >
              Las mismas promesas de siempre.
            </h3>
          </Reveal>

          <div className="flex flex-col gap-4">
            {ellos.map((item, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <div className="flex items-start gap-3">
                  <span
                    className="text-[#2a2520] mt-0.5 flex-shrink-0"
                    style={{ fontFamily: FONT_MONO, fontSize: "0.8rem" }}
                  >
                    ✕
                  </span>
                  <p
                    className="text-[#5c554c] line-through decoration-[#2a2520]"
                    style={{ fontFamily: FONT_SANS, fontSize: "0.95rem" }}
                  >
                    {item}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* Derecha — Lo que hace BarberOS */}
        <div className="bg-[#0a0807] flex flex-col justify-center px-12 py-20 gap-6">
          <Reveal direction="right">
            <p
              className="tracking-[0.4em] uppercase text-[#d97644] mb-4"
              style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
            >
              Lo que hace BarberOS
            </p>
            <h3
              className="font-light text-[#f3ece1] mb-8"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(1.6rem, 3vw, 2.5rem)",
              }}
            >
              Un sistema que funciona mientras tú cortas.
            </h3>
          </Reveal>

          <div className="flex flex-col gap-4">
            {nosotros.map((item, i) => (
              <Reveal key={i} delay={0.05 * i} direction="right">
                <div className="flex items-start gap-3">
                  <Check />
                  <p
                    className="text-[#f3ece1]"
                    style={{ fontFamily: FONT_SANS, fontSize: "0.95rem" }}
                  >
                    {item}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* ─ Frase grande ─ */}
      <div className="bg-black py-28 px-6 flex items-center justify-center text-center">
        <Reveal>
          <p
            className="font-light text-[#f3ece1] max-w-4xl leading-tight"
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(1.8rem, 4.5vw, 3.5rem)",
              letterSpacing: "-0.02em",
            }}
          >
            No digitalizamos una tarjeta.{" "}
            <em className="text-[#d97644]" style={{ fontStyle: "italic" }}>
              Digitalizamos la relación con tus clientes.
            </em>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
