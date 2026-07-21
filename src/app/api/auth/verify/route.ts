import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "JWT_SECRET_SUPER_CONFIDENCIAL_DESARROLLO_LOCAL"
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/acceso?error=Falta_token", request.url));
    }

    // Buscar el MagicToken en la base de datos
    const magicToken = await prisma.magicToken.findUnique({
      where: { token },
    });

    if (!magicToken) {
      return NextResponse.redirect(new URL("/acceso?error=Token_invalido", request.url));
    }

    if (new Date() > magicToken.expiresAt) {
      return NextResponse.redirect(new URL("/acceso?error=Token_expirado", request.url));
    }

    // Ya no marcamos el token como "usado" inmediatamente.
    // Esto evita que el pre-fetch (link preview) de WhatsApp consuma el token
    // y bloquee al usuario real cuando hace clic. El token simplemente expira en 15 mins.

    // Obtener detalles de la barbería para asegurar planStatus
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: magicToken.barbershopId },
      select: { id: true, planStatus: true, trialEndsAt: true },
    });

    if (!barbershop) {
      return NextResponse.redirect(new URL("/acceso?error=Barberia_no_encontrada", request.url));
    }

    // Firmar JWT utilizando jose
    const jwt = await new jose.SignJWT({
      barbershopId: barbershop.id,
      planStatus: barbershop.planStatus,
      trialEndsAt: barbershop.trialEndsAt?.toISOString() || null,
      role: "OWNER",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    // Preparar redirección y adjuntar la cookie HTTP-Only
    const response = NextResponse.redirect(new URL("/panel", request.url));
    
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    response.cookies.set("session", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60, // 365 días
      expires: oneYearFromNow,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Verify Auth API] Error:", error);
    return NextResponse.json({ error: "Error interno al verificar el token" }, { status: 500 });
  }
}
