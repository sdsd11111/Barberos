import Link from "next/link";

interface CTABlockProps {
  texto: string;
  href: string;
  subtexto?: string;
}

/**
 * CTABlock — Bloque de conversión único por página.
 * Regla arquitectural: cada página tiene UN solo CTA principal.
 * No renderizar dos CTABlock en la misma página.
 */
export default function CTABlock({ texto, href, subtexto }: CTABlockProps) {
  return (
    <section className="py-24 px-6 border-t border-[#2a2520]">
      <div className="max-w-2xl mx-auto text-center">
        {subtexto && (
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-6">
            {subtexto}
          </p>
        )}
        <Link
          href={href}
          className="inline-block font-mono text-sm tracking-[0.25em] uppercase text-[#0a0807] bg-[#d97644] px-10 py-5 hover:bg-[#e8854f] transition-all hover:tracking-[0.3em]"
        >
          {texto}
        </Link>
      </div>
    </section>
  );
}
