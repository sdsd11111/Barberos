import type { Metadata } from "next";
import Image from "next/image";
import VideoFAQ, { type FAQCard } from "@/components/landing/VideoFAQ";
import CTABlock from "@/components/shared/CTABlock";
import StructuredData from "@/components/shared/StructuredData";

// ⚠️ COPY PROVISIONAL — pendiente de sello final contra 04-SISTEMA-DE-COMUNICACION.md
// No publicar a producción sin aprobación explícita de César sobre este texto.

export const metadata: Metadata = {
  title: "Cómo funciona BarberOS — Fidelización automática para barberías",
  description:
    "Sin usuarios ni contraseñas. Un link mágico por WhatsApp, un dashboard en tiempo real y mensajes automáticos de reactivación. Así funciona BarberOS.",
  openGraph: {
    title: "Cómo funciona BarberOS",
    description:
      "Dashboard real, link mágico, reactivación automática. Sin apps, sin complicaciones.",
    type: "website",
    url: "https://barberos-rho-henna.vercel.app/como-funciona",
  },
  alternates: {
    canonical: "https://barberos-rho-henna.vercel.app/como-funciona",
  },
};

const faqItems: FAQCard[] = [
  {
    id: "01",
    pregunta: "¿Necesito WhatsApp Business?",
    respuestaCorta:
      "Funciona con WhatsApp normal o Business. La integración se conecta con la línea oficial que ya usa tu barbería.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/%C2%BFNecesito%20WhatsApp%20Business.mp4",
  },
  {
    id: "02",
    pregunta: "¿Necesito descargar alguna aplicación?",
    respuestaCorta:
      "No. Cero descargas. Funciona desde el navegador sin contraseñas y tus clientes usan su WhatsApp de siempre.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/cero%20aplicaciones.mp4",
  },
  {
    id: "03",
    pregunta: "¿Qué pasa si no tengo tiempo para administrarlo?",
    respuestaCorta:
      "El registro toma 3 segundos en el check-in. El sistema automatiza el seguimiento en segundo plano sin que hagas nada.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/no%20tengo%20tiempo.mp4",
  },
  {
    id: "04",
    pregunta: "¿Qué pasa si un cliente no tiene WhatsApp?",
    respuestaCorta:
      "WhatsApp tiene más del 90% de penetración. Para casos excepcionales, haces el check-in manual desde el panel.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/Y%20si%20mi%20cliente%20no%20sabe%20enviar%20un%20whatsapp.mp4",
  },
];

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Cómo funciona BarberOS",
  description: "Flujo completo de fidelización automática para barberías con BarberOS",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "El cliente llega y hace check-in",
      text: "El cliente envía un código por WhatsApp. BarberOS lo registra automáticamente.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "El sistema acumula y notifica",
      text: "Cada visita suma un corte a la tarjeta virtual del cliente. BarberOS notifica cuándo está cerca del premio.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Tú ves todo en tiempo real",
      text: "El panel muestra cortes del día, clientes nuevos, recurrentes y próximos premios — sin que tú hagas nada manual.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "El sistema reactiva a los clientes perdidos",
      text: "Si un cliente no regresa en 30 días, BarberOS le envía automáticamente un mensaje de reactivación.",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.pregunta,
    acceptedAnswer: { "@type": "Answer", text: item.respuestaCorta },
  })),
};

