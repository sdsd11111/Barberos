"use client";

import { useEffect, useRef, useState } from "react";

interface CinematicSceneProps {
  children: React.ReactNode;
  className?: string;
  /** Delay adicional en ms antes de que la animación arranque (para escalonar preguntas) */
  delay?: number;
  /** Si es true, la escena ocupa la altura completa del viewport */
  fullscreen?: boolean;
  /** Umbral de visibilidad para activar la animación (0-1) */
  threshold?: number;
}

/**
 * CinematicScene — Wrapper cliente para animaciones de entrada por scroll.
 *
 * REGLA TÉCNICA (03-ARQUITECTURA-WEB.md):
 * El contenido hijo es SSR desde el servidor — existe en el DOM desde el primer byte.
 * Este componente SOLO añade/quita clases CSS para la transición visual.
 * No inyecta ni destruye nodos del DOM.
 *
 * Técnica: IntersectionObserver + CSS transition sobre clases utilitarias.
 */
export default function CinematicScene({
  children,
  className = "",
  delay = 0,
  fullscreen = false,
  threshold = 0.15,
}: CinematicSceneProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay opcional para escalonar animaciones dentro de la misma sección
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      } ${fullscreen ? "min-h-screen" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
