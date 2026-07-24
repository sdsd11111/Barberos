"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface SlideItem {
  src: string;
  alt: string;
  title?: string;
}

const slides: SlideItem[] = [
  {
    src: "/slide screenshot/total clientes.webp",
    alt: "Total de clientes",
    title: "Total de clientes",
  },
  {
    src: "/slide screenshot/opiniones de google.webp",
    alt: "Opiniones en Google",
    title: "Opiniones en Google",
  },
  {
    src: "/slide screenshot/notificaciones.webp",
    alt: "Notificaciones",
    title: "Notificaciones",
  },
  {
    src: "/slide screenshot/calificacion barberos.webp",
    alt: "Calificación a Barberos",
    title: "Calificación a Barberos",
  },
];

export default function EscenaSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-play cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 select-none">
      {/* Contenedor Principal del Slider estilo Mockup Celular ActivaQR */}
      <div className="relative flex items-center justify-center min-h-[520px] sm:min-h-[580px] md:min-h-[620px] overflow-hidden py-4">
        {slides.map((slide, i) => {
          // Cálculo de posición relativa
          const total = slides.length;
          let diff = i - currentIndex;

          // Loop circular para posiciones relativas
          if (diff < -1) diff += total;
          if (diff > 1) diff -= total;

          const isCenter = diff === 0;
          const isLeft = diff === -1 || (currentIndex === 0 && i === total - 1);
          const isRight = diff === 1 || (currentIndex === total - 1 && i === 0);

          // Si no es visible en el trío central, ocultar
          if (!isCenter && !isLeft && !isRight) {
            return null;
          }

          let positionStyles = "opacity-0 scale-75 pointer-events-none z-0";
          if (isCenter) {
            positionStyles =
              "opacity-100 scale-100 z-30 translate-x-0 cursor-default shadow-[0_25px_60px_rgba(217,118,68,0.2)] border-[#d97644]/60 ring-1 ring-[#d97644]/30";
          } else if (isLeft) {
            positionStyles =
              "opacity-40 scale-85 z-10 -translate-x-[70%] sm:-translate-x-[80%] md:-translate-x-[85%] cursor-pointer filter blur-[0.5px] hover:opacity-70 border-[#2a2520]";
          } else if (isRight) {
            positionStyles =
              "opacity-40 scale-85 z-10 translate-x-[70%] sm:translate-x-[80%] md:translate-x-[85%] cursor-pointer filter blur-[0.5px] hover:opacity-70 border-[#2a2520]";
          }

          return (
            <div
              key={slide.src}
              onClick={() => {
                if (isLeft) prevSlide();
                if (isRight) nextSlide();
              }}
              className={`absolute transition-all duration-700 ease-out w-[240px] sm:w-[280px] md:w-[310px] aspect-[9/18.5] bg-[#0d0b09] border-[3px] rounded-[36px] sm:rounded-[42px] overflow-hidden ${positionStyles}`}
            >
              {/* Notch / Cámara Superior del Smartphone */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-[#1a1715] rounded-full z-20 flex items-center justify-center border border-[#2a2520]">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0d0b09] border border-[#3a332c]" />
              </div>

              {/* Imagen o Placeholder del Celular */}
              <div className="relative w-full h-full pt-6 bg-[#120f0d] flex flex-col items-center justify-center text-center p-4">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 280px, 310px"
                  priority={i === 0}
                  onError={(e) => {
                    // Si la imagen no existe aún, ocultar el elemento img roto
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                {/* Fallback elegante cuando la imagen no está guardada aún */}
                <div className="flex flex-col items-center justify-center gap-3 text-[#5c554c] p-6 z-0">
                  <div className="w-12 h-12 rounded-full border border-[#2a2520] bg-[#1a1715] flex items-center justify-center text-[#d97644]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-mono text-xs text-[#a89e90] uppercase tracking-wider">{slide.title}</p>
                </div>
              </div>

              {/* Tag con Título en el borde inferior */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0d0b09] via-[#0d0b09]/80 to-transparent pt-8 pb-5 px-4 text-center z-10">
                <p className="font-display text-base sm:text-lg font-light text-[#f3ece1]">
                  {slide.title}
                </p>
              </div>
            </div>
          );
        })}

        {/* Botón Flecha Izquierda */}
        <button
          onClick={prevSlide}
          aria-label="Anterior"
          className="absolute left-1 sm:left-4 md:left-8 z-40 p-3 rounded-full bg-[#1c1917]/90 border border-[#3a332c] text-[#f3ece1] hover:text-[#d97644] hover:bg-[#2a2520] transition-all shadow-xl backdrop-blur-md"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Botón Flecha Derecha */}
        <button
          onClick={nextSlide}
          aria-label="Siguiente"
          className="absolute right-1 sm:right-4 md:right-8 z-40 p-3 rounded-full bg-[#1c1917]/90 border border-[#3a332c] text-[#f3ece1] hover:text-[#d97644] hover:bg-[#2a2520] transition-all shadow-xl backdrop-blur-md"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Indicadores de Paginación (Puntos) estilo ActivaQR */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            aria-label={`Ir al slide ${i + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentIndex === i
                ? "w-8 bg-[#d97644]"
                : "w-2.5 bg-[#3a332c] hover:bg-[#5c554c]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
