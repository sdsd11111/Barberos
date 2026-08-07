# Instrucción de Construcción — Motor de Conocimiento + Director IA (BarberOS Premium)

> version: 2.1
> fecha: 2026-07-25
> audiencia: Antigravity / Claude 4.6 (constructor)
> relacionado:
> - [[07-MOTOR-DE-CONOCIMIENTO]]
> - [[08-ARQUITECTURA-IA]]
> - [[09-ROADMAP-TECNICO]]
> - [[13-COMPONENTES]] (fuente de verdad — pendiente de confirmación de Antigravity)

---

## 0. Por qué existe este documento y por qué es urgente

BarberOS ya tiene 2 clientes pagando el plan Premium ($19.99/mes), y ese plan promete públicamente en `/precios`: Motor de Conocimiento, IA especializada, Recomendaciones automáticas, Alertas inteligentes, Consultor IA 24/7. Hoy, ninguna de esas piezas existe en código — el Motor de Conocimiento es únicamente un documento ([[07-MOTOR-DE-CONOCIMIENTO]]), sin ninguna línea programada. Esto no es un desarrollo a futuro dentro del roadmap normal: es una deuda de producto activa con dinero real ya cobrado. Se construye ahora, con prioridad alta.

Este documento no dice cómo programarlo (qué tablas crear, qué funciones escribir, qué arquitectura de código usar). Dice qué necesitamos que el sistema logre y por qué. Las decisiones de implementación quedan en manos de quien construye.

---

## 1.1 Regla de Control de Acceso y Monetización (Gating por planType)

El producto BarberOS está segmentado comercialmente en dos niveles:
- **BarberOS PRO ($9.99/mes)**: Incluye WhatsApp Check-In, Cola de Aprobaciones, Libro Diario y Sistema de Fidelización Estándar.
- **BarberOS PREMIUM ($19.99/mes)**: Incluye el Motor de Conocimiento (cálculos nocturnos, métricas avanzadas, snapshots) y el Director IA.

### Reglas Estrictas de Backend y Frontend:
1. **Cron & background tasks**: `/api/cron/motor` solo procesa barberías con `planType === "PREMIUM"` y `planStatus === "ACTIVE" | "TRIAL"`.
2. **Endpoints de Lectura**: Cualquier API del Motor (ej. `/api/motor/snapshot`) verificará `planType === "PREMIUM"`. Si es `PRO`, devolverá `403 Forbidden`.
3. **Director IA**: Toda llamada al futuro Director IA (generación de recomendaciones, sugerencias de mensaje o interfaz conversacional) validará `planType === "PREMIUM"` de forma obligatoria antes de invocar la API del modelo LLM.
4. **Frontend Dashboard**: Las secciones relativas al Motor o la IA en la UI del panel verificarán la propiedad `planType`. En cuentas `PRO`, estas secciones no mostrarán errores de carga ni pantallas rotas; mostrarán un componente decorativo de "Upgrade a Premium".

---

## 1. Principio arquitectónico no negociable: separación entre Motor (determinístico) y Director IA (generativo)

El documento [[08-ARQUITECTURA-IA]] ya establece esta regla y no se puede romper: la IA nunca analiza datos crudos directamente. Siempre consume conocimiento que otro proceso (el Motor) ya calculó de forma determinística (matemática, reglas fijas, sin modelo de lenguaje).

Razón de negocio, no solo técnica: si le entregamos a un modelo de lenguaje una lista larga de fechas y le pedimos que calcule promedios o compare cifras, el modelo puede inventar un número con total confianza (alucinación). El dueño de la barbería va a confiar ciegamente en lo que le diga la IA. No podemos permitir que un cálculo mal hecho por el modelo se presente como un hecho.

Por lo tanto, la arquitectura de flujo obligatoria es:

```
Datos crudos (visitas, calificaciones, clientes)
   ↓ [el Motor, scripts determinísticos ejecutados por cron, calcula y estructura]
Conocimiento ya resuelto (ej: "este cliente tiene un ritmo normal de X días y lleva Y días sin volver")
   ↓ [el Director IA, vía API tipo DeepSeek, solo redacta y conversa]
Respuesta al dueño en lenguaje humano, con recomendación]
```

