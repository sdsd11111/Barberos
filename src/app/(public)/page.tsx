import type { Metadata } from "next";
import Link from "next/link";
import StructuredData from "@/components/shared/StructuredData";
import CinematicScene from "@/components/landing/CinematicScene";
import VideoScrollSection, { type SceneOverlay } from "@/components/landing/VideoScrollSection";
import MarqueeDivisor from "@/components/landing/MarqueeDivisor";
import VideoFAQ, { type FAQCard } from "@/components/landing/VideoFAQ";

// ⚠️ COPY PROVISIONAL — pendiente de sello final contra 04-SISTEMA-DE-COMUNICACION.md
// No publicar a producción sin aprobación explícita de César sobre este texto.

// DIRECCIÓN: Avatar 1 — "El que llega al viernes con miedo"
// Emociones dominantes: Tranquilidad + Control
// Código reptil: certeza contra la ruina.
// Referencia: 02-ARQUITECTURA-ESTRATEGICA.md v2.1 — Sección "Arquitectura de Avatares"

export const metadata: Metadata = {
  title: "¿Cuántos clientes tiene realmente tu barbería? — BarberOS",
  description:
    "La mayoría de barberos administra su negocio a ciegas. BarberOS es el sistema que te da las respuestas concretas que necesitas para dejar de adivinar si vas a sobrevivir este mes.",
  openGraph: {
    title: "¿Cuántos clientes tiene realmente tu barbería?",
    description:
      "Si no puedes responderlo... entonces no estás administrando una barbería. Estás adivinando.",
    type: "website",
    url: "https://barberos-rho-henna.vercel.app/",
  },
  alternates: { canonical: "https://barberos-rho-henna.vercel.app/" },
  robots: { index: true, follow: true },
};

// ──────────────────────────────────────────────
// DATOS ESTRUCTURADOS (Inicio: WebPage + FAQPage + BreadcrumbList)
// Referencia: 03-ARQUITECTURA-WEB.md — Sección "Datos estructurados"
// ──────────────────────────────────────────────
const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "BarberOS — ¿Cuántos clientes tiene realmente tu barbería?",
  description:
    "Sistema operativo para barberías. Fidelización automática, dashboard en tiempo real, acceso sin contraseñas.",
  url: "https://barberos-rho-henna.vercel.app/",
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://barberos-rho-henna.vercel.app/",
      },
    ],
  },
};

const faqItems = [
  {
    pregunta: "¿Necesito descargar una app?",
    respuesta:
      "No. BarberOS funciona desde cualquier navegador. Tus clientes interactúan por WhatsApp — el canal que ya usan todos los días. Sin descargas, sin registros de cliente.",
  },
  {
    pregunta: "¿Qué pasa si no tengo conocimientos técnicos?",
    respuesta:
      "El acceso es por enlace mágico desde tu WhatsApp — un toque y entras a tu panel. No hay usuarios, no hay contraseñas, no hay formularios largos.",
  },
  {
    pregunta: "¿Cuánto tiempo hasta ver resultados reales?",
    respuesta:
      "El primer corte registrado ya genera datos. La mayoría de barberías piloto vieron sus primeras métricas en la misma semana de activación.",
  },
  {
    pregunta: "¿Y si un cliente no tiene WhatsApp?",
    respuesta:
      "WhatsApp tiene más del 90% de penetración en el mercado objetivo. Para casos excepcionales, el barbero puede registrar la visita manualmente desde su panel.",
  },
  {
    pregunta: "¿Es seguro? ¿Mis datos son míos?",
    respuesta:
      "Sí. Cada barbería tiene su propio espacio aislado — ningún dueño puede ver datos de otro. Y tus datos los exportas cuando quieras.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.pregunta,
    acceptedAnswer: { "@type": "Answer", text: item.respuesta },
  })),
};

// ──────────────────────────────────────────────────────────────
// ESCENA 2 — El Interrogatorio con ScrollSequence
//
// ORDEN DE PREGUNTAS (Arco narrativo de César, 2026-07-19):
// La tensión escala desde el dolor inmediato (dinero) → pérdida del equipo
// → pérdida de clientes → consecuencia financiera → cierre simbólico.
//
// MICROCOPY: Frases de cambio de mentalidad (no de venta).
// Reprograman el marco mental antes de presentar el producto.
// Referencia: 02-ARQUITECTURA-ESTRATEGICA.md v2.1
//
// 33 frames reales del video — modo canvas Apple continuo desde el hero.
// Para agregar más frames: solo añade más paths a este array.
const ESCENA1_FRAMES = Array.from({ length: 33 }, (_, i) =>
  `/interrogatorio/escena1/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`
);

