import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, type SessionPayload } from "@/lib/session";

/**
 * Data Access Layer — capa central de autorización.
 *
 * verifySession() es la función canónica para obtener la sesión del dueño
 * en cualquier Server Component o Server Action del panel.
 *
 * - Si no hay sesión válida → redirige a /login.
 * - Si el plan está SUSPENDED → redirige a /billing.
 * - Si todo está bien → retorna el payload con barbershopId y planStatus.
 *
 * Memoizada con React.cache() para evitar múltiples lecturas de cookie
 * durante el mismo ciclo de render.
 */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  const session = await decrypt(token);

  if (!session?.barbershopId) {
    redirect("/login");
  }

  if (session.planStatus === "SUSPENDED") {
    redirect("/billing");
  }

  return session;
});
