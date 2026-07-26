export interface CustomerIntervalMetrics {
  avgIntervalDays: number;
  preCutTriggerDays: number; // 0.8x
  overdueTriggerDays: number; // 1.2x
  daysSinceLastVisit: number | null;
  status: "NORMAL" | "PRE_CUT_DUE" | "OVERDUE";
}

/**
 * Calcula la frecuencia habitual entre cortes de un cliente basado en sus fechas de visitas aprobadas.
 * @param visitDates Fechas ordenadas de menor a mayor (cronológicamente ascendente)
 * @param lastVisitAt Fecha de la última visita del cliente
 */
export function calculateCustomerMetrics(
  visitDates: Date[],
  lastVisitAt: Date | null
): CustomerIntervalMetrics {
  const DEFAULT_INTERVAL = 20; // Días por defecto si solo tiene 1 visita o no hay historial
  const now = new Date();

  let avgIntervalDays = DEFAULT_INTERVAL;

  if (visitDates.length >= 2) {
    const firstVisit = visitDates[0].getTime();
    const lastVisit = visitDates[visitDates.length - 1].getTime();
    const totalDays = (lastVisit - firstVisit) / (1000 * 60 * 60 * 24);
    const intervalsCount = visitDates.length - 1;

    if (intervalsCount > 0 && totalDays > 0) {
      avgIntervalDays = Math.max(7, Math.round(totalDays / intervalsCount));
    }
  }

  const preCutTriggerDays = Math.max(5, Math.round(avgIntervalDays * 0.8));
  const overdueTriggerDays = Math.max(8, Math.round(avgIntervalDays * 1.2));

  let daysSinceLastVisit: number | null = null;
  let status: "NORMAL" | "PRE_CUT_DUE" | "OVERDUE" = "NORMAL";

  if (lastVisitAt) {
    daysSinceLastVisit = Math.floor(
      (now.getTime() - new Date(lastVisitAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastVisit >= overdueTriggerDays) {
      status = "OVERDUE";
    } else if (daysSinceLastVisit >= preCutTriggerDays) {
      status = "PRE_CUT_DUE";
    }
  }

  return {
    avgIntervalDays,
    preCutTriggerDays,
    overdueTriggerDays,
    daysSinceLastVisit,
    status,
  };
}
