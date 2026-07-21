// src/app/(public)/acceso/page.tsx
// Redirect limpio a /login — no es una página de marketing.
// URL canónica indexable: /login. Esta ruta NO se incluye en sitemap.xml.
// Referencia: 03-ARQUITECTURA-WEB.md — Página 5 / Acceso.

import { redirect } from "next/navigation";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AccesoRedirect() {
  redirect("/login");
}
