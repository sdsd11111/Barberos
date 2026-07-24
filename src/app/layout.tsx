import type { Metadata } from "next";
import { Fraunces, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ClarityInit from "@/components/ClarityInit";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";
import LLMVisibilityContent from "@/components/shared/LLMVisibilityContent";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "BarberOS — Sistema Inteligente de Fidelización y Gestión para Barberías",
    template: "%s | BarberOS",
  },
  description:
    "Transforma tu barbería en un negocio recurrente. Sistema automatizado de tarjetas de fidelidad por WhatsApp, check-in en caja, avisos automáticos y control de clientes en Ecuador.",
  keywords: [
    "BarberOS",
    "software para barberías",
    "fidelización de barberías",
    "tarjeta de fidelidad whatsapp",
    "sistema de barbería ecuador",
    "gestión de clientes barbería",
    "barberos ecuador",
  ],
  metadataBase: new URL("http://www.barberosplus.com"),
  verification: {
    google: "S4YO9FbiTiBeFAGaOowZq0VlK1T-uhzQjbEIhWNTt9o",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logos/barberos_isotipo.png", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logos/barberos_isotipo.png",
  },
  openGraph: {
    title: "BarberOS — Sistema Inteligente de Fidelización y Gestión para Barberías",
    description:
      "Aumenta la frecuencia de tus clientes y automatiza tu barbería por WhatsApp. Fidelización rápida, métricas en vivo y avisos automáticos.",
    url: "http://www.barberosplus.com",
    siteName: "BarberOS",
    images: [
      {
        url: "http://www.barberosplus.com/logos/barberos_logo_concept_1.webp",
        width: 1200,
        height: 630,
        alt: "BarberOS - Software e Inteligencia para Barberías",
      },
    ],
    locale: "es_EC",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BarberOS — Sistema Inteligente de Fidelización y Gestión para Barberías",
    description:
      "Aumenta la frecuencia de tus clientes y automatiza tu barbería por WhatsApp.",
    images: ["http://www.barberosplus.com/logos/barberos_logo_concept_1.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <ClarityInit />
        <RegisterServiceWorker />
        <LLMVisibilityContent />
        {children}
      </body>
    </html>
  );
}
