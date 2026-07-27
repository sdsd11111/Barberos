# BITACORA.md — Puente de memoria entre sesiones

> **Propósito:** Registrar tareas pendientes, hipótesis sin validar y preguntas de seguimiento entre sesiones de trabajo con Antigravity.
> **Regla:** Máximo 5 sesiones activas. Al llegar a la 6ª, el agente pregunta si puede comprimir y borrar las más antiguas.
> **Lectura obligatoria:** Este archivo se lee al inicio de cada sesión, antes de cualquier acción.

---

### Sesión 2026-07-26 (Tarde) — Programa Leones: Enmienda, Acuerdo y Guion de Campo

**Documentos creados/actualizados:**
- [x] [[ACUERDO-CORTO-LEONES]] — Documento de términos para Leones (firma simple por WhatsApp)
- [x] [[GUION-CAMPO-LEONES-LOJA-2026-07-27]] — Paso a paso para reclutamiento de Leones en Loja
- [x] [[17-PROGRAMA-LEONES-FUNDADORES]] — Enmienda 2026-07-26 incorporada:
  - Techo ampliado de 3 a 5 Leones Operativos
  - Expansión geográfica nacional para reclutamiento de Leones
  - Dos roles definidos: León Operativo ($25 + 10%) y León Referidor ($10 flat)
  - Regla de autorreferido (local propio excluido de comisión)
  - Trial de 15 días solo aplica a Pro (no a Premium)
  - Reglas duras: anti-pirámide, atribución técnica, sin "gratis", sin IA como gancho
- [x] [[_index]] — Actualizado con nuevos documentos

**Pendientes del programa Leones:**
- [ ] Nombre oficial del rol Cuenta Enterprise y comisión definitiva
- [ ] Definir tercer perfil de León Operativo (distribuidor de insumos)
- [ ] Actualizar guion de campo para flujo del León Referidor

**Grafo de Obsidian — Actualización Completada:**
- [x] 15 documentos actualizados con enlaces `[[ ]]` para el Grafo
- [x] Regla del Grafo agregada en [[skill-madre]], [[_index]] y [[CONTEXT]]
- [x] 83 conexiones bidireccionales creadas
- [x] Nota: `Documentación/` permanece en `.gitignore` (IP sensible, no se sube al repo)

---

### Sesión 2026-07-26 — Sprint A (checkinMethod) + Capa de Control de Acceso (planType gating)

**Sprint A — Completado:**
- [x] `checkinMethod: SELF` en webhook — cada check-in por WhatsApp lleva `SELF` + `visitHour` + `barbershopId`
- [x] `checkinMethod: BARBER_ASSISTED_KNOWN` en `/api/visits` — default cuando el barbero registra manualmente a un cliente identificado
- [x] `checkinMethod: BARBER_ASSISTED_ANONYMOUS` en `/api/visits` — nuevo Flujo A (CF). `customerId: null`, incrementa `anonymousVisitCounter` en la barbería
- [x] Schema: `customerId` nullable en `BarberVisit` + `barbershopId` agregado para scoping multi-tenant directo. `db push` aplicado.
- [x] Propagación del nullable en `pending`, `approve`, `reject`, `export`, `barberos/page`, `panel/page` — 0 errores TypeScript

**Control de Acceso por planType (resuelto antes de Sprint B):**
- [x] `src/lib/plan-guard.ts` — `checkPremiumAccess()` para APIs, `isPremiumBarbershop()` para RSC
- [x] `/api/motor/snapshot` — primer endpoint del Motor, protegido con `checkPremiumAccess()`. Devuelve snapshot estructurado (nunca tablas crudas)
- [x] `UpgradeBanner.tsx` — componente decorativo para barberías PRO donde irían las secciones Premium. Sin pantallas rotas ni errores.
- [x] `MotorSummaryWidget.tsx` — Server Component: PRO ve banner, PREMIUM ve mapa de riesgo + métricas de equipo + contadores CF
- [x] `panel/page.tsx` — integrado `MotorSummaryWidget` + `cutsToday` ahora suma CF + identificadas (usa `barbershopId` directamente)
- [x] [[19-INSTRUCCION-MOTOR-DIRECTOR]] Sección 1.1 — Regla de Gating por planType documentada para cron, APIs, Director IA y frontend. Queda por escrito para que el Director IA herede la misma regla cuando se construya.

