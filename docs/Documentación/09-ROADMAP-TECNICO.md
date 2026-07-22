---
id: 09-roadmap-tecnico
titulo: Roadmap Técnico
categoria: tecnico
estado: activo
sprint: fase-0-completada
ultima_revision: 2026-07-19
relacionado:
  - 13-COMPONENTES
  - 06-DASHBOARD
---

# 09-ROADMAP-TECNICO.md

> Versión: 1.0
>
> Estado: Activo
>
> Clasificación: CONFIDENCIAL
>
> Tipo de documento: Roadmap Técnico
>
> Audiencia: Dirección, Desarrollo, Arquitectura
>
> Este documento NO debe distribuirse públicamente.

---

# Objetivo

Este documento define el orden correcto para construir BarberOS.

No define qué construir.

Eso ya lo definieron los documentos 05, 06, 07 y 08.

Define **cuándo** construir cada cosa, y por qué ese orden protege el negocio.

# Estado verificado por cotejo de código (19/07/2026, actualizado 22/07/2026)

- Fase 0: completada, confirmada contra el código real de `src/`.
- `LoginMagicLink` (dueño entra sin usuario/contraseña): **ya implementado**, no es parte pendiente de Sprint 5.
- **Sprint 5 (validación de sesión y aislamiento multi-tenant): ✅ Completado.** Firma/lectura de JWT mediante cookie `session` en `src/proxy.ts` y DAL (`src/lib/dal.ts`) para Server Components. Logout con Server Actions integrado.
- **Sprint 6 (cron "Te extrañamos"): ✅ Completado.** Cron `/api/cron/reactivation` integrado con BD real en producción y Vercel Crons.
- **Sprint 7 (dashboard con métricas reales): ✅ Completado.** Dashboard consume métricas en vivo de PostgreSQL filtradas por `barbershopId` de sesión.
- **Sprint 8 (PWA Push Notifications): ✅ Completado (2026-07-21).** Service Worker, `PushNotificationManager`, `src/lib/push.ts` con auto-limpieza de endpoints 410 Gone.
- Hallazgo no documentado previamente: existe un SuperAdmin (`/admin`) funcional para onboarding y gestión de `planStatus`, sin lógica que aplique las suspensiones todavía.

---


La Constitución de BarberOS establece que las mejoras nacen de la experiencia real de los dueños de barbería, no de la imaginación del equipo.

Por lo tanto: **ninguna capa avanzada se construye antes de tener uso real que la justifique.**

El roadmap técnico existe para evitar la tentación de construir el Motor de Conocimiento o los agentes de IA antes de validar si BarberOS Pro, en su forma más simple, resuelve el problema.

---

# Fases

## Fase 0 — Validación (Estado actual)

Ya completado:

- Next.js + Prisma + PostgreSQL funcionando.
- Registro de corte vía panel.
- Envío de WhatsApp automático vía Evolution API.
- Barra de progreso Unicode.
- Webhook de calificación (rating 1-5).
- Flujo de aprobación anti-fraude (check-in PENDING → APPROVED/REJECTED).
- Límite de 24h por cliente para evitar check-ins duplicados.
- Multi-tenant seguro a nivel de consulta (`barbershopId + whatsapp`).

Pendiente antes de salir a vender en Cuenca:

- **Sprint 5 — Roles y autenticación multi-tenant.** Necesario en cuanto exista más de una barbería real operando simultáneamente; sin esto, un piloto puede ver datos de otro.
- **Sprint 6 — Automatizaciones (cron jobs).** El mensaje "Te extrañamos" para clientes con más de 30 días sin volver. Es la primera pieza de valor que el dueño ve *sin hacer nada*, y es además la funcionalidad que más se menciona en el discurso de ventas.
- **Sprint 7 — Dashboard con métricas reales.** Sustituye el "Libro Diario" vacío por datos reales de los pilotos: clientes activos, tasa de retorno, próximos premios a entregar.

## Fase 1 — Piloto (10 barberías fundadoras)

Objetivo técnico: que el sistema no se caiga con múltiples tenants reales y que cada aprobación, mensaje y premio funcione sin intervención manual del equipo.

No se construye en esta fase:

- Motor de Conocimiento (07).
- Agentes de IA (08).
- Dashboard analítico avanzado (LTV, churn predictivo).

Esas piezas quedan documentadas pero **congeladas** hasta que la Fase 1 entregue evidencia real de qué preguntas hacen los dueños sobre su negocio. Esa evidencia es la que decide qué agente se construye primero.

## Fase 2 — BarberOS Premium (post-validación)

Se activa únicamente cuando exista al menos un piloto dispuesto a pagar por una versión con inteligencia — no antes. Orden de construcción dentro de esta fase:

1. Motor de Conocimiento — capa Eventos + Contexto (las dos capas que ya existen como datos crudos en el schema actual).
2. Agente 1 (Director General IA) — es el único agente que se libera primero, porque responde preguntas generales sin necesitar los especialistas.
3. Agentes especializados (Clientes, Equipo, Reputación, Comercial, Contenido) — se activan uno a uno, en el orden que determine la demanda real observada en la Fase 1.

## Fase 3 — Multi-sede y Enterprise

No se documenta en detalle todavía. Referencia: `15-PROYECTOS-Y-PROYECCIONES.md`.

---

# Deuda técnica aceptada (temporalmente)

- Autenticación simple (número de WhatsApp como identificador) antes de un sistema de roles completo — aceptable mientras hay pocos tenants.
- Sin dashboard analítico — aceptable mientras no hay volumen de datos que lo justifique.

Esta deuda se paga en el orden de las fases, nunca antes.

---

# Relación con el resto de la documentación

Este roadmap no autoriza nada por sí mismo. La autorización para avanzar de fase la da evidencia real de barberías usando el sistema, según el principio de la Constitución (documento 00).