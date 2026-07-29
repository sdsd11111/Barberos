// src/lib/alianza-schema.ts
// Schema Zod compartido cliente/servidor para el Programa de Aliados Comerciales.
// Validación del formulario + validación en el route handler POST /api/alianza.

import { z } from "zod";
import { normalizePhone } from "@/lib/phone-normalizer";

// Cédula ecuatoriana: 10 dígitos numéricos. Permitimos también pasaportes / RUC
// simples (6 a 13 dígitos) para no romper diplomáticos/extranjeros, pero el caso
// normal EC es 10 dígitos.
const cedulaSchema = z
  .string()
  .trim()
  .min(6, "Mínimo 6 dígitos")
  .max(13, "Máximo 13 dígitos")
  .regex(/^[0-9]+$/, "Solo dígitos, sin puntos ni guiones");

// E.164 normalizado vía phone-normalizer. Lo usamos como transform para
// asegurar que el celular queda en formato canónico antes de persistir.
const celularSchema = z
  .string()
  .trim()
  .min(7, "Teléfono demasiado corto")
  .transform((v) => normalizePhone(v))
  .refine((v) => /^593\d{9,10}$/.test(v), "Formato ecuatoriano inválido (ej. 593991234567)");

export const METODOS_PAGO = ["transferencia", "payphone", "efectivo", "otro"] as const;
export const MESES_FIRMA = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const alianzaInputSchema = z.object({
  // ===== Datos del ALIADO (crea/encuentra el ReferralVendedor) =====
  nombreCompleto: z.string().trim().min(2, "Mínimo 2 caracteres").max(120),
  cedula: cedulaSchema,
  celular: celularSchema,
  nombreNegocio: z.string().trim().min(2, "Mínimo 2 caracteres").max(160),
  direccion: z.string().trim().min(3, "Mínimo 3 caracteres").max(240),

  // ===== Código asignado (lo genera el backend, el cliente lo confirma) =====
  codigoAsignado: z
    .string()
    .trim()
    .length(8, "El código debe tener 8 caracteres")
    .regex(/^[A-Z0-9]+$/, "Solo letras mayúsculas y números"),

  // ===== Datos contractuales (AlianzaContract) =====
  zonaTerritorio: z.string().trim().max(160).optional().or(z.literal("")),
  diasPagoComision: z.coerce.number().int().min(1, "Mínimo 1").max(30, "Máximo 30"),
  metodoPago: z.enum(METODOS_PAGO),

  // ===== Bloque de firma =====
  ciudadFirma: z.string().trim().min(2, "Mínimo 2 caracteres").max(80),
  diaFirma: z.coerce.number().int().min(1, "Día inválido").max(31, "Día inválido"),
  mesFirma: z.enum(MESES_FIRMA),
  anioFirma: z.coerce
    .number()
    .int()
    .min(2026, "Año debe ser 2026 o posterior")
    .max(2099, "Año fuera de rango"),
});

export type AlianzaInput = z.infer<typeof alianzaInputSchema>;