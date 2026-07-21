import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";
const FONT_SANS = "var(--font-grotesk), sans-serif";

export default function CTAFinal() {
  return (
    <>
      {/* ─────────────────────────────────────────────
          CTA FINAL — 11
      ───────────────────────────────────────────── */}
      <section className="bg-black py-32 px-6">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <Reveal>
            <p
              className="tracking-[0.4em] uppercase text-[#5c554c]"
              style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
            >
              11 — La decisión
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="font-light text-[#f3ece1] leading-tight"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(2rem, 5vw, 4rem)",
                letterSpacing: "-0.025em",
              }}
            >
              Dentro de seis meses tendrás{" "}
              <em className="text-[#d97644]" style={{ fontStyle: "italic" }}>
                dos opciones.
              </em>
            </h2>
          </Reveal>

          {/* Grid 2 tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-8">
            {/* Opción A — Muted */}
            <Reveal delay={0.15}>
              <div className="border border-[#2a2520] p-10 flex flex-col gap-5 h-full text-left">
                <p
                  className="text-[#5c554c]"
                  style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.3em" }}
                >
                  OPCIÓN A
                </p>
                <p
                  className="font-light text-[#5c554c] leading-tight"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                  }}
                >
                  Seguir igual. Esperar que vuelvan solos.
                </p>
                <ul className="flex flex-col gap-2">
                  {[
                    "Clientes que se pierden sin avisar",
                    "Cero reseñas de Google",
                    "Adquiriendo clientes caros",
                    "Mismos ingresos",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-[#2a2520]"
                      style={{ fontFamily: FONT_SANS, fontSize: "0.85rem" }}
                    >
                      <span>—</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Opción B — Accent */}
            <Reveal delay={0.25}>
              <div
                className="border p-10 flex flex-col gap-5 h-full text-left relative overflow-hidden"
                style={{
                  borderColor: "#d97644",
                  boxShadow: "0 0 40px rgba(217,118,68,0.12), inset 0 0 40px rgba(217,118,68,0.03)",
                }}
              >
                {/* Glow */}
                <div
                  className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
                  style={{
                    background: "radial-gradient(circle, rgba(217,118,68,0.15) 0%, transparent 70%)",
                  }}
                />
                <p
                  className="text-[#d97644]"
                  style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.3em" }}
                >
                  OPCIÓN B · BARBEROS
                </p>
                <p
                  className="font-light text-[#f3ece1] leading-tight"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                  }}
                >
                  BarberOS trabajando mientras tú cortas.
                </p>
                <ul className="flex flex-col gap-2">
                  {[
                    "Clientes que regresan solos",
                    "Reseñas automáticas cada semana",
                    "Premio al cliente 5, sin esfuerzo",
                    "Más ingresos con los mismos clientes",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-[#f3ece1]"
                      style={{ fontFamily: FONT_SANS, fontSize: "0.85rem" }}
                    >
                      <span className="text-[#d97644]">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Botón final */}
          <Reveal delay={0.3}>
            <div className="flex flex-col items-center gap-4 mt-8">
              <a
                href="#fundadores"
                className="inline-block px-14 py-5 transition-all duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: "#d97644",
                  color: "#0a0807",
                  fontFamily: FONT_MONO,
                  fontSize: "0.7rem",
                  letterSpacing: "0.3em",
                }}
              >
                QUIERO QUE MIS CLIENTES REGRESEN MÁS
              </a>
              <p
                className="text-[#5c554c]"
                style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.25em" }}
              >
                Sin tarjeta · Sin contrato · Sin excusas
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────── */}
      <footer className="bg-[#0a0807] border-t border-[#2a2520] py-20 px-6">
        {/* Datos Estructurados JSON-LD para SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "BarberOS",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web, WhatsApp",
              "description":
                "Sistema de fidelización inteligente para barberías. Convierte visitas en clientes recurrentes mediante WhatsApp, sin apps adicionales.",
              "author": {
                "@type": "Person",
                "name": "César Reyes Jaramillo",
                "url": "https://www.cesarreyesjaramillo.com/",
              },
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/LimitedAvailability",
              },
            }),
          }}
        />

        <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
          {/* Eslogan */}
          <div className="text-center flex flex-col gap-4">
            <p
              className="font-light text-[#f3ece1]"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                letterSpacing: "-0.015em",
              }}
            >
              Tu trabajo termina cuando acaba el corte.
            </p>
            <p
              className="font-light text-[#d97644]"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(1.4rem, 3vw, 2.2rem)",
                fontStyle: "italic",
                letterSpacing: "-0.015em",
              }}
            >
              El nuestro empieza ahí.
            </p>
          </div>

          {/* Divider + meta */}
          <div className="w-full border-t border-[#2a2520] pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex flex-col gap-1">
              <p
                className="text-[#5c554c]"
                style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.3em" }}
              >
                BARBEROS © 2026 — TODOS LOS DERECHOS RESERVADOS
              </p>
              <p
                className="text-[#2a2520]"
                style={{ fontFamily: FONT_MONO, fontSize: "0.55rem", letterSpacing: "0.2em" }}
              >
                REALIZADO POR{" "}
                <a
                  href="https://www.cesarreyesjaramillo.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#5c554c] hover:text-[#d97644] transition-colors underline underline-offset-2"
                >
                  CÉSAR REYES JARAMILLO
                </a>
              </p>
            </div>
            <div className="flex gap-8">
              {[
                { label: "Privacidad", href: "#" },
                { label: "Términos", href: "#" },
                {
                  label: "Contacto",
                  href: "https://wa.me/593963410409",
                },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-[#5c554c] hover:text-[#d97644] transition-colors"
                  style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.25em" }}
                >
                  {link.label.toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