export default function ComoFuncionaPage() {
  return (
    <>
      <StructuredData data={howToSchema} />
      <StructuredData data={faqSchema} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-24 pb-12 px-6 border-b border-[#2a2520]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-8">
              Cómo Funciona / Sin complicaciones técnicas
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-light leading-[1.1] mb-8 text-[#f3ece1]">
              Tu barbería, en{" "}
              <em className="not-italic text-[#d97644]">piloto automático</em>.
            </h1>
            <p className="font-display italic text-xl text-[#a89e90] font-light max-w-xl leading-relaxed mb-8">
              BarberOS se conecta a tu WhatsApp de negocio y empieza a trabajar
              desde el primer check-in. Sin instalaciones. Sin formularios.
            </p>
          </div>
          
          <div className="flex-1 w-full relative">
            {/* Imagen del Hero */}
            <div className="relative aspect-video w-full bg-[#131110] border border-[#2a2520] shadow-2xl overflow-hidden rounded-sm group">
              <Image
                src="/paginas/Como-funciona.webp"
                alt="Interfaz de BarberOS en piloto automático"
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                priority
              />
              <div className="absolute inset-0 border border-[#d97644]/10 pointer-events-none" />
            </div>
            {/* Elemento decorativo */}
            <div className="absolute -bottom-4 -left-4 font-mono text-xs text-[#5c554c] tracking-widest hidden md:block">
              REC // DASHBOARD
            </div>
          </div>
        </div>
      </section>

      {/* ── FLUJO PASO A PASO ─────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="flujo-titulo">
        <div className="max-w-4xl mx-auto">
          <p
            id="flujo-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-20"
          >
            El flujo completo / De la llegada al regreso
          </p>

          <ol className="relative border-l border-[#2a2520] space-y-0" role="list">
            {[
              {
                paso: "01",
                titulo: "El cliente llega y hace check-in",
                detalle:
                  "Envía un código por WhatsApp. BarberOS lo identifica, registra la visita y actualiza su tarjeta de fidelidad automáticamente. Sin app, sin formulario.",
              },
              {
                paso: "02",
                titulo: "El encargado aprueba con un clic",
                detalle:
                  "Una notificación aparece en tu panel. Con un toque apruebas el corte. El sistema actualiza las métricas del día al instante.",
              },
              {
                paso: "03",
                titulo: "El cliente recibe su confirmación por WhatsApp",
                detalle:
                  "Un mensaje automático le dice cuántos cortes lleva y cuántos le faltan para su premio. Eso solo hace que vuelva antes.",
              },
              {
                paso: "04",
                titulo: "Tú ves el día completo en tiempo real",
                detalle:
                  "El panel muestra cortes del día, clientes nuevos, recurrentes y próximos a premio. Datos reales, no estimaciones.",
              },
              {
                paso: "05",
                titulo: "El sistema reactiva a quien no ha vuelto",
                detalle:
                  "A los 30 días sin visita, BarberOS envía un mensaje de reactivación automático. Sin que hagas nada. Sin olvidarte de nadie.",
              },
            ].map(({ paso, titulo, detalle }, i) => (
              <li key={i} className="pl-10 pb-16 last:pb-0 relative">
                <span className="absolute -left-3 w-6 h-6 bg-[#0a0807] border border-[#d97644] flex items-center justify-center">
                  <span className="w-2 h-2 bg-[#d97644] rounded-full" aria-hidden="true" />
                </span>
                <p className="font-mono text-xs text-[#5c554c] tracking-widest mb-3 uppercase">
                  {paso}
                </p>
                <h2 className="font-display text-2xl font-light text-[#f3ece1] mb-3">
                  {titulo}
                </h2>
                <p className="font-display italic text-[#a89e90] font-light leading-relaxed">
                  {detalle}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── LINK MÁGICO — pieza técnica confirmada en producción ── */}
      <section className="py-24 px-6 border-b border-[#2a2520] bg-[#0d0b09]" aria-labelledby="magiclink-titulo">
        <div className="max-w-4xl mx-auto">
          <p
            id="magiclink-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-12"
          >
            Acceso al panel / Sin usuarios. Sin contraseñas.
          </p>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-light text-[#f3ece1] mb-6 leading-tight">
                Un WhatsApp con un toque.
                <br />
                <em className="not-italic text-[#d97644]">
                  Eso es todo lo que necesitas.
                </em>
              </h2>
              <p className="font-display italic text-[#a89e90] font-light leading-relaxed mb-6">
                Escribes tu número. El sistema te manda un enlace único a tu
                WhatsApp. Tocas el enlace y entras directamente a tu panel de
                control. El enlace expira en 15 minutos y es de uso único.
              </p>
              <p className="font-mono text-xs text-[#5c554c] tracking-widest">
                Esta funcionalidad está en producción real — no es una promesa de venta.
              </p>
            </div>

            {/* Simulación visual del flujo del link mágico */}
            <div className="bg-[#131110] border border-[#2a2520] p-8 space-y-4 font-mono text-sm">
              <div className="flex items-start gap-3">
                <span className="text-[#d97644] shrink-0">→</span>
                <p className="text-[#a89e90]">Ingresas tu número de WhatsApp</p>
              </div>
              <div className="flex items-start gap-3 pl-4">
                <span className="text-[#5c554c] shrink-0">↓</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#d97644] shrink-0">→</span>
                <p className="text-[#a89e90]">
                  Recibes: <span className="text-[#f3ece1]">&quot;Tu enlace de acceso: [link]&quot;</span>
                </p>
              </div>
              <div className="flex items-start gap-3 pl-4">
                <span className="text-[#5c554c] shrink-0">↓</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#d97644] shrink-0">→</span>
                <p className="text-[#a89e90]">Tocas el link</p>
              </div>
              <div className="flex items-start gap-3 pl-4">
                <span className="text-[#5c554c] shrink-0">↓</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#d97644] shrink-0">✓</span>
                <p className="text-[#f3ece1] font-semibold">
                  Estás dentro. Sin contraseña.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARATIVA ─────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="comparativa-titulo">
        <div className="max-w-4xl mx-auto">
          <p
            id="comparativa-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-6"
          >
            Comparativa / vs. lo que hay hoy en el mercado
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-[#f3ece1] mb-16 leading-tight">
            Todo lo que usas hoy <em className="not-italic text-[#d97644] font-normal">¿Funciona?</em>
          </h2>

          <div className="grid md:grid-cols-3 gap-px bg-[#2a2520] border border-[#2a2520]">
            {[
              {
                metodo: "Tarjeta de cartulina",
                problemas: [
                  "Se pierde o se olvida",
                  "No genera datos",
                  "No envía recordatorios",
                  "No mide nada",
                ],
              },
              {
                metodo: "QR + formulario",
                problemas: [
                  "Nadie llena formularios",
                  "Datos incompletos o falsos",
                  "Requiere pantalla en local",
                  "Sin seguimiento automático",
                ],
              },
              {
                metodo: "Apps de terceros",
                problemas: [
                  "El cliente tiene que descargarse algo",
                  "Tus datos son de ellos",
                  "Costos variables y altos",
                  "Sin soporte local",
                ],
              },
            ].map(({ metodo, problemas }, i) => (
              <div key={i} className="bg-[#0a0807] p-8">
                <p className="font-mono text-xs tracking-widest uppercase text-[#5c554c] mb-6">
                  {metodo}
                </p>
                <ul className="space-y-3">
                  {problemas.map((p, j) => (
                    <li key={j} className="flex gap-3 items-start">
                      <span className="text-[#d97644] font-mono text-xs mt-0.5 shrink-0" aria-hidden="true">✕</span>
                      <span className="font-display italic text-[#5c554c] text-sm font-light">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <VideoFAQ
        label="DUDAS TÉCNICAS"
        title={
          <>
            Automatizar tu barbería <em className="text-[#d97644] not-italic font-normal">es así de simple.</em>
            <br />
            Resolvemos tus dudas de implementación.
          </>
        }
        subtitle="Pasa el cursor. Respuestas directas en 30 segundos."
        items={faqItems}
      />

      {/* ── CTA ÚNICO ────────────────────────────────────────── */}
      <CTABlock
        texto="Solicitar acceso a BarberOS"
        href="/acceso"
        subtexto="¿Todo claro? Siguiente paso"
      />
    </>
  );
}
