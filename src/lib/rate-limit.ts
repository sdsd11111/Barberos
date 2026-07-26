import { prisma } from "@/lib/prisma";

export interface RateLimitOptions {
  key: string;            // Clave única (ej: "reg:ip:192.168.1.1")
  maxAttempts: number;    // Máximo de intentos en la ventana
  windowMs: number;       // Ventana de tiempo en milisegundos
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Rate Limiter persistente respaldado por MySQL para Next.js / Serverless (Vercel).
 */
export async function checkDbRateLimit(
  options: RateLimitOptions
): Promise<RateLimitResult> {
  const { key, maxAttempts, windowMs } = options;
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  try {
    // Buscar registro existente
    const record = await prisma.rateLimitAttempt.findUnique({
      where: { key },
    });

    if (!record) {
      // Crear nuevo registro
      await prisma.rateLimitAttempt.create({
        data: {
          key,
          attempts: 1,
          expiresAt: resetAt,
        },
      });
      return { success: true, remaining: maxAttempts - 1, resetAt };
    }

    // Si expiró la ventana, reiniciar contador
    if (now > record.expiresAt) {
      await prisma.rateLimitAttempt.update({
        where: { key },
        data: {
          attempts: 1,
          expiresAt: resetAt,
        },
      });
      return { success: true, remaining: maxAttempts - 1, resetAt };
    }

    // Si ya alcanzó o superó el máximo
    if (record.attempts >= maxAttempts) {
      return {
        success: false,
        remaining: 0,
        resetAt: record.expiresAt,
      };
    }

    // Incrementar contador
    const updated = await prisma.rateLimitAttempt.update({
      where: { key },
      data: {
        attempts: { increment: 1 },
      },
    });

    return {
      success: true,
      remaining: maxAttempts - updated.attempts,
      resetAt: record.expiresAt,
    };
  } catch (error) {
    console.error("[DbRateLimit Error, dejando pasar por falla abierta]:", error);
    return { success: true, remaining: 1, resetAt };
  }
}