Confirmado sin ambigüedad: el Motor (scripts deterministas, ejecutados por cron) calcula y deja el resultado resuelto. La IA (vía API tipo DeepSeek) nunca accede a la base de datos directamente — solo recibe el resultado ya calculado y lo redacta. La IA puede usar prompts de "rol dinámico" (ej. actuar como copywriter al redactar un mensaje sugerido para un cliente), pero eso es una función de redacción, nunca de cálculo. Esto permite usar un modelo de IA económico (tipo DeepSeek, Qwen u otro de bajo costo) porque no le exigimos razonamiento matemático complejo — solo redacción a partir de datos ya resueltos.

---

## 2. Regla crítica de identidad de datos — ENMIENDA IMPORTANTE, prioridad alta

Se confirmó (revisión de código real) que el sistema identifica a cada cliente exclusivamente por su número de WhatsApp, y que el `upsert` de `BarberCustomer` fusiona automáticamente cualquier registro que comparta el mismo número, sin ningún filtro. Esto no es un caso hipotético: ya ocurre en producción — múltiples visitas bajo el mismo número/nombre genérico se están fusionando en un solo historial de cliente.

César confirmó además un flujo de negocio real que hace esto todavía más relevante: existen clientes que, por estar de prisa, no quieren auto-registrarse (no quieren interactuar con el check-in por WhatsApp). En esos casos, el barbero necesita poder registrar el corte o servicio de todas formas (el registro no es opcional para el barbero, aunque sí lo sea para el cliente).

### Mecanismo de check-in: tres tipos obligatorios

Cada visita se registra con un `checkinMethod` de tres tipos posibles:

- **SELF** — el cliente inicia por su propio WhatsApp. Cuenta para su historial, puede pedir calificación, cuenta para premios de fidelidad.
- **BARBER_ASSISTED_KNOWN** — el barbero registra la visita a nombre de un cliente ya existente en el sistema (lo busca y selecciona, no crea un número nuevo). Cuenta para el historial de ese cliente y para premios. **Nunca dispara solicitud de calificación.**
- **BARBER_ASSISTED_ANONYMOUS** (botón "Consumidor Final" / CF) — un solo botón que activa el barbero, sin buscar ni crear cliente. Va a un contador separado por barbería ("visitas sin identificar"), nunca a un número de teléfono simulado. Solo alimenta la dimensión Negocio (volumen total), nunca la dimensión Clientes. No pide calificación, no acumula premio.

### Modelo Cuenta / Perfil

El número de WhatsApp deja de tratarse como "el cliente" y pasa a ser **la cuenta** (canal de comunicación). Una cuenta puede contener uno o más **perfiles** (personas reales distintas que comparten el número — ej. padre e hijo).

- Frecuencia, ritmo y riesgo se calculan **por perfil**, nunca por número de teléfono.
- Un perfil nuevo se crea dentro de una cuenta existente vía el QR de registro (ver Enmienda 3 de este documento), operado por el barbero o caja al momento de la visita.
- El control de fraude (aprobación manual de cada check-in, ya existente en `ApprovalQueue`) es independiente del modelo de perfiles y no cambia.
- El bloqueo de números por abuso es un control a **nivel de cuenta completa**, independiente de cuántos perfiles tenga — sigue existiendo, no lo reemplaza el modelo de perfiles.

**Premio de fidelidad y perfiles compartidos:** el conteo de "5 cortes = 1 gratis" es **configurable por barbería** (un solo ajuste en configuración, aplica a todos los clientes de esa barbería), con dos modos posibles:

- **Por perfil** — cada persona dentro de la cuenta acumula sus propios cortes de forma independiente.
- **Por cuenta** — todos los perfiles de una misma cuenta suman hacia un solo contador de premio compartido.

*(Confirmado: configuración a nivel de barbería, ajuste único. No es por cuenta individual.)*

**Reglas obligatorias que se derivan de esto (deben quedar así, sin excepción):**