**Hallazgo:** El SuperAdmin (`/admin`) YA tenía UI de toggle PRO/PREMIUM desde antes. No era un hueco de producto.

**Prueba de Aislamiento de Tenant — Evidencia Permanente (`test-tenant-isolation.ts`)**

Script conservado en el repo. Simula el ataque real: JWT legítimo de Chechebarber (PRO) + header `x-barbershop-id` forjado al ID de "Que?" (PREMIUM). Output crudo:

```
Request:
  cookie.session         → JWT Chechebarber (PRO, ID: cmrv83o3f...)  ← sesión real del atacante
  x-barbershop-id header → cmrz48we30000oovsa9cm7pf4 (Que? PREMIUM) [FORJADO]

Resultado:
  STATUS CODE: 403
  BODY: { "code": "PREMIUM_REQUIRED", "currentPlan": "PRO" }
  → Plan de Chechebarber, no snapshot de Que?. Aislamiento verificado.
```

**Aclaración de arquitectura (sin ambigüedad para referencia futura):**
- El **middleware** (`proxy.ts`) NO bloquea por plan. Su único trabajo es sobrescribir el header `x-barbershop-id` con el `barbershopId` del JWT verificado criptográficamente. El header forjado del cliente queda reemplazado antes de llegar al route handler.
- El **guard** (`plan-guard.ts`, `checkPremiumAccess()`) es quien evalúa el plan y devuelve el `403`. El middleware lo deja pasar con el ID correcto — el guard decide el acceso.
- La cadena real del ataque: `forja header → middleware sobrescribe → route handler recibe ID real → guard evalúa planType PRO → 403`. En ningún momento el atacante obtuvo datos de Que?.
- El mensaje "Middleware devolvió respuesta directa" en el output del test era un artefacto de lectura: `NextResponse.next()` modifica los request headers (no los response headers), y el test leía los response headers (vacíos). El comportamiento real era correcto.

**Estado de BD verificado post-tests (2026-07-26):**
| Barbería         | planType | planStatus |
|------------------|----------|------------|
| Probando Barberos| PREMIUM  | ACTIVE     |
| Chechebarber     | PRO      | ACTIVE     |
| Monique          | PRO      | TRIAL      |
| Que?             | PREMIUM  | TRIAL      |

**Sprint B — Completado (Configuración del Motor):**
- [x] API `PATCH /api/barbershop/settings` implementada y protegida por el middleware de sesión
- [x] Pantalla en `/panel/configuracion` con `ConfigForm.tsx` implementada.
- [x] Navegación: enlace agregado a `PanelNav.tsx` y se renombró el actual "Configuración" a "WhatsApp" para mayor claridad.
- [x] TypeScript validation ok.

**Sprint C — Completado (Cuenta / Perfiles en Interfaz & QR Onboarding):**
- [x] Script de migración (`scripts/migrate-profiles.ts`) ejecutado y verificado (100% de visitas de Chechebarber y demás barberías asignadas a su `CustomerProfile`).
- [x] Parche en APIs (`/api/visits` y `/api/webhook/whatsapp`) para asignar de forma atómica el `profileId` a toda visita futura.
- [x] Dashboard de Clientes (`/panel/clientes`) actualizado para listar **Perfiles** (`CustomerProfile`) mostrando a qué Cuenta WhatsApp pertenecen y calculando el avance de lealtad según la configuración de la barbería (`BY_PROFILE` vs `BY_ACCOUNT`).
- [x] Flujo de Auto-Registro QR (`/registro/[barbershopId]`) e interfaz `RegistrationForm` construidos para capturar Nombre, WhatsApp, Fecha de Nacimiento (Día/Mes) y Canal de adquisición.
- [x] API de registro (`/api/clientes/registro`) protegida con validación `Zod` y rate limit en memoria.
- [x] `proxy.ts` actualizado para exceptuar rutas públicas de registro.
- [x] TypeScript validation ok (0 errores).