// Preguntas del interrogatorio — sin frameSrc, el canvas es global
const interrogatorioScenes: SceneOverlay[] = [
  {
    question: "¿Cuánto necesitas facturar esta semana para cubrir arriendo, sueldos y servicios?",
    microcopy: "Todo negocio rentable comienza con una medición correcta.",
  },
  {
    question: "¿Sabes cuál de tus barberos genera más clientes recurrentes?",
    microcopy: "No puedes mejorar lo que no puedes medir.",
  },
  {
    question: "¿Sabes cuántos de tus clientes de esta semana van a volver la próxima?",
    microcopy: "Cada cliente que no regresa es una oportunidad perdida.",
  },
  {
    question: "Si no vuelven suficientes... ¿de dónde sale la diferencia?",
    microcopy: "La recurrencia vale más que la publicidad.",
  },
  {
    question: "¿Cuánto proyectas ganar el siguiente mes?",
    microcopy: "Los datos convierten la intuición en estrategia.",
  },
];

const GOLPE_FINAL =
  "Si no puedes responder estas preguntas... no estás administrando una barbería. Estás adivinando.";

const objecionesHome: FAQCard[] = [
  {
    id: "01",
    pregunta: "¿No es esto lo mismo que ya trato de hacer a mano?",
    respuestaCorta: "Te lo ofrecieron. Pero no te lo dieron. Te vendieron una tarjeta. No una relación.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/No%20es%20esto%20lo%20mismo%20que%20ya%20trato%20de%20hacer%20a.mp4",
  },
  {
    id: "02",
    pregunta: "¿Lo puedo hacer con ChatGPT?",
    respuestaCorta: "ChatGPT no tiene el historial de tus clientes en tiempo real, ni sabe quién entró por tu puerta hoy.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/chatgpt%20lo%20puede%20hacer.mp4",
  },
  {
    id: "03",
    pregunta: "¿Necesito otra aplicación?",
    respuestaCorta: "No. Cero apps. Tus clientes usan su WhatsApp de siempre. Tú entras desde tu navegador sin contraseñas.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/cero%20aplicaciones.mp4",
  },
  {
    id: "04",
    pregunta: "¿Qué pasa si no tengo tiempo?",
    respuestaCorta: "El registro toma 3 segundos en el check-in. El sistema hace el resto del seguimiento en segundo plano.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/no%20tengo%20tiempo.mp4",
  },
  {
    id: "05",
    pregunta: "¿Y si tengo varios barberos?",
    respuestaCorta: "Cada barbero tiene su cuenta. El sistema te dice quién está fidelizando clientes de verdad y quién no.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/Varios%20Barberos.mp4",
  },
  {
    id: "06",
    pregunta: "¿Y si mi cliente no sabe enviar un WhatsApp?",
    respuestaCorta: "Si sabe enviar un mensaje por WhatsApp, sabe usar BarberOS. Y si no, lo registras tú a mano en un clic.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/Y%20si%20mi%20cliente%20no%20sabe%20enviar%20un%20whatsapp.mp4",
  },
];

// Hero content — se pasa como prop a VideoScrollSection
// El canvas del video está detrás desde el primer pixel
const heroContent = (
  <>
    <div className="flex items-center gap-3 mb-16 justify-center">
      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-blink" aria-hidden="true" />
      <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#d97644]">
        REC · 24FPS · ESC 01
      </p>
    </div>
    <h1
      id="h1-principal"
      className="font-display text-5xl md:text-7xl lg:text-8xl font-light text-[#f3ece1] leading-[1.05] max-w-4xl"
    >
      ¿Cuántos clientes tiene{" "}
      <em className="not-italic text-[#d97644]">realmente</em>{" "}
      tu barbería?
    </h1>
    <p className="font-display italic text-lg md:text-xl text-[#5c554c] mt-16 font-light max-w-md leading-relaxed">
      La intuición sirve para cortar cabello.
      <br />
      Los negocios crecen con datos.
    </p>
    <span
      className="block font-mono text-xs tracking-[0.4em] uppercase text-[#3a3530] animate-bounce mt-20"
      aria-hidden="true"
    >
      ↓
    </span>
  </>
);

