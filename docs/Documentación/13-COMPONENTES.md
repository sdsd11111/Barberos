---
id: 13-componentes
titulo: Librería de Componentes
categoria: tecnico
estado: activo
sprint: fase-1-piloto-activo
ultima_revision: 2026-07-29
relacionado:
  - 09-ROADMAP-TECNICO
  - 06-DASHBOARD
  - 12-UX
  - 15-BRAND-KIT-BRIEFING
---

# 13-COMPONENTES.md

> Versión: 2.0
>
> Estado: Activo
>
> Clasificación: CONFIDENCIAL
>
> Tipo de documento: Librería de Componentes
>
> Audiencia: Desarrollo, Diseño
>
> Este documento NO debe distribuirse públicamente.

---

# Objetivo

Inventariar los componentes ya construidos y los pendientes, para que el desarrollo (Antigravity/Abel) no reinvente lo existente y mantenga consistencia visual y funcional.

> **Nota 2026-07-29:** Sprint E (Rediseño Visual del Panel) introdujo un sistema de componentes premium en `src/components/redesign/` que reemplaza los bloques sólidos apilados del panel anterior. Todo nuevo desarrollo del panel debe usar estos componentes. Los componentes heredados (sidebar fijo, métricas en grid, etc.) siguen activos pero son candidatos a reemplazo gradual.

---

# Sistema de Rediseño Visual (`src/components/redesign/`)

> Implementado en Sprint E (2026-07-27 → 2026-07-29). Coherente con la dirección cinematográfica de [[15-BRAND-KIT-BRIEFING]]. **Todo componente del panel nuevo debe construirse sobre esta base, no inventar estilos nuevos.**

## Paleta y tokens visuales (NO cambiar)

| Token | Valor | Uso |
|---|---|---|
| Fondo base | `#0a0807` | Fondo del panel y degradados de hero |
| Texto principal | `#f3ece1` | Títulos, valores |
| Texto secundario | `#a89e90` | Subtítulos, captions |
| Texto terciario | `#5c554c` | Labels desactivados |
| Acento primario | `#d97644` | CTAs, valores destacados, estado activo |
| Acento secundario | `#e8a33d` | Hover, anillos de progreso, gradientes |
| Acento positivo | `#4ADE80` / `emerald-400` | **SOLO** indicadores de éxito |
| Borde sutil | `#3a2f25` / `#2a2520` | Bordes de tarjetas |
| Tipografía display | Fraunces (serif) | Títulos, hero |
| Tipografía body | Space Grotesk (sans) | Texto corrido |
| Tipografía mono | JetBrains Mono | Etiquetas uppercase, métricas, códigos |

## `GlassCard`

- Client Component.
- Tarjeta con efecto vidrio sobre fondo oscuro: `bg-[#1a1614]/70 border border-[#3a2f25]/80` + `shadow-[0_8px_30px_rgba(0,0,0,0.55)]`.
- Línea de luz sutil en el top (gradiente horizontal `via-[#f3ece1]/15`).
- Padding configurable (`sm` / `md` / `lg`).
- Prop `elevated` agrega `ring-1 ring-[#d97644]/15` para tarjetas sobre imágenes hero.

## `MetricTile`

- Client Component.
- Tarjeta glassmórfica para mostrar una métrica del dashboard.
- Props: `label`, `value` (string|number), `caption`, `footer` (ReactNode), `accent` (`orange` | `amber` | `green` | `neutral`), `icon`, `href`, `onClick`, `headerExtra`.
- Acento `orange` → `#d97644`, `amber` → `#e8a33d`, `green` → `emerald-400`, `neutral` → `#f3ece1`.
- Si `href` está definido, hace la tarjeta entera clickable como Link.
- Usada en `/panel`, `/panel/clientes`, `/panel/configuracion`, `/panel/barberos`.

## `PanelHero`

- Server Component (puede usar Prisma vía children).
- Hero "a sangre completa" con imagen real de fondo + degradado oscuro que se funde con `#0a0807`.
- Props: `imageUrl`, `eyebrow`, `badge`, `title`, `subtitle`, `action`, `minHeight` (default 320px desktop / 280px móvil), `overlay`, `imagePosition`.
- **Estructura interna en 3 capas:** imagen, degradado inferior (180deg), degradado lateral (90deg, oculto en móvil), viñeta naranja sutil.
- Imágenes predeterminadas en producción (Unsplash CDN): ver sección "Imágenes hero" en [[CONTEXT]].

