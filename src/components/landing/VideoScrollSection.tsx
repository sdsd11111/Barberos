"use client";

import { useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export interface SceneOverlay {
  question: string;
  microcopy?: string;
}

interface VideoScrollSectionProps {
  frames: string[];
  scenes?: SceneOverlay[];
  heroContent?: ReactNode;
  closingText?: string;
  scrollHeight?: string;
  overlayStrength?: number;
  sectionLabel?: string;
}

export default function VideoScrollSection({
  frames,
  scenes = [],
  heroContent,
  closingText,
  scrollHeight = "300vh",
  overlayStrength = 0.78,
  sectionLabel = "Cinco preguntas",
}: VideoScrollSectionProps) {
  const wrapperRef   = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const imagesRef    = useRef<(HTMLImageElement | null)[]>([]);
  const lastFrameRef = useRef<number>(-1);
  const heroRef      = useRef<HTMLDivElement>(null);
  const closingRef   = useRef<HTMLDivElement>(null);
  const sceneRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const canvas  = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || !h) return;
      // Multiplicar por devicePixelRatio para nitidez en pantallas retina/AMOLED
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap en 2x para no sobrecargar GPU
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      const idx = lastFrameRef.current;
      if (idx >= 0 && imagesRef.current[idx]) drawFrame(imagesRef.current[idx]!);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function drawFrame(img: HTMLImageElement) {
      if (!ctx || !canvas || !img.naturalWidth) return;
      // Usar dimensiones CSS (no físicas) porque el ctx ya está escalado por dpr
      const cw = canvas.offsetWidth, ch = canvas.offsetHeight;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    imagesRef.current = new Array(frames.length).fill(null);
    const loadFrame = (src: string, idx: number) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[idx] = img;
        if (idx === 0 && lastFrameRef.current < 0) {
          lastFrameRef.current = 0;
          drawFrame(img);
          ScrollTrigger.refresh();
        }
      };
    };
    frames.slice(0, 5).forEach((src, i) => loadFrame(src, i));
    const deferTimer = setTimeout(() => {
      frames.slice(5).forEach((src, i) => loadFrame(src, 5 + i));
    }, 100);

    const stCanvas = ScrollTrigger.create({
      trigger:  wrapper,
      start:    "top top",
      end:      "bottom bottom",
      scrub:    0.1,
      onUpdate: (self) => {
        if (!frames.length) return;
        const p = self.progress;
        const speedMultiplier = 1.1; 
        const frameProgress = Math.min(p * speedMultiplier, 1.0);
        const idx = Math.min(
          Math.floor(frameProgress * (frames.length - 1)),
          frames.length - 1
        );
        if (idx === lastFrameRef.current) return;
        const img = imagesRef.current[idx];
        if (!img) return;
        lastFrameRef.current = idx;
        drawFrame(img);
      },
    });

    const HERO_BLOCK  = scenes.length > 0 ? 0.8 : 0;
    const SCENE_BLOCK = 1.0;
    const FADE        = 0.35;
    const EXIT_AT     = 0.65;

    const gCtx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: wrapper, start: "top top", end: "bottom bottom", scrub: 0.3 },
      });

      if (heroRef.current && heroContent) {
        gsap.set(heroRef.current, { opacity: 1 });
        tl.to(heroRef.current, { opacity: 0, duration: FADE, ease: "power2.in" }, HERO_BLOCK - FADE);
      }

      sceneRefs.current.forEach(el => {
        if (el) gsap.set(el, { opacity: 0, clipPath: "inset(0 100% 0 0)" });
      });

      scenes.forEach((_, i) => {
        const el = sceneRefs.current[i];
        if (!el) return;
        const blockStart = HERO_BLOCK + i * SCENE_BLOCK;
        tl.to(el, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: FADE, ease: "power1.out" }, blockStart);
        // Hacemos que TODAS las preguntas desaparezcan (incluyendo la ultima) antes del texto final
        tl.to(el, { opacity: 0, clipPath: "inset(0 0% 0 100%)", duration: FADE, ease: "power1.in" }, blockStart + EXIT_AT);
      });

      if (closingRef.current && closingText) {
        gsap.set(closingRef.current, { opacity: 0, y: 16 });
        // Se calcula con un margen de holgura extra (0.3) para asegurar que la ultima pregunta ya se haya ido por completo
        const lastBlock = HERO_BLOCK + (scenes.length > 0 ? (scenes.length - 1) * SCENE_BLOCK + EXIT_AT + 0.35 : 0);
        tl.to(closingRef.current, { opacity: 1, y: 0, duration: FADE, ease: "power2.out" }, lastBlock);
      }
    }, wrapper);

    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      clearTimeout(deferTimer);
      clearTimeout(refreshTimer);
      stCanvas.kill();
      gCtx.revert();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frames, scenes.length]);

  return (
    <div ref={wrapperRef} style={{ height: scrollHeight }} className="relative" aria-label={sectionLabel}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full bg-[#0a0807]" aria-hidden="true" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "linear-gradient(to right, rgba(10,8,7," + overlayStrength + ") 0%, rgba(10,8,7," + (overlayStrength * 0.6) + ") 50%, rgba(10,8,7,0.1) 100%)",
              "linear-gradient(to top, rgba(10,8,7," + (overlayStrength * 0.95) + ") 0%, transparent 45%)",
              "linear-gradient(to bottom, rgba(10,8,7,0.4) 0%, transparent 15%)"
            ].map(function(s) { return s.replace(/"/g, ""); }).join(", ")
          }}
          aria-hidden="true"
        />
        {heroContent && (
          <div ref={heroRef} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10">
            {heroContent}
          </div>
        )}
        {scenes.length > 0 && (
          <div className="absolute inset-0 z-20 flex items-end pointer-events-none">
            <div className="w-full px-6 md:px-16 pb-16 md:pb-20 relative">
              <p className="font-mono text-xs tracking-[0.4em] uppercase text-[#3a3530] mb-6">{sectionLabel}</p>
              {scenes.map((scene, i) => (
                <div
                  key={i}
                  ref={el => { sceneRefs.current[i] = el; }}
                  className="absolute bottom-16 md:bottom-20 left-6 md:left-16 right-6 md:max-w-xl"
                  style={{ opacity: 0 }}
                >
                  <span className="font-mono text-xs text-[#d97644] tracking-widest block mb-3">
                    0{i + 1}&nbsp;/&nbsp;0{scenes.length}
                  </span>
                  {scene.microcopy && (
                    <p className="font-mono text-xs tracking-wide text-[#5c554c] uppercase mb-4 leading-relaxed">
                      {scene.microcopy}
                    </p>
                  )}
                  <p className="font-display text-2xl md:text-3xl lg:text-4xl font-light text-[#f3ece1] leading-snug min-h-[4.5em] md:min-h-[4em]">
                    {scene.question}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {closingText && (
          <div ref={closingRef} className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-center pb-20 px-8 pointer-events-none" style={{ opacity: 0 }}>
            <p className="font-display text-2xl md:text-4xl font-light text-[#f3ece1] text-center max-w-2xl leading-tight">
              {closingText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}