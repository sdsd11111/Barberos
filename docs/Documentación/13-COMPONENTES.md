---
id: 13-componentes
titulo: Librería de Componentes
categoria: tecnico
estado: activo
sprint: fase-0-completada
ultima_revision: 2026-07-22
relacionado:
  - 09-ROADMAP-TECNICO
  - 06-DASHBOARD
---

# 13-COMPONENTES.md

> Versión: 1.0
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

## Solicitud de Reseña Google (a discreción del barbero)

- **Nuevo (2026-07-22):** La solicitud de reseña de Google **no es automática por defecto**.
- El barbero decide si el cliente salió satisfecho antes de aprobar el envío del mensaje de reseña (no se dispara a las 2h de forma automática y ciega).
- Esto evita reseñas negativas de clientes que no quedaron conformes.
- El copy del sitio que prometía "envío automático a las 2h" debe actualizarse para reflejar esta decisión — tarea pendiente de alineación web.

## Componentes del Panel (src/components/panel/)

### `PanelNav.tsx`
- Navegación principal del panel con sidebar.
- Fondo `#0a0807`, links en `font-mono`, uppercase.
- Estado activo: borde izquierdo naranja + fondo `#131110`.

### `ClientesTabs.tsx`
- Gestión de clientes con tabs (activos/inactivos).
- Muestra historial de visitas y datos del cliente.

### `StaffManager.tsx`
- Gestión de personal de la barbería (barberos).
- CRUD de `BarberStaff`.

---

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
- Cron `/api/cron/reactivation` integrado con base de datos real en producción y Vercel Crons.

## `MetricsDashboard` (Sprint 7) — **completado**

- Reemplaza el "Libro Diario" vacío.
- Dashboard consume métricas reales en vivo de la BD PostgreSQL filtradas estrictamente por `barbershopId` de la sesión.
- No incluye todavía predicción de churn ni LTV — eso pertenece a la Fase 2 (Premium).

---

# Componentes de la landing pública (referencia visual, no funcional)

La landing actual (`barberos-rho-henna.vercel.app`) ya tiene una estructura de 12 secciones cinematográficas con scroll narrativo y cursor personalizado. Estos bloques se mantienen como base visual, pero su contenido y orden se actualizan según `03-ARQUITECTURA-WEB.md` (pendiente de reescritura con el nuevo ADN centrado en tranquilidad/control).

---

# Convenciones de nomenclatura

- Componentes de cliente (`'use client'`) en PascalCase, un archivo por componente.
- Utilidades puras (sin estado) viven en `src/lib/`, nunca en `src/components/`.
- Toda llamada a Evolution API pasa por `src/lib/evolution.ts` — nunca se llama la API externamente desde un componente directamente.