1. Una visita registrada por el barbero **sin que el cliente se haya identificado por sí mismo** (es decir, sin que el cliente haya interactuado directamente vía su propio WhatsApp) **nunca puede generar una solicitud de calificación**. No existe manera legítima de pedirle una calificación real a un cliente que nunca participó directamente en el registro — hacerlo generaría calificaciones falsas o atribuidas a la persona equivocada.
2. Estas visitas "sin auto-identificación" **no deben fusionarse con el historial de ningún cliente real identificado**. Deben quedar en su propia categoría, clara y separada, precisamente para que no contaminen el cálculo de frecuencia individual de los clientes que sí tienen una identidad confiable.
3. Las visitas `BARBER_ASSISTED_ANONYMOUS` alimentan exclusivamente la dimensión Negocio (volumen total), nunca la dimensión Clientes ni la dimensión Equipo.

Esta regla es prioritaria porque afecta directamente la confiabilidad de las tres dimensiones de análisis que se piden más abajo — sin esta separación, cualquier cálculo de frecuencia, capacidad o reputación de barbero puede estar corrompido por datos que en realidad no representan a un cliente único.

---

## 3. Qué debe calcular el Motor de Conocimiento, por dimensión

### A. Dimensión Clientes — frecuencia individual, anticipación y rescate

**Conclusión que el Motor debe entregar ya calculada (no en bruto):**

- El ritmo normal de regreso de cada cliente específico, basado en su propio historial — no un número genérico igual para todos los clientes de la barbería.
- Cuánto tiempo lleva ese cliente sin volver, comparado contra su propio ritmo habitual (no contra un umbral fijo de días para todo el negocio, como hace hoy el cron de reactivar con sus 30 días fijos).
- Una clasificación simple y ya resuelta de riesgo (por ejemplo: normal / atrasado / en riesgo de perderlo), que el Director IA pueda leer directamente sin tener que inferirla ni calcularla.

**Contexto activo por perfil:** un campo de texto libre, escrito por el barbero, con fecha de vigencia (ej. "ausencia esperada hasta 15 de agosto"). Mientras ese contexto esté vigente, el cálculo de riesgo para ese perfil se suprime o pospone — no se dispara alerta de abandono durante esa ventana.

- Regla de privacidad: el campo debe mostrar una ayuda visible junto a la entrada de texto: *"Anota solo lo que necesites recordar del cliente — evita datos médicos o de terceros."*
- Fuera de alcance de V1: transcripción de audio o interpretación de notas por IA. Se difiere a una versión futura, sin fecha definida.

**QR de auto-registro de datos del cliente:** nuevo mecanismo de captura — un QR que el cliente escanea para dejar voluntariamente datos estructurados sobre sí mismo (fecha de nacimiento, hitos personales). Este dato es determinista y estructurado, no requiere interpretación de IA, y alimenta triggers automáticos (ej. mensaje de cumpleaños), de forma equivalente al cron de reactivación ya existente. Este mismo QR es el mecanismo operativo para crear un **nuevo perfil dentro de una cuenta existente** cuando dos personas comparten número de WhatsApp — el cliente adicional (ej. el hijo) escanea y registra su propia identidad dentro de la cuenta familiar ya existente.

**Preguntas reales que el dueño debe poder hacerle al Director IA:**

- "¿A quién estoy a punto de perder esta semana?"
- "¿Carlos por qué no ha vuelto si siempre viene seguido?"
- "¿A cuáles clientes ya se me fueron y todavía vale la pena contactar?"

### B. Dimensión Negocio — capacidad instalada vs. uso real, horas pico y huecos

**Corrección importante de alcance (enmienda de César):** el sistema no debe asumir ni nombrar tipos de puesto o estación (por ejemplo, no asumir "silla de barbero" como única unidad). Cada dueño debe poder definir y nombrar sus propios puestos o estaciones de trabajo, de forma genérica y configurable por él mismo — porque BarberOS puede terminar usándose en negocios que también ofrecen manicure, pedicure u otros servicios. No se debe hardcodear ningún nombre de servicio o tipo de estación dentro del sistema.

**Conclusión que el Motor debe entregar ya calculada:**