> ⚠️ **Limitaciones Conocidas (Documentadas):**
> 1. **Rate Limit Serverless:** El rate-limit en memoria en `/api/clientes/registro` no es persistente en Vercel (servidores efímeros). Sirve como mitigación mínima de primer nivel. Si se requiere protección avanzada en el futuro, migrar a almacenamiento persistente (Upstash/Redis o tabla BD).
> 2. **Atribución de Perfil en Check-in por WhatsApp:** Cuando una cuenta tiene 2+ perfiles (ej: Padre e Hijo), la visita por mensaje directo (`SELF`) asigna la visita al `activeProfileId` (o al primer perfil creado `profiles[0]`).
> 3. **Groq Rate Limit & Escalabilidad:** El tier de Groq permite 30 requests/minuto y 14,400/día (sobrado para las barberías Premium actuales). Si el número de clientes Premium supera las 30 barberías ejecutando el cron a las 3am en simultáneo, se debe implementar una cola secuencial o delay de 500ms entre barberías para no alcanzar el rate limit. Para atribuir con precisión cirujana cuando asisten distintos miembros de la misma familia, el barbero puede registrar la visita desde el panel o el flujo de WhatsApp deberá desplegar un sub-menú intermedio de selección de perfil cuando `profiles.length > 1`.

📌 **Pendiente en Backlog (Futuro Trigger):**
- [ ] **Cron de Cumpleaños (`/api/cron/birthday`):** El QR ya guarda `birthDate` en `CustomerProfile`. Falta construir el cron diario que consulte cumpleañeros y envíe plantilla de felicitación/descuento por WhatsApp.

**Sprint D — Completado (Director IA Generativo Real con Groq LLM + Motor):**
- [x] **Integración LLM Real (Groq Llama 3.3 70B):** Configurada la clave `GROQ_API_KEY` en `.env`. El Director IA ejecuta llamadas reales a la API de Groq (`https://api.groq.com/openai/v1/chat/completions`, modelo `llama-3.3-70b-versatile`) con 0 alucinación de datos.
- [x] **Fallback Transparente & Logging:** Si falla o no hay API key, se activa el motor de reglas determinístico local con logging explícito en consola y metadata en la API (`isGenerativeLLM: false`).
- [x] **Estructura de 5 Pasos & Disclaimer Obligatorio (Doc 19 - Sección 5):** Cada recomendación incluye la etiqueta fija de responsabilidad e incertidumbre: *"⚠️ Esto es un patrón detectado en datos, no una certeza absoluta — revisa la situación y decide tú como dueño."*
- [x] **Detección Temprana (Atrasados + Riesgo):** El Director IA analiza tanto a clientes en **Riesgo Crítico (`AT_RISK`)** como en **Atraso Inicial (`DELAYED`)**, previniendo pérdidas de clientes a tiempo.
- [x] **Widget UI Actualizado (`DirectorWidget.tsx`):** Muestra el badge dinámico del modelo en uso (`LLM Real (Groq llama-3.3-70b-versatile)`), el disclaimer de incertidumbre por tarjeta y botones de 1-Clic a WhatsApp.
- [x] **Prueba Real en BD:** Validada contra el Snapshot real de producción de `Probando Barberos` generando recomendaciones mediante Groq LLM.
- [x] **TypeScript Validation:** 0 errores (`npx tsc --noEmit`).

