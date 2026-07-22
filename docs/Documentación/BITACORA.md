# BITACORA.md — Puente de memoria entre sesiones

> **Propósito:** Registrar tareas pendientes, hipótesis sin validar y preguntas de seguimiento entre sesiones de trabajo con Antigravity.
> **Regla:** Máximo 5 sesiones activas. Al llegar a la 6ª, el agente pregunta si puede comprimir y borrar las más antiguas.
> **Lectura obligatoria:** Este archivo se lee al inicio de cada sesión, antes de cualquier acción.

### Sesión 2026-07-22 — Reestructuración de Precios, Primer Lifetime Vendido, Push Notifications

**Tareas completadas:**
- [x] **Reestructuración de precios confirmada y en producción:** Setup unificado USD 50 para ambos planes (Pro y Premium). Pro $9.99/mes, Premium $19.99/mes + $5/mes tokens IA aparte.
- [x] **Planes Anual y Lifetime creados:** Pro Annual $99 / Premium Annual $199; Pro Lifetime $500 / Premium Lifetime $1000 (hasta 12 cuotas vía Payphone).
- [x] **Trial público de 15 días:** Sin tarjeta, activo en el sitio.
- [x] **Primera venta Lifetime cerrada (2026-07-22): USD 500 — Pro Lifetime.** Primer dato real de venta a precio completo.
- [x] **Push notifications confirmado por versión del hijo:** Sprint 8 completado. Push nativo con sonido como canal primario, polling como fallback.
- [x] **Reseñas Google pasan a discrecionales:** El barbero decide si el cliente salió satisfecho antes de aprobar el envío. Ya no es automático a las 2h.
- [x] **Corrección de contradicción interna:** CONTEXT.md (Sprint 5, 6, 7 completados) ahora alineado con 09-ROADMAP-TECNICO.md y 13-COMPONENTES.md.
- [x] **Documentación actualizada:** 10-ROADMAP-COMERCIAL.md, 14-PRD.md, 03-ARQUITECTURA-WEB.md, 12-UX.md, 13-COMPONENTES.md, 09-ROADMAP-TECNICO.md, 05-ARQUITECTURA-DEL-PRODUCTO.md.

**Pendientes:**
- [ ] **Spec técnica de push:** Detalle completo de la implementación de notificaciones push (pendiente confirmar con el hijo).
- [ ] **Copy del sitio:** Alinear texto de "envío automático a las 2h" con la nueva política de reseñas a discreción del barbero.
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
- [x] `skill-madre.md` actualizada con Gate de Comunicación + Protocolo Escalonado + Protocolo de Bitácora.
- [x] `CONTEXT.md` actualizado con Error 001 (tagline con avatar cruzado).
- [x] `15-BRAND-KIT-BRIEFING.md` creado como brief para Manus.
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
