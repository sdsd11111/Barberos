// src/app/(public)/alianza/page.tsx
// Página pública del Programa de Aliados Comerciales.
// Server component: SEO + metadata. Delega el formulario al client component.

import type { Metadata } from "next";
import AlianzaForm from "./AlianzaForm";

export const metadata: Metadata = {
  title: "Alianza Estratégica Comercial — BarberOSPlus.com",
  description:
    "Programa de Aliados Comerciales de BarberosPlus.com. Únete a la red de aliados que ayuda a dueños de barberías a recuperar el control real de su negocio.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Alianza Estratégica Comercial — BarberOSPlus.com",
    description:
      "Programa de Aliados Comerciales de BarberosPlus.com",
    type: "website",
  },
};

export default function AlianzaPage() {
  return (
    <div className="bg-[#0a0807] text-[#f3ece1] min-h-screen pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        {/* Hero */}
        <header className="text-center mb-12">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] block mb-3">
            Programa de Aliados Comerciales · v1
          </span>
          <h1 className="font-display text-5xl sm:text-6xl font-light tracking-tight text-[#f3ece1] leading-[1.05]">
            Alianza{" "}
            <span className="text-[#d97644]">Estratégica</span>
            <br />
            Comercial
          </h1>
          <p className="font-sans text-[#a89e90] text-base max-w-xl mx-auto mt-6 leading-relaxed">
            Únete a la red de aliados que, desde su propia cartera de
            contactos, despierta el interés de dueños de barberías por recuperar
            el control real de su negocio.
          </p>
        </header>

        {/* Formulario */}
        <AlianzaForm />

        {/* Footer mini */}
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] text-center mt-12">
          BarberOSPlus.com · Loja, Ecuador · 2026
        </p>
      </div>
    </div>
  );
}