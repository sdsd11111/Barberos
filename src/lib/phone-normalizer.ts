// Normaliza un teléfono a formato E.164 (ej: 593991234567)
// Elimina espacios, guiones, paréntesis y el prefijo + si existe

export function normalizePhone(phone: string): string {
  // Eliminar todo lo que no sea dígito
  const digits = phone.replace(/\D/g, "");
  
  // Si empieza con 0, removerlo y agregar 593 (Ecuador)
  if (digits.startsWith("0")) {
    return "593" + digits.slice(1);
  }
  
  // Si ya empieza con 593, retornar directo
  if (digits.startsWith("593")) {
    return digits;
  }
  
  // Si empieza con 9 (número ecuatoriano sin prefijo), agregar 593
  if (digits.startsWith("9")) {
    return "593" + digits;
  }
  
  return digits;
}

// Normaliza un array de teléfonos
export function normalizePhones(phones: string[]): string[] {
  return phones.map(normalizePhone);
}
