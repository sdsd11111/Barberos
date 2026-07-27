/**
 * Motor de Conocimiento — Capa Determinística
 * 
 * Calcula frecuencia, riesgo y snapshots por barbería.
 * NUNCA usa IA — solo matemáticas y reglas fijas.
 * La IA solo consume el output de este módulo, nunca los datos crudos.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { getEcuadorHour, getEcuadorDateOnly, getEcuadorDayKey } from "@/lib/time-ec";

// ===== TIPOS =====

export type RiskLevel = "NORMAL" | "DELAYED" | "AT_RISK" | "INSUFFICIENT_DATA";

export interface ProfileFrequency {
  profileId: string;
  avgDaysBetweenVisits: number | null; // null si no hay suficientes visitas
  daysSinceLastVisit: number | null;
  totalApprovedVisits: number;
  riskLevel: RiskLevel;
  isContextSuppressed: boolean; // true si hay nota vigente que suprime la alerta
}

export interface StaffMetric {
  staffId: string;
  name: string;
  avgRating: number | null;
  totalRated: number;
  totalVisits: number; // solo APPROVED con staffId asignado
}

export interface ScheduleGap {
  /** Franja horaria: "MAÑANA" (6-12), "TARDE" (12-18), "NOCHE" (18-23) */
  franja: string;
  /** Hora de inicio del hueco (0-23) */
  horaInicio: number;
  /** Hora de fin del hueco (0-23) */
  horaFin: number;
  /** Minutos totales del hueco */
  duracionMinutos: number;
  /** Cuántos cortes podrían haberse atendido en ese hueco */
  cortesPerdidos: number;
}

export interface BarbershopSnapshot {
  barbershopId: string;
  totalVisitsApproved: number;
  totalAnonymousVisits: number;
  visitsByHour: Record<number, number>;
  profilesNormal: number;
  profilesDelayed: number;
  profilesAtRisk: number;
  profilesInsufficient: number;
  staffMetrics: StaffMetric[];
  scheduleGaps: ScheduleGap[];
}

// ===== CONSTANTES =====

// Mínimo de visitas para calcular un ritmo confiable
const MIN_VISITS_FOR_PATTERN = 3;
// Ventana móvil: cuántas visitas recientes usar para el promedio
const ROLLING_WINDOW = 8;

// ===== FUNCIONES CORE =====

/**
 * Calcula el ritmo promedio de visitas de un perfil
 * usando ventana móvil de las últimas ROLLING_WINDOW visitas
 */
export function calculateAvgDaysBetween(visitDates: Date[]): number | null {
  if (visitDates.length < MIN_VISITS_FOR_PATTERN) return null;

  // Ordenar de más antiguo a más reciente, tomar últimas N
  const sorted = [...visitDates].sort((a, b) => a.getTime() - b.getTime());
  const window = sorted.slice(-ROLLING_WINDOW);

  if (window.length < 2) return null;

  const gaps: number[] = [];
  for (let i = 1; i < window.length; i++) {
    const diffMs = window[i].getTime() - window[i - 1].getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    gaps.push(diffDays);
  }

  const avg = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  return Math.round(avg * 10) / 10; // redondear a 1 decimal
}

/**
 * Determina el nivel de riesgo de un perfil
 * basado en su ritmo habitual y los umbrales configurados en la barbería
 */
export function calculateRiskLevel(
  avgDays: number | null,
  daysSinceLast: number | null,
  thresholdNormal: number, // ej: 1.2
  thresholdAtRisk: number  // ej: 2.0
): RiskLevel {
  if (avgDays === null || daysSinceLast === null) return "INSUFFICIENT_DATA";
  
  const ratio = daysSinceLast / avgDays;
  
  if (ratio <= thresholdNormal) return "NORMAL";
  if (ratio <= thresholdAtRisk) return "DELAYED";
  return "AT_RISK";
}

/**
 * Calcula la frecuencia e indicadores de un perfil individual
 */