**Seguridad y Continuidad Operativa (Doc 20 — Implementado & Re-Verificado):**
- [x] **Decisión Explícita Key Groq:** La llave de pruebas se mantiene activa por decisión explícita de negocio/pruebas en fase piloto (tier gratuito sin impacto financiero).
- [ ] **Tarea en Backlog:** *Migrar a una API Key de producción propia y privada antes de escalar más allá de las 4 barberías piloto actuales.*
- [x] **Rate-Limiting Persistente MySQL:** Tabla `RateLimitAttempt` activa y probada en `/api/clientes/registro`, `/api/auth/request-link` y `/api/webhook/whatsapp`.
- [x] **Plan de Recuperación DRP:** Procedimiento documentado para respaldos automáticos en StackCP (`RTO < 15 min`, `RPO < 24h`). Verificación visual de capturas reservada para César/Abel (el agente no posee acceso a la consola web gráfica de StackCP).
- [x] **Estado `npm audit`:** Ejecutado en terminal (`npm audit`). Retorna `HTTP 400 Bad Request / invalid json response body` por incompatibilidad de formato payload en el endpoint bulk de npm registry v10 en Windows.
- [x] **Auditoría Multi-Tenant Post Sprint C/D:** Re-ejecutada la prueba de ataque en `test-tenant-isolation.ts` post-cambios de Sprint C/D. Status 403 retornado con el plan `PRO` del atacante. Aislamiento verificado al 100%.

---

## **Siguiente Sesión — Agenda y Bloqueantes (PENDIENTE)**

> **🛑 BLOQUEANTES ABSOLUTOS antes del deploy a producción o de iniciar el Sprint E:**
> 
> 1. **[ ] Backup StackCP (Acción Manual):** César/Abel deben capturar pantalla real con fecha/hora del último snapshot automático desde el panel StackCP. Idealmente, realizar restauración de prueba aislada para cronometrar el RTO. Sin esto, **NO HAY LUZ VERDE PARA DEPLOY**.
> 2. **[ ] Auditoría de Vulnerabilidades (Resolución de Entorno):** Obtener el conteo real de vulnerabilidades por severidad utilizando Dependabot en GitHub post-push, o corriendo `npm audit` durante el paso de build en Vercel (entorno Linux) para evadir el bug de compresión de Windows.

*(El trabajo de desarrollo y despliegue se reanudará única y exclusivamente tras validar con evidencia los dos puntos anteriores.)*
---

### Sesión 2026-07-25 — Audit + Diagnóstico BD + BUILD Motor de Conocimiento (capa Determinismo)

**Contexto:** Sesión completa. Empezó como diagnóstico y cerró con el Motor corriendo en producción.

**Resultados de BD de producción (queries directas vía `information_schema`):**

| Consulta | Resultado |
|---|---|
| Tabla `CustomerFeedback` | ❌ NO existe |
| Tabla `VisitAttempt` | ❌ NO existe |
| Tablas originales | 7 tablas: `BarberCustomer`, `Barbershop`, `BarberStaff`, `BarberVisit`, `DelayedTask`, `MagicToken`, `PushSubscription` |
| Visitas por status | `APPROVED: 23`, `REJECTED: 3` — datos ficticios de Chechebarber |
| APPROVED sin barbero | 6 visitas (26%) — datos de prueba, no representativos de producción real |
| Barberías en BD | 4: `Probando Barberos`, `Chechebarber`, `Monique`, `Que?` |

**Correcciones de documentación aplicadas:**
- [x] [[CONTEXT]] — corregida BD: era Postgres/Supabase, ahora MySQL/cPanel. Máquina de estados de feedback corregida.
- [x] [[09-ROADMAP-TECNICO]] — corregida referencia a PostgreSQL → MySQL/cPanel
- [x] [[13-COMPONENTES]] — re-corregida sección de feedback: `AWAITING_FEEDBACK` SÍ está implementado en webhook (confirmado por captura WhatsApp real). Lo que falta: `CustomerFeedback` tabla y recordatorio 4-5h.
- [x] `BITACORA.md` sesión 2026-07-24 — marcadas con `[~]` las tareas documentadas por error

**CONSTRUIDO en esta sesión:**
- [x] **Schema del Motor** (`prisma/schema.prisma`) — nuevos modelos:
  - `CustomerProfile` — persona real dentro de una cuenta WhatsApp
  - `ProfileMotorContext` — contexto calculado por el Motor (frecuencia, riesgo, vigencia)
  - `MotorSnapshot` — resumen nocturno por barbería (dimensiones: Negocio, Clientes, Equipo)
  - `TestExclusion` — tabla editable de números excluidos del cálculo
  - Campos nuevos en `BarberVisit`: `checkinMethod`, `profileId`, `services`, `visitHour`
  - Campos nuevos en `Barbershop`: `riskThresholdNormal`, `riskThresholdAt`, `loyaltyMode`, `visitDurationMin`, `anonymousVisitCounter`
