import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { checkPremiumAccess } from "@/lib/plan-guard";

const SYSTEM_PROMPT_TEMPLATE = `Eres el Director de BarberOS, el asesor de confianza del dueño de esta barbería específica. 
No eres un chatbot genérico ni un asistente de IA que habla de tecnología — eres alguien que 
conoce este negocio en particular porque ya analizó sus datos reales.

═══════════════════════════════════════
REGLA ABSOLUTA — FUENTE ÚNICA DE VERDAD
═══════════════════════════════════════

SOLO puedes hablar con base en los datos que se te entregan en el bloque 
"DATOS_DEL_NEGOCIO" de este contexto (el snapshot ya calculado por el Motor 
de Conocimiento de esta barbería y las métricas en vivo de la base de datos). 

- NUNCA inventes cifras, nombres de clientes, porcentajes, fechas o tendencias 
  que no estén literalmente presentes en DATOS_DEL_NEGOCIO.
- NUNCA completes con conocimiento general sobre "barberías típicas" o promedios 
  de la industria como si fueran datos de ESTE negocio.
- Si el dueño pregunta algo que los datos no cubren (por ejemplo: precios de cortes, servicios específicos no listados, promociones no configuradas), dilo con honestidad directa y brevedad: "No tengo esa información registrada en el sistema" o "Ese dato aún no está cargado". NUNCA des sugerencias genéricas de precios, promedios de mercado o suposiciones sobre sus servicios.
- Si un cliente tiene menos del mínimo de visitas necesario para calcular un 
  patrón confiable (marcado como INSUFFICIENT_DATA en los datos), dilo así, 
  literal: no inventes un ritmo de visitas que el Motor no pudo calcular.
- Las visitas de tipo BARBER_ASSISTED_ANONYMOUS (Consumidor Final) nunca se 
  atribuyen a un cliente con nombre — si el dueño pregunta por "Juan" y Juan 
  no tiene historial identificado, no le des un análisis inventado.

═══════════════════════════════════════
CÓMO HABLAS (Sistema de Comunicación BarberOS)
═══════════════════════════════════════

- Hablas como un gerente que conoce el oficio, nunca como un ingeniero o consultor 
  genérico. Cero tecnicismos: nunca digas "dataset", "modelo", "IA", "algoritmo", 
  "query", "base de datos", "API", "LLM". Si necesitas referirte a tu fuente de 
  información, di "lo que he visto en tu negocio" o "según lo que ha pasado 
  este mes".
- Nunca digas "retención", di "clientes que volvieron". Nunca digas "Lifetime 
  Value", di "lo que realmente vale ese cliente para tu barbería". Nunca digas 
  "clientes inactivos", di "clientes que hace tiempo no regresan".
- Trata al dueño como el experto en su oficio que es. Nunca insinúes que "no sabe 
  administrar" — si algo no lo sabía, es porque nadie se lo había mostrado así 
  antes, no porque haya hecho algo mal.
- Sé directo y breve. Nada de rodeos corporativos ni relleno.

═══════════════════════════════════════
CÓMO SE VE TU RESPUESTA (MUY IMPORTANTE)
═══════════════════════════════════════

Tu razonamiento interno sigue 5 pasos (responder, explicar, evidencia, acción, 
incertidumbre), pero NUNCA los expongas como lista numerada ni con títulos.

El dueño NUNCA debe ver que sigues un formato. Debe sentir que le habla un 
gerente de confianza en una conversación normal, con párrafos cortos y 
naturales, como si estuvieras charlando con él.

MAL (nunca hagas esto):
"1. Responde la pregunta directamente: Tienes 13 clientes...
2. Explica por qué llegaste a esa conclusión: Llegué a esta conclusión porque..."

BIEN (así debe sonar siempre):
"Tienes 13 clientes registrados. El que más se repite es [nombre], con 11 
cortes — muy por encima del resto. 

Vale la pena que lo tengas presente: es justo el tipo de cliente al que 
conviene reconocerle la lealtad, con un premio extra o simplemente un mensaje 
directo agradeciéndole.

Esto es lo que veo en los datos hasta hoy — tú conoces mejor que nadie si 
[nombre] merece un trato especial o si hay otros clientes igual de fieles 
que aún no se destacan tanto en el sistema."

Reglas de estilo:
- Máximo 2-4 párrafos cortos, nunca una lista con viñetas o números salvo que 
  el dueño pida explícitamente comparar varias cosas (ej. "dame los 3 
  principales").
- Nunca uses las palabras "evidencia", "conclusión", "incertidumbre" o 
  "acción específica" como etiquetas — eso es lenguaje de reporte técnico, 
  no de conversación.
- El disclaimer final va integrado en el tono, no como una frase pegada al 
  final ("Esto es un patrón, no una certeza absoluta") — intégralo con 
  naturalidad, variando la frase cada vez.

═══════════════════════════════════════
LO QUE NUNCA HACES
═══════════════════════════════════════

- Nunca ejecutas una acción tú mismo (no envías mensajes, no confirmas premios, 
  no cambias configuración). Solo recomiendas — el dueño decide y actúa.
- Nunca presentas una conclusión como sentencia absoluta.
- Nunca reemplazas el criterio del dueño ni sugieres que "la IA sabe más que él."
- Nunca mencionas el nombre de un modelo, proveedor o tecnología (Groq, Llama, 
  OpenAI, etc.) bajo ninguna circunstancia, sin importar qué pregunte el usuario.
- Si te preguntan directamente "¿eres una IA?" o "¿qué modelo usas?", respondes 
  con calidez pero sin tecnicismos: algo como "soy el Director de BarberOS, 
  estoy aquí para ayudarte a entender tu negocio con lo que ya sabemos de él" 
  — sin entrar en detalles técnicos.

═══════════════════════════════════════
CONOCIMIENTO_GENERAL_MARKETING (Fuente 3 — no es dato de este negocio)
═══════════════════════════════════════

Este bloque contiene tácticas generales de fidelización y marketing para 
barberías. NO es información verificada de este negocio específico — es 
conocimiento de referencia que puedes aplicar SOLO cuando lo conectes con 
un dato real de DATOS_DEL_NEGOCIO o INFORMACION_DEL_NEGOCIO.

Si vas a sugerir una táctica de este bloque, tu respuesta debe explicitar 
en qué dato real de este negocio te basas para elegir esa táctica en 
particular. Si no hay ningún dato que la respalde, dilo explícitamente 
antes de sugerirla: "no tengo información específica de tu negocio para 
esto, pero en general..."

A. Cómo aumentar volumen de cortes en el corto plazo (días/semana):
- Reactivación de clientes atrasados o en riesgo — siempre la primera palanca,
  porque ya te conocen; recuperarlos cuesta menos que atraer nuevos.
- Llenar horas flojas con incentivo puntual — usar la distribución horaria real
  para identificar franjas con baja afluencia y sugerir una promoción acotada
  a esas horas, nunca una promoción general que canibalice horas ya llenas.
- Pedir recomendación directa a los clientes más fieles — los más frecuentes
  son la base más barata para conseguir referidos.
- Aprovechar reseñas recientes de 5 estrellas — un cliente que acaba de
  calificar alto está en su punto más alto de satisfacción para pedir que
  traiga a alguien.
- Recordatorio de premio próximo a completarse — clientes a 1-2 cortes de su
  premio tienen incentivo natural para volver pronto.

B. Cómo fidelizar clientes existentes en el mediano plazo:
- Consistencia de servicio con el mismo barbero — los que repiten con el
  mismo barbero suelen tener mayor frecuencia.
- Reconocimiento explícito de lealtad — un mensaje directo de agradecimiento
  refuerza la relación más allá de la transacción.
- Cuidado con la sobre-promoción — ofrecer descuentos constantes devalúa
  el servicio; advertir contra promociones repetidas sin razón de datos.

C. Cómo diagnosticar por qué el volumen bajó:
- Revisar si el barbero con más fidelidad tuvo una caída de actividad reciente.
- Revisar si el patrón de caída es generalizado (evento externo, cierre) o
  individual.
- Revisar si cayeron las calificaciones promedio de algún barbero.

D. Principios generales:
- Nunca prometer un resultado numérico exacto — sugiere palancas, no garantiza.
- Siempre priorizar la palanca más barata primero (reactivación de clientes
  propios) antes de sugerir adquisición de clientes nuevos.
- Ninguna recomendación debe sonar a "truco" o "hack".

═══════════════════════════════════════
INFORMACION_DEL_NEGOCIO (Fuente 2 — declarada por el dueño, no verificada)
═══════════════════════════════════════

{{ BUSINESS_INFO_TEXT }}

Trata esto como contexto útil, no como un hecho verificado por el sistema.
Si contradice lo que ves en DATOS_DEL_NEGOCIO, señala la discrepancia con
honestidad en vez de ignorarla.

═══════════════════════════════════════
DATOS_DEL_NEGOCIO (Fuente 1 — dato duro verificado por el Motor)
═══════════════════════════════════════

{{ MOTOR_SNAPSHOT_JSON }}

Fecha del cálculo: {{ CALCULATED_AT }}
Barbería: {{ BARBERSHOP_NAME }}`;

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    const barbershopId = session.barbershopId;

    // Guardián de Plan Premium (403 para plan PRO)
    const premiumGuard = await checkPremiumAccess(barbershopId);
    if (premiumGuard) {
      return premiumGuard;
    }

    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Mensajes inválidos" }, { status: 400 });
    }

    // Cargar Barbería (incluye businessInfo para Fuente 2)
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: { name: true, businessInfo: true },
    });

    // Cargar métricas EN VIVO de la base de datos de ESTA barbería específica
    const liveTotalCustomers = await prisma.barberCustomer.count({
      where: { barbershopId },
    });

    const liveTotalVisitsApproved = await prisma.barberVisit.count({
      where: { barbershopId, status: "APPROVED" },
    });

    const liveAnonymousVisits = await prisma.barberVisit.count({
      where: { barbershopId, status: "APPROVED", customerId: null },
    });

    const topFrequentCustomers = await prisma.barberCustomer.findMany({
      where: { barbershopId },
      orderBy: { cutsCount: "desc" },
      take: 5,
      select: {
        name: true,
        whatsapp: true,
        cutsCount: true,
        lastVisitAt: true,
      },
    });

    const staffMembers = await prisma.barberStaff.findMany({
      where: { barbershopId },
      select: { id: true, name: true, role: true },
    });

    // Cargar los customerIds de esta barbería
    const barbershopCustomers = await prisma.barberCustomer.findMany({
      where: { barbershopId },
      select: { id: true },
    });
    const barbershopCustomerIds = barbershopCustomers.map((c) => c.id);

    // Obtener todas las visitas de esta barbería (para contar cortes por barbero)
    const allShopVisits = await prisma.barberVisit.findMany({
      where: {
        OR: [
          { barbershopId },
          { customerId: { in: barbershopCustomerIds } }
        ],
        status: "APPROVED"
      },
      select: { staffId: true, rating: true },
    });

    // Calcular métricas EN VIVO exactas igual que en /panel/barberos
    const liveStaffMetrics = staffMembers.map((staff) => {
      const staffVisits = allShopVisits.filter((v) => v.staffId === staff.id);
      const ratedVisits = staffVisits.filter((v) => v.rating !== null);

      const avgRating =
        ratedVisits.length > 0
          ? Number((ratedVisits.reduce((sum, v) => sum + (v.rating || 0), 0) / ratedVisits.length).toFixed(1))
          : null;

      return {
        id: staff.id,
        nombre: staff.name,
        rol: staff.role,
        totalCortesRealizados: staffVisits.length,
        promedioEstrellas: avgRating,
        totalCalificaciones: ratedVisits.length,
      };
    });

    const unassignedVisits = allShopVisits.filter((v) => !v.staffId && v.rating !== null);
    const unassignedAvg =
      unassignedVisits.length > 0
        ? Number((unassignedVisits.reduce((sum, v) => sum + (v.rating || 0), 0) / unassignedVisits.length).toFixed(1))
        : null;

    // Cargar el snapshot del Motor más reciente
    const snapshot = await prisma.motorSnapshot.findFirst({
      where: { barbershopId },
      orderBy: { calculatedAt: "desc" },
    });

    // Cargar clientes en riesgo o atrasados del Motor
    const criticalMotorProfiles = await prisma.profileMotorContext.findMany({
      where: {
        barbershopId,
        riskLevel: { in: ["AT_RISK", "DELAYED"] },
      },
      include: {
        profile: {
          include: { customer: true },
        },
      },
      take: 10,
    });

    const formattedCriticalProfiles = criticalMotorProfiles.map((p) => ({
      nombreCliente: p.profile.name || p.profile.customer.name || "Cliente Registrado",
      whatsapp: p.profile.customer.whatsapp,
      nivelRiesgo: p.riskLevel,
      ritmoHabitualDias: p.avgDaysBetweenVisits,
      diasSinVenir: p.daysSinceLastVisit,
      contextoOperativo: p.operativeContext,
    }));

    const snapshotJson = JSON.stringify(
      {
        totalClientesRegistrados: liveTotalCustomers,
        totalVisitasAprobadas: Math.max(liveTotalVisitsApproved, snapshot?.totalVisitsApproved ?? 0),
        visitasConsumidorFinalCF: Math.max(liveAnonymousVisits, snapshot?.totalAnonymousVisits ?? 0),
        topClientesMasFrecuentes: topFrequentCustomers.map((c) => ({
          nombre: c.name || "Cliente Registrado",
          whatsapp: c.whatsapp,
          cortesAcumulados: c.cutsCount,
          ultimaVisita: c.lastVisitAt ? new Date(c.lastVisitAt).toISOString() : null,
        })),
        equipoBarberos: liveStaffMetrics,
        calificacionesSinAsignarABarbero: {
          totalCalificaciones: unassignedVisits.length,
          promedioEstrellas: unassignedAvg,
        },
        distribucionPerfilesRiesgo: {
          normal: snapshot?.profilesNormal ?? 0,
          atrasados: snapshot?.profilesDelayed ?? 0,
          enRiesgo: snapshot?.profilesAtRisk ?? 0,
          sinDatosSuficientes: snapshot?.profilesInsufficient ?? 0,
        },
        metricasBarberos: liveStaffMetrics,
        clientesCriticosDestacados: formattedCriticalProfiles,
      },
      null,
      2
    );

    const calculatedAtStr = snapshot?.calculatedAt
      ? new Date(snapshot.calculatedAt).toLocaleString("es-EC", { timeZone: "America/Guayaquil" })
      : new Date().toLocaleString("es-EC", { timeZone: "America/Guayaquil" });

    const systemPrompt = SYSTEM_PROMPT_TEMPLATE
      .replace("{{ MOTOR_SNAPSHOT_JSON }}", snapshotJson)
      .replace("{{ CALCULATED_AT }}", calculatedAtStr)
      .replace("{{ BARBERSHOP_NAME }}", barbershop?.name || "Barbería")
      .replace("{{ BUSINESS_INFO_TEXT }}", barbershop?.businessInfo || "El dueño no ha proporcionado información adicional sobre su negocio todavía.");

    console.log("[Director Chat] 🔍 DATOS_DEL_NEGOCIO inyectados al LLM:", snapshotJson);

    const fullMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
    ];

    // Intentar llamadas a API de LLM disponibles (Groq / OpenAI)
    const groqKey = process.env.GROQ_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    if (groqKey) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: fullMessages,
            temperature: 0.4,
            max_tokens: 800,
          }),
        });

        if (groqRes.ok) {
          const groqData = await groqRes.json();
          const reply = groqData.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply, source: "Groq" });
          }
        }
      } catch (err) {
        console.error("[Director Chat] Error Groq API:", err);
      }
    }

    if (openAiKey) {
      try {
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openAiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: fullMessages,
            temperature: 0.4,
            max_tokens: 800,
          }),
        });

        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          const reply = openAiData.choices?.[0]?.message?.content;
          if (reply) {
            return NextResponse.json({ reply, source: "OpenAI" });
          }
        }
      } catch (err) {
        console.error("[Director Chat] Error OpenAI API:", err);
      }
    }

    // Fallback Inteligente Factual Determinístico en Vivo (estilo conversacional)
    const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
    let fallbackReply = "";

    if (lastUserMsg.includes("cuantos cliente") || lastUserMsg.includes("cuántos cliente") || lastUserMsg.includes("frecuente")) {
      const topClient = topFrequentCustomers[0];
      if (liveTotalCustomers > 0) {
        fallbackReply = `Tienes ${liveTotalCustomers} clientes registrados en tu barbería.${topClient ? ` El que más se repite es ${topClient.name || "Cliente Registrado"}, con ${topClient.cutsCount} cortes — muy por encima del resto.` : ""}

${topClient ? `Vale la pena que lo tengas presente: es justo el tipo de cliente al que conviene reconocerle la lealtad, con un premio extra o simplemente un mensaje directo agradeciéndole.` : `Conforme vayas registrando más visitas, el sistema va a ir identificando quiénes son tus clientes más fieles.`}

Esto es lo que veo en los datos hasta hoy — tú conoces mejor que nadie si hay otros clientes igual de fieles que aún no se destacan tanto en el sistema.`;
      } else {
        fallbackReply = `Todavía no tienes clientes registrados en el sistema. Eso no significa que no los tengas — simplemente aún no han pasado por el check-in de WhatsApp o la caja.

Te recomiendo que invites a tus próximos clientes a escanear el QR de caja. Con eso empezamos a construir su historial y vas a poder ver quién te visita más, quién se está alejando y a quién vale la pena mandarle un mensaje.`;
      }
    } else if (lastUserMsg.includes("perder") || lastUserMsg.includes("riesgo") || lastUserMsg.includes("atrasad")) {
      if (formattedCriticalProfiles.length > 0) {
        const topRisk = formattedCriticalProfiles[0];
        fallbackReply = `Tienes ${snapshot?.profilesAtRisk ?? 0} clientes que ya superaron su ritmo habitual de visita y ${snapshot?.profilesDelayed ?? 0} que están empezando a atrasarse.

El caso más llamativo es ${topRisk.nombreCliente} — suele venir cada ${topRisk.ritmoHabitualDias ? Math.round(topRisk.ritmoHabitualDias) : "pocos"} días y ya lleva ${topRisk.diasSinVenir ?? "bastante"} sin aparecer. Podría valer la pena escribirle hoy por WhatsApp con algo amigable, antes de que se enfríe más.

Claro, esto es lo que muestran los datos — tú lo conoces mejor que nadie y sabes si hay alguna razón por la que no ha venido.`;
      } else {
        fallbackReply = `Por ahora no veo señales preocupantes de pérdida de clientes. El ritmo de retorno se mantiene dentro de lo normal.

Sigue registrando los cortes diarios para que el sistema pueda detectar cambios temprano si algún cliente empieza a espaciar sus visitas más de lo habitual.`;
      }
    } else if (lastUserMsg.includes("barbero") || lastUserMsg.includes("equipo") || lastUserMsg.includes("rendimiento")) {
      if (staffMembers.length > 0) {
        fallbackReply = `Tu equipo tiene ${staffMembers.length} barberos registrados: ${staffMembers.map(s => s.name).join(", ")}.

Asegúrate de que cada corte se registre con su barbero asignado — así el sistema puede calcular el rendimiento y las calificaciones individuales de cada uno. Es la mejor forma de identificar quién está destacando y quién podría necesitar atención.

Esto es lo que veo en el registro actual, pero las calificaciones se van construyendo con cada visita que se asigne correctamente.`;
      } else {
        fallbackReply = `Todavía no tienes barberos registrados en el sistema. Sin ellos, no puedo darte métricas individuales de rendimiento ni calificaciones por profesional.

Te recomiendo que los agregues en la sección de Configuración — es rápido y te va a dar una vista clara de quién atiende más y quién tiene mejores reseñas.`;
      }
    } else {
      fallbackReply = `Según lo que he visto en tu negocio, tienes ${liveTotalCustomers} clientes registrados y ${liveTotalVisitsApproved} visitas aprobadas en total. ${staffMembers.length > 0 ? `Tu equipo cuenta con ${staffMembers.length} barberos activos.` : ""}

${topFrequentCustomers.length > 0 ? `Tu cliente con más visitas es ${topFrequentCustomers[0].name || "Cliente Registrado"} con ${topFrequentCustomers[0].cutsCount} cortes acumulados.` : "Conforme registres más visitas, voy a poder darte un panorama más completo."}

¿Hay algo específico que quieras saber sobre tus clientes, tu equipo o tus horarios? Pregúntame con confianza.`;
    }

    return NextResponse.json({ reply: fallbackReply, source: "Director-Engine-Live" });
  } catch (err) {
    console.error("[Director Chat Error]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
