import { prisma } from "@/lib/prisma";

export interface MotorSnapshotData {
  barbershopId: string;
  calculatedAt: Date | string | null;
  snapshotDate: Date | string | null;
  totalVisitsApproved: number;
  totalAnonymousVisits: number;
  visitsByHour: Record<string, number>;
  profiles: {
    normal: number;
    delayed: number;
    atRisk: number;
    insufficient: number;
    total: number;
  };
  staffMetrics: Array<{
    staffId: string;
    staffName: string;
    totalCuts: number;
    avgRating: number | null;
  }>;
  criticalProfiles?: Array<{
    profileId: string;
    profileName: string;
    whatsapp: string;
    riskLevel: string;
    avgDaysBetweenVisits: number | null;
    daysSinceLastVisit: number | null;
  }>;
  scheduleGaps?: Array<{
    franja: string;
    horaInicio: number;
    horaFin: number;
    duracionMinutos: number;
    cortesPerdidos: number;
  }>;
}

export interface AIRecommendation {
  id: string;
  type: "REACTIVATION" | "CAPACITY" | "STAFF" | "SCHEDULE_GAP" | "GENERAL";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  disclaimer?: string;
  actionText?: string;
  actionUrl?: string;
  whatsappMessage?: string;
  targetWhatsapp?: string;
}

export interface DirectorResponse {
  isGenerativeLLM: boolean;
  modelUsed: string;
  recommendations: AIRecommendation[];
}

const DEFAULT_DISCLAIMER = "⚠️ Esto es una seal signs detectada en los datos del Motor, no una certeza absoluta. Revisa la situacion y toma la decision final como dueno de la barberia.";

// ─────────────────────────────────────────────────────────────────────────────
// SECCION 1 — PLANTILLAS FACTUALES (deterministico, sin IA)
// El codigo arma estos strings desde el snapshot. El LLM solo recibe estos datos
// y no puede alterarlos. Arquitectura: plantilla + relleno.
// ─────────────────────────────────────────────────────────────────────────────

interface FactualBlock {
  type: "REACTIVATION" | "CAPACITY" | "STAFF" | "SCHEDULE_GAP";
  /** Texto factual armado por codigo — contiene cifras reales del snapshot, NO pasa por el LLM */
  factualText: string;
  profileId?: string;
  profileName?: string;
  whatsapp?: string;
  riskLevel?: string;
  peakHour?: number;
  peakCount?: number;
  offPeakHour?: number;
  offPeakCount?: number;
  staffId?: string;
  staffName?: string;
  avgRating?: number | null;
  totalCuts?: number;
}

