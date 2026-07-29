# CONTEXT.md
> Última actualización: 2026-07-29 | Estado: Activo | Autor: Antigravity

> **📌 Regla del Grafo:** Al mencionar cualquier documento de Documentación/, usar siempre formato `[[nombre]]`. Esto mantiene las conexiones del Grafo de Obsidian actualizadas.

---

Este documento actúa como la **memoria de ejecución actual** del proyecto BarberOS. Mantiene al equipo y a cualquier agente de desarrollo alineados con la realidad del código en producción en todo momento, evitando confusiones de versiones o supuestos.

---

## 📌 Estado de Sprints & Fases

### Fase 0 — Validación (Completada)
- **Next.js + Prisma + MySQL (cPanel/StackCP)**: Operando. *(Nota 2026-07-25: La BD de producción es MySQL via cPanel/StackCP, no Postgres/Supabase. La documentación previa mencionaba Supabase — el proyecto migró de Supabase a MySQL/cPanel en alguna etapa anterior; el driver actual es `@prisma/adapter-mariadb`. Prisma abstrae el motor, el código funciona igual.)*
- **Check-in vía WhatsApp**: Totalmente funcional (`src/app/api/webhook/whatsapp/route.ts`).
  - Límite estricto de 24 horas por cliente.
  - Generación de visitas en estado `PENDING`.
  - Cola de aprobación en tiempo real (`ApprovalQueue`) mediante polling.
  - **Máquina de estados real (cotejo 2026-07-25):** `IDLE → AWAITING_RATING → AWAITING_FEEDBACK → IDLE`.
    - Rating = 5 → envío inmediato de link Google My Business + `firstReviewSent: true`. **Implementado.**
    - Rating < 5 → estado `AWAITING_FEEDBACK`, solicita comentario escrito. El comentario se guarda en `BarberVisit.comment`. **Implementado en el webhook.** Confirmado por captura de WhatsApp real (2026-07-25).
    - **Lo que NO existe:** tabla `CustomerFeedback` separada (feedback va a `BarberVisit.comment`), recordatorio/timeout a las 4-5h, cron separado `delayed-tasks`. Estas piezas están pendientes.
- **Magic Link de Acceso**: Backend y UI listos. Genera `MagicToken` de 15 minutos y se envía vía Evolution API.
- **Seguridad y Aislamiento Multi-tenant (Sprint 5)**: 
  - ✅ **Completado**. Firma/lectura de JWT mediante la cookie `session` en `src/proxy.ts` y DAL (`src/lib/dal.ts`) para Server Components.
  - ✅ **Completado**. Integrado logout con Server Actions en el Layout del Panel.

### Fase 1 — Piloto (10 Barberías Fundadoras)
- **Sprint 6 — Automatizaciones (Te extrañamos)**: ✅ **Completado**. Cron `/api/cron/reactivation` integrado con BD real en producción y Vercel Crons (10am diario). Este mismo cron procesa `DelayedTask` pendientes.
- **Sprint 7 — Métricas Reales**: ✅ **Completado**. Dashboard consume métricas reales en vivo de la BD MySQL filtradas estrictamente por `barbershopId` de la sesión.
- **Sprint 8 — PWA Push Notifications**: ✅ **Completado** (2026-07-21). El panel es ahora una Progressive Web App instalable. Cuando un cliente hace check-in por WhatsApp, el servidor envía una notificación push nativa al celular del barbero aunque el panel esté cerrado.
  - Nuevo modelo `PushSubscription` en BD (barbershopId, endpoint, p256dh, auth).
  - Service Worker en `public/sw.js` con `requireInteraction: true`.
  - `PushNotificationManager.tsx` gestiona opt-in, registro de SW y sincronización de suscripción.
  - `src/lib/push.ts` centraliza el envío con auto-limpieza de endpoints 410 Gone.
  - `ApprovalQueue.tsx` se mantiene como fallback para cuando el panel está abierto.
- **Sistema de reseñas y feedback (cotejo 2026-07-25):**
  - Rating = 5 → link Google My Business enviado de inmediato. **Implementado.**
  - Rating < 5 → `AWAITING_FEEDBACK` + solicita comentario escrito → guarda en `BarberVisit.comment`. **Implementado.** (Sin recordatorio a las 4-5h todavía.)

