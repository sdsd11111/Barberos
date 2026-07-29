import type { Metadata } from "next";
import Link from "next/link";
import CTABlock from "@/components/shared/CTABlock";
import StructuredData from "@/components/shared/StructuredData";
import FeatureTabs, { type FeatureTab } from "@/components/shared/FeatureTabs";
import { planesPro } from "@/lib/planes";

// Página /pro — Plan Pro de BarberOS
// Página de CAPTURA con tabs acordeón para los features.
// El detalle de tiers y precios vive en /precios (única fuente de verdad).
// Regla arquitectural: UN solo CTA por página → apunta a /precios.

export const metadata: Metadata = {
  title: "Plan Pro — Sistema de fidelización para tu barbería | BarberOS",
  description:
    "Sabe quién realmente vuelve a tu barbería, sin cambiar tu forma de trabajar. Setup $50, $9.99/mes. Prueba 15 días gratis, sin tarjeta.",
  openGraph: {
    title: "Plan Pro — BarberOS",
    description:
      "Sabe quién vuelve a tu barbería sin cambiar tu forma de trabajar. Setup $50, $9.99/mes. 15 días gratis.",
    type: "website",
    url: "https://barberosplus.com/pro",
  },
  alternates: {
    canonical: "https://barberosplus.com/pro",
  },
};

const productoProSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BarberOS Pro",
  description:
    "Sistema de fidelización para tu barbería. Check-in por WhatsApp, avisos automáticos, historial de clientes y reseñas de Google. Setup $50, $9.99/mes.",
  brand: { "@type": "Brand", name: "BarberOS" },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "9.99",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        price: "50",
        priceCurrency: "USD",
        name: "Setup (pago único, precio de lanzamiento)",
      },
      {
        "@type": "UnitPriceSpecification",
        price: "9.99",
        priceCurrency: "USD",
        billingDuration: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
        name: "Mensualidad",
      },
    ],
    availability: "https://schema.org/InStock",
    url: "https://barberosplus.com/pro",
  },
};

// Plan mensual Pro (único dato destacado en esta página de captura).
const planMensualPro = planesPro.find((p) => p.tipo === "Mensual")!;

// 6 features de Pro con screenshot ilustrativo.
// Las URLs Unsplash son placeholders hasta que existan capturas reales del producto.
const featuresPro: FeatureTab[] = [
  {
    id: "checkin",
    orden: 1,
    titulo: "Check-in por WhatsApp",
    descripcion:
      "Tu cliente envía un código por WhatsApp y queda registrado. Sin app que descargar, sin formularios. El mismo canal que ya usa todos los días.",
    screenshot: "/features/pro-checkin-whatsapp.webp",
    alt: "Conversación de WhatsApp con check-in automático del cliente",
  },
  {
    id: "panel",
    orden: 2,
    titulo: "Panel de clientes y visitas",
    descripcion:
      "Historial completo por cliente: cuántas veces vino, cuándo fue la última, qué barbero lo atendió. Todo ordenado sin que tengas que archivar nada.",
    screenshot: "/features/pro-panel-clientes.webp",
    alt: "Panel de BarberOS mostrando historial de clientes y visitas",
  },
  {
    id: "fidelizacion",
    orden: 3,
    titulo: "Fidelización automática",
    descripcion:
      "Cada corte suma automáticamente a la tarjeta virtual del cliente. Él ve cuántos cortes lleva y cuántos le faltan para su premio, sin que tú intervengas.",
    screenshot: "/features/pro-fidelizacion-automatica.webp",
    alt: "Tarjeta de fidelidad digital del cliente con cortes acumulados",
  },
  {
    id: "dashboard",
    orden: 4,
    titulo: "Dashboard en tiempo real",
    descripcion:
      "Cortes del día, clientes nuevos, recurrentes y próximos a premio — actualizados al instante. Datos reales, no estimaciones de fin de mes.",
    screenshot: "/features/pro-dashboard-tiempo-real.webp",
    alt: "Dashboard de BarberOS con métricas en tiempo real",
  },
  {
    id: "premios",
    orden: 5,
    titulo: "Sistema de premios",
    descripcion:
      "Al quinto corte, tu cliente recibe uno gratis automáticamente. Cero tarjetas de cartón que se pierden, cero cuentas a mano.",
    screenshot: "/features/pro-sistema-premios.webp",
    alt: "Cliente recibiendo premio automático al quinto corte",
  },
  {
    id: "reviews",
    orden: 6,
    titulo: "Integración Google Reviews",
    descripcion:
      "Cuando un cliente sale contento, el sistema le pide su reseña de Google en el momento justo. Tu reputación crece sola, sin que tengas que acordarte.",
    screenshot: "/features/pro-google-reviews.webp",
    alt: "Notificación automática de reseña de Google enviada tras el corte",
  },
];

export default function ProPage() {
  return (
    <>
      <StructuredData data={productoProSchema} />

      {/* ── HERO — Captura con titular + precio + CTA a /precios ── */}
      <section className="pt-24 pb-20 px-6 border-b border-[#2a2520]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-8">
            Plan Pro / Fidelización real para tu barbería
          </p>

          <h1 className="font-display text-5xl md:text-7xl font-light leading-[1.05] mb-8 text-[#f3ece1]">
            Sabe quién{" "}
            <em className="not-italic text-[#d97644]">
              realmente vuelve
            </em>{" "}
            a tu barbería.
          </h1>

          <p className="font-display italic text-xl text-[#a89e90] font-light max-w-2xl mx-auto leading-relaxed mb-12">
            Registro automático por WhatsApp. Avisos de clientes que no vuelven. Premios y reseñas de Google en piloto automático.
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
                $9.99<span className="text-[#5c554c] text-base"> / mes</span>
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
              href="#features-pro"
              className="font-mono text-xs tracking-[0.25em] uppercase text-[#a89e90] hover:text-[#f3ece1] transition-colors"
            >
              Ver lo que incluye ↓
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURES — Acordeón de tabs con screenshot ────────── */}
      <FeatureTabs
        sectionId="features-pro"
        label="Lo que obtienes / BarberOS Pro"
        titulo={
          <>
            Seis cosas que cambian{" "}
            <em className="not-italic text-[#d97644]">desde el día uno</em>.
          </>
        }
        subtitulo="Toca cada tab para ver qué hace y cómo se ve."
        items={featuresPro}
      />

      {/* ── DETALLE — link al desglose completo de tiers ──────── */}
      <section className="py-16 px-6 border-b border-[#2a2520]" aria-labelledby="detalle-titulo">
        <div className="max-w-3xl mx-auto text-center">
          <p
            id="detalle-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-6"
          >
            {planMensualPro.tipo} · {planMensualPro.precio} {planMensualPro.periodo}
          </p>
          <p className="font-display italic text-xl text-[#a89e90] font-light mb-8">
            El plan mensual es el más común. Tenemos Anual y Lifetime también — con sus números exactos y qué incluye cada uno.
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
        subtexto="¿Listo para saber quién vuelve?"
      />
    </>
  );
}