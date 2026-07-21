"use client";

import { useState } from "react";
import CinematicScene from "./CinematicScene";

// ⚠️ COPY PROVISIONAL — pendiente de sello final contra 04-SISTEMA-DE-COMUNICACION.md
// No publicar a producción sin aprobación explícita de César sobre estos videos.

export interface FAQCard {
  id: string;
  pregunta: string;
  respuestaCorta: string;
  duracion: string;
  videoSrc?: string; // Para cuando César tenga los videos listos (.mp4)
}

export interface VideoFAQProps {
  label: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  items: FAQCard[];
}

export default function VideoFAQ({ label, title, subtitle, items }: VideoFAQProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  return (
    <section className="py-32 px-6 bg-[#0a0807] border-t border-[#2a2520]" aria-labelledby="video-faq-label">
      <div className="max-w-6xl mx-auto">
        <CinematicScene>
          <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#d97644] mb-8">
            {label}
          </p>
          <h2 id="video-faq-label" className="font-display text-4xl md:text-6xl font-light text-[#f3ece1] leading-tight mb-4">
            {title}
          </h2>
          <p className="font-display italic text-[#a89e90] text-lg font-light mb-20">
            {subtitle}
          </p>
        </CinematicScene>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((card, i) => {
            const isHovered = hoveredCard === card.id;
            const isPlaying = activeVideo === card.id;

            return (
              <CinematicScene
                key={card.id}
                delay={i * 80}
                threshold={0.1}
                className="w-full"
              >
                <div
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => {
                    setHoveredCard(null);
                    setActiveVideo(null); // Detener video si sale del hover
                  }}
                  onClick={() => card.videoSrc && setActiveVideo(card.id)}
                  className={`relative aspect-[4/3] bg-[#131110] border transition-all duration-300 cursor-pointer p-8 flex flex-col justify-between overflow-hidden ${
                    isHovered ? "border-[#d97644] shadow-lg shadow-[#d97644]/5" : "border-[#2a2520]"
                  }`}
                  role="button"
                  aria-label={`Ver respuesta a: ${card.pregunta}`}
                >
                  {/* Background Video or Image Placeholder */}
                  {card.videoSrc && (isHovered || isPlaying) && (
                    <video
                      src={card.videoSrc}
                      autoPlay
                      muted={!isPlaying}
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 transition-opacity duration-500"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0807] via-transparent to-transparent z-[1] pointer-events-none" />

                  {/* Top Content */}
                  <div className="relative z-10">
                    <span className="font-mono text-xs text-[#d97644] tracking-widest block mb-4">
                      {card.id}
                    </span>
                    <h3 className="font-display text-2xl font-light text-[#f3ece1] leading-snug">
                      {card.pregunta}
                    </h3>
                  </div>

                  {/* Hover Answer Text (Slide up / fade in) */}
                  <div
                    className={`relative z-10 transition-all duration-500 ease-out mt-4 ${
                      isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                    }`}
                  >
                    <p className="font-display italic text-[#a89e90] text-sm leading-relaxed">
                      {card.respuestaCorta}
                    </p>
                  </div>

                  {/* Bottom Elements */}
                  <div className="relative z-10 flex justify-between items-end mt-6">
                    <span className="font-mono text-xs text-[#5c554c] tracking-widest">
                      {card.duracion}
                    </span>

                    {/* Play Button Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isHovered ? "bg-[#d97644] text-[#0a0807] scale-110" : "bg-[#2a2520] text-[#f3ece1]"
                      }`}
                      aria-hidden="true"
                    >
                      <svg
                        className="w-4 h-4 fill-current ml-0.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </CinematicScene>
            );
          })}
        </div>
      </div>
    </section>
  );
}
