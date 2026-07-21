import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "JWT_SECRET_SUPER_CONFIDENCIAL_DESARROLLO_LOCAL"
);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Paths exceptuados de verificación
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhook") ||
    pathname === "/login" ||
    pathname === "/billing" ||
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes("favicon") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/r/")
  ) {
    return NextResponse.next();
  }

  // Rutas bajo /panel o APIs protegidas
  if (pathname.startsWith("/panel") || pathname.startsWith("/api/")) {
    const sessionCookie = request.cookies.get("session")?.value;

    if (!sessionCookie) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      // Verificar token JWT
      const { payload } = await jose.jwtVerify(sessionCookie, JWT_SECRET);
      
      const barbershopId = payload.barbershopId as string;
      const planStatus = payload.planStatus as string;
      const trialEndsAtStr = payload.trialEndsAt as string | null;

      // Validar si el plan está suspendido o el trial expiró
      const isSuspended = planStatus === "SUSPENDED";
      const isTrialExpired =
        planStatus === "TRIAL" &&
        trialEndsAtStr &&
        new Date() > new Date(trialEndsAtStr);

      if (isSuspended || isTrialExpired) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Suscripción inactiva. Dirígete a facturación." },
            { status: 403 }
          );
        }
        return NextResponse.redirect(new URL("/billing", request.url));
      }

      // Inyectar el ID de la barbería en los headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-barbershop-id", barbershopId);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      console.error("[Middleware Auth Check] Token inválido:", error);
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Sesión inválida o expirada" }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/api/:path*"],
};