- [x] **`db push` a producción** — 11 tablas en BD, schema sincronizado ✅
- [x] **`src/lib/motor.ts`** — librería determinística del Motor:
  - `calculateAvgDaysBetween()` — ventana móvil de 8 visitas
  - `calculateRiskLevel()` — umbrales configurables por barbería
  - `calculateProfileFrequency()` — frecuencia e indicadores por perfil
  - `calculateStaffMetrics()` — promedios de equipo (solo visitas con barbero real)
  - `calculateVisitsByHour()` — distribución horaria para análisis de capacidad
  - `runMotorForBarbershop()` — runner completo para una barbería
  - `persistMotorResults()` — persiste snapshot y contextos
- [x] **`/api/cron/motor/route.ts`** — cron nocturno del Motor (3am). Solo procesa barberías PREMIUM. Paginación secuencial, manejo de errores por barbería.
- [x] **`vercel.json`** — agregado cron Motor (3am) junto al de reactivación (10am)
- [x] **Exclusiones de prueba registradas en BD** — `TestExclusion` con `593963410409` (César) en Chechebarber

**Barberías Premium configuradas para testing del Motor:**
- `Probando Barberos` (cmru1hgkp000004l2ml3yv1ik) — PREMIUM ACTIVE
- `Chechebarber` (cmrv83o3f000004jsf0m3r6zt) — PREMIUM ACTIVE

**Pendientes para próxima sesión:**

- [x] **Prueba del Motor validada (2026-07-26):** Motor corrió contra Chechebarber y Probando Barberos. Resultados:
  - Chechebarber: 22 APPROVED (1 excluida — César correcto), INSUFFICIENT_DATA: 11, NORMAL: 1. Pico 11am-12pm. Staff: Juan Pablo 4.3★, Dras Urich 4.4★, Zar Rutten 4.3★, Juan Perez 5.0★. ✅ Coherente.
  - Probando Barberos: 1 visita, 1 perfil sin datos. ✅ Correcto.
  - Exclusión por `TestExclusion` funcionó: BD tenía 23 APPROVED, Motor procesó 22.

- **DECISIÓN EXPLÍCITA — Historial legacy de `checkinMethod` (2026-07-26):**
  Las 23 visitas existentes en BD tienen `checkinMethod = "SELF"` (el default del schema). Esto es una **aproximación, no un dato verificado**. Decisión tomada explícitamente:
  - Para la data de Chechebarber (ficticia): aceptable como está. No hay migración retroactiva.
  - Para barberías reales en producción futura: cuando entren los primeros clientes reales, las visitas históricas previas al Motor también quedarán con `checkinMethod = "SELF"`. El Director IA **debe comunicar esta limitación** cuando analice periodos anteriores a la implantación del Motor — nunca presentar esos datos como verificados. Se dejará nota en el prompt del Director IA cuando se construya.
  - No hay script de migración retroactiva porque sería una suposición, no un dato real.

**Sprint A — EN CURSO (esta sesión):**
- [ ] `checkinMethod: SELF` en webhook (visitas desde WhatsApp)
- [ ] `checkinMethod: BARBER_ASSISTED_KNOWN` en `RegisterVisitModal`
- [ ] Botón CF (`BARBER_ASSISTED_ANONYMOUS`) — visita anónima sin número de cliente

**Sprint B — después:**
- [ ] Pantalla de configuración de barbería (umbrales de riesgo, modo de premio, duración)

**Sprint C — ciclo separado:**
- [ ] Modelo Cuenta/Perfil en UI
- [ ] QR de auto-registro de perfil (`/register/{barbershopId}`)

**Después de ~1 semana de datos reales:**
- [ ] Director IA



---

### Sesión 2026-07-24 — Sistema Auto-gestión de Reseñas + Ajuste de Precio Setup