export function calculateProfileFrequency(
  visits: { createdAt: Date; status: string; checkinMethod: string }[],
  lastVisitAt: Date | null,
  noteValidUntil: Date | null,
  thresholdNormal: number,
  thresholdAtRisk: number
): Omit<ProfileFrequency, "profileId"> {
  const now = new Date();

  // Solo visitas APPROVED con identidad conocida (no ANONYMOUS)
  const validDates = visits
    .filter((v) => v.status === "APPROVED" && v.checkinMethod !== "BARBER_ASSISTED_ANONYMOUS")
    .map((v) => v.createdAt);

  const totalApprovedVisits = validDates.length;
  const avgDaysBetweenVisits = calculateAvgDaysBetween(validDates);

  const daysSinceLastVisit = lastVisitAt
    ? Math.floor((now.getTime() - lastVisitAt.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // ¿Hay una nota operativa vigente? Si sí, suprimir alerta de riesgo
  const isContextSuppressed = noteValidUntil ? now < noteValidUntil : false;

  const riskLevel = isContextSuppressed
    ? "NORMAL" // mientras hay contexto vigente, el perfil se trata como normal
    : calculateRiskLevel(avgDaysBetweenVisits, daysSinceLastVisit, thresholdNormal, thresholdAtRisk);

  return {
    avgDaysBetweenVisits,
    daysSinceLastVisit,
    totalApprovedVisits,
    riskLevel,
    isContextSuppressed,
  };
}

/**
 * Calcula métricas del equipo de barberos
 * Solo sobre visitas APPROVED con barbero real asignado (excluye BARBER_ASSISTED_ANONYMOUS)
 */
export function calculateStaffMetrics(
  visits: { staffId: string | null; rating: number | null; status: string; checkinMethod: string }[],
  staffList: { id: string; name: string }[]
): StaffMetric[] {
  return staffList.map((staff) => {
    const staffVisits = visits.filter(
      (v) =>
        v.staffId === staff.id &&
        v.status === "APPROVED" &&
        v.checkinMethod !== "BARBER_ASSISTED_ANONYMOUS"
    );
    const ratedVisits = staffVisits.filter((v) => v.rating !== null);
    const avgRating =
      ratedVisits.length > 0
        ? Math.round(
            (ratedVisits.reduce((sum, v) => sum + (v.rating ?? 0), 0) / ratedVisits.length) * 10
          ) / 10
        : null;

    return {
      staffId: staff.id,
      name: staff.name,
      avgRating,
      totalRated: ratedVisits.length,
      totalVisits: staffVisits.length,
    };
  });
}

/**
 * Agrupa visitas por hora del día para análisis de capacidad
 */
export function calculateVisitsByHour(
  visits: { createdAt: Date; status: string; checkinMethod: string }[]
): Record<number, number> {
  const byHour: Record<number, number> = {};
  for (let h = 0; h < 24; h++) byHour[h] = 0;

  visits
    .filter((v) => v.status === "APPROVED" && v.checkinMethod !== "BARBER_ASSISTED_ANONYMOUS")
    .forEach((v) => {
      // Usar hora de Ecuador (UTC-5), no la hora local del servidor
      // (Vercel corre en UTC, lo que desplazaría las franjas 5 horas).
      const hour = getEcuadorHour(v.createdAt);
      byHour[hour] = (byHour[hour] ?? 0) + 1;
    });

  return byHour;
}

/**
 * Analiza huecos en el horario usando las horas de finalización de visitas
 * y el tiempo estimado de corte (visitDurationMin) para deducir ventanas libres.
 * 
 * Lógica: 
 * - Toma las visitas APPROVED de los últimos 14 días
 * - Agrupa por día y ordena por hora de finalización (createdAt)
 * - Resta visitDurationMin para estimar hora de inicio
 * - Detecta gaps entre el fin estimado de una visita y el inicio estimado de la siguiente
 * - Promedia los gaps por franja horaria (mañana/tarde/noche)
 */
export function calculateScheduleGaps(
  visits: { createdAt: Date; status: string; checkinMethod: string; staffId: string | null }[],
  visitDurationMin: number | null,
  staffCount: number
): ScheduleGap[] {
  // Si no hay duración configurada, no podemos calcular huecos
  if (!visitDurationMin || visitDurationMin <= 0) return [];
  
  const durationMs = visitDurationMin * 60 * 1000;
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  // Solo visitas aprobadas con identidad en los últimos 14 días
  const recentVisits = visits
    .filter(v =>
      v.status === "APPROVED" &&
      v.checkinMethod !== "BARBER_ASSISTED_ANONYMOUS" &&
      v.createdAt >= fourteenDaysAgo
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  if (recentVisits.length < 5) return []; // Necesitamos mínimo 5 visitas para patrones confiables

  // Agrupar por día en zona horaria de Ecuador (clave YYYY-MM-DD local)
  // (antes se usaba toISOString().slice(0,10) que es UTC — corregido)
  const visitsByDay = new Map<string, Date[]>();
  for (const v of recentVisits) {
    const dayKey = getEcuadorDayKey(v.createdAt);
    if (!visitsByDay.has(dayKey)) visitsByDay.set(dayKey, []);
    visitsByDay.get(dayKey)!.push(v.createdAt);
  }

  // Solo analizar días con al menos 2 visitas (para detectar gaps entre ellas)
  const activeDays = [...visitsByDay.entries()].filter(([, times]) => times.length >= 2);
  if (activeDays.length === 0) return [];

  // Franjas horarias para clasificar
  const franjas = [
    { nombre: "MAÑANA", inicio: 6, fin: 12 },
    { nombre: "TARDE", inicio: 12, fin: 18 },
    { nombre: "NOCHE", inicio: 18, fin: 23 },
  ];

  // Acumular gaps por franja
  const gapsByFranja: Record<string, number[]> = {
    "MAÑANA": [],
    "TARDE": [],
    "NOCHE": [],
  };

  // El número efectivo de barberos afecta: con 3 barberos se pueden atender 3 simultáneos
  const effectiveStaff = Math.max(staffCount, 1);

  for (const [, times] of activeDays) {
    const sorted = times.sort((a, b) => a.getTime() - b.getTime());
    
    for (let i = 1; i < sorted.length; i++) {
      // Hora de finalización de visita anterior
      const prevEnd = sorted[i - 1].getTime();
      // Hora estimada de inicio de la siguiente visita (finalización - duración)
      const nextStart = sorted[i].getTime() - durationMs;
      
      // El gap es: desde que terminó el anterior hasta que empezó el siguiente
      const gapMs = nextStart - prevEnd;
      const gapMinutes = gapMs / (60 * 1000);
      
      // Solo contar gaps significativos (>= duración de 1 corte)
      // y dividir entre barberos (si hay 3 barberos, un gap de 40 min podría ser normal)
      if (gapMinutes >= visitDurationMin * effectiveStaff) {
        // Clasificar por franja según la hora del gap (hora Ecuador, no UTC)
        const gapHour = getEcuadorHour(new Date(prevEnd));
        for (const franja of franjas) {
          if (gapHour >= franja.inicio && gapHour < franja.fin) {
            gapsByFranja[franja.nombre].push(gapMinutes);
            break;
          }
        }
      }
    }
  }

  // Promediar gaps por franja y generar resultados
  const results: ScheduleGap[] = [];
  const daysAnalyzed = activeDays.length;

  for (const franja of franjas) {
    const gaps = gapsByFranja[franja.nombre];
    if (gaps.length === 0) continue;
    
    // Frecuencia: si hay huecos en más de 30% de los días activos, es un patrón
    const frequency = gaps.length / daysAnalyzed;
    if (frequency < 0.3) continue; // No es un patrón recurrente
    
    const avgGapMin = Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length);
    const cortesPerdidos = Math.floor(avgGapMin / visitDurationMin);
    
    if (cortesPerdidos >= 1) {
      results.push({
        franja: franja.nombre,
        horaInicio: franja.inicio,
        horaFin: franja.fin,
        duracionMinutos: avgGapMin,
        cortesPerdidos,
      });
    }
  }

  // Ordenar por cortes perdidos (mayor impacto primero)
  return results.sort((a, b) => b.cortesPerdidos - a.cortesPerdidos);
}

// ===== RUNNER PRINCIPAL =====

/**
 * Ejecuta el Motor completo para una barbería
 * Devuelve el snapshot calculado (no lo persiste — eso lo hace el cron)
 */
export async function runMotorForBarbershop(
  prisma: PrismaClient,
  barbershopId: string
): Promise<BarbershopSnapshot> {
  // 1. Cargar config de la barbería y exclusiones de prueba
  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
    include: {
      testExclusions: true,
      staff: true,
    },
  });

  if (!barbershop) throw new Error(`Barbershop ${barbershopId} not found`);

  const excludedNumbers = new Set(
    barbershop.testExclusions
      .filter((e) => !e.validUntil || new Date() < e.validUntil)
      .map((e) => e.whatsapp)
      .filter(Boolean) as string[]
  );

  const thresholdNormal = barbershop.riskThresholdNormal;
  const thresholdAtRisk = barbershop.riskThresholdAt;

  // 2. Cargar clientes (cuentas) de esta barbería, excluyendo números de prueba
  const customers = await prisma.barberCustomer.findMany({
    where: {
      barbershopId,
      NOT: excludedNumbers.size > 0
        ? { whatsapp: { in: Array.from(excludedNumbers) } }
        : undefined,
    },
    include: {
      profiles: {
        where: { isActive: true },
        include: {
          motorContext: true,
        },
      },
    },
  });

  const customerIds = customers.map((c) => c.id);
  const profileIds = customers.flatMap((c) => c.profiles.map((p) => p.id));

  // 3. Cargar todas las visitas relevantes
  const allVisits = await prisma.barberVisit.findMany({
    where: {
      customerId: { in: customerIds },
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      customerId: true,
      profileId: true,
      staffId: true,
      rating: true,
      status: true,
      checkinMethod: true,
      createdAt: true,
    },
  });

  // 4. Contar visitas anónimas (CF)
  const totalAnonymousVisits = allVisits.filter(
    (v) => v.checkinMethod === "BARBER_ASSISTED_ANONYMOUS"
  ).length;

  // 5. Calcular contexto de cada perfil
  const profileFrequencies: ProfileFrequency[] = [];

  for (const customer of customers) {
    for (const profile of customer.profiles) {
      const profileVisits = allVisits.filter((v) => v.profileId === profile.id);
      // Para perfiles sin visitas con profileId aún (datos pre-Motor), usar visitas del customer
      const visitsToUse =
        profileVisits.length > 0
          ? profileVisits
          : allVisits.filter((v) => v.customerId === customer.id && !v.profileId);

      const freq = calculateProfileFrequency(
        visitsToUse,
        customer.lastVisitAt,
        profile.notesValidUntil,
        thresholdNormal,
        thresholdAtRisk
      );

      profileFrequencies.push({ profileId: profile.id, ...freq });
    }
  }

  // Si un cliente no tiene perfiles aún (datos pre-Motor), crear contexto sobre la cuenta
  const customersWithoutProfiles = customers.filter((c) => c.profiles.length === 0);
  for (const customer of customersWithoutProfiles) {
    const customerVisits = allVisits.filter((v) => v.customerId === customer.id);
    const freq = calculateProfileFrequency(
      customerVisits,
      customer.lastVisitAt,
      null,
      thresholdNormal,
      thresholdAtRisk
    );
    // Usamos el customerId como proxy hasta que tenga perfil real
    profileFrequencies.push({ profileId: `account:${customer.id}`, ...freq });
  }

  // 6. Dimensión Equipo
  const staffMetrics = calculateStaffMetrics(allVisits, barbershop.staff);

  // 7. Dimensión Negocio
  const visitsByHour = calculateVisitsByHour(allVisits);
  const totalVisitsApproved = allVisits.filter(
    (v) => v.status === "APPROVED" && v.checkinMethod !== "BARBER_ASSISTED_ANONYMOUS"
  ).length;

  // 8. Contadores de riesgo
  const riskCounts = profileFrequencies.reduce(
    (acc, pf) => {
      acc[pf.riskLevel] = (acc[pf.riskLevel] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // 9. Dimensión Huecos — Análisis de gaps en el horario
  const scheduleGaps = calculateScheduleGaps(
    allVisits as any,
    barbershop.visitDurationMin,
    barbershop.staff.length
  );

  return {
    barbershopId,
    totalVisitsApproved,
    totalAnonymousVisits,
    visitsByHour,
    profilesNormal: riskCounts["NORMAL"] ?? 0,
    profilesDelayed: riskCounts["DELAYED"] ?? 0,
    profilesAtRisk: riskCounts["AT_RISK"] ?? 0,
    profilesInsufficient: riskCounts["INSUFFICIENT_DATA"] ?? 0,
    staffMetrics,
    scheduleGaps,
  };
}

/**
 * Persiste el snapshot y el contexto de cada perfil en la BD
 * Reemplaza el snapshot del día anterior para esta barbería
 */
export async function persistMotorResults(
  prisma: PrismaClient,
  snapshot: BarbershopSnapshot,
  profileFrequencies: ProfileFrequency[]
): Promise<void> {
  const now = new Date();

  // Upsert del snapshot de barbería (un registro por día en zona horaria Ecuador)
  // Antes usaba getFullYear/getMonth/getDate que son LOCALES del servidor (UTC en Vercel),
  // lo que desplazaba la "fecha del snapshot" 5 horas.
  const today = getEcuadorDateOnly(now);

  await prisma.motorSnapshot.upsert({
    where: {
      // Se necesita un unique index por (barbershopId, snapshotDate) — usando el id trick
      id: `${snapshot.barbershopId}-${today.toISOString().slice(0, 10)}`,
    },
    update: {
      totalVisitsApproved: snapshot.totalVisitsApproved,
      totalAnonymousVisits: snapshot.totalAnonymousVisits,
      visitsByHour: JSON.stringify(snapshot.visitsByHour),
      profilesNormal: snapshot.profilesNormal,
      profilesDelayed: snapshot.profilesDelayed,
      profilesAtRisk: snapshot.profilesAtRisk,
      profilesInsufficient: snapshot.profilesInsufficient,
      staffMetrics: JSON.stringify(snapshot.staffMetrics),
      calculatedAt: now,
    },
    create: {
      id: `${snapshot.barbershopId}-${today.toISOString().slice(0, 10)}`,
      barbershopId: snapshot.barbershopId,
      totalVisitsApproved: snapshot.totalVisitsApproved,
      totalAnonymousVisits: snapshot.totalAnonymousVisits,
      visitsByHour: JSON.stringify(snapshot.visitsByHour),
      profilesNormal: snapshot.profilesNormal,
      profilesDelayed: snapshot.profilesDelayed,
      profilesAtRisk: snapshot.profilesAtRisk,
      profilesInsufficient: snapshot.profilesInsufficient,
      staffMetrics: JSON.stringify(snapshot.staffMetrics),
      calculatedAt: now,
    },
  });

  // Upsert del contexto de cada perfil real
  for (const pf of profileFrequencies) {
    if (pf.profileId.startsWith("account:")) continue; // solo perfiles reales
    await prisma.profileMotorContext.upsert({
      where: { profileId: pf.profileId },
      update: {
        avgDaysBetweenVisits: pf.avgDaysBetweenVisits,
        daysSinceLastVisit: pf.daysSinceLastVisit,
        riskLevel: pf.riskLevel,
        totalVisits: pf.totalApprovedVisits,
        calculatedAt: now,
      },
      create: {
        profileId: pf.profileId,
        barbershopId: snapshot.barbershopId,
        avgDaysBetweenVisits: pf.avgDaysBetweenVisits,
        daysSinceLastVisit: pf.daysSinceLastVisit,
        riskLevel: pf.riskLevel,
        totalVisits: pf.totalApprovedVisits,
        calculatedAt: now,
      },
    });
  }
}
