/**
 * Utilidades de zona horaria — Ecuador (America/Guayaquil, UTC-5, sin DST)
 *
 * Los servidores de Vercel corren en UTC, por lo que `new Date().getHours()`
 * devuelve la hora UTC, no la hora local del negocio (Ecuador).
 *
 * Cualquier cálculo que se muestre al dueño o se use para tomar decisiones
 * (franjas horarias, "hoy", hora pico, huecos en agenda, etc.) DEBE pasar
 * por estas funciones en vez de usar `getHours()` / `getDate()` / `getMonth()`
 * directamente sobre la fecha.
 *
 * Ecuador: UTC-5 todo el año (no aplica horario de verano).
 *
 * Ejemplo:
 *   UTC 2026-07-27 15:30  →  Ecuador 2026-07-27 10:30
 */

/** Identificador IANA oficial para Ecuador */
export const ECUADOR_TZ = "America/Guayaquil" as const;

/** Diferencia horaria Ecuador vs UTC, en horas (Ecuador = UTC - 5) */
export const ECUADOR_UTC_OFFSET_HOURS = -5;

/**
 * Devuelve la hora (0-23) en Ecuador para una fecha dada.
 *
 * @example
 *   // UTC: 2026-07-27T15:30:00Z → Ecuador: 10:30
 *   getEcuadorHour(new Date("2026-07-27T15:30:00Z")) // → 10
 */
export function getEcuadorHour(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    hour12: false,
    timeZone: ECUADOR_TZ,
  }).formatToParts(date);

  const hourPart = parts.find((p) => p.type === "hour");
  // En algunos navegadores "24" puede aparecer para medianoche; normalizamos a 0.
  const raw = hourPart ? parseInt(hourPart.value, 10) : 0;
  return raw === 24 ? 0 : raw;
}

/**
 * Devuelve la fecha calendario en Ecuador como Date de medianoche LOCAL.
 * Útil para "hoy" / "inicio del día" en lógica de negocio.
 *
 * NOTA: retorna un Date construido con getFullYear/getMonth/getDate ya
 * ajustados a Ecuador, por lo que sus getters locales son seguros.
 */
export function getEcuadorDateOnly(date: Date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: ECUADOR_TZ,
  }).formatToParts(date);

  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value ?? "0", 10);

  // Construye con UTC noon para evitar drift por DST del servidor
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day"), 12));
}

/**
 * Devuelve la clave de día "YYYY-MM-DD" en Ecuador (para agrupar, snapshots, etc.).
 * Estable aunque cambien zonas horarias del servidor.
 */
export function getEcuadorDayKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: ECUADOR_TZ,
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Formatea una fecha en zona horaria de Ecuador.
 * Helper para mantener consistencia entre componentes.
 */
export function formatEcuador(
  date: Date,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }
): string {
  return new Intl.DateTimeFormat("es-EC", {
    ...options,
    timeZone: ECUADOR_TZ,
  }).format(date);
}