import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";
const FONT_SANS = "var(--font-grotesk), sans-serif";

const pasos = [
  {
    fase: "Hoy",
    titulo: "Lanzamiento Beta",
    desc: "10 barberías seleccionadas. Registro de cortes y mensajes de WhatsApp automáticos.",
    lado: "left",
  },
  {
    fase: "+3 meses",
    titulo: "Solicitud de reseñas",
    desc: "Después de cada corte, BarberOS pedirá una reseña de Google al cliente. Piloto automático.",
    lado: "right",
  },
  {
    fase: "+6 meses",
    titulo: "Campanhas de reactivación",
    desc: "Mensaje automático a clientes que llevan más de 30 días sin volver. El 'Te extrañamos'.",
    lado: "left",
  },
  {
    fase: "+9 meses",
    titulo: "Multi-sede",
    desc: "Un panel para múltiples locales. Staff independiente. Métricas consolidadas.",
    lado: "right",
  },
  {
    fase: "+12 meses",
    titulo: "Dashboard analítico",
    desc: "Tasa de retención, LTV por cliente, predicción de churn. Decisiones con datos.",
    lado: "left",
  },
  {
    fase: "+18 meses",
    titulo: "BarberOS Enterprise",
    desc: "Para cadenas. API abierta. Integraciones POS. White-label para grupos de barberías.",
    lado: "right",
  },
];

export default function Futuro() {
  return (
    <section className="bg-[#0a0807] py-32 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-24 text-center">
          <Reveal>
            <p
              className="tracking-[0.4em] uppercase text-[#5c554c] mb-4"
              style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
            >
              08 — El roadmap
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="font-light text-[#f3ece1]"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Esto es solo el{" "}
              <em className="text-[#d97644]" style={{ fontStyle: "italic" }}>
                comienzo.
              </em>
            </h2>
          </Reveal>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Línea central — solo en desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-[#2a2520] -translate-x-1/2" />

          <div className="flex flex-col gap-12">
            {pasos.map((paso, i) => (
              <Reveal key={i} delay={0.08 * i} direction={paso.lado === "left" ? "right" : "left"}>
                <div
                  className={`relative flex flex-col ${
                    paso.lado === "right"
                      ? "lg:flex-row-reverse lg:text-right"
                      : "lg:flex-row"
                  } items-start lg:items-center gap-6`}
                >
                  {/* Texto */}
                  <div className="lg:w-[calc(50%-2rem)] flex flex-col gap-2">
                    <p
                      className="text-[#d97644]"
                      style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.35em" }}
                    >
                      {paso.fase}
                    </p>
                    <h4
                      className="font-light text-[#f3ece1]"
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)",
                      }}
                    >
                      {paso.titulo}
                    </h4>
                    <p
                      className="text-[#a89e90] leading-relaxed"
                      style={{ fontFamily: FONT_SANS, fontSize: "0.85rem" }}
                    >
                      {paso.desc}
                    </p>
                  </div>

                  {/* Punto central */}
                  <div className="hidden lg:flex lg:w-16 items-center justify-center flex-shrink-0">
                    <div className="w-3 h-3 rounded-full border-2 border-[#d97644] bg-[#0a0807]" />
                  </div>

                  {/* Espacio opuesto */}
                  <div className="hidden lg:block lg:w-[calc(50%-2rem)]" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