> ⚠️ **CORRECCIÓN APLICADA 2026-07-25:** Las tareas marcadas con [x] abajo que mencionan `AWAITING_FEEDBACK`, `CustomerFeedback`, `DelayedTask cada 5 min` y `/api/cron/delayed-tasks` se documentaron como completadas **por error**. Confirmado vía query directa a la BD de producción (`information_schema`) el 2026-07-25: ninguna de esas piezas existe en producción. Se deja el registro histórico intacto para trazabilidad pero se corrige el estado real aquí.

**Tareas completadas:**
- [x] **Rating = 5 → reseña Google automática:** implementado en el webhook. El link se envía de forma inmediata al cliente (no via `DelayedTask`, sino directamente en el flujo del webhook). Campo `firstReviewSent` en schema y BD, funcional.
- [~] **Flujo rating < 5 (`AWAITING_FEEDBACK`, recordatorio 4-5h, tabla `CustomerFeedback`):** documentado como implementado, **en realidad NO existe**. La máquina de estados real es `IDLE → AWAITING_RATING → IDLE` solamente. Cuando rating < 5, el cliente no recibe ninguna acción adicional. (Ver corrección en [[13-COMPONENTES]])
- [~] **Cron `/api/cron/delayed-tasks` cada 5 min:** no existe. El procesamiento de `DelayedTask` está embebido en `/api/cron/reactivation`. Solo hay un cron en `vercel.json`.
- [x] **Campo `salesAgent` en Barbershop:** Agregado para trazabilidad de agentes de ventas (sin cálculo de comisión todavía).
- [x] **Verificación WhatsApp Business:** Confirmado que el check-in y mensajes corren sobre el número de la barbería vía Evolution API, no número personal del barbero.

**Decisión de negocio revertida:**
- La decisión de la sesión 2026-07-22 ("reseñas a discreción del barbero") se revierte. Nueva regla: **automático basado en rating del cliente** (solo para 5 estrellas).

**Pendientes:**
- [ ] **Copy definitivo de feedback:** César debe entregar el texto real para el flujo rating < 5 cuando se decida construirlo.
- [ ] **Migración de BD necesaria:** cuando se construya el flujo de feedback (rating < 5), crear `CustomerFeedback` y ajustar la máquina de estados.
- [ ] **Decisión pendiente:** ¿El flujo rating < 5 entra en el alcance del Motor + Director IA (doc 19) o es una etapa separada? No construir sin confirmación de César.
- [x] **Holdback de comisión:** Resuelto (sin holdback, comisión activa desde el primer pago). Documentado en [[17-PROGRAMA-LEONES-FUNDADORES]].
- [x] **Separación founder deal vs. precio completo:** Resuelto (Barbería Fundadora vs. León Fundador). Documentado en [[17-PROGRAMA-LEONES-FUNDADORES]].
- [ ] **Panel de comisiones para Leones:** Construcción técnica del panel de visualización y cálculo de comisiones. Bloqueante antes de escalar a los 20 Leones.
- [ ] **Marketing Horizonte 1 (Salida):** Definir criterio numérico exacto de salida (ciudades, barberías activas).
- [ ] **Relación ActivaQR vs BarberOS:** Aclarar la postura pública sobre la relación entre ambas marcas.
- [ ] **Voceros Horizonte 3:** Definir quién más, aparte de César, puede hablar en nombre de la marca.
- [ ] **Estrategia PR/Medios:** Redactar la estrategia concreta una vez cumplido el Horizonte 2.

---

### Sesión 2026-07-22 — Reestructuración de Precios, Primer Lifetime Vendido, Push Notifications

