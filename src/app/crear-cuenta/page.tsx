import type { Metadata } from "next";
import CrearCuentaForm from "@/components/crear-cuenta/CrearCuentaForm";

export const metadata: Metadata = {
  title: "Activa tu Barbería · 15 Días Gratis · BarberOS",
  description:
    "Crea tu cuenta de BarberOS gratis por 15 días. Sin tarjeta, sin compromiso. Activa tu barbería y empieza a fidelizar clientes hoy.",
  robots: { index: false, follow: false }, // Página de conversión — no indexar
};

export default function CrearCuentaPage() {
  return <CrearCuentaForm />;
}