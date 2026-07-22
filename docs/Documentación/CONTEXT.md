# CONTEXT.md
> Última actualización: 2026-07-22 | Estado: Activo | Autor: Antigravity

Este documento actúa como la **memoria de ejecución actual** del proyecto BarberOS. Mantiene al equipo y a cualquier agente de desarrollo alineados con la realidad del código en producción en todo momento, evitando confusiones de versiones o supuestos.

---

## 📌 Estado de Sprints & Fases

### Fase 0 — Validación (Completada ✅)
- **Next.js + Prisma + PostgreSQL**: Operando y configurado con Supabase (Transaction Pooler + Session Pooler).
- **Check-in vía WhatsApp**: Totalmente funcional (`src/app/api/webhook/whatsapp/route.ts`).
  - Límite estricto de 24 horas por cliente.
  - Generación de visitas en estado `PENDING`.
  - Cola de aprobación en tiempo real (`ApprovalQueue`) mediante polling.
  - Calificación post-servicio (1 a 5) y máquina de estados `IDLE → AWAITING_RATING → IDLE`.
- **Magic Link de Acceso**: Backend y UI listos. Genera `MagicToken` de 15 minutos y se envía vía Evolution API.
- **Seguridad y Aislamiento Multi-tenant (Sprint 5)**: 
  - ✅ **Completado**. Firma/lectura de JWT mediante la cookie `session` en `src/proxy.ts` y DAL (`src/lib/dal.ts`) para Server Components.
  - ✅ **Completado**. Integrado logout con Server Actions en el Layout del Panel.

### Fase 1 — Piloto (10 Barberías Fundadoras)
- **Sprint 6 — Automatizaciones (Te extrañamos)**: ✅ **Completado**. Cron `/api/cron/reactivation` integrado con base de datos real en producción y Vercel Crons.
- **Sprint 7 — Métricas Reales**: ✅ **Completado**. Dashboard consume métricas reales en vivo de la BD PostgreSQL filtradas estrictamente por `barbershopId` de la sesión.
- **Sprint 8 — PWA Push Notifications**: ✅ **Completado** (2026-07-21). El panel es ahora una Progressive Web App instalable. Cuando un cliente hace check-in por WhatsApp, el servidor envía una notificación push nativa al celular del barbero aunque el panel esté cerrado.
  - Nuevo modelo `PushSubscription` en BD (barbershopId, endpoint, p256dh, auth).
  - Service Worker en `public/sw.js` con `requireInteraction: true`.
  - `PushNotificationManager.tsx` gestiona opt-in, registro de SW y sincronización de suscripción.
  - `src/lib/push.ts` centraliza el envío con auto-limpieza de endpoints 410 Gone.
  - `ApprovalQueue.tsx` se mantiene como fallback para cuando el panel está abierto.
  - Nombre de WhatsApp (`pushName`) ahora se guarda al crear/actualizar clientes desde el webhook.
- **Arquitectura de Avatares & Nueva Web**: 🔄 **En Progreso**. Sitemap de 7 páginas estructurado con SEO y JSON-LD. Pendiente de implementar la Dirección Cinematográfica de la Home (10 escenas) basada en el Avatar 1.

### Fase 2 — BarberOS Premium
- **Motor de Conocimiento (07)**: ❄️ **CONGELADO**. Cero código.
- **Agentes de IA (08)**: ❄️ **CONGELADO**. Cero código.

---

## 🛠️ Foto Técnica de Producción

### Dependencias Clave
- `next`: `16.2.10` (App Router)
- `prisma`: `7.8.0`
- `jose`: `6.2.3` (para firma de JWT en runtime Edge/Node)
- `axios`: `1.18.1` (comunicación con Evolution API)
- `web-push`: `3.x` (PWA Push Notifications vía VAPID)

### Variables de entorno requeridas (nuevas)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — clave pública VAPID (expuesta al browser).
- `VAPID_PRIVATE_KEY` — clave privada VAPID (solo servidor). **Debe agregarse a Vercel manualmente.**
- `VAPID_EMAIL` — email de contacto para VAPID.

> ⚠️ **Antes del próximo deploy a Vercel:** agregar las 3 vars VAPID al dashboard de Vercel (Settings → Environment Variables). Sin ellas, el webhook fallará silenciosamente al intentar enviar pushes.

### Componentes y Rutas No Documentados Anteriormente
1. **SuperAdmin (`/admin`)**: Panel completo para onboarding de nuevas barberías y control de `planStatus` (TRIAL/ACTIVE/SUSPENDED) autenticado con `ADMIN_SECRET_KEY` vía Bearer.
2. **`planStatus` / `trialEndsAt`**: Campos definidos en el modelo `Barbershop` para control comercial.

---

### Modelo de Datos - Actualización 2026-07-22