### Fase 2 — BarberOS Premium (en construcción activa)
- **Motor de Conocimiento (07)**: ✅ **Capa Determinística IMPLEMENTADA Y EN PRODUCCIÓN** (2026-07-25). Ver [[07-MOTOR-DE-CONOCIMIENTO]] y [[19-INSTRUCCION-MOTOR-DIRECTOR]] para el detalle.
  - Tablas nuevas: `CustomerProfile`, `ProfileMotorContext`, `MotorSnapshot`, `TestExclusion`.
  - Campos nuevos en `BarberVisit`: `checkinMethod`, `profileId`, `services`, `visitHour`.
  - Campos nuevos en `Barbershop`: `riskThresholdNormal`, `riskThresholdAt`, `loyaltyMode`, `visitDurationMin`, `anonymousVisitCounter`.
  - Librería determinística: `src/lib/motor.ts` con cálculo de frecuencia, riesgo, métricas de equipo y distribución horaria.
  - Cron nocturno: `/api/cron/motor` (3am) — solo procesa barberías PREMIUM.
- **Director IA (08)**: ✅ **PRIMER AGENTE IMPLEMENTADO EN PRODUCCIÓN** (2026-07-26) — Director General con Groq Llama 3.3 70B.
  - Fallback transparente al motor determinístico si falla la API key.
  - Disclaimer obligatorio de incertidumbre por tarjeta.
  - Detección temprana de Atrasados + Riesgo Crítico.
  - Documentado en [[19-INSTRUCCION-MOTOR-DIRECTOR]].
- **Sistema de Control de Acceso por planType (2026-07-26)**: ✅ Implementado.
  - `src/lib/plan-guard.ts` con `checkPremiumAccess()` (APIs) e `isPremiumBarbershop()` (RSC).
  - `UpgradeBanner.tsx` para secciones Premium en cuentas PRO (sin pantallas rotas).
  - `MotorSummaryWidget.tsx` en panel principal: PRO ve banner, PREMIUM ve mapa de riesgo + métricas de equipo + contadores CF.

---

## 🛠️ Foto Técnica de Producción

### Dependencias Clave
- `next`: `16.2.10` (App Router + Turbopack)
- `react`: `19.2.4`
- `prisma`: `7.8.0` con `@prisma/adapter-mariadb`
- `jose`: `6.2.3` (para firma de JWT en runtime Edge/Node)
- `axios`: `1.18.1` (comunicación con Evolution API)
- `web-push`: `3.x` (PWA Push Notifications vía VAPID)
- `groq-sdk` (Director IA — Llama 3.3 70B)

### Estructura del proyecto (post-rediseño)
- `src/components/redesign/` — Sistema visual premium (GlassCard, MetricTile, SectionTabs, PanelHero, FloatingNav, TabsCarousel, PillButton, ProgressRing).
- `src/components/panel/` — Componentes del panel del dueño (PanelNav, DashboardClient, ClientesTabs, ConfigForm, DirectorWidget, MotorSummaryWidget, UpgradeBanner, etc.).
- `src/components/landing/` — Componentes de la landing pública.
- `src/components/public/` — Componentes de páginas públicas secundarias.
- `src/lib/` — Utilidades (motor.ts, plan-guard.ts, rate-limit.ts, push.ts, evolution.ts, boxcode.ts, dal.ts).

### Variables de entorno requeridas
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — clave pública VAPID (expuesta al browser). **Pendiente configurar en Vercel Dashboard.**
- `VAPID_PRIVATE_KEY` — clave privada VAPID (solo servidor). **Pendiente configurar en Vercel Dashboard.**
- `VAPID_EMAIL` — email de contacto para VAPID. **Pendiente configurar en Vercel Dashboard.**
- `GROQ_API_KEY` — API key del Director IA (Groq Llama 3.3 70B). **Configurada y operativa.** Decisión explícita: se mantiene la llave de pruebas del tier gratuito por la fase piloto. Backlog: migrar a llave productiva propia antes de escalar más allá de las 4 barberías piloto.
- `BARBEROSPLUS_API_KEY` — API key compartida con barberosplus.com para el sistema de referidos QR. Configurada.
- `ADMIN_SECRET_KEY` — Bearer token para SuperAdmin.

> ⚠️ **Pendiente deploy:** las 3 vars VAPID deben agregarse al dashboard de Vercel (Settings → Environment Variables). Sin ellas, el webhook fallará silenciosamente al intentar enviar pushes.

