"use client";

import { useState } from "react";
import CinematicScene from "./CinematicScene";

export interface FAQCard {
  id: string;
  pregunta: string;
  respuestaCorta: string;
  duracion: string;
  videoSrc?: string;
}

export interface VideoFAQProps {
  label: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  items: FAQCard[];
}

export default function VideoFAQ({ label, title, subtitle, items }: VideoFAQProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [modalVideo, setModalVideo] = useState<FAQCard | null>(null);

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

            return (
              <CinematicScene
                key={card.id}
                delay={i * 80}
                threshold={0.1}
                className="w-full"
              >
                <div
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => card.videoSrc && setModalVideo(card)}
                  className={`relative aspect-[4/3] bg-[#131110] border transition-all duration-300 cursor-pointer p-8 flex flex-col justify-between overflow-hidden group ${
                    isHovered ? "border-[#d97644] shadow-lg shadow-[#d97644]/5" : "border-[#2a2520]"
                  }`}
                  role="button"
                  aria-label={`Ver respuesta en video: ${card.pregunta}`}
                >
                  {/* Background Preview Video on Hover */}
                  {card.videoSrc && isHovered && (
                    <video
                      src={card.videoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover z-0 opacity-40 transition-opacity duration-500"
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0807] via-[#0a0807]/40 to-transparent z-[1] pointer-events-none" />

                  {/* Top Content */}
                  <div className="relative z-10">
                    <span className="font-mono text-xs text-[#d97644] tracking-widest block mb-4">
                      {card.id}
                    </span>
                    <h3 className="font-display text-2xl font-light text-[#f3ece1] leading-snug">
                      {card.pregunta}
                    </h3>
                  </div>

                  {/* Hover Answer Text */}
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

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isHovered ? "bg-[#d97644] text-[#0a0807] scale-110" : "bg-[#2a2520] text-[#f3ece1]"
                      }`}
                      aria-hidden="true"
                    >
                      <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
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

      {/* Modal Reproductor de Video con Audio */}
      {modalVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setModalVideo(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#131110] border border-[#d97644]/40 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between p-6 border-b border-[#2a2520]">
              <div>
                <span className="font-mono text-xs text-[#d97644] tracking-widest block mb-1">
                  RESPUESTA EN VIDEO · {modalVideo.id}
                </span>
                <h3 className="font-display text-xl text-[#f3ece1] font-light">
                  {modalVideo.pregunta}
                </h3>
              </div>
              <button
                onClick={() => setModalVideo(null)}
                className="w-10 h-10 border border-[#2a2520] text-[#a89e90] hover:text-[#d97644] hover:border-[#d97644] flex items-center justify-center font-mono text-sm transition-all"
                aria-label="Cerrar video"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black flex items-center justify-center">
              <video
                src={modalVideo.videoSrc}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