Nuevos campos y modelos en `prisma/schema.prisma`:

| Modelo | Campo | Propósito |
|--------|-------|-----------|
| `Barbershop` | `loginPin` | PIN de acceso de 6 dígitos único |
| `Barbershop` | `currentBoxCode` | Código de caja dinámico para check-ins (ej. "RV55") |
| `Barbershop` | `whatsappConnected` | Número que realmente escaneó el código QR |
| `Barbershop` | `connectionStatus` | DISCONNECTED, CONNECTED, WAITING_QR |
| `BarberCustomer` | `firstReviewSent` | Indica si ya se envió solicitud de Google review |
| `BarberCustomer` | `lastReactivationSentAt` | Control del cron de reactivación |
| `PushSubscription` | — | Suscripciones push de los barberos (implementado Sprint 8) |
| `DelayedTask` | — | Tareas demoradas (ej. envío de review Google 2h después) |

### Flujo de Reseñas Google (2026-07-22)

- **NO es automático por defecto** — el barbero decide cuándo el cliente salió satisfecho
- Modelo `DelayedTask` con tipo `SEND_GOOGLE_REVIEW` programmed para `createdAt + 2 horas`
- Campo `firstReviewSent` en `BarberCustomer` previene envíos duplicados

---

## 📂 Enlaces Clave del Vault
- [_index.md](file:///C:/Users/Cesar/Documents/GRUPO%20EMPRESARIAL%20REYES/PROYECTOS/Barberos/barberos-saas/Documentación/_index.md) — Mapa conceptual de la base de conocimiento.
- [09-ROADMAP-TECNICO.md](file:///C:/Users/Cesar/Documents/GRUPO%20EMPRESARIAL%20REYES/PROYECTOS/Barberos/barberos-saas/Documentación/09-ROADMAP-TECNICO.md) — Planificación y fases de liberación.
- [13-COMPONENTES.md](file:///C:/Users/Cesar/Documents/GRUPO%20EMPRESARIAL%20REYES/PROYECTOS/Barberos/barberos-saas/Documentación/13-COMPONENTES.md) — Biblioteca de componentes reales y pendientes.

---

## ⚠️ Errores de proceso corregidos

### Error 001 — Tagline con avatar cruzado
**Fecha:** 2026-07-19  
**Causa raíz:** El agente generó copy de marca (tagline de logo) sin haber leído previamente `04-SISTEMA-DE-COMUNICACION.md` ni la sección "Arquitectura de Avatares" de `02-ARQUITECTURA-ESTRATEGICA.md`. El texto resultante ("INFRASTRUCTURE | SYSTEMS | TRANSFORMATION") usó palabras en inglés corporativo genérico, directamente contradictorias con las listas de palabras prohibidas y el tono definido para el Avatar 1.  
**Por qué pasó:** No existía un gate explícito que obligara la lectura de esos dos documentos antes de generar copy. El agente respondió desde memoria de entrenamiento general en lugar de contrastar con la fuente local.  
**Fix aplicado:** Se añadió el "Gate obligatorio de comunicación" y el "Protocolo de razonamiento escalonado" al final de `skill-madre.md`. Ambos son de cumplimiento obligatorio a partir de esta fecha.  
**Patrón a reconocer:** Cualquier tarea que incluya palabras como *nombre*, *tagline*, *CTA*, *texto para la web*, *mensaje de WhatsApp* o *copy* activa automáticamente el Nivel 1 del protocolo — sin importar cuán pequeña o rápida parezca la tarea.

### Error 002 — Empatía antes que confrontación
**Fecha:** 2026-07-20  
**Causa raíz:** El agente generó copy de objeción para BarberOS que enfrentaba directamente al prospecto ("¿Por qué no me sirvió la tarjeta de fidelidad clásica?") sin aplicar primero el principio de empatía definido en `04-SISTEMA-DE-COMUNICACION.md` y en la skill de guiones. El texto resultante decía "¿Tienes tiempo para llevar eso a mano?" — confrontación directa antes de generar conexión.  
**Por qué pasó:** No existía un gate que verificara el orden del flujo retórico antes de generar copy de objeciones. La skill de guiones ya tenía la corrección registrada, pero `CONTEXT.md` — la memoria institucional del proyecto — no la reflejaba, dejando el aprendizaje parcializado en un solo archivo.  
**Fix aplicado:** Se registró el error en `CONTEXT.md` bajo la sección "Errores de proceso corregidos", garantizando que el aprendizaje viva tanto en la skill específica de guiones como en la memoria central del proyecto.  
**Patrón a reconocer:** Cualquier tarea que genere copy de objeción, defensa, contra-argumento o pregunta retórica debe verificar primero que el flujo empieza con empatía y validación antes de introducir cualquier elemento de confrontación — sin importar cuánto el framing inicial invite a "abrir con la herida".