**Tareas completadas:**
- [x] **Reestructuración de precios confirmada y en producción:** Setup unificado USD 50 para ambos planes (Pro y Premium). Pro $9.99/mes, Premium $19.99/mes + $5/mes tokens IA aparte.
- [x] **Planes Anual y Lifetime creados:** Pro Annual $99 / Premium Annual $199; Pro Lifetime $500 / Premium Lifetime $1000 (hasta 12 cuotas vía Payphone).
- [x] **Trial público de 15 días:** Sin tarjeta, activo en el sitio.
- [x] **Primera venta Lifetime cerrada (2026-07-22): USD 500 — Pro Lifetime.** Primer dato real de venta a precio completo.
- [x] **Push notifications confirmado por versión del hijo:** Sprint 8 completado. Push nativo con sonido como canal primario, polling como fallback.
- [x] **Reseñas Google pasan a discrecionales:** El barbero decide si el cliente salió satisfecho antes de aprobar el envío. Ya no es automático a las 2h. *(Nota: esta decisión se volvió a revertir en sesión 2026-07-24 — ver esa sesión.)*
- [x] **Corrección de contradicción interna:** [[CONTEXT]] (Sprint 5, 6, 7 completados) ahora alineado con [[09-ROADMAP-TECNICO]] y [[13-COMPONENTES]].
- [x] **Documentación actualizada:** [[10-ROADMAP-COMERCIAL]], [[14-PRD]], [[03-ARQUITECTURA-WEB]], [[12-UX]], [[13-COMPONENTES]], [[09-ROADMAP-TECNICO]], [[05-ARQUITECTURA-DEL-PRODUCTO]].

**Pendientes:**
- [ ] **Spec técnica de push:** Detalle completo de la implementación de notificaciones push (pendiente confirmar con el hijo).
- [ ] **Copy del sitio:** Alinear texto de "envío automático a las 2h" con la nueva política de reseñas.
- [ ] **Decisión piloto fundador vs trial público:** ¿El piloto fundador (testimonio+reseña+60 días) sigue existiendo aparte del trial público de 15 días, o el trial lo absorbió?

---

### Sesión 2026-07-21 (tarde) — Bugs, Anti-Spam y Selección de Barbero

**Tareas completadas:**
- [x] **Hotfix nombre errado**: `pushName` ya no se usa como nombre del cliente (origen no confiable: puede venir de WhatsApp Web de otra persona, número compartido, etc.)
- [x] **Feedback de error en Rechazar**: `VisitActionButtons` ahora muestra mensaje de error cuando falla la petición.
- [x] **Tabla VisitAttempt**: Nueva tabla para auditoría de intentos de check-in (bloqueados, rechazados, exitosos).
- [x] **Endpoint `/api/visits/recover`**: Recuperar un rechazo accidental (vuelve a PENDING).
- [x] **Endpoint `/api/visits/rejected`**: Ver rechazos de los últimos 7 días para posible recuperación.
- [x] **Endpoint `/api/barbershop/staff`**: Lista de barberos para dropdowns.
- [x] **RegisterVisitModal**: Ahora pregunta "¿Quién te atendió?" con dropdown de barberos.
- [x] **Barberos de prueba creados**: Juanito `[cmruxfnqj00006oveltkxlky8]` y Abelito `[cmruxfnv800016ovehf72ahxf]` en Barbería Tuneche.

**Pendientes:**
- [ ] **Vercel**: Variables VAPID (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`) siguen sin configurar en producción.
- [ ] **Tagline logo**: Pendiente validación de campo (sesión 2026-07-19).
- [ ] **Frames video Interrogatorio**: Pending de sesión 2026-07-19.

---

### Sesión 2026-07-21 — PWA Push Notifications & Mapeo Completo de 18 Videos CDN

**Tareas completadas en esta sesión:**
- [x] **PWA Push Notifications (Sprint 8)**: Implementado sistema de notificaciones push nativas para el barbero con Web Push API, VAPID y Service Worker (`/public/sw.js`).
- [x] Modelo `PushSubscription` agregado a `schema.prisma` y sincronizado en Supabase vía `prisma db push`.
- [x] Componente `PushNotificationManager.tsx` integrado en el layout del panel para opt-in de notificaciones.
- [x] Endpoint `/api/push/subscribe` implementado con upsert e higiene de endpoints caducados (`410 Gone`).
- [x] Webhook WhatsApp (`/api/webhook/whatsapp/route.ts`) actualizado para disparar notificaciones push al barbero de forma asíncrona (fire-and-forget) cuando un cliente hace check-in.
- [x] Extracción y almacenamiento del nombre de contacto de WhatsApp (`pushName`) en `BarberCustomer`.
- [x] PWA Manifest (`/public/manifest.json`) e íconos generados (`/public/icons/icon-192x192.png`).
- [x] **Mapeo de 18 Videos CDN**: Integrados los 18 videos en sus respectivas páginas según la arquitectura (`/`, `/como-funciona`, `/precios`, `/historias`, `/resenas`).

**Tareas pendientes para la próxima sesión:**
- [ ] Configurar variables de entorno VAPID en Vercel Dashboard (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`).

