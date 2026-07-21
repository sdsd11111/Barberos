"use client";

import { useState } from "react";
import Reveal from "./Reveal";

const FONT_DISPLAY = "var(--font-fraunces), serif";
const FONT_MONO = "var(--font-mono), monospace";
const FONT_SANS = "var(--font-grotesk), sans-serif";

const TOTAL_PLAZAS = 10;
const PLAZAS_TOMADAS = 7;

const beneficios = [
  {
    ico: "∞",
    titulo: "Acceso de por vida",
    desc: "Sin suscripción mensual. Pagas una vez y BarberOS trabaja para siempre.",
  },
  {
    ico: "◎",
    titulo: "Onboarding personal",
    desc: "Te configuramos todo. En 30 minutos estás activo y enviando mensajes.",
  },
  {
    ico: "✦",
    titulo: "Influyes en el producto",
    desc: "Tu feedback moldea las siguientes versiones. Eres co-fundador simbólico.",
  },
  {
    ico: "★",
    titulo: "Precio de fundador",
    desc: "El precio más bajo que existirá. Siempre. Garantizado por escrito.",
  },
];

export default function Fundadores() {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [barberia, setBarberia] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const WHATSAPP_DESTINO = "593963410409"; // Número de César con prefijo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    // Construir el mensaje estructurado para WhatsApp
    const mensaje = [
      `🔥 *SOLICITUD DE PLAZA — BarberOS Fundadores*`,
      ``,
      `👤 *Nombre:* ${nombre}`,
      `📱 *WhatsApp:* ${whatsapp}`,
      `✂️ *Barbería:* ${barberia}`,
      ``,
      `Quiero reservar mi plaza como Barbería Fundadora.`,
    ].join("\n");

    const url = `https://wa.me/${WHATSAPP_DESTINO}?text=${encodeURIComponent(mensaje)}`;

    // Breve pausa para feedback visual antes de redirigir
    await new Promise((r) => setTimeout(r, 600));
    setEnviado(true);
    setEnviando(false);

    // Abrir WhatsApp en nueva pestaña
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="bg-[#131110] py-32 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-20 text-center flex flex-col items-center gap-5">
          <Reveal>
            <p
              className="tracking-[0.4em] uppercase text-[#5c554c]"
              style={{ fontFamily: FONT_MONO, fontSize: "0.65rem" }}
            >
              10 — Barberías fundadoras
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2
              className="font-light text-[#f3ece1] max-w-2xl leading-tight"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(2.2rem, 5vw, 4rem)",
                letterSpacing: "-0.025em",
              }}
            >
              Buscamos solo{" "}
              <em className="text-[#d97644]" style={{ fontStyle: "italic" }}>
                10 barberías.
              </em>
            </h2>
          </Reveal>

          {/* Contador de plazas */}
          <Reveal delay={0.2}>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex gap-1.5">
                {Array.from({ length: TOTAL_PLAZAS }).map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: i < PLAZAS_TOMADAS ? "#d97644" : "#2a2520",
                    }}
                  />
                ))}
              </div>
              <p
                className="text-[#a89e90]"
                style={{ fontFamily: FONT_MONO, fontSize: "0.72rem", letterSpacing: "0.2em" }}
              >
                {String(PLAZAS_TOMADAS).padStart(2, "0")}/{TOTAL_PLAZAS} plazas ocupadas
              </p>
            </div>
          </Reveal>
        </div>

        {/* Grid beneficios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#2a2520] mb-16">
          {beneficios.map((b, i) => (
            <Reveal key={i} delay={0.08 * i}>
              <div className="bg-[#131110] p-10 flex flex-col gap-4 h-full">
                <p
                  className="text-[#d97644]"
                  style={{ fontFamily: FONT_MONO, fontSize: "1.4rem" }}
                >
                  {b.ico}
                </p>
                <h4
                  className="font-light text-[#f3ece1]"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
                  }}
                >
                  {b.titulo}
                </h4>
                <p
                  className="text-[#5c554c] leading-relaxed"
                  style={{ fontFamily: FONT_SANS, fontSize: "0.875rem" }}
                >
                  {b.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Formulario */}
        <Reveal delay={0.2}>
          <div className="border border-[#2a2520] p-10 max-w-lg mx-auto">
            {enviado ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <p
                  className="text-[#d97644]"
                  style={{ fontFamily: FONT_MONO, fontSize: "2rem" }}
                >
                  ✓
                </p>
                <p
                  className="font-light text-[#f3ece1]"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
                  }}
                >
                  Recibido. Te contactamos hoy.
                </p>
                <p
                  className="text-[#5c554c]"
                  style={{ fontFamily: FONT_MONO, fontSize: "0.7rem", letterSpacing: "0.2em" }}
                >
                  Revisa tu WhatsApp en los próximos minutos.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <p
                  className="text-[#f3ece1] mb-2"
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)",
                    fontWeight: 300,
                  }}
                >
                  Reserva tu plaza.
                </p>

                {[
                  {
                    label: "NOMBRE",
                    value: nombre,
                    setter: setNombre,
                    placeholder: "Tu nombre",
                    type: "text",
                  },
                  {
                    label: "WHATSAPP",
                    value: whatsapp,
                    setter: setWhatsapp,
                    placeholder: "593963...",
                    type: "tel",
                  },
                  {
                    label: "BARBERÍA",
                    value: barberia,
                    setter: setBarberia,
                    placeholder: "Nombre de tu barbería",
                    type: "text",
                  },
                ].map((field) => (
                  <div key={field.label} className="flex flex-col gap-1.5">
                    <label
                      className="text-[#5c554c]"
                      style={{ fontFamily: FONT_MONO, fontSize: "0.6rem", letterSpacing: "0.3em" }}
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      placeholder={field.placeholder}
                      className="bg-[#0a0807] border border-[#2a2520] px-4 py-3 text-[#f3ece1] outline-none placeholder-[#2a2520] focus:border-[#d97644] transition-colors"
                      style={{ fontFamily: FONT_SANS, fontSize: "0.9rem" }}
                    />
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={enviando}
                  className="mt-2 px-8 py-4 transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  style={{
                    backgroundColor: "#d97644",
                    color: "#0a0807",
                    fontFamily: FONT_MONO,
                    fontSize: "0.7rem",
                    letterSpacing: "0.3em",
                  }}
                >
                  {enviando ? "ENVIANDO..." : "QUIERO MI PLAZA"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