- Qué franjas horarias están consistentemente vacías o subutilizadas a lo largo del tiempo, no solo en un día aislado.
- Qué tan lejos está la barbería de su capacidad real definida por el propio dueño, en cada franja horaria, para poder distinguir "hoy estuvo flojo por casualidad" de "los martes en la tarde siempre están flojos".

**Preguntas reales:**

- "¿Qué horas tengo vacías que debería llenar con una promoción?"
- "¿Vale la pena tener abierto los martes en la tarde?"
- "¿Cuánta gente más podría atender si organizo mejor mis horarios?"

**Duración de visita: no se captura por defecto en V1.** Se agrega como opción configurable en ajustes de la barbería, para el dueño que quiera activarla. El cálculo de capacidad en V1 es por conteo de visitas en franja horaria, sin duración — el Director debe comunicar esto siempre en términos aproximados, nunca como cifra exacta de ocupación.

**Servicios por visita (múltiples):** una visita puede incluir varios servicios. Se registran como una **lista simple de etiquetas** (ej: `["corte", "barba"]`), exclusivamente para que el Motor sepa qué tipo de servicios se prestaron. **Confirmado: cero precio, cero cobro, cero total, cero funcionalidad de caja registradora.** Esto es una herramienta de fidelización y conocimiento, no de contabilidad ni punto de venta — coherente con [[14-PRD]], que excluye integraciones POS de forma explícita. No construir ningún campo de precio ni total asociado a esta lista de etiquetas.

Con esta reducción de alcance (sin cobro), el registro de servicios múltiples lo puede hacer el mismo rol `BARBER` ya existente, sin necesidad de crear un rol adicional de "caja".

---

# ENMIENDA 2026-08-07 — Bono de Referido Transferible (Cliente Final)

```yaml
id: 19-instruccion-motor-director-enmienda-2026-08-07
titulo: Enmienda — Bono de Referido Transferible (Cliente Final)
categoria: inteligente
estado: activo — reemplaza cualquier discusión previa sobre "comisión para cliente final"
sprint: pendiente-construccion
ultima_revision: 2026-08-07
relacionado:
  - 17-PROGRAMA-LEONES-FUNDADORES (afecta perímetro — Leo el párrafo 3 antes de implementar)
  - 14-PRD
  - 08-ARQUITECTURA-IA
  - 00-Constitución (Art. 4 — integridad del dato)
```

> **Naturaleza de esta enmienda:** no reemplaza el documento base 19. Lo amplía con un mecanismo de adquisición incentivada por el cliente final, manteniendo intacta la lógica del Motor. Es una regla de producto, no un workaround.

## 0. Contexto y diagnóstico

El sistema de fidelidad actual (5x1) es **solo retención**. Cuando una barbería tiene una base estable de clientes que ya vienen, no necesita más ese mecanismo; pero mientras sigue intentando crecer, el 5x1 no le ayuda a **traer** clientes nuevos. Sin capa de adquisición, el dueño paga el corte gratis del 5x1 sin recuperar la inversión en flujo nuevo.

Necesidad validada por César en conversación del 2026-08-07: si un cliente trae a un familiar o amigo a cortarse, ese "esfuerzo de traer" debería traducirse en avance hacia su próximo corte gratis. Es una capa de **adquisición incentivada por el cliente**, no una comisión en efectivo.

## 1. Regla dura #0 — La data del Motor es sagrada

> **Ningún mecanismo de bono o referido puede alterar el historial real de visitas de un perfil.**

El Motor de Conocimiento ([[07-MOTOR-DE-CONOCIMIENTO]]) se ancla en la línea de tiempo real de cada perfil para generar las recomendaciones de:

- Días en que el cliente suele regresar.
- Horarios donde la barbería tiene más o menos gente.
- Fechas hito para promociones dirigidas.
- Ritmo normal → atraso → riesgo de pérdida.

**Si por implementar el referido removemos, fusionamos o reasignamos una visita real, el Motor deja de ser confiable.** Eso es exactamente lo que la Constitución Art. 4 prohíbe ("Nunca mostraremos un dato sin interpretación") y la sección 2 de este documento refuerza ("las visitas de otra persona no identificada nunca deben fusionarse con el historial de un perfil real").

