import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Ruta dinámica de check-in para clientes.
 * 
 * El QR impreso en la mesa de la barbería apunta a:
 *   https://barberos-teal.vercel.app/c/{barbershopId}
 * 
 * Al escanear, esta ruta:
 * 1. Busca la barbería en la base de datos
 * 2. Lee el código de caja ACTUAL (dinámico, cambia con cada check-in)
 * 3. Redirige al cliente a wa.me con el mensaje pre-rellenado:
 *    "Hola, mi código de caja es NK21"
 * 
 * Resultado: el QR es PERMANENTE (se imprime una vez), pero el código
 * de caja siempre es el correcto porque se lee en tiempo real del servidor.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const barbershop = await prisma.barbershop.findUnique({
    where: { id },
    select: { whatsappNumber: true, currentBoxCode: true },
  });

  if (!barbershop) {
    return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
  }

  const code = barbershop.currentBoxCode || "0000";
  const waUrl = `https://wa.me/${barbershop.whatsappNumber}?text=${encodeURIComponent(
    `Hola, mi código de caja es ${code}`
  )}`;

  return NextResponse.redirect(waUrl);
}
