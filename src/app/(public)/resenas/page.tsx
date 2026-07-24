import type { Metadata } from "next";
import Image from "next/image";
import CTABlock from "@/components/shared/CTABlock";
import StructuredData from "@/components/shared/StructuredData";
import VideoFAQ from "@/components/landing/VideoFAQ";

// ⚠️ COPY PROVISIONAL — pendiente de sello final contra 04-SISTEMA-DE-COMUNICACION.md
// No publicar a producción sin aprobación explícita de César sobre este texto.

// ⚠️ RESEÑAS PLACEHOLDER — pendiente de reseñas verificadas y Google Reviews reales.
// Esta estructura valida el diseño y el JSON-LD. Los datos reales se insertan
// cuando los pilotos entreguen sus testimonios escritos y de video.
const RESENAS_PLACEHOLDER = [
  {
    autor: "Barbero Piloto A",
    barberia: "Barbería de Ejemplo — Cuenca",
    calificacion: 5,
    texto: "Reseña verificada pendiente de confirmar con el piloto.",
    fecha: "2026-07",
    placeholder: true,
  },
  {
    autor: "Barbero Piloto B",
    barberia: "Barbería de Ejemplo — Loja",
    calificacion: 5,
    texto: "Reseña verificada pendiente de confirmar con el piloto.",
    fecha: "2026-07",
    placeholder: true,
  },
];

export const metadata: Metadata = {
  title: "Reseñas — ¿Qué dicen las barberías que usan BarberOS?",
  description:
    "Opiniones verificadas de barberías reales usando BarberOS. Calificaciones, testimonios y Google Reviews de los primeros pilotos.",
  openGraph: {
    title: "Reseñas reales de BarberOS — Lo que dicen los barberos",
    description:
      "Descubre cómo barberos en Ecuador están aumentando la frecuencia de sus clientes y ordenando su caja con BarberOS.",
    type: "website",
    url: "http://www.barberosplus.com/resenas",
    images: [
      {
        url: "http://www.barberosplus.com/logos/barberos_logo_concept_1.webp",
        width: 1200,
        height: 630,
        alt: "BarberOS - Reseñas",
      },
    ],
  },
  alternates: {
    canonical: "http://www.barberosplus.com/resenas",
  },
};

const aggregateRatingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BarberOS",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: String(RESENAS_PLACEHOLDER.length),
    bestRating: "5",
    worstRating: "1",
  },
  review: RESENAS_PLACEHOLDER.map((r) => ({
    "@type": "Review",
    author: { "@type": "Person", name: r.autor },
    reviewBody: r.texto,
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(r.calificacion),
      bestRating: "5",
    },
    datePublished: r.fecha,
  })),
};

export default function ResenasPage() {
  return (
    <>
      <StructuredData data={aggregateRatingSchema} />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-24 pb-12 px-6 border-b border-[#2a2520]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-8">
              Reseñas / Prueba social verificada
            </p>
            <h1 className="font-display text-5xl md:text-6xl font-light leading-[1.1] mb-8 text-[#f3ece1]">
              ¿Puedes{" "}
              <em className="not-italic text-[#d97644]">confiar en BarberOS</em>?
            </h1>
            <p className="font-display italic text-xl text-[#a89e90] font-light max-w-xl leading-relaxed mb-8">
              No lo decimos nosotros. Lo dicen las barberías que lo usan todos los
              días.
            </p>
          </div>

          <div className="flex-1 w-full relative">
            <div className="relative aspect-video w-full bg-[#131110] border border-[#2a2520] shadow-2xl overflow-hidden rounded-sm group">
              <Image
                src="/paginas/reseñas.webp"
                alt="Barberías que confían en BarberOS"
                fill
                className="object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                priority
              />
              <div className="absolute inset-0 border border-[#d97644]/10 pointer-events-none" />
            </div>
            <div className="absolute -bottom-4 -left-4 font-mono text-xs text-[#5c554c] tracking-widest hidden md:block">
              REC // REVIEWS
            </div>
          </div>
        </div>
      </section>

      {/* ── CALIFICACIÓN AGREGADA ─────────────────────────────── */}
      <section className="py-16 px-6 border-b border-[#2a2520] bg-[#0d0b09]" aria-labelledby="rating-titulo">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
          <div className="text-center">
            <p className="font-display text-8xl font-light text-[#d97644]">5.0</p>
            <p className="font-mono text-xs text-[#5c554c] tracking-widest uppercase mt-2">
              Calificación promedio
            </p>
          </div>
          <div>
            <p
              id="rating-titulo"
              className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-4"
            >
              Basado en los pilotos activos
            </p>
            <div className="flex gap-1 mb-4" aria-label="5 de 5 estrellas" role="img">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-[#d97644] text-2xl" aria-hidden="true">★</span>
              ))}
            </div>
            <p className="font-display italic text-[#a89e90] font-light">
              {RESENAS_PLACEHOLDER.length} reseñas verificadas · Más en camino
            </p>
          </div>
        </div>
      </section>

      {/* ── RESEÑAS ──────────────────────────────────────────── */}
      <section className="py-24 px-6 border-b border-[#2a2520]" aria-labelledby="resenas-titulo">
        <div className="max-w-4xl mx-auto">
          <p
            id="resenas-titulo"
            className="font-mono text-xs tracking-[0.4em] uppercase text-[#5c554c] mb-16"
          >
            Lo que dicen / En sus propias palabras
          </p>

          <div className="space-y-8">
            {RESENAS_PLACEHOLDER.map((resena, i) => (
              <article
                key={i}
                className="bg-[#131110] border border-[#2a2520] p-10"
              >
                {resena.placeholder && (
                  <p className="font-mono text-[10px] tracking-widest uppercase text-[#3a3530] mb-6 border border-[#3a3530] px-2 py-1 w-fit">
                    Placeholder — reseña real en camino
                  </p>
                )}

                <div className="flex gap-1 mb-6" aria-label={`${resena.calificacion} de 5 estrellas`} role="img">
                  {Array.from({ length: resena.calificacion }).map((_, j) => (
                    <span key={j} className="text-[#d97644]" aria-hidden="true">★</span>
                  ))}
                </div>

                <blockquote className="font-display italic text-[#f3ece1] text-lg font-light leading-relaxed mb-8">
                  &ldquo;{resena.texto}&rdquo;
                </blockquote>

                <footer>
                  <p className="font-mono text-xs text-[#a89e90] tracking-wide">{resena.autor}</p>
                  <p className="font-mono text-xs text-[#5c554c] tracking-widest mt-1">{resena.barberia}</p>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── RESEÑAS EN VIDEO ──────────────────────────────────── */}
      <VideoFAQ
        label="Video Testimonio"
        title="Experiencias reales en barberías"
        subtitle="Mira cómo los barberos gestionan la recurrencia de sus clientes."
        items={[
          {
            id: "01",
            pregunta: "¿Qué opinan las barberías que ya probaron el sistema?",
            respuestaCorta: "Testimonio directo sobre el impacto en el flujo diario de cortes y fidelización.",
            duracion: "00:45",
            videoSrc: "https://activaqr-archivos.b-cdn.net/barberos/rese%C3%B1as%20v2.mp4",
          },
        ]}
      />

      {/* ── CTA ÚNICO ────────────────────────────────────────── */}
      <CTABlock
        texto="Solicitar acceso a BarberOS"
        href="/acceso"
        subtexto="Ya tienes suficiente información"
      />
    </>
  );
}