**Implicación directa:** el Bono de Referido es una operación **independiente** de la visita. No se crea, no se modifica, no se borra `BarberVisit` para dárselo a otro perfil.

## 2. Definiciones

| Concepto | Definición |
|---|---|
| **Visita** | Evento de negocio. Un perfil, un corte, una fila en `BarberVisit`. Alimenta el Motor. |
| **Perfil referido** | La persona real que fue traída por el referente. Tiene su propia visita, su propio historial. |
| **Bono de Referido** | Movimiento en el contador de fidelidad del **referente**. No es una visita. No es un evento de negocio. Es un crédito de premio. |

## 3. Mecanismo — Bono de Referido Transferible

### 3.1 Disparo

El barbero registra los cortes de la jornada de la forma habitual (cada persona con su perfil o como CF). En un toque adicional, después de registrar la visita de un **perfil referido**, el barbero abre un mini-modal:

> *"¿Este corte fue traído por algún cliente de la casa? ¿A quién le sumo el bono?"*

- Búsqueda por nombre o WhatsApp del referente.
- Selección del perfil del referente.
- Confirmación: se registra el bono.

### 3.2 Efecto

- El **perfil referido** mantiene su visita en `BarberVisit` con su propio `profileId`, su propio `createdAt`, su propio `staffId`, su propio `checkinMethod`.
- El **perfil referente** recibe un crédito en su contador de fidelidad. Esto es un **incremento en `cutsCount` del referente** (modo `BY_PROFILE`) o en el contador de la cuenta (modo `BY_ACCOUNT`), según la configuración de la barbería.
- El barbero no necesita entender la diferencia técnica — solo marca "este se lo trajo Fulano" y el sistema hace lo correcto.

### 3.3 Lo que NO se hace

- **No se crea `BarberVisit` para el referente.** Si César trajo a su papá y a su hermano, las filas en `BarberVisit` son tres: la del papá, la del hermano, ninguna de César. César solo ve aumentar su barra de progreso.
- **No se modifica `createdAt`, `profileId`, `staffId` de ninguna visita existente.**
- **No se borra ni edita ninguna visita histórica para "transferirla".** Eso sería falsificar el historial.
- **No se permite el auto-referido.** César no puede referirse a sí mismo. Esto se valida en backend: `referenteProfileId !== profileId.del.corte.actual`.

## 4. Persistencia mínima en BD (recomendación, no decisión final)

```prisma
// Nueva tabla — modela el evento de asignación del bono, no la visita
model ReferralBonus {
  id              String   @id @default(cuid())
  barbershopId    String
  referenteProfileId String  // FK a CustomerProfile — quien recibe el bono
  visitaTriggerId String   // FK a BarberVisit — la visita del referido que disparó el bono
  assignedAt      DateTime @default(now())
  assignedByStaffId String? // FK a BarberStaff — barbero que hizo la asignación

  @@index([barbershopId, assignedAt])
  @@index([referenteProfileId])
  @@index([visitaTriggerId])
}
```

**Por qué una tabla separada y no un campo en `CustomerProfile`:**

- Auditable: sabemos exactamente cuándo, por qué visita y por qué barbero se asignó cada bono.
- Reversible: si hay disputa, se borra el `ReferralBonus` y `cutsCount` se recalcula.
- Compatible con el cron del Motor: el snapshot puede contar `ReferralBonus` por separado sin tocar `BarberVisit`.

**Cálculo del `cutsCount` del referente:**

```
cutsCount.referente = (
  BarberVisit aprobadas con profileId = referente  // visitas reales
  + COUNT(ReferralBonus donde referenteProfileId = referente)  // bonos recibidos
)
```

Recalcular este valor en cada asignación o durante el cron nocturno del Motor — decisión del constructor, pero la fórmula es esta.

## 5. Reglas duras

