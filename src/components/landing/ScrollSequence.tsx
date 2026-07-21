"use client";

/**
 * ScrollSequence — Componente reutilizable de "Apple Effect" con GSAP + ScrollTrigger.
 *
 * ARQUITECTURA:
 * - Todo el texto (preguntas + microcopy) está SSR desde el servidor (indexable).
 *   GSAP solo anima opacity/transform — no inyecta ni elimina nodos del DOM.
 * - El panel visual (imagen) hace crossfade entre escenas controlado por scroll.
 * - El scroll "pinea" (fija) el panel mientras el usuario avanza por las escenas.
 * - Responsive: una sola versión desktop/móvil. Las imágenes deben diseñarse
 *   con safe-zone central (el canvas recorta en móvil manteniendo el centro).
 *
 * MODO PLACEHOLDER → PRODUCCIÓN:
 * - Con `scenes[n].frameSrc`: muestra 1 imagen por escena con crossfade (modo actual).
 * - Con `frameList` (array de 20-40 imgs por escena): activa modo canvas + frame-sequence
 *   para la animación tipo Apple con fluidez de video. Se activa automáticamente.
 *
 * PROPS:
 * - scenes: Array de escenas. Cada una tiene question, microcopy opcional e imagen.
 * - closingText: Texto que aparece tras la última escena (el golpe final).
 * - scrollDurationVh: Cuántos vh de scroll consume cada escena (default: 120).
 * - frameList: Array global de imágenes para modo canvas-sequence (futuro).
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface SceneData {
  question: string;
  microcopy?: string;
  /** Una imagen por escena (modo placeholder / crossfade) */
  frameSrc?: string;
  /** Array de frames para animación canvas tipo Apple (20-40 imágenes por escena) */
  frames?: string[];
  /** Solo para documentación interna — descripción del visual de producción */
  productionNote?: string;
}

interface ScrollSequenceProps {
  scenes: SceneData[];
  closingText: string;
  /** Vh de scroll que consume cada escena. Default: 120 */
  scrollDurationVh?: number;
  /** Array global de frames para modo canvas-sequence (futuro) */
  frameList?: string[];
  /** Label superior de la sección */
  sectionLabel?: string;
}

