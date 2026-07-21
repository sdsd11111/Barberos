/**
 * Normaliza un número de WhatsApp a formato internacional sin el +.
 * Maneja casos como: 0963410409, +593963410409, 593963410409, 5930963410409, 963410409
 * País por defecto: Ecuador (593)
 */
export function normalizeWhatsapp(raw: string, countryCode = "593"): string {
  // Quitar todo excepto dígitos
  let digits = raw.replace(/\D/g, "");

  // Ecuador edge-case: algunos escriben 5930963... (prefijo 0 extra después del código de país)
  // 5930963... → 593963...
  if (digits.startsWith(countryCode + "0")) {
    digits = countryCode + digits.slice(countryCode.length + 1);
  }

  // Si empieza con el código de país correcto, ya está bien
  if (digits.startsWith(countryCode) && digits.length >= countryCode.length + 9) {
    return digits;
  }

  // Si es número local con 0 adelante: 0963... → quita el 0 y agrega país
  if (digits.startsWith("0") && digits.length >= 10) {
    return countryCode + digits.slice(1);
  }

  // Si es número sin nada: 963... (9 dígitos) → agrega país
  if (!digits.startsWith(countryCode) && digits.length === 9) {
    return countryCode + digits;
  }

  // Si ya viene limpio (10 dígitos sin prefijo país)
  if (!digits.startsWith(countryCode) && digits.length === 10) {
    return countryCode + digits;
  }

  return digits;
}