1. **Sin efectivo.** El bono es exclusivamente avance en el contador de fidelidad. No se entrega dinero al cliente en ningún caso. Coherente con la lógica de "no somos un sistema de pagos" de la sección 7 de este documento.
2. **El bono acelera el mismo contador del referente, no crea uno paralelo.** Una sola barra de progreso. Una sola cosa que explicar.
3. **El costo lo asume 100% el dueño de la barbería.** Igual que el corte gratis del 5x1. No es gasto de BarberOS ni se subsidia desde la plataforma.
4. **Sin ranking ni competencia entre referentes.** Por ahora el bono es individual y silencioso. Si en el futuro se quiere gamificar, se hace en una versión posterior y separada.
5. **No se notifica automáticamente al cliente que trae referidos.** El barbero le informa verbalmente en el momento. Cero mensajes automáticos nuevos por ahora.
6. **El referido no tiene que ser perfil.** Si el cliente referido entra como CF (Consumidor Final), el barbero puede asignar el bono al referente de todas formas — la visita del referido queda como `BARBER_ASSISTED_ANONYMOUS` y el bono se asigna por separado. Esto NO contamina el Motor porque la visita CF nunca entró al historial de un perfil real.

## 6. Compatibilidad con el Motor de Conocimiento

Esta enmienda **no rompe ninguna capa existente**:

- **Motor (cron nocturno):** sigue calculando sobre `BarberVisit` aprobadas con `checkinMethod !== 'BARBER_ASSISTED_ANONYMOUS'`. Los `ReferralBonus` no entran al cálculo de frecuencia porque NO son visitas. El Motor sigue diciendo la verdad.
- **Director IA:** puede mencionar la cantidad de bonos que un cliente ha recibido si el dueño pregunta "¿quién me trae más gente?", pero esto debe ser explícitamente solicitado, no aparecer por defecto en `/panel`. La sugerencia accionable es derivar al barbero a premiar a esos clientes con un gesto manual (un servicio extra, un descuento verbal), no automatizar nada.
- **Snapshot del Motor:** las métricas de clientes no cambian. Si en una versión futura se quiere reportar "clientes que más refieren", eso va en una dimensión nueva del snapshot, no se mezcla con visitas reales.

## 7. Fuera de alcance (explícito)

- Notificación automática al referido.
- Sistema de ranking o competencia entre referentes.
- Comisiones en dinero electrónico o efectivo (ni a BarberOS ni a la barbería).
- Multiplicadores o combos (trae 3 y te doy 2 bonos — no, 1 bono por referido).
- Bono canjeable por servicios de otras barberías — esto ya existe como `ReferralComision` para Aliados/Leones y se mantiene separado. **El perimetro de los Leones ([[17-PROGRAMA-LEONES-FUNDADORES]]) y el perimetro del Bono de Referido son distintos y NO se cruzan.** Un León es un adulto que recluta barberías; un referente de bono es un cliente que trae a un amigo. Mismas palabras, productos distintos.

## 8. Pitch de campo — cómo explicarlo sin prometer lo que no existe

Coherente con la regla de "Cero Anécdotas Sintéticas" y anti-promesa de la Skill de Guiones y [[04-SISTEMA-DE-COMUNICACION]]:

> *"Si traes a un amigo o familiar, te acercamos un paso más a tu próximo corte gratis. Eso ya está en la dirección del producto — no te lo voy a vender como que ya está listo, pero es la próxima capa."*

Eso refuerza la narrativa de "el que entra primero" sin mentir.

## 9. Preguntas abiertas — para resolver antes de construir

1. ¿El bono se asigna **en el momento** del corte del referido, o el barbero puede hacerlo después (ej. al cierre del día)? Mi recomendación: en el momento, para evitar discrecionalidad.
2. ¿Tiene fecha de expiración el bono? Mi recomendación: no. Un crédito en barra de fidelidad no caduca.
3. ¿Se puede transferir un bono ya asignado? Mi recomendación: no. Solo el barbero con rol OWNER puede revertir (borrar `ReferralBonus` y recalcular `cutsCount` del referente).
4. ¿El barbero puede asignar bonos a perfiles de OTRA barbería si el cliente se cambió? Mi recomendación: no. El bono es por barbería, va con `barbershopId`.

