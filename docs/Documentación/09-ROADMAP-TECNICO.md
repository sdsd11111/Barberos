---
id: 09-roadmap-tecnico
titulo: Roadmap Técnico
categoria: tecnico
estado: activo
sprint: fase-1-piloto-activo
ultima_revision: 2026-08-07
relacionado:
  - 13-COMPONENTES
  - 06-DASHBOARD
  - 07-MOTOR-DE-CONOCIMIENTO
  - 08-ARQUITECTURA-IA
  - 19-INSTRUCCION-MOTOR-DIRECTOR
---

# 09-ROADMAP-TECNICO.md

> Versión: 2.0
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

**Sprint F — Alianza Comercial + Login PIN + Comisiones Admin (✅ Completado — 2026-07-29 → 2026-08-07):**
- [x] Reemplazo del "Acuerdo Corto" de WhatsApp por Alianza Comercial formal con `AlianzaContract` 1:1, PDF firmado digitalmente (`alianza-pdf.tsx`), persistido en MySQL (`LongBlob`).
- [x] Reescritura de `/login` para usar **PIN de 6-7 dígitos** en lugar de Magic Link. Sesión JWT persistente 365 días.
- [x] `/acceso` ahora es redirect 308 a `/login` (URL canónica indexable única).
- [x] `/api/barbershop/status` para auto-redirect de sesión activa.
- [x] `/api/cron/check-connections` (Sprint G) sincroniza `connectionStatus` con Evolution API.
- [x] `/api/barbershop/qr` dedicado para QR fresco.
- [x] `/api/admin/comisiones` + `/api/admin/comisiones/[id]` para gestión de comisiones.
- [x] `/api/director/chat` + `DirectorChatWidget` para chat libre con el Director IA.
- [x] Página `/alianza` con `AlianzaForm`.
- [x] Página `/crear-cuenta` con `CrearCuentaForm`.
- [x] Página `/r/[id]` para redirect de QR legacy.
- [x] `/panel/whatsapp` separado de `/panel/configuracion` (`ConfigTabs`).
- [x] `/panel/barberos` con `BarberosView` + `StaffManager`.
- [x] Reescritura completa de la landing en 16 secciones cinematográficas (`src/components/landing/`).
- [x] `Barbershop.currentBoxCode` (código de caja rotativo, default `RV55`).
- [x] `Barbershop.loginPin` (PIN único por barbería).
- [x] `Barbershop.businessInfo` (texto declarado por el dueño, fuente 2 del Director IA).
- [x] `Barbershop.vertical` (BARBERIA | SALON | OTRO).
- [x] `Barbershop.sales8-07):**
- 4 barberías reales operativas en BD de producción: Probando Barberos (PREMIUM ACTIVE), Chechebarber (PRO ACTIVE), Monique (PRO TRIAL), Que? (PREMIUM TRIAL).
- El sistema está validado para operar multi-tenant sin caídas. Sprints A, B, C, D, E, F y G
- [x] `ReferralVendedor.cedula` (unique, nullable para legados).
- [x] `ReferralLead`, `ReferralComision`, `AlianzaContract` modelos nuevos.
- [x] `WalletConfig` para alinear schema con DB.
- [x] Sistema de códigos de caja rotativos (`boxcode.ts`).
- [x] Normalización de teléfonos (E.164) en `phone-normalizer.ts`.
- [x] Zona horaria Ecuador (`time-ec.ts`) y catálogo de planes (`planes.ts`).
- [x] Diccionario multi-tenant cacheado (`tenant-dictionary.ts`).

---


La Constitución de BarberOS establece que las mejoras nacen de la experiencia real de los dueños de barbería, no de la imaginación del equipo.

Por lo tanto: **ninguna capa avanzada se construye antes de tener uso real que la justifique.**

El roadmap técnico existe para evitar la tentación de construir el Motor de Conocimiento o los agentes de IA antes de validar si BarberOS Pro, en su forma más simple, resuelve el problema.

---

# Fases

## Fase 0 — Validación (✅ Completada — ver bloque superior)

Esta fase está cerrada. El contenido histórico se conserva en `BITACORA.md` (sección 2026-07-25 y anteriores).

---

## Fase 1 — Piloto (10 barberías fundadoras) — EN PROGRESO

**Estado actual (2026-07-29):**
- 4 barberías reales operativas en BD de producción: Probando Barberos (PREMIUM ACTIVE), Chechebarber (PRO ACTIVE), Monique (PRO TRIAL), Que? (PREMIUM TRIAL).
- El sistema está validado para operar multi-tenant sin caídas. Sprints A, B, C, D y E completados.
- **Decisión documentada (2026-07-25):** El Motor de Conocimiento y el Director IA **rompen la regla de fases** deliberadamente. Se construyen en paralelo a Fase 1 para responder a la deuda activa con 2 clientes que ya pagan Premium. Ver [[19-INSTRUCCION-MOTOR-DIRECTOR]] sección 0 para la justificación completa.

**Programa de Distribución vía Leones Fundadores ([[17-PROGRAMA-LEONES-FUNDADORES]]):** Sigue corriendo en paralelo a la validación técnica, como excepción explícita a la regla de fases. Sin cambios.

## Fase 2 — BarberOS Premium 🟡 EN CONSTRUCCIÓN ACTIVA

**Excepción documentada (2026-07-25):** Esta fase se activó antes de cerrar Fase 1 por la deuda activa con 2 clientes que ya pagan Premium ($19.99/mes). Las piezas se construyen en paralelo a Fase 1, no en serie.

**Capas ya implementadas:**
1. ✅ **Motor de Conocimiento — capa Determinística:** `src/lib/motor.ts` + `/api/cron/motor` (3am) + tablas `CustomerProfile` / `ProfileMotorContext` / `MotorSnapshot` / `TestExclusion`. Calcula frecuencia por perfil, riesgo (`AT_RISK` / `DELAYED` / `NORMAL` / `INSUFFICIENT_DATA`), métricas de equipo (solo visitas con barbero real) y distribución horaria. Ver [[07-MOTOR-DE-CONOCIMIENTO]].
2. ✅ **Agente 1 (Director General IA):** Groq Llama 3.3 70B con fallback determinístico. Disclaimer obligatorio de incertidumbre. Detección temprana de Atrasados + Riesgo Crítico. Ver [[08-ARQUITECTURA-IA]] y [[19-INSTRUCCION-MOTOR-DIRECTOR]].
   - **Sprint F agregó:** endpoint `/api/director/chat` + `DirectorChatWidget` para chat libre conversacional. Mismo `SYSTEM_PROMPT` con reglas duras contra tecnicismos, alucinaciones y ejecución automática.
3. ✅ **Control de Acceso por planType:** `src/lib/plan-guard.ts` con `checkPremiumAccess()` (APIs) e `isPremiumBarbershop()` (RSC). PRO ve banner de upgrade en lugar de pantallas rotas.

**Pendiente en esta fase:**
- Agentes especializados (Clientes, Equipo, Reputación, Comercial, Contenido) — se activan uno a uno según demanda real observada en Fase 1.
- Cron de cumpleaños (`/api/cron/birthday`) — la data ya está en `CustomerProfile.birthDate`.
- Migración de `GROQ_API_KEY` a tier productivo propio (backlog).

## Fase 3 — Multi-sede y Enterprise

No se documenta en detalle todavía. Referencia: [[15-BRAND-KIT-BRIEFING]].

---

# Deuda técnica aceptada (temporalmente)

- ~~Autenticación simple (número de WhatsApp como identificador) antes de un sistema de roles completo~~ — **RESUELTA** (Sprint 5, 2026-07-19). Cookie `session` con JWT firmado y DAL para Server Components.
- ~~Sin dashboard analítico~~ — **RESUELTA** (Sprint 7, 2026-07-19 + Fase 2, 2026-07-25). Métricas reales en vivo + Motor de Conocimiento con snapshots nocturnos.
- API Key de Groq en tier gratuito — **pendiente migrar** a llave productiva propia antes de escalar más allá de 4 barberías piloto. Documentado en [[20-SEGURIDAD-Y-CONTINUIDAD]].
- Variables VAPID no configuradas en Vercel — **bloqueante** antes del próximo deploy para que las push notifications funcionen.

---

# Relación con el resto de la documentación

Este roadmap no autoriza nada por sí mismo. La autorización para avanzar de fase la da evidencia real de barberías usando el sistema, según el principio de la Constitución (documento 00).

---

**Aclaración de alcance (2026-07-25):** El desarrollo de Motor de Conocimiento + Director IA no se limita a resolver la deuda con los 2 clientes Premium actuales. BarberOS sigue en venta activa en paralelo a esta construcción — las decisiones de arquitectura (umbrales, modelo de cuentas/perfiles, checkinMethod) deben diseñarse pensando en escalar a múltiples barberías, no ajustarse manualmente por cliente.