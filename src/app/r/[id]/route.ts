import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const barbershop = await prisma.barbershop.findUnique({
      where: { id },
      select: { googleMapsUrl: true },
    });

    if (barbershop?.googleMapsUrl) {
      // Redirigir directamente con el string URL original para preservar fragmentos # (#lrd=...)
      return NextResponse.redirect(barbershop.googleMapsUrl);
    }
  } catch (error) {
    console.error("[Redirección Reseña] Error:", error);
  }

  // Fallback seguro si no hay link guardado
  const defaultGoogleReviewLink = "https://www.google.com.ec/search?q=opiniones+de+c%C3%A9sar+reyes+jaramillo+loja";
  return NextResponse.redirect(defaultGoogleReviewLink);
}
