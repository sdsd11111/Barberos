import type { Metadata } from "next";
import Image from "next/image";
import VideoFAQ, { type FAQCard } from "@/components/landing/VideoFAQ";
import CTABlock from "@/components/shared/CTABlock";
import StructuredData from "@/components/shared/StructuredData";

// ⚠️ COPY PROVISIONAL — pendiente de sello final contra 04-SISTEMA-DE-COMUNICACION.md
// No publicar a producción sin aprobación explícita de César sobre este texto.

// REGLA ARQUITECTURAL:
// - Setup y mensualidad SIEMPRE mostrados por separado. Nunca combinarlos en "$X/año".
// - El tier económico privado ("Starter") NO aparece aquí bajo ninguna circunstancia.
// - Referencia: 03-ARQUITECTURA-WEB.md — Página 6 / Precios.

export const metadata: Metadata = {
  title: "Precios — BarberOS — Setup $50 + Prueba 15 días gratis",
  description:
    "BarberOS Pro: Setup $50 + desde $9.99/mes o $500 lifetime. BarberOS Premium: Setup $50 + desde $19.99/mes o $1000 lifetime. Prueba 15 días gratis.",
  openGraph: {
    title: "Precios BarberOS — Sin ambigüedad",
    description:
      "Setup único + mensualidad baja. Dos planes claros para barberías que quieren control real.",
    type: "website",
    url: "https://barberos-rho-henna.vercel.app/precios",
  },
  alternates: {
    canonical: "https://barberos-rho-henna.vercel.app/precios",
  },
};

const objecionesPrecio: FAQCard[] = [
  {
    id: "01",
    pregunta: "¿Hay contrato de permanencia?",
    respuestaCorta:
      "No. La mensualidad se renueva mes a mes. Puedes cancelar cuando quieras sin penalización.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/%C2%BFHay%20contrato%20de%20permanencia.mp4",
  },
  {
    id: "02",
    pregunta: "¿Qué pasa si dejo de pagar la mensualidad?",
    respuestaCorta:
      "Tu acceso al panel queda suspendido temporalmente. Tus datos no se eliminan — cuando reactivás, todo sigue como lo dejaste.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/%C2%BFQu%C3%A9%20pasa%20si%20dejo%20de%20pagar%20la%20mensualidad.mp4",
  },
  {
    id: "03",
    pregunta: "¿El setup se repite si cambio de plan?",
    respuestaCorta:
      "No. El setup es pago único por activación de tu barbería. Si migras de Pro a Premium, solo pagas la diferencia de mensualidad.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/%C2%BFEl%20setup%20se%20repite%20si%20cambio%20de%20plan.mp4",
  },
  {
    id: "04",
    pregunta: "¿Puedo hablar directamente con alguno de estos dueños?",
    respuestaCorta:
      "Sí. Transparencia total. Te contactamos con barberías activas en el sistema para que escuches su experiencia directa.",
    duracion: "00:30",
    videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/%C2%BFPuedo%20hablar%20directamente%20con%20alguno%20de%20estos%20due.mp4",
  },
];

const productoProSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BarberOS Pro",
  description:
    "Sistema de fidelización para barberías individuales. Check-in por WhatsApp, dashboard, reportes, premios y Google Reviews.",
  brand: { "@type": "Brand", name: "BarberOS" },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "9.99",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        price: "9.99",
        priceCurrency: "USD",
        billingDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        name: "Mensualidad",
      },
      {
        "@type": "UnitPriceSpecification",
        price: "99",
        priceCurrency: "USD",
        name: "Anual",
      },
      {
        "@type": "UnitPriceSpecification",
        price: "500",
        priceCurrency: "USD",
        name: "Lifetime",
      },
    ],
    availability: "https://schema.org/InStock",
    url: "https://barberos-rho-henna.vercel.app/precios",
  },
};

const productoPremiumSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BarberOS Premium",
  description:
    "Sistema de fidelización avanzado para barberías con equipo. Todo lo de Pro más Motor de Conocimiento, IA especializada, alertas y consultor IA.",
  brand: { "@type": "Brand", name: "BarberOS" },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "19.99",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        price: "19.99",
        priceCurrency: "USD",
        billingDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        name: "Mensualidad",
      },
      {
        "@type": "UnitPriceSpecification",
        price: "199",
        priceCurrency: "USD",
        name: "Anual",
      },
      {
        "@type": "UnitPriceSpecification",
        price: "1000",
        priceCurrency: "USD",
        name: "Lifetime",
      },
    ],
    availability: "https://schema.org/InStock",
    url: "https://barberos-rho-henna.vercel.app/precios",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: objecionesPrecio.map((item) => ({
    "@type": "Question",
    name: item.pregunta,
    acceptedAnswer: { "@type": "Answer", text: item.respuestaCorta },
  })),
};

const planesPro = [
  {
    tipo: "Prueba 15 días",
    precio: "$0",
    periodo: "15 días",
    descripcion: "Prueba BarberOS Pro gratis. Sin tarjeta, sin compromiso.",
    incluye: [
      "Check-in por WhatsApp",
      "Panel de clientes y visitas",
      "Fidelización automática",
      "Dashboard en tiempo real",
      "Reportes de desempeño",
      "Sistema de premios",
      "Integración Google Reviews",
    ],
    nota: "Setup USD 50 al activar",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Mensual",
    precio: "$9.99",
    periodo: "/ mes",
    descripcion: "Paga mes a mes sin compromiso.",
    incluye: [
      "Check-in por WhatsApp",
      "Panel de clientes y visitas",
      "Fidelización automática",
      "Dashboard en tiempo real",
      "Reportes de desempeño",
      "Sistema de premios",
      "Integración Google Reviews",
    ],
    nota: "Setup USD 50 al activar",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Anual",
    precio: "$99",
    periodo: "/ año",
    descripcion: "Ahorra más de USD 20 al año.",
    incluye: [
      "Check-in por WhatsApp",
      "Panel de clientes y visitas",
      "Fidelización automática",
      "Dashboard en tiempo real",
      "Reportes de desempeño",
      "Sistema de premios",
      "Integración Google Reviews",
    ],
    nota: "Equivale a $8.25/mes + Setup USD 50",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Lifetime",
    precio: "$500",
    periodo: "pago único",
    descripcion: "Acceso permanente sin mensalidades.",
    incluye: [
      "Todo lo del plan Anual",
      "Actualizaciones gratis de por vida",
      "Sin costos mensuales",
      "Soporte por WhatsApp",
    ],
    nota: "Setup USD 50 incluido. O hasta 12 cuotas sin intereses",
    destacado: true,
    whatsapp: true,
  },
];

const planesPremium = [
  {
    tipo: "Mensual",
    precio: "$19.99",
    periodo: "/ mes",
    descripcion: "Paga mes a mes sin compromiso.",
    incluye: [
      "Todo lo del plan Pro",
      "Motor de Conocimiento",
      "IA especializada en tu barbería",
      "Recomendaciones automáticas",
      "Alertas inteligentes",
      "Consultor IA 24/7",
    ],
    nota: "+ USD 5/mes tokens IA. Setup USD 50 al activar",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Anual",
    precio: "$199",
    periodo: "/ año",
    descripcion: "Ahorra más de USD 40 al año.",
    incluye: [
      "Todo lo del plan Pro",
      "Motor de Conocimiento",
      "IA especializada en tu barbería",
      "Recomendaciones automáticas",
      "Alertas inteligentes",
      "Consultor IA 24/7",
    ],
    nota: "Equivale a $16.58/mes + tokens. Setup USD 50",
    destacado: false,
    whatsapp: false,
  },
  {
    tipo: "Lifetime",
    precio: "$1000",
    periodo: "pago único",
    descripcion: "Acceso permanente sin mensalidades.",
    incluye: [
      "Todo lo del plan Anual",
      "Actualizaciones gratis de por vida",
      "Sin costos mensuales",
      "Soporte prioritario por WhatsApp",
    ],
    nota: "Setup USD 50 incluido. Tokens IA 2 años. Hasta 12 cuotas",
    destacado: true,
    whatsapp: true,
  },
];

