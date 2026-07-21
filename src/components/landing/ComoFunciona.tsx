import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";
const FONT_SANS = "var(--font-grotesk), sans-serif";

const pasos = [
  {
    num: "01",
    titulo: "El cliente entra",
    desc: "Registras el corte en 3 segundos desde el panel. Nada más.",
    img: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=800&auto=format&fit=crop",
    offset: "",
  },
  {
    num: "02",
    titulo: "BarberOS habla",
    desc: "El cliente recibe un WhatsApp automático con su progreso hacia el premio.",
    img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=800&auto=format&fit=crop",
    offset: "lg:translate-y-12",
  },
  {
    num: "03",
    titulo: "El cliente regresa",
    desc: "Motivado por el progreso y la recompensa, vuelve. Sin que tú hagas nada.",
    img: "https://images.unsplash.com/photo-1584486188879-29e0c0f7c0c5?q=80&w=800&auto=format&fit=crop",
    offset: "lg:translate-y-24",
  },
];

export default function ComoFunciona() {
  return (
    <section className="bg-[#0a0807] py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-20 flex flex-col gap-4">
          <Reveal>
            <p
              className="tracking-[0.4em] uppercase text-[#5c554c]"
              style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
            >
              03 — Cómo funciona
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="font-light text-[#f3ece1] max-w-2xl leading-tight"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                letterSpacing: "-0.02em",
              }}
            >
              Tres pasos.{" "}
              <em className="text-[#d97644]" style={{ fontStyle: "italic" }}>
                Sin descargar nada. Sin complicaciones.
              </em>
            </h2>
          </Reveal>
        </div>

        {/* Grid de tarjetas escalonadas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {pasos.map((paso, i) => (
            <Reveal key={i} delay={0.12 * i} className={paso.offset}>
              <div className={`relative group ${paso.offset}`}>
                {/* Imagen */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-[#131110] relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={paso.img}
                    alt={paso.titulo}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10,8,7,0.95) 0%, rgba(10,8,7,0.1) 60%)",
                    }}
                  />
                  {/* Número */}
                  <p
                    className="absolute top-6 left-6 text-[#d97644]"
                    style={{ fontFamily: FONT_MONO, fontSize: "0.65rem", letterSpacing: "0.3em" }}
                  >
                    {paso.num}
                  </p>
                </div>

                {/* Texto debajo */}
                <div className="pt-6 flex flex-col gap-2">
                  <h3
                    className="font-light text-[#f3ece1]"
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                    }}
                  >
                    {paso.titulo}
                  </h3>
                  <p
                    className="text-[#a89e90] leading-relaxed"
                    style={{ fontFamily: FONT_SANS, fontSize: "0.9rem" }}
                  >
                    {paso.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