---

### Sesión 2026-07-19 — Gobernanza, Home Cinematográfica y Logo

**Tareas completadas en esta sesión:**
- [x] Implementación de 10 escenas cinematográficas en la Home (Avatar 1).
- [x] Componentes: `ScrollSequence.tsx` con GSAP, `MarqueeDivisor.tsx`, `VideoFAQ.tsx`, indicador REC parpadeante.
- [x] 5 imágenes placeholder para el Interrogatorio copiadas a `/public/interrogatorio/`.
- [x] [[skill-madre]] actualizada con Gate de Comunicación + Protocolo Escalonado + Protocolo de Bitácora.
- [x] [[CONTEXT]] actualizado con Error 001 (tagline con avatar cruzado).
- [x] [[15-BRAND-KIT-BRIEFING]] creado como brief para Manus.
- [x] Decision logo: misma tipografía para "OS", misma altura, cambio de color a cobre. Tagline: pendiente de validación de campo.

---

**Tareas pendientes para la próxima sesión:**

- [ ] **LOGO — Tagline definitivo:** César sale mañana (2026-07-20) a recorrer barberías para su validación de campo. Al regresar, trae las frases textuales exactas que los dueños usaron para describir BarberOS (sin parafrasear). Con esos datos reales, elegimos el tagline final entre las opciones en juego.
- [ ] **HOME — Aplicar frames reales del video de César:** César va a grabar el video de las 5 escenas del Interrogatorio. Al tener los frames, reemplazar las imágenes placeholder en `/public/interrogatorio/` y ajustar el `ScrollSequence` si la relación de aspecto lo requiere.
- [ ] **LOGO — Enviar ajuste a Manus:** Cambiar las tres palabras en inglés debajo del logo por `CERTEZA | CONTROL | PATRIMONIO` (tipografía idéntica, mismo tamaño). Tagline final por debajo o integrado, a definir tras validación de campo.

---

**Hipótesis no validadas (traer datos reales de campo):**

- Avatar 1 (1-2 sillas) posiblemente dirá: *"me avisa solo cuándo un cliente no ha vuelto"* o *"ya no ando adivinando quién se me fue"*.
- Avatar 2 (3-5 sillas) posiblemente dirá: *"tengo control de mis barberos, sé quién rinde más"* o *"se ve más profesional, tengo todo en un sistema"*.
- Ninguna de estas frases tiene que coincidir literalmente con el tagline del logo — cumplen trabajos distintos. El tagline es identidad permanente; la frase de boca en boca nace de la experiencia real del usuario.

---

**Decisiones tomadas (no llevadas a documento oficial aún):**

- El tagline **NO** debe activar dolor ni código reptil directamente — eso es lenguaje situacional (Home, anuncios), no identidad permanente (logo).
- Candidatos en tabla: `"Deja de adivinar."` (favorito actual, declaración de postura), `"Saber. Decidir. Construir."` (institucional), `"La barbería que sí sabe."` (identidad del usuario).
- Decisión final bloqueada intencionalmente hasta tener datos de campo reales.

---

**Pregunta de seguimiento — Antigravity pregunta al iniciar la próxima sesión:**

> *"César, ¿cómo te fue en la validación de campo con las barberías? ¿Qué frases exactas usaron los dueños para describir qué hace BarberOS? Con esas frases cerramos el tagline del logo y avanzamos con los frames del video para la Home."*