Estas preguntas quedan abiertas para que el constructor (Abel) las responda con César antes de empezar.

### C. Dimensión Equipo — calificaciones y comentarios por barbero

**Conclusión que el Motor debe entregar ya calculada:**

- Promedio de calificación por barbero, y si esa tendencia mejora o empeora respecto al periodo anterior.
- Qué comentarios negativos se repiten con más frecuencia entre los distintos clientes, agrupados de forma simple (no una lista larga sin ningún orden).

**Regla obligatoria derivada de la sección 2:** esta dimensión debe calcularse únicamente sobre visitas que tuvieron una calificación legítima posible. Quedan excluidas: visitas con estado `REJECTED`, visitas sin barbero asignado, y visitas de tipo `BARBER_ASSISTED_ANONYMOUS`. Solo cuentan visitas `APPROVED` con barbero real asignado.

El Director debe poder señalar al dueño, como parte de sus respuestas, si detecta un volumen alto de visitas sin barbero asignado — como alerta de proceso, no como error silencioso.

**Preguntas reales:**

- "¿Cuál de mis barberos tiene mejores reseñas?"
- "¿Qué se está repitiendo en los comentarios negativos?"
- "¿A quién debería felicitar o corregir esta semana?"

---

## 4. Reglas de calidad estadística que el Motor debe respetar (confirmadas como huecos reales del sistema actual)

Se confirmó, revisando el código existente, que hoy no existe ninguna de estas protecciones. Deben incorporarse:

1. **Piso mínimo de datos.** Un cliente con una o dos visitas no tiene un historial suficiente para calcular un "ritmo normal" confiable. El Motor debe definir una cantidad mínima de visitas antes de animarse a calcular un patrón de frecuencia, y mientras no se alcance ese mínimo, el Director IA debe poder decir honestamente que todavía no hay suficiente información — nunca debe inventar una conclusión con datos insuficientes.
2. **Detección de cierre del negocio.** Si la barbería cierra varios días (vacaciones, feriado, remodelación), todos los clientes se van a ver "atrasados" al mismo tiempo. El sistema necesita alguna forma de distinguir "el negocio estuvo cerrado" de "todos mis clientes me abandonaron a la vez", para no disparar una alerta masiva falsa en ese escenario.
3. **Ajuste ante estacionalidad.** Se resuelve con ventana móvil de últimas 5-8 visitas, sin modelo de estacionalidad explícito. El ritmo normal se recalcula continuamente con los datos más recientes, no queda fijo desde el primer cálculo.
4. **Umbral de riesgo, configurable por barbería, valor inicial de fábrica:**
   - **Normal:** hasta 1.2x el ritmo habitual del perfil.
   - **Atrasado:** entre 1.2x y 2x el ritmo habitual del perfil.
   - **En riesgo:** más de 2x el ritmo habitual del perfil.

---

## 5. Cómo debe responder el Director IA — estructura obligatoria (ya definida en el documento 08, no se puede omitir ningún paso)

1. Responde la pregunta directamente.
2. Explica por qué llegó a esa conclusión.
3. Muestra la evidencia concreta (el dato que ya calculó el Motor).
4. Propone una acción.
5. Indica el riesgo o la incertidumbre — nunca en términos absolutos, siempre reconociendo que es un patrón, no una certeza matemática garantizada.
6. Cierra siempre devolviendo la decisión al dueño (ej. "revisa esto y decide si..."), nunca en forma de sentencia ("Carlos se va a ir").

El Director nunca afirma una conclusión de riesgo como hecho. Siempre devuelve la decisión al dueño.

**Ejemplo de cómo debe sonar (para que quede claro el tono, no como plantilla literal de código):**

> Pregunta del dueño: "¿A quién estoy a punto de perder?"
>
> Respuesta esperada: "Carlos y dos clientes más están en zona de riesgo. Carlos normalmente regresa cada 3 semanas y ya lleva más de un mes sin volver — bastante más que su ritmo habitual. Sería buen momento para escribirle antes de que se enfríe del todo. Ten en cuenta que esto es un patrón, no una certeza: puede que simplemente esté ocupado."

