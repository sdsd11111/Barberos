import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import CTABlock from "@/components/shared/CTABlock";
import StructuredData from "@/components/shared/StructuredData";

// ⚠️ COPY PROVISIONAL — pendiente de sello final contra 04-SISTEMA-DE-COMUNICACION.md
// No publicar a producción sin aprobación explícita de César sobre este texto.

// ⚠️ DATOS PLACEHOLDER — Los slugs y contenidos reales se agregan cuando los pilotos
// confirmen su testimonio (video + reseña). La estructura de datos aquí abajo es
// la definición del tipo de información que necesitamos por cada barbería.
const PILOTOS: Record<string, {
  nombre: string;
  ciudad: string;
  pais: string;
  desde: string;
  barbero: string;
  resumenCorto: string;
  antesDeBarberOS: string[];
  despuesDeBarberOS: string[];
  cita: string;
  tiempoUsando: string;
  placeholder: boolean;
}> = {
  "barberia-ejemplo-cuenca": {
    nombre: "Barbería Ejemplo — Cuenca",
    ciudad: "Cuenca",
    pais: "Ecuador",
    desde: "2026",
    barbero: "Nombre del Barbero (por confirmar)",
    resumenCorto: "De llevar el conteo en papel a tener un dashboard en tiempo real.",
    antesDeBarberOS: [
      "Conteo de fidelidad en papel o cartulina",
      "Sin idea de cuántos clientes repetían",
      "Clientes perdidos sin seguimiento",
      "Sin datos de desempeño por barbero",
    ],
    despuesDeBarberOS: [
      "Dashboard con métricas en tiempo real",
      "Clientes reciben recordatorio automático a los 30 días",
      "Acceso al panel desde WhatsApp sin contraseñas",
      "Primeros datos concretos de retención",
    ],
    cita: "\"Por primera vez sé exactamente qué tan bien le está yendo a mi negocio. No más intuición, solo números.\" — Testimonio pendiente de confirmar",
    tiempoUsando: "Piloto activo desde 2026",
    placeholder: true,
  },
  "barberia-ejemplo-loja": {
    nombre: "Barbería Ejemplo — Loja",
    ciudad: "Loja",
    pais: "Ecuador",
    desde: "2026",
    barbero: "Nombre del Barbero (por confirmar)",
    resumenCorto: "El dueño dejó de administrar a mano.",
    antesDeBarberOS: [
      "Gestión completamente manual",
      "Sin historial de clientes",
      "Imposible saber quién no había vuelto",
      "Fidelización improvisada",
    ],
    despuesDeBarberOS: [
      "Historial completo de cada cliente",
      "Mensajes automáticos de reactivación",
      "Métricas de retención disponibles",
      "Tiempo recuperado para el negocio",
    ],
    cita: "\"Lo que más me sorprendió fue cuántos clientes no estaban volviendo. Ahora eso se arregla solo.\" — Testimonio pendiente de confirmar",
    tiempoUsando: "Piloto activo desde 2026",
    placeholder: true,
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const piloto = PILOTOS[slug];
  if (!piloto) return { title: "Historia no encontrada — BarberOS" };

  return {
    title: `${piloto.nombre} — Historia de Barbería — BarberOS`,
    description: piloto.resumenCorto,
    openGraph: {
      title: `${piloto.nombre} — Caso de éxito BarberOS`,
      description: piloto.resumenCorto,
      type: "article",
    },
    alternates: {
      canonical: `https://barberos-rho-henna.vercel.app/historias/${slug}`,
    },
  };
}

export function generateStaticParams() {
  return Object.keys(PILOTOS).map((slug) => ({ slug }));
}

export default async function HistoriaPage({ params }: Props) {
  const { slug } = await params;
  const piloto = PILOTOS[slug];

  if (!piloto) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${piloto.nombre} — Caso de éxito con BarberOS`,
    description: piloto.resumenCorto,
    datePublished: `${piloto.desde}-01-01`,
    publisher: { "@type": "Organization", name: "BarberOS" },
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://barberos-rho-henna.vercel.app/historias/${slug}`,
    name: piloto.nombre,
    address: {
      "@type": "PostalAddress",
      addressLocality: piloto.ciudad,
      addressCountry: piloto.pais,
    },
  };

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "SoftwareApplication",
      name: "BarberOS",
    },
    reviewBody: piloto.cita,
    author: { "@type": "Person", name: piloto.barbero },
  };

  return (
    <>
      <StructuredData data={articleSchema} />
      <StructuredData data={localBusinessSchema} />
      <StructuredData data={reviewSchema} />

      {/* ── BREADCRUMB ───────────────────────────────────────── */}
      <nav className="px-6 py-4 border-b border-[#2a2520]" aria-label="Miga de pan">
        <ol className="flex gap-2 font-mono text-xs text-[#5c554c] uppercase tracking-widest">
          <li><Link href="/" className="hover:text-[#a89e90] transition-colors">Inicio</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/historias" className="hover:text-[#a89e90] transition-colors">Historias</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-[#f3ece1]" aria-current="page">{piloto.nombre}</li>
        </ol>
      </nav>

      {piloto.placeholder && (
        <div className="px-6 py-4 bg-[#1c1410] border-b border-[#d97644]/30">
          <p className="font-mono text-xs text-[#d97644] tracking-widest uppercase text-center">
            ⚠️ Placeholder — Contenido real pendiente de confirmación del piloto
          </p>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-8">
            {piloto.ciudad}, {piloto.pais} · Usando BarberOS desde {piloto.desde}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-light leading-[1.15] mb-8 text-[#f3ece1]">
            {piloto.nombre}
          </h1>
          <p className="font-display italic text-xl text-[#a89e90] font-light max-w-2xl leading-relaxed">
            {piloto.resumenCorto}
          </p>
        </div>
      </section>

      {/* ── ANTES / DESPUÉS ──────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="cambio-titulo">
        <div className="max-w-4xl mx-auto">
          <p
            id="cambio-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-16"
          >
            El cambio / Antes y después de BarberOS
          </p>

          <div className="grid md:grid-cols-2 gap-px bg-[#2a2520] border border-[#2a2520]">
            <div className="bg-[#0a0807] p-10">
              <p className="font-mono text-xs tracking-widest uppercase text-[#5c554c] mb-8">
                Antes
              </p>
              <ul className="space-y-4" role="list">
                {piloto.antesDeBarberOS.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-[#d97644] font-mono text-xs mt-1 shrink-0" aria-hidden="true">✕</span>
                    <span className="font-display italic text-[#5c554c] font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-[#0d0b09] p-10">
              <p className="font-mono text-xs tracking-widest uppercase text-[#5c554c] mb-8">
                Después
              </p>
              <ul className="space-y-4" role="list">
                {piloto.despuesDeBarberOS.map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-[#d97644] font-mono text-xs mt-1 shrink-0" aria-hidden="true">✓</span>
                    <span className="font-display italic text-[#f3ece1] font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CITA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520] bg-[#0d0b09]">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="font-display text-2xl md:text-3xl font-light text-[#f3ece1] italic leading-relaxed">
            {piloto.cita}
          </blockquote>
          <p className="font-mono text-xs text-[#5c554c] tracking-widest uppercase mt-8">
            {piloto.tiempoUsando}
          </p>
        </div>
      </section>

      {/* ── CTA ÚNICO ────────────────────────────────────────── */}
      <CTABlock
        texto="Solicitar acceso a BarberOS"
        href="/acceso"
        subtexto="¿Listo para escribir tu propia historia?"
      />
    </>
  );
}