## `SectionTabs`

- Client Component.
- Tabs píldora/segmented control con dos variantes: `pill` (default, estilo referencia fitness) y `underline`.
- Props: `tabs[]` (`{id, label, icon?, badge?}`), `activeTab`, `onChange`, `variant`, `className`.
- Variante `pill`: contenedor con `rounded-full` + `bg-[#1a1614]/80`, botón activo con gradiente naranja.
- Variante `underline`: tabs horizontales con borde inferior naranja de 0.5px en estado activo.
- Soporta badge numérico a la derecha del label.

## `TabsCarousel`

- Client Component.
- Wrapper con scroll horizontal + indicador visual "desliza →" en móvil.
- Detecta overflow automático y muestra flecha pulsante naranja mientras haya contenido oculto.
- Auto-hide tras 5 segundos aunque no haya scroll.
- Gradiente negro en el borde derecho (solo móvil, solo si hay overflow).
- Snap horizontal en móvil (`snap-x snap-mandatory`), desactivado en desktop.

## `PillButton`

- Client Component.
- Botón píldora con variantes: `primary` (gradiente naranja con sombra interior y exterior), `ghost` (transparente), `outline` (borde sutil).
- Tamaños: `sm` (h-9), `md` (h-11, default), `lg` (h-14).
- Tipografía monoespaciada uppercase con tracking `[0.18em]`.
- `leadingIcon` opcional para iconos a la izquierda.

## `ProgressRing`

- Server Component.
- Anillo de progreso circular SVG con gradiente naranja→ámbar.
- Props: `value`, `max` (default 100), `size` (default 170px), `stroke` (default 11px), `color`, `trackColor`, `label`, `suffix`, `caption`.
- `aria-valuenow`, `aria-valuemin`, `aria-valuemax` para accesibilidad.
- Usado en `/panel` para tasa de retorno y progreso de lealtad.

## `FloatingNav`

- Client Component.
- Barra de navegación inferior flotante con tabs circulares (estilo referencia fitness).
- `fixed bottom-5 left-1/2 -translate-x-1/2 z-40` — queda debajo del `ApprovalQueue` (z-50).
- Props: `tabs[]` (`{href, label, icon, exact?}`).
- Estado activo: gradiente naranja con `scale-110` y sombra exterior.
- Tooltip monoespaciado que aparece en hover.
- Usa `usePathname()` para detectar ruta activa.
- En el panel se muestra en móvil y tablet; en desktop coexiste con el sidebar tradicional.

---

# Componentes ya implementados

## `RegisterVisitModal`

- Client Component.
- Overlay con `backdrop-blur-sm`, fondo `rgba(10,8,7,0.8)`.
- Input de WhatsApp con prefijo `+`.
- Estados: `idle` → `loading` → `success` | `error`.
- Auto-cierre a los 2 segundos tras éxito.
- Llama a `POST /api/visits` con `barbershopId` dinámico.

## `ApprovalQueue`

- **Mecanismo real (Sprint 8, 2026-07-21):** Push nativo con sonido como canal primario (enviado via `PushNotificationManager` + `src/lib/push.ts`), incluso cuando el panel está cerrado. Cola visual en el panel como fallback para cuando está abierto.
- Posición sticky en la parte inferior del panel (mobile-first).
- Acciones: Aprobar → `POST /api/visits/approve`; Rechazar → `POST /api/visits/reject`.
- Lista alimentada por `GET /api/visits/pending`.
- **Detalle técnico pendiente de confirmar con el hijo** (spec de implementación del push).

## Sistema automático de reseñas post-calificación

> ✅ **RE-CORRECCIÓN 2026-07-25 (segunda vuelta):** La corrección anterior de esta misma sesión fue excesiva. El estado `AWAITING_FEEDBACK` **SÍ está implementado** en el webhook (`route.ts` líneas 280-307 y 366-379). Confirmado por captura de WhatsApp real: un cliente calificó con 3, el sistema preguntó "qué podemos mejorar?", el cliente respondió y el sistema agradeció. Lo que **no existe** es la tabla `CustomerFeedback` y el recordatorio a las 4-5h.

