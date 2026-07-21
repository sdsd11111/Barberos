/**
 * Genera un código de caja aleatorio de 4 caracteres alfanuméricos (mayúsculas + números).
 * Ejemplo: "NK21", "RV55", "AX09", "PL37"
 */
export function generateBoxCode(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  const d1 = digits[Math.floor(Math.random() * digits.length)];
  const d2 = digits[Math.floor(Math.random() * digits.length)];

  return `${l1}${l2}${d1}${d2}`;
}