### Componentes y Rutas documentados en la base de conocimiento
1. **SuperAdmin (`/admin`)**: Panel completo para onboarding de nuevas barberías y control de `planStatus` (TRIAL/ACTIVE/SUSPENDED) autenticado con `ADMIN_SECRET_KEY` vía Bearer. Toggle PRO/PREMIUM funcional.
2. **`planStatus` / `trialEndsAt`**: Campos definidos en el modelo `Barbershop` para control comercial.
3. **`/panel/configuracion`**: UI para que el dueño edite `riskThresholdNormal`, `riskThresholdAt`, `loyaltyMode`, `visitDurationMin`. Protegido por sesión. Backend: `PATCH /api/barbershop/settings`.
4. **`/panel/clientes`**: Dashboard de Perfiles (`CustomerProfile`) con atribución de Cuenta WhatsApp y cálculo de lealtad según `loyaltyMode` (BY_PROFILE vs BY_ACCOUNT).
5. **`/registro/[barbershopId]`**: Flujo público de auto-registro vía QR. Captura Nombre, WhatsApp, Fecha de Nacimiento (Día/Mes) y Canal de adquisición. Backend: `/api/clientes/registro` con validación Zod y rate limit persistente.
6. **Sistema de Referidos QR**: Integración bidireccional con barberosplus.com vía webhooks firmados. Ver [[21-SISTEMA-REFERIDOS-QR]] y [[22-SISTEMA-COMISIONES-REFERRAL]]. Reporte final en [[24-REPORTE-FINAL-INTEGRACION]].
7. **Sistema de Rediseño Visual** (`src/components/redesign/`): Sistema de componentes premium con glassmorfismo, paleta de marca coherente (#d97644 / #e8a33d / #0D0D0D / #f3ece1), tipografía editorial (Fraunces + Space Grotesk + JetBrains Mono). Ver [[13-COMPONENTES]].

### Tablas añadidas en producción (post-Fase 0)
- `CustomerProfile` — persona real dentro de una cuenta WhatsApp (modelo Cuenta/Perfil).
- `ProfileMotorContext` — contexto calculado por el Motor (frecuencia, riesgo, vigencia) por perfil.
- `MotorSnapshot` — resumen nocturno por barbería (dimensiones: Negocio, Clientes, Equipo).
- `TestExclusion` — números excluidos del cálculo (ej. barberos, dueños, números de prueba).
- `RateLimitAttempt` — intentos de rate-limit persistente en MySQL.
- Campos en `BarberVisit`: `checkinMethod` (SELF, BARBER_ASSISTED_KNOWN, BARBER_ASSISTED_ANONYMOUS), `profileId`, `services`, `visitHour`.
- Campos en `Barbershop`: `riskThresholdNormal`, `riskThresholdAt`, `loyaltyMode` (BY_PROFILE/BY_ACCOUNT), `visitDurationMin`, `anonymousVisitCounter`, `salesAgent`.

---

## 📂 Enlaces Clave del Vault
- [[_index]] — Mapa conceptual de la base de conocimiento.
- [[09-ROADMAP-TECNICO]] — Planificación y fases de liberación.
- [[13-COMPONENTES]] — Biblioteca de componentes reales y pendientes.

---

## 🎨 Rediseño Visual del Panel (2026-07-27 → 2026-07-29)

**Contexto:** El panel existente mostraba bloques sólidos apilados sin jerarquía visual ni identidad de marca coherente con el sitio público. Se construyó un sistema de componentes premium reutilizables en `src/components/redesign/`, alineado con la paleta de marca ya programada (#d97644, #e8a33d, #0D0D0D, #f3ece1) y la dirección cinematográfica definida en [[15-BRAND-KIT-BRIEFING]].

### Componentes creados
| Componente | Tipo | Función |
|---|---|---|
| `GlassCard` | Client | Tarjeta con efecto vidrio (fondo `bg-[#1a1614]/70`, borde sutil, gradiente lineal en el top). |
| `MetricTile` | Client | Tarjeta glassmórfica para métricas. Acepta accent (`orange`/`amber`/`green`/`neutral`), badge, footer. |
| `PanelHero` | Server | Hero a sangre completa con imagen + degradado oscuro + viñeta naranja. Soporta eyebrow, badge, action y overlay. |
| `SectionTabs` | Client | Tabs píldora/segmented control con badge numérico y variantes `pill` y `underline`. |
| `TabsCarousel` | Client | Wrapper con scroll horizontal + flecha pulsante "desliza →" en móvil. Auto-hide tras 5s. |
| `PillButton` | Client | Botón píldora con variantes `primary` (gradiente naranja) / `ghost` / `outline`. |
| `ProgressRing` | Server | Anillo de progreso SVG con gradiente naranja→ámbar. |
| `FloatingNav` | Client | Barra inferior flotante con tabs circulares (referencia fitness) y tooltip on hover. |

### Paleta aplicada (NO cambiar)
- Fondo: `#0a0807` (carbón cálido, NO negro puro).
- Texto principal: `#f3ece1` (crema).
- Texto secundario: `#a89e90`, `#5c554c`.
- Acento primario: `#d97644` (naranja terracota).
- Acento secundario: `#e8a33d` (ámbar/dorado).
- Acento positivo: `#4ADE80` (verde) — **SOLO** indicadores positivos, nunca decoración.
- Tipografía: **Fraunces** (serif display) + **Space Grotesk** (sans body) + **JetBrains Mono** (etiquetas uppercase, métricas).

### Imágenes hero usadas (Unsplash CDN)
- Dashboard Reputación: `photo-1521590832167-7bcbfaa6381f`
- Dashboard Clientes: `photo-1503951914875-452162b0f3f1`
- Dashboard Retención: `photo-1599351431202-1e0f0137899a`
- Dashboard Recupera: `photo-1622286342621-4bd786c2447c`

### Patrones aprendidos (referencia para futuras sesiones)
- **Server Components con Prisma NO pueden importarse en Client Components.** Si el padre es client, pasar el resultado de Prisma como `children` o `ReactNode` prop.
- **Hidratación de tiempo falla con `toLocaleTimeString`.** Usar `getUTCHours() - 5` (Ecuador = UTC-5) con `suppressHydrationWarning`.
- **Pre-existe un error de hidratación en `BarberosView.tsx`** que no es causado por este rediseño. Mantener `suppressHydrationWarning` hasta investigar.
- **GlassCards sobre imágenes hero** deben usar `elevated` prop para sumar `ring-1 ring-[#d97644]/15` y mantener contraste.
- **`FloatingNav` con `z-40` queda debajo del `ApprovalQueue` flotante** (que usa `z-50`). Mantener este orden para que la cola de aprobación tape la nav cuando esté activa.

---

## ⚠️ Errores de proceso corregidos

### Error 001 — Tagline con avatar cruzado
**Fecha:** 2026-07-19  
**Causa raíz:** El agente generó copy de marca (tagline de logo) sin haber leído previamente [[04-SISTEMA-DE-COMUNICACION]] ni la sección "Arquitectura de Avatares" de [[02-ARQUITECTURA-ESTRATEGICA]]. El texto resultante ("INFRASTRUCTURE | SYSTEMS | TRANSFORMATION") usó palabras en inglés corporativo genérico, directamente contradictorias con las listas de palabras prohibidas y el tono definido para el Avatar 1.  
**Por qué pasó:** No existía un gate explícito que obligara la lectura de esos dos documentos antes de generar copy. El agente respondió desde memoria de entrenamiento general en lugar de contrastar con la fuente local.  
**Fix aplicado:** Se añadió el "Gate obligatorio de comunicación" y el "Protocolo de razonamiento escalonado" al final de [[skill-madre]]. Ambos son de cumplimiento obligatorio a partir de esta fecha.  
**Patrón a reconocer:** Cualquier tarea que incluya palabras como *nombre*, *tagline*, *CTA*, *texto para la web*, *mensaje de WhatsApp* o *copy* activa automáticamente el Nivel 1 del protocolo — sin importar cuán pequeña o rápida parezca la tarea.

### Error 002 — Empatía antes que confrontación
**Fecha:** 2026-07-20  
**Causa raíz:** El agente generó copy de objeción para BarberOS que enfrentaba directamente al prospecto ("¿Por qué no me sirvió la tarjeta de fidelidad clásica?") sin aplicar primero el principio de empatía definido en [[04-SISTEMA-DE-COMUNICACION]] y en la skill de guiones. El texto resultante decía "¿Tienes tiempo para llevar eso a mano?" — confrontación directa antes de generar conexión.  
**Por qué pasó:** No existía un gate que verificara el orden del flujo retórico antes de generar copy de objeciones. La skill de guiones ya tenía la corrección registrada, pero [[CONTEXT]] — la memoria institucional del proyecto — no la reflejaba, dejando el aprendizaje parcializado en un solo archivo.  
**Fix aplicado:** Se registró el error en `CONTEXT.md` bajo la sección "Errores de proceso corregidos", garantizando que el aprendizaje viva tanto en la skill específica de guiones como en la memoria central del proyecto.  
**Patrón a reconocer:** Cualquier tarea que genere copy de objeción, defensa, contra-argumento o pregunta retórica debe verificar primero que el flujo empieza con empatía y validación antes de introducir cualquier elemento de confrontación — sin importar cuánto el framing inicial invite a "abrir con la herida".