**Máquina de estados real — cotejo 2026-07-25:**
- `IDLE → AWAITING_RATING → AWAITING_FEEDBACK → IDLE` — **implementada en el webhook.**
- **Rating = 5** → envía link Google My Business inmediatamente + `firstReviewSent: true`. **Implementado.**
- **Rating 1-4** → establece `sessionState: "AWAITING_FEEDBACK"`, solicita comentario escrito. El comentario se guarda en `BarberVisit.comment`. **Implementado.**
- **Exclusividad del número telefónico:** el check-in ya corre sobre el WhatsApp Business de la barbería (`whatsappConnected`, vía Evolution API). Ya está en producción.

**Lo que está PENDIENTE DE CONSTRUIR:**
- **Tabla `CustomerFeedback`:** no existe en BD (confirmado por `information_schema` 2026-07-25). El feedback va a `BarberVisit.comment`. Se decide construir cuando haya necesidad de historial separado.
- **Recordatorio/timeout a las 4-5h:** no implementado. El cliente que no responde simplemente queda en `AWAITING_FEEDBACK` hasta que envíe cualquier mensaje o haga un nuevo check-in.
- **Cron separado `/api/cron/delayed-tasks`:** no existe. `DelayedTask` lo procesa el cron `reactivation` (10am diario).

## Sidebar del panel

- Ancho fijo 256px (`w-64`).
- Fondo `#0a0807`.
- Links en `font-mono`, uppercase, tracking amplio.
- Estado activo: borde izquierdo naranja + fondo `#131110`.
- Botón de logout fijo en la parte inferior.

## Utilidad `getProgressBar(current, target)`

- Genera barra Unicode: `█` (lleno) / `░` (vacío).
- Ejemplo: `getProgressBar(3, 5)` → `[███░░] 3 de 5`.
- Usada tanto en el mensaje de WhatsApp como en el dashboard visual.

## Código de caja / QR (Dashboard)

- Grid de 3 columnas: código (2 cols) + QR (1 col).
- Código mostrado en `text-9xl`, fuente Fraunces.
- Métricas en grid sin espaciado, con bordes de 1px entre celdas (estética "ficha técnica").

## `LoginMagicLink` — **implementado, confirmado por cotejo del 19/07/2026**

- `src/app/(public)/login/page.tsx` — UI de login, pide número de WhatsApp.
- `src/app/api/auth/request-link/route.ts` — genera `MagicToken` (crypto 32 bytes), expiración 15 min, envío por Evolution API.
- `src/app/api/auth/verify/` — ruta de verificación del token.
- Modelo `MagicToken` en el schema (`usedAt`, `expiresAt`).
- Esta es la pieza que sostiene la promesa de venta "no necesitas usuario ni contraseña" — ya es real, no solo discurso.
- **Nota:** este login autentica al dueño para *entrar*, pero como el panel no valida sesión después de entrar (ver `AuthGate` abajo), el link mágico resuelve el acceso inicial, no la seguridad multi-tenant.

---

# Componentes existentes NO documentados hasta este cotejo (19/07/2026)

## `SuperAdmin Panel` (`/admin`)

- Autenticación por `ADMIN_SECRET_KEY` (Bearer token).
- Onboarding de barberías nuevas, cambio de `planStatus` (TRIAL/ACTIVE/SUSPENDED).
- Pendiente: documentar formalmente en un `13b` o anexo, y decidir si Antigravity necesita reforzar su seguridad antes de escalar.

## `planStatus` / `trialEndsAt` (schema)

- Existen en BD y en el SuperAdmin, pero **sin middleware que los aplique** — una barbería en `SUSPENDED` no pierde acceso real todavía.

## `connectionStatus` (Barbershop)

- Campo en schema, sin uso funcional en el código todavía.

## `AuthGate` / Multi-tenant login (Sprint 5) — **completado, confirmado por cotejo del 19/07/2026**

- Login simplificado, coherente con el principio de "sin usuario ni contraseña" para el cliente final, pero con autenticación real para el dueño/staff (roles: OWNER, BARBER).
- Firma/lectura de JWT mediante la cookie `session` en `src/proxy.ts` y DAL (`src/lib/dal.ts`) para Server Components.
- Integrado logout con Server Actions en el Layout del Panel.

## `ReactivationCron` (Sprint 6) — **completado**

- No es un componente visual, es un job.
- Envía el mensaje "Te extrañamos" a clientes con más de 30 días sin `lastVisitAt` actualizado.
- Cron `/api/cron/reactivation` integrado con BD real en producción y Vercel Crons (10am diario).
- **Nota importante (cotejo 2026-07-25):** este mismo cron procesa también los `DelayedTask` pendientes (ej: envío de reseña Google). No existe un cron separado `/api/cron/delayed-tasks` ni un schedule de 5 minutos — todo lo hace el job de reactivación. El `vercel.json` tiene un único cron registrado.

