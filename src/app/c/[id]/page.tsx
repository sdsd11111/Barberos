import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Página de check-in dinámica para clientes.
 * 
 * El QR impreso en la mesa apunta a: /c/{barbershopId}
 * Esta página lee el código de caja ACTUAL de la BD y redirige
 * inmediatamente a wa.me con el mensaje pre-rellenado.
 */
export default async function CheckinRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const barbershop = await prisma.barbershop.findUnique({
    where: { id },
    select: { whatsappNumber: true, currentBoxCode: true, name: true },
  });

  if (!barbershop) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", fontFamily: "system-ui" }}>
        <p>Barbería no encontrada</p>
      </div>
    );
  }

  const code = barbershop.currentBoxCode || "0000";
  const waUrl = `https://wa.me/${barbershop.whatsappNumber}?text=${encodeURIComponent(
    `Hola, mi código de caja es ${code}`
  )}`;

  // Redirect server-side (Next.js native redirect)
  redirect(waUrl);
}