---

## 6. El Director coordina, no ejecuta — decisión confirmada (Camino A)

César confirmó explícitamente esta decisión: el Director IA **nunca ejecuta una acción por sí solo**. Su función es exclusivamente conversar con el dueño, explicarle la situación y recomendarle qué hacer.

La ejecución real (por ejemplo, enviar un mensaje de WhatsApp al cliente en riesgo) solo debe ocurrir después de que el dueño lo confirme explícitamente en la conversación — no automáticamente por decisión del Motor o del Director.

**Nota importante de contexto para quien construye:** hoy ya existen en el sistema mecanismos de envío automático que sí actúan sin pasar por el dueño (el cron de reactivación de "Te extrañamos" y el envío automático de solicitud de reseña de Google). Esos mecanismos existentes **no se modifican con esta instrucción** — siguen funcionando como hoy. Lo que se define aquí es exclusivamente el comportamiento del nuevo Director IA: él no dispara nada solo, solo recomienda, y espera confirmación humana antes de que cualquier ejecución ocurra. Si en el futuro se decide que el Director también pueda ejecutar directamente, será una decisión nueva y explícita, no una extensión automática de esta instrucción.

---

## 7. Fuera de alcance — decisión ya tomada, no reabrir

BarberOS no se convierte en herramienta de precios, comisiones ni contabilidad. Aunque en algún momento se consideró que el registro de cortes podía servir como base para calcular comisiones de barberos, esa idea fue descartada explícitamente: BarberOS se mantiene exclusivamente como herramienta de análisis y conocimiento del negocio (clientes, capacidad, equipo), evitando que el producto se confunda con un sistema contable y la responsabilidad legal que eso implicaría.

---

## 8. Orden de construcción (obligatorio según [[09-ROADMAP-TECNICO]], no negociable)

1. Motor de Conocimiento — capa de Eventos (ya existe como datos crudos) más la capa de Contexto descrita en este documento (frecuencia individual, capacidad configurable por el dueño, promedios de equipo, con las reglas de calidad estadística de la sección 4 y la regla de identidad de la sección 2).
2. Director IA — responde las preguntas descritas en la sección 3, siguiendo la estructura obligatoria de la sección 5, sin poder ejecutar nada por sí solo (sección 6).
3. Ningún agente especialista adicional (Equipo, Reputación, Comercial, Contenido) se construye todavía. Se decidirá cuál se libera después, según lo que estos 2 clientes reales terminen preguntando más en la práctica — la demanda real decide, no una planificación anticipada.

---

## 9. Preguntas abiertas — estado actualizado (v2.1)

~~1. Duración por visita~~ → **Resuelto**: no se captura por defecto, configurable opcionalmente.
~~2. Mecanismo checkinMethod~~ → **Resuelto**: 3 valores (SELF, BARBER_ASSISTED_KNOWN, BARBER_ASSISTED_ANONYMOUS).
~~3. Umbral de riesgo~~ → **Resuelto**: dos niveles — Normal (≤1.2x), Atrasado (1.2x–2x), En riesgo (>2x). Configurable por barbería.
4. **Fuente de verdad → PENDIENTE.** Confirmar con Antigravity si la base de datos Postgres/Supabase es la única fuente o si existe flujo paralelo manual (Excel/papel). No cerrar hasta recibir respuesta.
~~5. Estacionalidad~~ → **Resuelto**: ventana móvil de últimas 5-8 visitas.
6. **Familia comparte número** → **Resuelto con modelo Cuenta/Perfil** (sección 2).
7. **Premio de fidelidad compartido** → **Resuelto**: configurable a nivel de barbería, no por cuenta individual. Dos modos: por perfil o por cuenta.
8. **Frescura del cálculo** → **Resuelto**: cron nocturno, resultado del día reemplaza al anterior.
9. **Visita con varios servicios** → **Resuelto**: lista de etiquetas simples, cero precio/cobro. Rol "caja" no necesario — BARBER existente lo cubre.
10. **QR de auto-registro** → **Resuelto**: nuevo mecanismo, alimenta triggers automáticos y creación de perfiles.