## `MetricsDashboard` (Sprint 7) — **completado**

- Reemplaza el "Libro Diario" vacío.
- Dashboard consume métricas reales en vivo de la BD PostgreSQL filtradas estrictamente por `barbershopId` de la sesión.
- No incluye todavía predicción de churn ni LTV — eso pertenece a la Fase 2 (Premium).

## `salesAgent` (Pendiente de desarrollo)

- Campo existente en schema `Barbershop`.
- Pendiente construir:
  a) Lógica de cálculo de comisión sobre mensualidad excluyendo tokens IA.
  b) Vista simple (panel) para el León de sus barberías activas e ingresos ($, no jerga).
  c) Mecanismo de reasignación de código tras 15 días sin actividad.
- *Nota:* Bloqueante antes de escalar a los 20 Leones.

---

# Componentes de Premium y Motor (Fase 2)

## `UpgradeBanner` (`src/components/panel/`)

- Server Component.
- Pieza del sistema de Gating por `planType`. Se renderiza en cuentas `PRO` donde iría una sección Premium.
- **No es pantalla rota ni error.** Es un componente decorativo con CTA a `/precios`.
- Acompaña a `MotorSummaryWidget` y `DirectorWidget` cuando aplica el downgrade visual.

## `MotorSummaryWidget` (`src/components/panel/`)

- Server Component.
- Resumen del Motor de Conocimiento en el dashboard principal.
- `PRO`: muestra `UpgradeBanner`.
- `PREMIUM`: muestra mapa de riesgo (`AT_RISK` / `DELAYED` / `NORMAL`), métricas de equipo (top barberos por rating) y contadores de visitas anónimas (`BARBER_ASSISTED_ANONYMOUS`).
- Consume `getMotorSnapshot()` de `src/lib/motor.ts`.

## `DirectorWidget` (`src/components/panel/`)

- Client Component.
- Recomendaciones del Director IA en el dashboard.
- Badge dinámico del modelo en uso: `LLM Real (Groq llama-3.3-70b-versatile)` o `Motor Determinístico` (fallback).
- Disclaimer obligatorio de incertidumbre por tarjeta.
- Botones de 1-Clic a WhatsApp para ejecutar la recomendación.

## `DirectorChatWidget` (`src/components/panel/`)

- Client Component.
- Variante conversacional del Director IA (preguntas libres del dueño).
- Mismo backend que `DirectorWidget` pero con interfaz de chat.

## `ConfigForm` / `ConfigTabs` (`src/components/panel/`)

- Componentes del flujo `/panel/configuracion` (Sprint B, 2026-07-26).
- `ConfigForm.tsx` — formulario de edición de `riskThresholdNormal`, `riskThresholdAt`, `loyaltyMode`, `visitDurationMin`.
- `ConfigTabs.tsx` — tabs píldora para separar Configuración de Barbería de Configuración de WhatsApp.
- Persistencia vía `PATCH /api/barbershop/settings`.

## `ClientesTabs` (`src/components/panel/`)

- Server Component que renderiza las pestañas del dashboard `/panel/clientes`.
- Ahora lista **Perfiles** (`CustomerProfile`), no clientes por número de teléfono.
- Muestra a qué Cuenta WhatsApp pertenece cada perfil y calcula el avance de lealtad según `loyaltyMode` (`BY_PROFILE` vs `BY_ACCOUNT`).

## `StaffManager` (`src/components/panel/`)

- Gestión del equipo de barberos desde el panel.
- Lista, crea y edita registros de `BarberStaff` por barbería.

---

# Componentes de la landing pública (referencia visual, no funcional)

La landing actual (`barberos-rho-henna.vercel.app`) ya tiene una estructura de 12 secciones cinematográficas con scroll narrativo y cursor personalizado. Estos bloques se mantienen como base visual, pero su contenido y orden se actualizan según [[03-ARQUITECTURA-WEB]] (pendiente de reescritura con el nuevo ADN centrado en tranquilidad/control).

---

# Convenciones de nomenclatura

- Componentes de cliente (`'use client'`) en PascalCase, un archivo por componente.
- Utilidades puras (sin estado) viven en `src/lib/`, nunca en `src/components/`.
- Toda llamada a Evolution API pasa por `src/lib/evolution.ts` — nunca se llama la API externamente desde un componente directamente.