export default function InicioPage() {
  return (
    <>
      {/* ── JSON-LD — SSR garantizado, indexable ─── */}
      <StructuredData data={webPageSchema} />
      <StructuredData data={faqSchema} />

      {/* ══════════════════════════════════════════
          ESCENAS 1+2 — Hero + Interrogatorio
          Un canvas continuo cubre ambas secciones.
          El video corre desde el primer pixel visible.
          Las preguntas aparecen con clip-path reveal.
      ══════════════════════════════════════════ */}
      <VideoScrollSection
        frames={ESCENA1_FRAMES}
        scenes={interrogatorioScenes}
        heroContent={heroContent}
        closingText=""
        scrollHeight="320vh"
        sectionLabel="Cinco preguntas"
      />

      {/* Divisor con texto en movimiento infinito (Marquee) para romper el ritmo de lectura */}
      <MarqueeDivisor text="Adivinar si vas a sobrevivir este mes. / El costo de no saber. / Arriendo. / Sueldos. / Fuga silenciosa de clientes. / Administrar a ciegas. / ¿Saber o adivinar? / Certeza contra la ruina. /" />

      {/* ══════════════════════════════════════════
          ESCENA 3 — El Golpe (Pantalla negra)
          Esta sección reafirma la transición de atmósfera tras el corte del marquee.
      ══════════════════════════════════════════ */}
      <section className="py-32 bg-[#000000] flex items-center justify-center px-6 border-b border-[#1c1917]">
        <CinematicScene threshold={0.2} className="max-w-3xl text-center">
          <p className="font-mono text-xs tracking-[0.5em] uppercase text-[#1a1815] mb-20">
            La verdad
          </p>
          <blockquote className="font-display text-3xl md:text-5xl font-light text-[#f3ece1] leading-tight">
            Si no puedes responderlas...
            <br />
            <span className="text-[#d97644]">entonces no estás administrando una barbería.</span>
            <br />
            Estás adivinando.
          </blockquote>
        </CinematicScene>
      </section>

      {/* ══════════════════════════════════════════
          ESCENA 4 — La Consecuencia
          Estado mental: visualizar la pérdida silenciosa.
          Acción: mostrar el "leak" de clientes sin datos.
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 border-b border-[#1c1917] bg-[#0a0807]">
        <div className="max-w-3xl mx-auto">
          <CinematicScene>
            <p className="font-mono text-xs tracking-[0.5em] uppercase text-[#3a3530] mb-20 text-center">
              Lo que pasa en silencio
            </p>
          </CinematicScene>

          <ol className="relative" aria-label="Recorrido del cliente perdido">
            {[
              {
                estado: "Entra",
                detalle: "Un cliente llega por primera vez. Se va feliz.",
                color: "text-[#d97644]",
                lineColor: "bg-[#d97644]",
              },
              {
                estado: "Queda satisfecho",
                detalle: "Promete volver. Tú lo recuerdas vagamente.",
                color: "text-[#a89e90]",
                lineColor: "bg-[#3a3530]",
              },
              {
                estado: "Pasan 45 días",
                detalle: "No ha vuelto. Tú no lo sabes. Nadie lo contactó.",
                color: "text-[#5c554c]",
                lineColor: "bg-[#2a2520]",
              },
              {
                estado: "Se fue para siempre",
                detalle: "Encontró otra barbería. Tú nunca lo supiste.",
                color: "text-[#3a3530]",
                lineColor: "bg-[#1c1917]",
              },
            ].map(({ estado, detalle, color, lineColor }, i) => (
              <CinematicScene key={i} delay={i * 150} threshold={0.1}>
                <li className="flex gap-8 items-start pb-16 last:pb-0 relative">
                  <div className="flex flex-col items-center shrink-0">
                    <span
                      className={`w-3 h-3 rounded-full border-2 border-current mt-1 ${color}`}
                      aria-hidden="true"
                    />
                    {i < 3 && (
                      <span className={`w-px flex-1 mt-2 min-h-[4rem] ${lineColor}`} aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <p className={`font-mono text-xs tracking-widest uppercase mb-2 ${color}`}>
                      {estado}
                    </p>
                    <p className="font-display italic text-xl text-[#a89e90] font-light">
                      {detalle}
                    </p>
                  </div>
                </li>
              </CinematicScene>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ESCENA 5 — La Realidad Alternativa
          Estado mental: alivio, posibilidad.
          Cambio de atmósfera: más luz, más calma.
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 border-b border-[#2a2520] bg-[#131110]">
        <div className="max-w-4xl mx-auto">
          <CinematicScene>
            <p className="font-mono text-xs tracking-[0.5em] uppercase text-[#5c554c] mb-6">
              Otra posibilidad
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-[#f3ece1] mb-20 leading-tight">
              Imagina conocer tus números.
            </h2>
          </CinematicScene>

          <div className="grid md:grid-cols-2 gap-px bg-[#2a2520] border border-[#2a2520] mb-16">
            {[
              { 
                numero: "Total de clientes", 
                label: "Visitas acumuladas",
                icon: (
                  <svg className="w-8 h-8 text-[#d97644]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              },
              { 
                numero: "Opiniones en Google", 
                label: "Reputación online",
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )
              },
              { 
                numero: "Notificaciones", 
                label: "Alertas de clientes",
                icon: (
                  <svg className="w-8 h-8 text-[#d97644]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                )
              },
              { 
                numero: "Calificación a Barberos", 
                label: "Evaluación del servicio",
                icon: (
                  <svg className="w-8 h-8 text-[#d97644]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                )
              },
            ].map(({ numero, label, icon }, i) => (
              <CinematicScene key={i} delay={i * 100} threshold={0.1}>
                <div className="bg-[#0d0b09] p-10 flex flex-col items-center text-center">
                  <div className="mb-4">{icon}</div>
                  <p className="font-display text-2xl font-light text-[#f3ece1] mb-2">
                    {numero}
                  </p>
                  <p className="font-mono text-xs tracking-widest uppercase text-[#5c554c]">
                    {label}
                  </p>
                </div>
              </CinematicScene>
            ))}
          </div>

          <CinematicScene delay={400}>
            <p className="font-display italic text-xl text-[#a89e90] font-light mt-12 text-center max-w-xl mx-auto">
              No son proyecciones. Son los datos reales que tu barbería
              genera cada día — solo que hoy no tienes dónde verlos.
            </p>
          </CinematicScene>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ESCENA 6 — Aquí aparece BarberOS
          Primera mención del producto.
          Regla: no abrir con "somos un software".
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 border-b border-[#2a2520]">
        <div className="max-w-4xl mx-auto">
          <CinematicScene>
            <p className="font-mono text-xs tracking-[0.5em] uppercase text-[#5c554c] mb-12">
              BarberOS / Por qué existe
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-light text-[#f3ece1] mb-8 leading-tight max-w-3xl">
              BarberOS nació porque{" "}
              <em className="not-italic text-[#d97644]">
                ningún dueño debería administrar una barbería a ciegas.
              </em>
            </h2>
            <p className="font-display italic text-xl text-[#a89e90] font-light max-w-2xl leading-relaxed">
              No somos un software de punto de venta. No somos una app de
              reservas. Somos el sistema que te dice la verdad de tu negocio
              mientras tú haces lo que sabes hacer: cortar cabello.
            </p>
          </CinematicScene>

          {/* Video Real — "Video Home (corregido)" */}
          <CinematicScene delay={300} className="mt-16">
            <div className="relative aspect-video bg-[#131110] border border-[#2a2520] overflow-hidden group shadow-2xl">
              <video
                src="https://activaqr-archivos.b-cdn.net/barberos/video%20home%20corregido%20.mp4"
                controls
                playsInline
                preload="metadata"
                className="w-full h-full object-cover"
              />
            </div>
          </CinematicScene>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ESCENA 7 — Cómo Funciona (Preview corto)
          Estado mental: curiosidad técnica.
          Regla: preview solamente, no duplicar la página.
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 border-b border-[#2a2520] bg-[#0d0b09]">
        <div className="max-w-4xl mx-auto">
          <CinematicScene>
            <p className="font-mono text-xs tracking-[0.5em] uppercase text-[#5c554c] mb-20">
              Cómo funciona / Sin complicaciones
            </p>
          </CinematicScene>

          <div className="grid md:grid-cols-3 gap-px bg-[#2a2520] border border-[#2a2520] mb-12">
            {[
              {
                paso: "01",
                titulo: "WhatsApp",
                detalle:
                  "El cliente envía su número. BarberOS lo identifica y registra la visita automáticamente.",
              },
              {
                paso: "02",
                titulo: "Check-in",
                detalle:
                  "Apruebas el corte con un toque. Las métricas se actualizan al instante.",
              },
              {
                paso: "03",
                titulo: "Dashboard",
                detalle:
                  "Tu panel muestra en tiempo real quién volvió, quién no, y cuántos premios hay por entregar.",
              },
            ].map(({ paso, titulo, detalle }, i) => (
              <CinematicScene key={i} delay={i * 120} threshold={0.15}>
                <div className="bg-[#0a0807] p-10">
                  <p className="font-mono text-xs text-[#d97644] tracking-widest mb-4">{paso}</p>
                  <p className="font-display text-2xl font-light text-[#f3ece1] mb-3">{titulo}</p>
                  <p className="font-display italic text-[#5c554c] text-sm font-light leading-relaxed">
                    {detalle}
                  </p>
                </div>
              </CinematicScene>
            ))}
          </div>

          <CinematicScene delay={400}>
            <div className="text-center">
              <Link
                href="/como-funciona"
                className="font-mono text-xs tracking-[0.3em] uppercase text-[#a89e90] border border-[#2a2520] px-8 py-4 hover:border-[#d97644] hover:text-[#d97644] transition-all inline-block"
              >
                Ver el flujo completo →
              </Link>
            </div>
          </CinematicScene>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ESCENA 8 — Historias (Preview corto)
          Estado mental: querer evidencia de otros.
      ══════════════════════════════════════════ */}
      <section className="py-32 px-6 border-b border-[#2a2520]">
        <div className="max-w-4xl mx-auto">
          <CinematicScene>
            <p className="font-mono text-xs tracking-[0.5em] uppercase text-[#5c554c] mb-4">
              Historias / Barberías reales
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#f3ece1] mb-20">
              No lo decimos nosotros.
            </h2>
          </CinematicScene>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                ciudad: "Cuenca, Ecuador",
                cita: '"Por primera vez sé exactamente qué tan bien le está yendo a mi negocio."',
                slug: "barberia-ejemplo-cuenca",
              },
              {
                ciudad: "Loja, Ecuador",
                cita: '"Lo que más me sorprendió fue cuántos clientes no estaban volviendo."',
                slug: "barberia-ejemplo-loja",
              },
            ].map(({ ciudad, cita, slug }, i) => (
              <CinematicScene key={i} delay={i * 150} threshold={0.15}>
                <Link
                  href={`/historias/${slug}`}
                  className="group block bg-[#131110] border border-[#2a2520] p-10 hover:border-[#d97644] transition-colors"
                >
                  <p className="font-mono text-xs tracking-widest uppercase text-[#5c554c] mb-6">
                    {ciudad}
                  </p>
                  <blockquote className="font-display italic text-[#f3ece1] text-lg font-light leading-relaxed mb-8">
                    {cita}
                  </blockquote>
                  <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#d97644] group-hover:tracking-[0.3em] transition-all">
                    Leer la historia →
                  </span>
                </Link>
              </CinematicScene>
            ))}
          </div>

          <CinematicScene delay={350}>
            <div className="text-center">
              <Link
                href="/historias"
                className="font-mono text-xs tracking-[0.3em] uppercase text-[#a89e90] border border-[#2a2520] px-8 py-4 hover:border-[#d97644] hover:text-[#d97644] transition-all inline-block"
              >
                Ver todas las historias →
              </Link>
            </div>
          </CinematicScene>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ESCENA 9 — FAQ / OBJECIONES ("No un acordeón. Tu cara.")
          Reemplaza las preguntas frecuentes tradicionales por el grid de videos interactivos.
          Referencia: 03-ARQUITECTURA-WEB.md
      ══════════════════════════════════════════ */}
      <VideoFAQ
        label="89 / OBJECIONES"
        title={
          <>
            Conocer tus números te hace <em className="text-[#d97644] not-italic font-normal">empresario.</em>
            <br />
            Resolvemos las dudas que te detienen.
          </>
        }
        subtitle="Pasa el cursor. Respuestas directas en 30 segundos."
        items={objecionesHome}
      />

      {/* ══════════════════════════════════════════
          ESCENA 10 — El Cierre
          Regla: volver a la pregunta inicial, no a un pitch.
          1 solo CTA.
      ══════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center border-t border-[#2a2520] bg-[#0a0807]">
        <CinematicScene threshold={0.2}>
          <p className="font-mono text-xs tracking-[0.5em] uppercase text-[#3a3530] mb-16">
            El siguiente paso
          </p>

          <h2 className="font-display text-4xl md:text-6xl font-light text-[#f3ece1] leading-tight mb-8 max-w-3xl mx-auto">
            Cuando alguien te pregunte cuántos clientes tiene{" "}
            <em className="not-italic">realmente</em> tu barbería...
            <br />
            <span className="text-[#d97644]">¿podrás responder con certeza?</span>
          </h2>

          <p className="font-display italic text-xl text-[#5c554c] font-light mb-20 max-w-xl mx-auto">
            Si no puedes aún... empieza aquí.
          </p>

          <Link
            href="/como-funciona"
            className="inline-block font-mono text-sm tracking-[0.3em] uppercase text-[#0a0807] bg-[#d97644] px-12 py-6 hover:bg-[#e8854f] transition-all hover:tracking-[0.35em]"
          >
            Quiero descubrirlo
          </Link>
        </CinematicScene>
      </section>
    </>
  );
}