export default function PreciosPage() {
  return (
    <>
      <StructuredData data={productoProSchema} />
      <StructuredData data={productoPremiumSchema} />
      <StructuredData data={faqSchema} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-24 pb-12 px-6 border-b border-[#2a2520]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-8">
              Precios / Transparencia sin excusas
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-light leading-[1.1] mb-8 text-[#f3ece1]">
              Cuánto cuesta y{" "}
              <em className="not-italic text-[#d97644]">qué obtienes exactamente</em>.
            </h1>
            <p className="font-display italic text-xl text-[#a89e90] font-light max-w-xl leading-relaxed mb-8">
              Setup de USD 50. Mensualidades bajas. Prueba 15 días gratis.
              Sin letra pequeña, sin cargos escondidos, sin permanencia.
            </p>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="relative aspect-video w-full bg-[#131110] border border-[#2a2520] shadow-2xl overflow-hidden rounded-sm group">
              <Image
                src="/paginas/precios.webp"
                alt="Transparencia en precios"
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                priority
              />
              <div className="absolute inset-0 border border-[#d97644]/10 pointer-events-none" />
            </div>
            <div className="absolute -bottom-4 -left-4 font-mono text-xs text-[#5c554c] tracking-widest hidden md:block">
              REC // PRICING
            </div>
          </div>
        </div>
      </section>

      {/* ── PLANES — 4 tiers por plan ────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="planes-titulo">
        <div className="max-w-6xl mx-auto">
          <p
            id="planes-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-16 text-center"
          >
            Elige tu plan / Sin sorpresas
          </p>

          {/* ── BarberOS Pro ── */}
          <div className="mb-20">
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#f3ece1] mb-8 text-center">
              BarberOS <em className="not-italic text-[#d97644] font-normal">Pro</em>
            </h2>
            
            {/* Cards horizontal en móvil, grid en desktop */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-4 md:overflow-visible pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
              {planesPro.map((plan) => (
                <article
                  key={plan.tipo}
                  className={`snap-center shrink-0 w-[85vw] md:w-auto bg-[#131110] border border-[#2a2520] p-6 flex flex-col ${
                    plan.destacado ? "border-[#d97644]/50" : ""
                  }`}
                >
                  {/* Tipo de plan */}
                  <p className={`font-mono text-xs tracking-[0.3em] uppercase mb-3 ${
                    plan.destacado ? "text-[#d97644]" : "text-[#5c554c]"
                  }`}>
                    {plan.tipo}
                  </p>

                  {/* Precio */}
                  <div className="mb-3">
                    <p className="font-display text-4xl font-light text-[#f3ece1]">
                      {plan.precio}
                    </p>
                    <p className="font-mono text-xs text-[#5c554c] mt-1">
                      {plan.periodo}
                    </p>
                  </div>

                  {/* Descripción */}
                  <p className="font-display italic text-[#a89e90] font-light text-xs leading-relaxed mb-4">
                    {plan.descripcion}
                  </p>

                  {/* Incluye */}
                  <ul className="space-y-1 flex-1 mb-4" role="list">
                    {plan.incluye.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#d97644] font-mono text-xs mt-0.5 shrink-0" aria-hidden="true">
                          ✓
                        </span>
                        <span className="font-mono text-xs text-[#a89e90] tracking-wide">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Nota */}
                  {plan.nota && (
                    <p className="font-mono text-xs text-[#5c554c] italic mb-3">
                      {plan.nota}
                    </p>
                  )}

                  {/* Botón Payphone para Lifetime */}
                  {plan.whatsapp && (
                    <a
                      href="https://wa.me/593963410409?text=Hola%2C%20quiero%20comprar%20BarberOS%20Pro%20Lifetime"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full bg-[#d97644] hover:bg-[#c0653a] text-white font-mono text-xs tracking-wider uppercase px-4 py-3 flex items-center justify-center gap-2 transition-colors rounded"
                    >
                      Aceptamos Payphone
                    </a>
                  )}
                </article>
              ))}
            </div>
            
            {/* Hint deslizar solo en móvil */}
            <div className="flex md:hidden items-center justify-center gap-2 mt-4 text-[#5c554c]">
              <span className="font-mono text-xs uppercase tracking-wider">Desliza</span>
              <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* ── BarberOS Premium ── */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-light text-[#f3ece1] mb-8 text-center">
              BarberOS <em className="not-italic text-[#d97644] font-normal">Premium</em>
            </h2>
            <p className="font-mono text-xs text-[#5c554c] text-center mb-8">
              Con IA + tokens incluidos o aparte según el plan
            </p>
            
            {/* Cards en grid vertical */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:grid md:grid-cols-3 md:overflow-visible pb-4 md:pb-0 -mx-6 px-6 md:mx-0 md:px-0">
              {planesPremium.map((plan) => (
                <article
                  key={plan.tipo}
                  className={`snap-center shrink-0 w-[85vw] md:w-auto bg-[#131110] border border-[#2a2520] p-6 flex flex-col ${
                    plan.destacado ? "border-[#d97644]/50" : ""
                  }`}
                >
                  {/* Tipo de plan */}
                  <p className={`font-mono text-xs tracking-[0.3em] uppercase mb-3 ${
                    plan.destacado ? "text-[#d97644]" : "text-[#5c554c]"
                  }`}>
                    {plan.tipo}
                  </p>

                  {/* Precio */}
                  <div className="mb-3">
                    <p className="font-display text-4xl font-light text-[#f3ece1]">
                      {plan.precio}
                    </p>
                    <p className="font-mono text-xs text-[#5c554c] mt-1">
                      {plan.periodo}
                    </p>
                  </div>

                  {/* Descripción */}
                  <p className="font-display italic text-[#a89e90] font-light text-xs leading-relaxed mb-4">
                    {plan.descripcion}
                  </p>

                  {/* Incluye */}
                  <ul className="space-y-1 flex-1 mb-4" role="list">
                    {plan.incluye.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#d97644] font-mono text-xs mt-0.5 shrink-0" aria-hidden="true">
                          ✓
                        </span>
                        <span className="font-mono text-xs text-[#a89e90] tracking-wide">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Nota */}
                  {plan.nota && (
                    <p className="font-mono text-xs text-[#5c554c] italic mb-3">
                      {plan.nota}
                    </p>
                  )}

                  {/* Botón Payphone para Lifetime */}
                  {plan.whatsapp && (
                    <a
                      href="https://wa.me/593963410409?text=Hola%2C%20quiero%20comprar%20BarberOS%20Premium%20Lifetime"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full bg-[#d97644] hover:bg-[#c0653a] text-white font-mono text-xs tracking-wider uppercase px-4 py-3 flex items-center justify-center gap-2 transition-colors rounded"
                    >
                      Aceptamos Payphone
                    </a>
                  )}
                </article>
              ))}
            </div>
            
            {/* Hint deslizar solo en móvil */}
            <div className="flex md:hidden items-center justify-center gap-2 mt-4 text-[#5c554c]">
              <span className="font-mono text-xs uppercase tracking-wider">Desliza</span>
              <svg className="w-4 h-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Nota aclaratoria */}
          <p className="mt-12 font-mono text-xs text-[#5c554c] text-center tracking-wide">
            Prueba 15 días gratis. Sin tarjeta, sin compromiso. El setup de USD 50 se paga solo cuando decides continuar.
          </p>
        </div>
      </section>

      {/* ── FAQ DE PRECIO ─────────────────────────────────────── */}
      <VideoFAQ
        label="PREGUNTAS DE PRECIO"
        title={
          <>
            Transparencia <em className="text-[#d97644] not-italic font-normal">total.</em>
            <br />
            Respuestas claras.
          </>
        }
        subtitle="Pasa el cursor. Respuestas directas en 30 segundos."
        items={objecionesPrecio}
      />

      {/* ── CTA ÚNICO ────────────────────────────────────────── */}
      <CTABlock
        texto="Quiero mi acceso a BarberOS"
        href="/acceso"
        subtexto="¿Listo para decidir?"
      />
    </>
  );
}