function buildFactualBlocks(snapshot: MotorSnapshotData): FactualBlock[] {
  const blocks: FactualBlock[] = [];

  // REACTIVATION
  if (snapshot.criticalProfiles && snapshot.criticalProfiles.length > 0) {
    const target = snapshot.criticalProfiles.filter(
      p => p.riskLevel === "AT_RISK" || p.riskLevel === "DELAYED"
    );
    target.forEach(profile => {
      const days = profile.daysSinceLastVisit ?? 0;
      const avg = profile.avgDaysBetweenVisits ?? 15;
      const overdue = days - avg;
      const riskLabel = profile.riskLevel === "AT_RISK" ? "Riesgo Critico" : "Atrasado";
      blocks.push({
        type: "REACTIVATION",
        factualText: `[FACTUAL] Cliente: ${profile.profileName} | Riesgo: ${riskLabel} | ` +
          `Dias sin visita: ${days} | Ritmo habitual: ${avg}d | ` +
          `Dias de exceso: ${overdue > 0 ? `+${Math.round(overdue)}` : "0"} | ` +
          `Telefono: ${profile.whatsapp}`,
        profileId: profile.profileId,
        profileName: profile.profileName,
        whatsapp: profile.whatsapp,
        riskLevel: profile.riskLevel,
      });
    });
  }

  // CAPACITY
  const hours = snapshot.visitsByHour || {};
  const hourEntries = Object.entries(hours)
    .map(([h, count]) => ({ hour: parseInt(h), count: count as number }))
    .sort((a, b) => b.count - a.count);

  if (hourEntries.length > 0) {
    const peak = hourEntries[0];
    const offPeak = hourEntries[hourEntries.length - 1];
    if (peak && peak.count > 3) {
      blocks.push({
        type: "CAPACITY",
        factualText: `[FACTUAL] Tipo: Hora PICO | Franja: ${peak.hour}:00 | ` +
          `Visitas registradas: ${peak.count} | Umbral configurado: >3`,
        peakHour: peak.hour,
        peakCount: peak.count,
      });
    }
    if (offPeak && offPeak.count < 3 && offPeak.hour !== peak?.hour) {
      blocks.push({
        type: "CAPACITY",
        factualText: `[FACTUAL] Tipo: Hora BAJA | Franja: ${offPeak.hour}:00 | ` +
          `Visitas registradas: ${offPeak.count} | Umbral configurado: <3`,
        offPeakHour: offPeak.hour,
        offPeakCount: offPeak.count,
      });
    }
  }

  // STAFF
  if (snapshot.staffMetrics && snapshot.staffMetrics.length > 0) {
    const sorted = [...snapshot.staffMetrics]
      .filter(s => s.avgRating != null)
      .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
    const top = sorted[0];
    if (top && (top.avgRating ?? 0) >= 4.5) {
      blocks.push({
        type: "STAFF",
        factualText: `[FACTUAL] Barbero: ${top.staffName} | Rating promedio: ${(top.avgRating ?? 0).toFixed(1)}★ | ` +
          `Total cortes: ${top.totalCuts}`,
        staffId: top.staffId,
        staffName: top.staffName,
        avgRating: top.avgRating,
        totalCuts: top.totalCuts,
      });
    }
  }

  // SCHEDULE_GAP — Huecos detectados por el Motor
  if (snapshot.scheduleGaps && snapshot.scheduleGaps.length > 0) {
    for (const gap of snapshot.scheduleGaps) {
      blocks.push({
        type: "SCHEDULE_GAP",
        factualText: `[FACTUAL] Tipo: HUECO HORARIO | Franja: ${gap.franja} (${gap.horaInicio}:00-${gap.horaFin}:00) | ` +
          `Duración promedio del hueco: ${gap.duracionMinutos} min | ` +
          `Cortes que cabrían en ese hueco: ~${gap.cortesPerdidos}`,
      });
    }
  }

  return blocks;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCION 2 — FILTRO DE LENGUAJE CATEGORICO (red de seguridad sobre tono del LLM)
// No verifica cifras (ya no pasan por el LLM). Solo filtra frases prohibidas.
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORICAL_PHRASES = [
  /se\s+va\s+a\s+ir/gi,
  /definitivamente/gi,
  /seguro\s+que\s+no\s+vuelve/gi,
  /nunca\s+mas/gi,
  /ya\s+no\s+va\s+a\s+volver/gi,
  /vas\s+a\s+perder/gi,
  /te\s+va\s+a\s+dejar/gi,
];

const CATEGORICAL_REPLACEMENTS: Record<string, string> = {
  "se va a ir": "esta mostrando un patron de riesgo",
  "definitivamente": "parece",
  "seguro que no vuelve": "podria no regresar",
  "nunca mas": "no ha regresado aun",
  "ya no va a volver": "todavia no ha vuelto",
  "vas a perder": "podrias estar perdiendo",
  "te va a dejar": "mostro senales de alejamiento",
};

function applyCategoricalFilter(text: string): { text: string; filtered: boolean } {
  let filtered = false;
  let result = text;
  for (const pattern of CATEGORICAL_PHRASES) {
    if (pattern.test(result)) {
      result = result.replace(pattern, (match) => {
        const lower = match.toLowerCase();
        filtered = true;
        return CATEGORICAL_REPLACEMENTS[lower] ?? "[lenguaje de certeza reemplazado]";
      });
    }
  }
  return { text: result, filtered };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCION 3 — ENSAMBLAJE FINAL (concatenacion dato + tono)
// Aplica a los 3 tipos: REACTIVATION, CAPACITY, STAFF
// ─────────────────────────────────────────────────────────────────────────────

interface ToneResponse {
  title: string;
  description: string;
  whatsappMessage?: string | null;
}

function assembleRecommendation(
  block: FactualBlock,
  tone: ToneResponse,
  index: number
): AIRecommendation {
  const titleFiltered = applyCategoricalFilter(tone.title);
  const descFiltered = applyCategoricalFilter(tone.description);
  const waFiltered = tone.whatsappMessage
    ? applyCategoricalFilter(tone.whatsappMessage)
    : null;

  if (titleFiltered.filtered || descFiltered.filtered || (waFiltered?.filtered ?? false)) {
    console.warn(
      `[Director IA] ⚠️ LENGUAJE CATEGORICO FILTRADO en bloque ${index} (${block.type}): ` +
      `title=${titleFiltered.filtered} desc=${descFiltered.filtered} wa=${waFiltered?.filtered}`
    );
  }

  const base = {
    id: `${block.type.toLowerCase()}-${index}`,
    type: block.type as AIRecommendation["type"],
    disclaimer: DEFAULT_DISCLAIMER,
  };

  if (block.type === "REACTIVATION") {
    const waFactual = `¡Hola, ${block.profileName}!`;
    const waFinal = waFiltered ? `${waFactual} ${waFiltered.text}` : undefined;

    return {
      ...base,
      priority: block.riskLevel === "AT_RISK" ? "HIGH" : "MEDIUM",
      title: titleFiltered.text,
      description: `${block.factualText}\n\n${descFiltered.text}`,
      actionText: "Enviar mensaje de WhatsApp",
      targetWhatsapp: block.whatsapp,
      whatsappMessage: waFinal,
    };
  }

  if (block.type === "CAPACITY") {
    return {
      ...base,
      priority: "MEDIUM",
      title: titleFiltered.text,
      description: `${block.factualText}\n\n${descFiltered.text}`,
      actionText: "Revisar horarios",
      actionUrl: "/panel/configuracion",
    };
  }

  if (block.type === "SCHEDULE_GAP") {
    return {
      ...base,
      priority: "HIGH",
      title: titleFiltered.text,
      description: `${block.factualText}\n\n${descFiltered.text}`,
      actionText: "Revisar horarios",
      actionUrl: "/panel/configuracion",
    };
  }

  // STAFF
  return {
    ...base,
    priority: "LOW",
    title: titleFiltered.text,
    description: `${block.factualText}\n\n${descFiltered.text}`,
    actionText: "Felicitar al equipo",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCION 4 — MOTOR DE TONE (Groq / OpenAI)
// Recibe bloques factuales y devuelve SOLO tonos (title, description, whatsappMessage).
// Arquitectura: plantilla + relleno (Auditoria Fabel — Rediseño punto 4)
// ─────────────────────────────────────────────────────────────────────────────

interface TonePromptResult {
  tones: ToneResponse[];
  modelUsed: string;
}

const TONE_EXAMPLES = [
  {
    role: "user" as const,
    content: `Aqui tienes datos factuales de un cliente en riesgo. Redacta SOLO el tono (titulo, descripcion, mensaje WhatsApp). No repitas ni reformules las cifras que se te dan, solo redacta el tono alrededor de ellas.

[FACTUAL] Cliente: Esteban Paredes | Riesgo: Riesgo Critico | Dias sin visita: 35 | Ritmo habitual: 14d | Dias de exceso: +21 | Telefono: 593987654321

Devuelve SOLO JSON: {"tones": [{"title": "...", "description": "...", "whatsappMessage": "..."}]}`
  },
  {
    role: "assistant" as const,
    content: `{"tones": [{"title": "Señal de desconexión detectada", "description": "Notamos un distanciamiento en la frecuencia de este cliente. Enviar un recordatorio amistoso puede ayudar a retomar el ritmo habitual.", "whatsappMessage": "Hace un tiempo que no te vemos por la barbería. ✂️ ¡Te esperamos pronto para dejarte nítido! ¡Reserva hoy mismo!"}]}`
  },
  {
    role: "user" as const,
    content: `Aqui tienes datos factuales de una franja pico. Redacta SOLO el tono (titulo, descripcion). No repitas ni reformules las cifras que se te dan, solo redacta el tono alrededor de ellas.

[FACTUAL] Tipo: Hora PICO | Franja: 11:00 | Visitas registradas: 25 | Umbral configurado: >3

Devuelve SOLO JSON: {"tones": [{"title": "...", "description": "...", "whatsappMessage": null}]}`
  },
  {
    role: "assistant" as const,
    content: `{"tones": [{"title": "Alta demanda detectada", "description": "Esta es la franja con mayor volumen de clientes. Excelente oportunidad para asegurar que el equipo esté preparado.", "whatsappMessage": null}]}`
  },
  {
    role: "user" as const,
    content: `Aqui tienes datos factuales de un barbero destacado. Redacta SOLO el tono (titulo, descripcion). No repitas ni reformules las cifras que se te dan, solo redacta el tono alrededor de ellas.

[FACTUAL] Barbero: Carlos Barbero | Rating promedio: 4.9★ | Total cortes: 50

Devuelve SOLO JSON: {"tones": [{"title": "...", "description": "...", "whatsappMessage": null}]}`
  },
  {
    role: "assistant" as const,
    content: `{"tones": [{"title": "Rendimiento destacado", "description": "Excelente desempeño en la atención a clientes. Mantener este nivel fortalece la reputación de la barbería.", "whatsappMessage": null}]}`
  },
];

async function generateToneWithLLM(
  blocks: FactualBlock[],
  model: "groq" | "openai",
  apiKey: string
): Promise<TonePromptResult | null> {
  if (blocks.length === 0) return { tones: [], modelUsed: model };

  const factualLines = blocks.map((b, i) => `[BLOQUE ${i}] ${b.factualText}`).join("\n\n");

  const userPrompt = `Eres el Director de Estrategia de BarberOS. Recibes bloques de DATOS FACTUALES ya calculados por el Motor — vos NO calculas nada, solo redactas el tono.

TU TRABAJO EXCLUSIVO: escribir title, description y whatsappMessage (si aplica) con empatía y cercanía. Voz directa, de barbero a cliente, sin jerga.
PROHIBIDO: No repitas ni reformules las cifras que se te dan, solo redacta el tono alrededor de ellas. Esas cifras ya están fijadas fuera de tu alcance.
PROHIBIDO: lenguaje categórico o de certeza absoluta ("se va a ir", "definitivamente", "vas a perder", etc.).
OBLIGATORIO: el array de "tones" debe tener LENGTH=${blocks.length} y ORDEN=${blocks.map((b, i) => `${i}=${b.type}`).join(", ")}. No uses IDs para emparejar, el índice del array es la única fuente de verdad.

BLOQUES FACTUALES (ordenados por indice):
${factualLines}

Devuelve SOLO JSON con {"tones": [...]} donde cada elemento corresponde al bloque del mismo indice. whatsappMessage solo para REACTIVATION, null para CAPACITY y STAFF.`;

  const messages = [...TONE_EXAMPLES, { role: "user" as const, content: userPrompt }];

  if (model === "groq") {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Director IA] Groq tone error:", response.status, err);
      return null;
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return { tones: parsed.tones || [], modelUsed: "Groq (llama-3.3-70b-versatile)" };
  } else {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Director IA] OpenAI tone error:", response.status, err);
      return null;
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return { tones: parsed.tones || [], modelUsed: "OpenAI (gpt-4o-mini)" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCION 5 — GENERATE DIRECTOR RECOMMENDATIONS (punto de entrada publico)
// Arquitectura: plantilla + relleno (Auditoria Fabel — Rediseño punto 4)
// ─────────────────────────────────────────────────────────────────────────────

export async function generateDirectorRecommendations(
  snapshot: MotorSnapshotData
): Promise<DirectorResponse> {
  const groqApiKey = process.env.GROQ_API_KEY;
  const openAiApiKey = process.env.OPENAI_API_KEY;

  // Paso 1: construir bloques factuales deterministicamente (sin IA)
  const blocks = buildFactualBlocks(snapshot);
  console.log(`[Director IA] Bloques factuales armador: ${blocks.length} (${blocks.map(b => b.type).join(", ")})`);

  if (blocks.length === 0) {
    return {
      isGenerativeLLM: false,
      modelUsed: "TypeScript-RuleEngine-v1",
      recommendations: [{
        id: "general-ok",
        type: "GENERAL",
        priority: "LOW",
        title: "Novedades",
        description: "El Motor no detecta alertas en este momento. Todo dentro de los parametros normales.",
        disclaimer: DEFAULT_DISCLAIMER,
      }],
    };
  }

  // Paso 2: Groq
  if (groqApiKey) {
    const result = await generateToneWithLLM(blocks, "groq", groqApiKey);
    if (result) {
      // GUARDA DE LONGITUD: si el LLM devolvio cantidad distinta, descartar lote completo
      if (result.tones.length !== blocks.length) {
        console.warn(
          `[Director IA] ⚠️ LONGITUD MISMATCH: bloques=${blocks.length}, tonos_recibidos=${result.tones.length}. ` +
          `Descartando lote LLM, cayendo a motor deterministico.`
        );
      } else {
        const recommendations = blocks.map((block, i) =>
          assembleRecommendation(block, result.tones[i], i)
        );
        console.log(`[Director IA] ✅ Tono Groq aplicado a ${recommendations.length} recomendaciones.`);
        return { isGenerativeLLM: true, modelUsed: result.modelUsed, recommendations };
      }
    }
  }

  // Paso 3: OpenAI
  if (openAiApiKey) {
    const result = await generateToneWithLLM(blocks, "openai", openAiApiKey);
    if (result) {
      if (result.tones.length !== blocks.length) {
        console.warn(
          `[Director IA] ⚠️ LONGITUD MISMATCH: bloques=${blocks.length}, tonos_recibidos=${result.tones.length}. ` +
          `Descartando lote LLM, cayendo a motor deterministico.`
        );
      } else {
        const recommendations = blocks.map((block, i) =>
          assembleRecommendation(block, result.tones[i], i)
        );
        console.log(`[Director IA] ✅ Tono OpenAI aplicado a ${recommendations.length} recomendaciones.`);
        return { isGenerativeLLM: true, modelUsed: result.modelUsed, recommendations };
      }
    }
  }

  // Paso 4: FALLBACK DETERMINISTICO
  console.warn("[Director IA] ⚠️ FALLBACK ACTIVADO: Motor de reglas deterministico local (sin LLM).");
  return buildFallbackRecommendations(blocks);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCION 6 — FALLBACK DETERMINISTICO
// ─────────────────────────────────────────────────────────────────────────────

function buildFallbackRecommendations(blocks: FactualBlock[]): DirectorResponse {
  const recommendations: AIRecommendation[] = blocks.map((block, index) => {
    if (block.type === "REACTIVATION") {
      const waMsg = `¡Hola ${block.profileName}! ✂️ Mucho tiempo sin verte por aqui. ` +
        `¿Todo bien? Te esperamos para tu proximo corte. ¡Reserva ya!`;
      return {
        id: `fallback-reactivation-${index}`,
        type: "REACTIVATION",
        priority: block.riskLevel === "AT_RISK" ? "HIGH" : "MEDIUM",
        title: `${block.profileName ?? "Cliente"} — Senal de riesgo detectada`,
        description: block.factualText,
        disclaimer: DEFAULT_DISCLAIMER,
        actionText: "Enviar mensaje de WhatsApp",
        targetWhatsapp: block.whatsapp,
        whatsappMessage: waMsg,
      };
    }

    if (block.type === "CAPACITY") {
      return {
        id: `fallback-capacity-${index}`,
        type: "CAPACITY",
        priority: "MEDIUM",
        title: "Analisis de capacidad registrado",
        description: block.factualText,
        disclaimer: DEFAULT_DISCLAIMER,
        actionText: "Revisar configuracion",
        actionUrl: "/panel/configuracion",
      };
    }

    if (block.type === "SCHEDULE_GAP") {
      return {
        id: `fallback-gap-${index}`,
        type: "SCHEDULE_GAP",
        priority: "HIGH",
        title: "Hueco horario detectado",
        description: block.factualText,
        disclaimer: DEFAULT_DISCLAIMER,
        actionText: "Revisar horarios",
        actionUrl: "/panel/configuracion",
      };
    }

    // STAFF
    return {
      id: `fallback-staff-${index}`,
      type: "STAFF",
      priority: "LOW",
      title: `${block.staffName ?? "Barbero"} — Metricas del equipo`,
      description: block.factualText,
      disclaimer: DEFAULT_DISCLAIMER,
      actionText: "Ver equipo",
    };
  });

  return { isGenerativeLLM: false, modelUsed: "TypeScript-RuleEngine-v1", recommendations };
}
