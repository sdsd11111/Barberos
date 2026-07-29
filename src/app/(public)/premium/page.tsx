import type { Metadata } from "next";
import Link from "next/link";
import CTABlock from "@/components/shared/CTABlock";
import StructuredData from "@/components/shared/StructuredData";
import FeatureTabs, { type FeatureTab } from "@/components/shared/FeatureTabs";
import { planesPremium } from "@/lib/planes";

// Página /premium — Plan Premium de BarberOS
// Página de CAPTURA con tabs acordeón para los features.
// El detalle de tiers y precios vive en /precios (única fuente de verdad).
// Regla arquitectural: UN solo CTA por página → apunta a /precios.

export const metadata: Metadata = {
  title: "Plan Premium — El sistema que piensa contigo | BarberOS",
  description:
    "Motor de Conocimiento y consultor conversacional que te dicen a quién estás a punto de perder y quién de tu equipo fortalece tu negocio. Setup $50, $19.99/mes.",
  openGraph: {
    title: "Plan Premium — BarberOS",
    description:
      "El sistema que piensa contigo. Motor de Conocimiento, alertas tempranas y consultor conversacional para tu barbería. Setup $50, $19.99/mes.",
    type: "website",
    url: "https://barberosplus.com/premium",
  },
  alternates: {
    canonical: "https://barberosplus.com/premium",
  },
};

const productoPremiumSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BarberOS Premium",
  description:
    "Sistema que piensa contigo: Motor de Conocimiento, alertas de clientes en riesgo, análisis de equipo y consultor conversacional. Setup $50, $19.99/mes.",
  brand: { "@type": "Brand", name: "BarberOS" },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "19.99",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        price: "50",
        priceCurrency: "USD",
        name: "Setup (pago único)",
      },
      {
        "@type": "UnitPriceSpecification",
        price: "19.99",
        priceCurrency: "USD",
        billingDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        name: "Mensualidad",
      },
    ],
    availability: "https://schema.org/InStock",
    url: "https://barberosplus.com/premium",
  },
};

// Plan mensual Premium (único dato destacado en esta página de captura).
const planMensualPremium = planesPremium.find((p) => p.tipo === "Mensual")!;

// Tabs de Pro (recordatorio corto de lo que Pro ya trae).
// Marcamos con badge "Incluido en Pro" para no repetir explicaciones largas.
const featuresProResumen: FeatureTab[] = [
  {
    id: "checkin",
    orden: 1,
    titulo: "Check-in por WhatsApp",
    descripcion:
      "Tu cliente envía un código por WhatsApp y queda registrado. Sin app que descargar.",
    screenshot: "/features/pro-checkin-whatsapp.webp",
    alt: "Check-in por WhatsApp",
  },
  {
    id: "panel",
    orden: 2,
    titulo: "Panel de clientes y visitas",
    descripcion:
      "Historial completo por cliente: visitas, frecuencia, barberos. Ordenado solo.",
    screenshot: "/features/pro-panel-clientes.webp",
    alt: "Panel de clientes",
  },
  {
    id: "fidelizacion",
    orden: 3,
    titulo: "Fidelización automática",
    descripcion:
      "Tarjeta virtual, suma de cortes, aviso cuando falta poco para el premio.",
    screenshot: "/features/pro-fidelizacion-automatica.webp",
    alt: "Fidelización automática",
  },
  {
    id: "dashboard",
    orden: 4,
    titulo: "Dashboard en tiempo real",
    descripcion: "Métricas del día, clientes nuevos, recurrentes, próximos a premio.",
    screenshot: "/features/pro-dashboard-tiempo-real.webp",
    alt: "Dashboard en tiempo real",
  },
  {
    id: "premios",
    orden: 5,
    titulo: "Sistema de premios",
    descripcion: "Premio al quinto corte automático. Cero cartón, cero cuentas a mano.",
    screenshot: "/features/pro-sistema-premios.webp",
    alt: "Sistema de premios",
  },
  {
    id: "reviews",
    orden: 6,
    titulo: "Integración Google Reviews",
    descripcion: "Pide la reseña en el momento justo, sin que tengas que acordarte.",
    screenshot: "/features/pro-google-reviews.webp",
    alt: "Google Reviews",
  },
];

// Tabs diferenciales de Premium — los que NO están en Pro.
const featuresPremiumExclusivo: FeatureTab[] = [
  {
    id: "motor",
    orden: 1,
    titulo: "Motor de Conocimiento",
    descripcion:
      "Aprende el ritmo real de cada cliente — no un promedio genérico — y te avisa cuando alguien se aleja de su propio patrón.",
    screenshot: "/features/premium-motor-conocimiento.webp",
    alt: "Motor de Conocimiento mostrando patrón de cada cliente",
  },
  {
    id: "alertas",
    orden: 2,
    titulo: "Alertas de clientes en riesgo",
    descripcion:
      "El sistema te dice a quién estás a punto de perder antes de que pase, con la evidencia detrás.",
    screenshot: "/features/premium-alertas-riesgo.webp",
    alt: "Alerta temprana de cliente en riesgo",
  },
  {
    id: "equipo",
    orden: 3,
    titulo: "Análisis de equipo",
    descripcion:
      "Quién de tus barberos realmente fideliza — por calificaciones, comentarios y tendencia mes a mes.",
    screenshot: "/features/premium-analisis-equipo.webp",
    alt: "Dashboard de análisis por barbero",
  },
  {
    id: "consultor",
    orden: 4,
    titulo: "Consultor conversacional",
    descripcion:
      "Le preguntas a tu negocio y te responde en lenguaje simple, con la evidencia detrás. La decisión siempre es tuya.",
    screenshot: "/features/premium-consultor-conversacional.webp",
    alt: "Chat con el consultor conversacional de BarberOS",
  },
  {
    id: "recomendaciones",
    orden: 5,
    titulo: "Recomendaciones automáticas",
    descripcion:
      "Qué hacer con cada alerta — promociones, ajustes de agenda, seguimiento — basado en datos reales de tu barbería.",
    screenshot: "/features/premium-recomendaciones.webp",
    alt: "Panel de recomendaciones automáticas",
  },
];