export default function ScrollSequence({
  scenes,
  closingText,
  scrollDurationVh = 120,
  frameList,
  sectionLabel = "Cinco preguntas",
}: ScrollSequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const closingRef = useRef<HTMLDivElement>(null);

  // Modo canvas-sequence simplificado (flat array)
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  // Hay modo sequence si cualquier escena tiene frames[] O si se pasó frameList global
  const hasAnyFrameScene = scenes.some(s => s.frames && s.frames.length > 0);
  const isSequenceMode = (frameList && frameList.length > 0) || hasAnyFrameScene;

  useEffect(() => {
    const ctx = gsap.context(() => {
      const totalHeight = scenes.length * scrollDurationVh;

      // ── Precarga de frames en modo sequence ─────────────────
      if (isSequenceMode && canvasRef.current) {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        // Construir el array plano de todas las imágenes
        const allFrames: string[] = frameList && frameList.length > 0
          ? frameList
          : scenes.flatMap(s => s.frames ?? (s.frameSrc ? [s.frameSrc] : []));

        // Inicializar array de imágenes
        imagesRef.current = [];

        const preloadImage = (src: string, index: number) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            imagesRef.current[index] = img;
            // Dibujar el primer frame de inmediato
            if (index === 0) {
              drawFrame(canvas, context, img);
            }
          };
        };

        // Precargar prioritariamente los primeros 5
        allFrames.slice(0, 5).forEach((src, idx) => preloadImage(src, idx));
        
        // Cargar el resto en diferido para no bloquear
        setTimeout(() => {
          allFrames.slice(5).forEach((src, idx) => preloadImage(src, 5 + idx));
        }, 150);

        // ScrollTrigger para canvas — reproduce de 0 a 1 linealmente
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
          onUpdate: (self) => {
            const p = self.progress;
            const totalFrames = allFrames.length;
            const frameIndex = Math.min(
              Math.floor(p * totalFrames),
              totalFrames - 1
            );
            const img = imagesRef.current[frameIndex];
            if (!img) return;
            drawFrame(canvas, context, img);
          },
        });
      }

      function drawFrame(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
        const drawW = img.naturalWidth * scale;
        const drawH = img.naturalHeight * scale;
        const x = (canvas.width - drawW) / 2;
        const y = (canvas.height - drawH) / 2;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, x, y, drawW, drawH);
      }

      // ── ScrollTrigger principal: Timeline de textos ───────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        }
      });

      // ── Timeline de textos ─────────────────────────
      // Cada escena ocupa un bloque exclusivo de la timeline.
      // Estructura por escena: entrada (typewriter clip-path) -> permanece -> salida
      const SCENE_DURATION = 4; // unidades GSAP por escena
      const ENTRY_DUR = 1.0;
      const EXIT_DUR  = 0.8;
      const EXIT_START = 2.8;

      scenes.forEach((_, i) => {
        const questionEl = questionRefs.current[i];
        const imageEl    = imageRefs.current[i];
        if (!questionEl) return;

        const blockStart = i * SCENE_DURATION;

        // Estado inicial: Opaco abajo y oculto con máscara de izquierda a derecha (typewriter)
        gsap.set(questionEl, { 
          opacity: 0, 
          y: 20, 
          clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" 
        });
        if (!isSequenceMode && imageEl) gsap.set(imageEl, { opacity: 0 });

        // Entrada: Revela deslizando la máscara a 100% de ancho (efecto escritura)
        tl.to(questionEl, { 
          opacity: 1, 
          y: 0, 
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          duration: ENTRY_DUR, 
          ease: "power1.inOut" 
        }, blockStart);

        if (!isSequenceMode && imageEl) {
          tl.to(imageEl, { opacity: 0.7, duration: ENTRY_DUR }, blockStart);
        }

        // Salida (solo si no es la última escena)
        if (i < scenes.length - 1) {
          tl.to(questionEl, { 
            opacity: 0, 
            y: -20, 
            clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)", // Se borra a la derecha
            duration: EXIT_DUR, 
            ease: "power1.inOut" 
          }, blockStart + EXIT_START);

          if (!isSequenceMode && imageEl) {
            tl.to(imageEl, { opacity: 0, duration: EXIT_DUR }, blockStart + EXIT_START);
          }
        }
      });

      // ── Closing text ─────────────────────────────────────────
      if (closingRef.current) {
        gsap.fromTo(
          closingRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: closingRef.current,
              start: "top 85%",
              end: "top 50%",
              scrub: 0.5,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [scenes, scrollDurationVh, isSequenceMode]);

  const totalVh = scenes.length * scrollDurationVh;

  return (
    <section
      ref={containerRef}
      style={{ height: `${totalVh}vh` }}
      className="relative bg-[#0a0807]"
      aria-labelledby="interrogatorio-label"
    >
      {/* Label SSR visible — indexable */}
      <p id="interrogatorio-label" className="sr-only">{sectionLabel}</p>

      {/* ── Panel sticky NATIVO de CSS (pantalla completa) ─────── */}
      <div
        ref={panelRef}
        className="sticky top-0 h-screen w-full overflow-hidden"
      >
        {/* ── Capa visual: canvas o imágenes (fondo, full-screen) ── */}
        <div className="absolute inset-0">
          {/* Modo PLACEHOLDER: imágenes individuales con crossfade */}
          {!isSequenceMode && scenes.map((scene, i) =>
            scene.frameSrc ? (
              <div
                key={i}
                ref={(el) => { imageRefs.current[i] = el; }}
                className="absolute inset-0"
                style={{
                  opacity: 0,
                  backgroundImage: `url(${scene.frameSrc})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center center",
                }}
                aria-hidden="true"
              />
            ) : null
          )}

          {/* Modo SEQUENCE: canvas tipo Apple */}
          {isSequenceMode && (
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ display: "block", objectFit: "cover" }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* ── Gradiente oscuro en la zona del texto (izquierda-inferior) ── */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: [
              "linear-gradient(to right, rgba(10,8,7,0.92) 0%, rgba(10,8,7,0.55) 55%, transparent 100%)",
            ].join(", "),
          }}
          aria-hidden="true"
        />
        {/* Gradiente inferior para dar profundidad */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none z-10"
          style={{ background: "linear-gradient(to top, rgba(10,8,7,0.8), transparent)" }}
          aria-hidden="true"
        />

        {/* ── Textos superpuestos: posicionados izquierda-inferior ── */}
        <div className="absolute inset-0 z-20 flex items-end">
          <div className="w-full md:w-3/5 px-8 md:px-16 pb-20 md:pb-24 relative">

            {/* Indicador de escena fijo */}
            <p className="font-mono text-xs tracking-[0.5em] uppercase text-[#3a3530] mb-8">
              {sectionLabel}
            </p>

            {/* Todas las preguntas en el DOM (SSR). GSAP solo mueve opacity/transform. */}
            {scenes.map((scene, i) => (
              <div
                key={i}
                ref={(el) => { questionRefs.current[i] = el; }}
                className="absolute bottom-20 md:bottom-24 left-8 md:left-16 right-4 md:right-auto md:max-w-xl"
                style={{ opacity: 0 }}
              >
                {/* Contador escena */}
                <span className="font-mono text-xs text-[#d97644] tracking-widest block mb-4">
                  0{i + 1}&nbsp;/&nbsp;0{scenes.length}
                </span>

                {/* Microcopy */}
                {scene.microcopy && (
                  <p className="font-mono text-xs tracking-wide text-[#5c554c] uppercase mb-6 leading-relaxed">
                    {scene.microcopy}
                  </p>
                )}

                {/* Pregunta principal */}
                <p className="font-display text-2xl md:text-3xl lg:text-4xl font-light text-[#f3ece1] leading-snug">
                  {scene.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Closing text — fuera del panel sticky ─────── */}
      <div
        ref={closingRef}
        className="sticky bottom-0 left-0 right-0 z-20 flex items-end justify-center pb-24 px-8 pointer-events-none"
        style={{ opacity: 0 }}
      >
        <p className="font-display text-2xl md:text-4xl font-light text-[#f3ece1] text-center max-w-2xl leading-tight">
          {closingText}
        </p>
      </div>
    </section>
  );
}
