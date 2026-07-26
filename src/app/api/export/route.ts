import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.barbershopId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const barbershopId = session.barbershopId;
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // "1" a "12"
    const yearParam = searchParams.get("year");   // "2026", etc.
    const formatParam = searchParams.get("format") || "csv"; // "csv" o "json"

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (monthParam && yearParam) {
      const month = parseInt(monthParam, 10);
      const year = parseInt(yearParam, 10);
      if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
      }
    }

    // 1. Obtener la información general de la barbería
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: {
        id: true,
        name: true,
        whatsappNumber: true,
        evolutionInstance: true,
        requiredCuts: true,
        googleMapsUrl: true,
        planStatus: true,
        trialEndsAt: true,
        connectionStatus: true,
        whatsappConnected: true,
        createdAt: true,
        loginPin: true,
        currentBoxCode: true,
        salesAgent: true,
      },
    });

    if (!barbershop) {
      return NextResponse.json({ error: "Barbería no encontrada" }, { status: 404 });
    }

    // 2. Obtener equipo / barberos (BarberStaff)
    const staff = await prisma.barberStaff.findMany({
      where: { barbershopId },
      orderBy: { name: "asc" },
    });

    const staffMap = new Map(staff.map((s) => [s.id, s.name]));

    // 3. Obtener clientes (BarberCustomer)
    const customers = await prisma.barberCustomer.findMany({
      where: { barbershopId },
      orderBy: { lastVisitAt: { sort: "desc", nulls: "last" } },
    });

    const customerIds = customers.map((c) => c.id);
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // 4. Obtener todas las visitas/cortes (BarberVisit) dentro del rango o completas
    const visitWhere: any = {
      customerId: { in: customerIds },
    };

    if (startDate && endDate) {
      visitWhere.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const visits = await prisma.barberVisit.findMany({
      where: visitWhere,
      orderBy: { createdAt: "desc" },
    });

    // 5. Formatear datos para exportación completa
    const exportData = {
      exportedAt: new Date().toISOString(),
      filtroPeriodo: startDate && endDate ? {
        desde: startDate.toISOString(),
        hasta: endDate.toISOString(),
        mes: monthParam,
        anio: yearParam
      } : "HISTORIAL_COMPLETO",
      barbershop: {
        id: barbershop.id,
        nombre: barbershop.name,
        whatsapp: barbershop.whatsappNumber,
        cortesRequeridosPremio: barbershop.requiredCuts,
        googleMapsUrl: barbershop.googleMapsUrl,
        planStatus: barbershop.planStatus,
        connectionStatus: barbershop.connectionStatus,
        codigoCajaActual: barbershop.currentBoxCode,
        fechaRegistro: barbershop.createdAt,
      },
      barberos: staff.map((s) => ({
        id: s.id,
        nombre: s.name,
        rol: s.role,
      })),
      clientes: customers.map((c) => ({
        id: c.id,
        nombre: c.name || "Sin nombre",
        whatsapp: c.whatsapp,
        cortesAcumulados: c.cutsCount,
        estadoSesion: c.sessionState,
        ultimaVisita: c.lastVisitAt ? c.lastVisitAt.toISOString() : null,
        primeraResenaEnviada: c.firstReviewSent,
      })),
      visitasYResenas: visits.map((v) => {
        const cust = v.customerId ? customerMap.get(v.customerId) : undefined;
        return {
          id: v.id,
          clienteId: v.customerId ?? "CF",
          clienteNombre: cust?.name || (v.customerId ? "Desconocido" : "Consumidor Final"),
          clienteWhatsapp: cust?.whatsapp || "",
          barberoId: v.staffId,
          barberoNombre: v.staffId ? staffMap.get(v.staffId) || "No asignado" : "No asignado",
          estrellasRating: v.rating,
          comentario: v.comment,
          estado: v.status,
          fecha: v.createdAt.toISOString(),
        };
      }),
    };

    const periodStr = monthParam && yearParam ? `_${yearParam}_mes${monthParam.padStart(2, '0')}` : "_todos_los_tiempos";

    if (formatParam === "excel" || formatParam === "csv") {
      // Crear un nuevo libro de Excel nativo (.xlsx)
      const workbook = XLSX.utils.book_new();

      // --- MÉTICAS AVANZADAS PARA RESUMEN EJECUTIVO ---
      const now = new Date();
      const approvedVisits = visits.filter((v) => v.status === "APPROVED");
      const totalVisitsCount = approvedVisits.length;
      
      // Días desde la última visita para cada cliente
      const customerHealth = customers.map((c) => {
        let daysSince = 999;
        if (c.lastVisitAt) {
          const diffMs = now.getTime() - new Date(c.lastVisitAt).getTime();
          daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }
        return {
          ...c,
          daysSince,
        };
      });

      const activeCustomers = customerHealth.filter((c) => c.daysSince <= 25);
      const readyForFollowup = customerHealth.filter((c) => c.daysSince > 25 && c.daysSince <= 45); // Tiempo óptimo para enviar mensaje por WhatsApp
      const inactiveCustomers = customerHealth.filter((c) => c.daysSince > 45);

      // Distribución de calificaciones
      const ratingsCount = [0, 0, 0, 0, 0];
      approvedVisits.forEach((v) => {
        if (v.rating && v.rating >= 1 && v.rating <= 5) {
          ratingsCount[v.rating - 1]++;
        }
      });

      const totalRated = ratingsCount.reduce((a, b) => a + b, 0);
      const avgOverallRating = totalRated > 0
        ? (approvedVisits.reduce((acc, v) => acc + (v.rating ?? 0), 0) / totalRated).toFixed(2)
        : "N/A";

      // 0. Pestaña: Resumen Ejecutivo & Decisiones de Negocio
      const summaryMetricsData = [
        { "Métrica / Indicador": "🏆 Total de Visitas Aprobadas", "Resultado": totalVisitsCount, "Nivel / Estado": "█".repeat(Math.min(Math.round(totalVisitsCount / 10), 10)), "Recomendación Comercial": "Servicios acumulados en el periodo." },
        { "Métrica / Indicador": "⭐ Calificación Promedio General", "Resultado": `${avgOverallRating} / 5.0`, "Nivel / Estado": avgOverallRating !== "N/A" ? "█".repeat(Math.round(Number(avgOverallRating))) + "░".repeat(5 - Math.round(Number(avgOverallRating))) : "N/A", "Recomendación Comercial": Number(avgOverallRating) >= 4.5 ? "Excelente satisfacción de clientes" : "Revisar comentarios de barberos" },
        { "Métrica / Indicador": "🟢 Clientes Activos (Últimos 25 días)", "Resultado": activeCustomers.length, "Nivel / Estado": "█".repeat(Math.min(activeCustomers.length, 10)), "Recomendación Comercial": "Clientes recurrentes con hábito activo." },
        { "Métrica / Indicador": "📲 IDEAL PARA MENSAJE DE SEGUIMIENTO (25-45 días sin venir)", "Resultado": readyForFollowup.length, "Nivel / Estado": "🔥 " + "█".repeat(Math.min(readyForFollowup.length, 10)), "Recomendación Comercial": "¡MOMENTO PERFECTO! Enviar recordatorio por WhatsApp este fin de semana." },
        { "Métrica / Indicador": "⚠️ Clientes Inactivos (+45 días sin venir)", "Resultado": inactiveCustomers.length, "Nivel / Estado": "█".repeat(Math.min(inactiveCustomers.length, 10)), "Recomendación Comercial": "Enviar oferta especial o promoción de reactivación." },
        { "Métrica / Indicador": "5 Estrellas ⭐⭐⭐⭐⭐", "Resultado": `${ratingsCount[4]} (${totalRated > 0 ? Math.round((ratingsCount[4]/totalRated)*100) : 0}%)`, "Nivel / Estado": "█".repeat(Math.min(ratingsCount[4], 10)), "Recomendación Comercial": "Clientes altamente promotores." },
        { "Métrica / Indicador": "1-3 Estrellas (A Mejorar)", "Resultado": `${ratingsCount[0] + ratingsCount[1] + ratingsCount[2]}`, "Nivel / Estado": "░".repeat(10), "Recomendación Comercial": "Revisar detalles en pestaña 'Visitas y Reseñas'." },
      ];

      const summarySheet = XLSX.utils.json_to_sheet(summaryMetricsData);
      summarySheet["!cols"] = [
        { wch: 45 }, // Métrica
        { wch: 22 }, // Resultado
        { wch: 18 }, // Nivel / Estado
        { wch: 55 }, // Recomendación Comercial
      ];
      XLSX.utils.book_append_sheet(workbook, summarySheet, "📊 Resumen Ejecutivo");

      // 1. Pestaña: Visitas y Reseñas
      const visitsData = visits.map((v) => {
        const cust = v.customerId ? customerMap.get(v.customerId) : undefined;
        return {
          "Fecha y Hora": new Date(v.createdAt).toLocaleString("es-EC"),
          "Cliente": cust?.name || (v.customerId ? "Sin Nombre" : "Consumidor Final"),
          "WhatsApp Cliente": cust?.whatsapp || "",
          "Barbero Asignado": v.staffId ? staffMap.get(v.staffId) || "No asignado" : "No asignado",
          "Estado de Visita": v.status === "APPROVED" ? "Aprobado" : v.status,
          "Estrellas": v.rating !== null ? `${v.rating} ⭐` : "Sin calificar",
          "Comentario / Reseña": v.comment || "",
        };
      });
      const visitsSheet = XLSX.utils.json_to_sheet(visitsData);

      // Ajustar ancho de columnas para Visitas
      visitsSheet["!cols"] = [
        { wch: 22 }, // Fecha
        { wch: 25 }, // Cliente
        { wch: 18 }, // WhatsApp
        { wch: 20 }, // Barbero
        { wch: 15 }, // Estado
        { wch: 14 }, // Estrellas
        { wch: 40 }, // Comentario
      ];

      XLSX.utils.book_append_sheet(workbook, visitsSheet, "Visitas y Reseñas");

      // 2. Pestaña: Clientes
      const customersData = customers.map((c) => ({
        "Nombre del Cliente": c.name || "Sin nombre",
        "Número WhatsApp": c.whatsapp,
        "Cortes Acumulados": c.cutsCount,
        "Última Visita": c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleString("es-EC") : "Sin visitas",
        "Reseña Enviada": c.firstReviewSent ? "Sí" : "No",
      }));
      const customersSheet = XLSX.utils.json_to_sheet(customersData);
      customersSheet["!cols"] = [
        { wch: 28 },
        { wch: 18 },
        { wch: 18 },
        { wch: 22 },
        { wch: 16 },
      ];
      XLSX.utils.book_append_sheet(workbook, customersSheet, "Directorio Clientes");

      // 3. Pestaña: Barberos con métricas de estrellas, volumen y barras visuales de rendimiento
      const maxCuts = Math.max(...staff.map(s => visits.filter(v => v.staffId === s.id && v.status === "APPROVED").length), 1);

      const staffData = staff.map((s) => {
        const staffVisits = visits.filter((v) => v.staffId === s.id && v.status === "APPROVED");
        const ratedVisits = staffVisits.filter((v) => v.rating !== null);
        
        const numRating = ratedVisits.length > 0
          ? (ratedVisits.reduce((acc, v) => acc + (v.rating ?? 0), 0) / ratedVisits.length)
          : 0;

        const avgRating = ratedVisits.length > 0 ? numRating.toFixed(1) : "Sin calificar";

        // Generar barra visual de estrellas (Gráfico de barras en texto)
        let ratingVisualBar = "░░░░░";
        if (numRating > 0) {
          const filled = Math.round(numRating);
          ratingVisualBar = "█".repeat(filled) + "░".repeat(5 - filled);
        }

        // Generar barra visual de volumen de cortes comparativo respecto al barbero con más cortes
        const cutsPercent = Math.round((staffVisits.length / maxCuts) * 10);
        const cutsVisualBar = "█".repeat(cutsPercent) + "░".repeat(10 - cutsPercent);

        return {
          "Nombre Barbero": s.name,
          "Rol": s.role,
          "Promedio Estrellas": avgRating !== "Sin calificar" ? `${avgRating} ⭐` : "Sin calificar",
          "Gráfico Estrellas": ratingVisualBar,
          "Total Calificaciones": ratedVisits.length,
          "Cortes Atendidos": staffVisits.length,
          "Gráfico Volumen Cortes": cutsVisualBar,
        };
      });
      const staffSheet = XLSX.utils.json_to_sheet(staffData);
      staffSheet["!cols"] = [
        { wch: 25 }, // Nombre
        { wch: 15 }, // Rol
        { wch: 20 }, // Promedio Estrellas
        { wch: 18 }, // Gráfico Estrellas
        { wch: 22 }, // Total Calificaciones
        { wch: 18 }, // Cortes Atendidos
        { wch: 24 }, // Gráfico Volumen Cortes
      ];
      XLSX.utils.book_append_sheet(workbook, staffSheet, "Equipo Barberos");

      // 4. Pestaña: Datos Barbería
      const barbershopData = [
        { "Propiedad": "Barbería", "Valor": barbershop.name },
        { "Propiedad": "WhatsApp Registrado", "Valor": barbershop.whatsappNumber },
        { "Propiedad": "Cortes Requeridos para Premio", "Valor": barbershop.requiredCuts },
        { "Propiedad": "Código de Caja Actual", "Valor": barbershop.currentBoxCode },
        { "Propiedad": "Estado del Plan", "Valor": barbershop.planStatus },
        { "Propiedad": "Fecha de Registro", "Valor": new Date(barbershop.createdAt).toLocaleDateString("es-EC") },
      ];
      const barbershopSheet = XLSX.utils.json_to_sheet(barbershopData);
      barbershopSheet["!cols"] = [{ wch: 30 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, barbershopSheet, "Info Barbería");

      // Generar buffer de Excel .xlsx
      const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      const excelFileName = `reporte_${barbershop.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}${periodStr}.xlsx`;

      return new NextResponse(excelBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${excelFileName}"`,
        },
      });
    }

    const fileName = `respaldo_${barbershop.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}${periodStr}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("[Export API] Error exporting barbershop data:", error);
    return NextResponse.json(
      { error: "Error al exportar los datos de la barbería." },
      { status: 500 }
    );
  }
}