export default function PremiumPage() {
  return (
    <>
      <StructuredData data={productoPremiumSchema} />

      {/* ── HERO — Captura con titular + precio + CTA a /precios ── */}
      <section className="pt-24 pb-20 px-6 border-b border-[#2a2520]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-8">
            Plan Premium / El sistema que piensa contigo
          </p>

          <h1 className="font-display text-5xl md:text-7xl font-light leading-[1.05] mb-8 text-[#f3ece1]">
            El que tiene el sistema,{" "}
            <em className="not-italic text-[#d97644]">
              manda la conversación.
            </em>
          </h1>

          <p className="font-display italic text-xl text-[#a89e90] font-light max-w-2xl mx-auto leading-relaxed mb-12">
            Motor de Conocimiento y alertas tempranas. Te dice a quién estás a punto de perder y quién de tu equipo fideliza.
          </p>

          {/* Precio en bloque mínimo */}
          <div className="inline-flex flex-col md:flex-row items-center gap-6 md:gap-10 bg-[#131110] border border-[#2a2520] px-8 py-6 mb-10">
            <div className="text-left">
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-1">
                Setup
              </p>
              <p className="font-display text-2xl font-light text-[#f3ece1]">
                <span className="line-through text-[#5c554c] mr-2">$100</span>
                <span className="text-[#d97644]">$50</span>
              </p>
            </div>
            <div className="hidden md:block w-px h-12 bg-[#2a2520]" />
            <div className="text-left">
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-1">
                Mensualidad
              </p>
              <p className="font-display text-2xl font-light text-[#f3ece1]">
                $19.99<span className="text-[#5c554c] text-base"> / mes</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              href="/precios"
              className="font-mono text-sm tracking-[0.25em] uppercase text-[#0a0807] bg-[#d97644] px-8 py-4 hover:bg-[#e8854f] transition-colors"
            >
              Ver precios y comparar planes
            </Link>
            <a
              href="#features-premium-exclusivo"
              className="font-mono text-xs tracking-[0.25em] uppercase text-[#a89e90] hover:text-[#f3ece1] transition-colors"
            >
              Ver lo que solo Premium agrega ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── EXCLUSIVO PREMIUM — 5 tabs diferenciales (lo que Pro no tiene) ── */}
      <FeatureTabs
        sectionId="features-premium-exclusivo"
        label="Solo Premium / Lo que Pro no tiene"
        titulo={
          <>
            Cinco cosas que{" "}
            <em className="not-italic text-[#d97644]">solo Premium</em> agrega.
          </>
        }
        subtitulo="Toca cada tab para ver qué hace y cómo se ve."
        items={featuresPremiumExclusivo}
      />

      {/* ── RECORDATORIO PRO — Resumen compacto con badge ──────── */}
      <FeatureTabs
        sectionId="features-premium-incluido"
        label="Incluido en Pro / Lo que ya tienes"
        titulo={
          <>
            Y todo lo de Pro{" "}
            <em className="not-italic text-[#d97644]">ya viene incluido</em>.
          </>
        }
        subtitulo="Resumen rápido — sin repetir explicaciones largas."
        items={featuresProResumen}
        badgeIncluido="Incluido en Pro"
      />

      {/* ── DETALLE — link al desglose completo de tiers ──────── */}
      <section className="py-16 px-6 border-b border-[#2a2520]" aria-labelledby="detalle-titulo">
        <div className="max-w-3xl mx-auto text-center">
          <p
            id="detalle-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-6"
          >
            {planMensualPremium.tipo} · {planMensualPremium.precio} {planMensualPremium.periodo}
          </p>
          <p className="font-display italic text-xl text-[#a89e90] font-light mb-8">
            También disponible Anual y Lifetime — números exactos y qué incluye cada uno.
          </p>
          <Link
            href="/precios"
            className="font-mono text-xs tracking-[0.25em] uppercase text-[#d97644] hover:text-[#e8854f] transition-colors"
          >
            Ver todos los tiers y comparativa completa →
          </Link>
        </div>
      </section>

      {/* ── CTA ÚNICO ────────────────────────────────────────── */}
      <CTABlock
        texto="Quiero mi acceso a BarberOS"
        href="/acceso"
        subtexto="¿Listo para anticiparte?"
      />
    </>
  );
}