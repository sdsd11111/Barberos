# CONTEXT.md
> Última actualización: 2026-07-19 | Estado: Activo | Autor: Antigravity

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

## 📂 Enlaces Clave del Vault
- [[_index]] — Mapa conceptual de la base de conocimiento.
- [[09-ROADMAP-TECNICO]] — Planificación y fases de liberación.
- [[13-COMPONENTES]] — Biblioteca de componentes reales y pendientes.

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
