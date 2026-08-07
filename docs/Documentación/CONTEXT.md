# CONTEXT.md
> Última actualización: 2026-08-07 | Estado: Activo | Autor: Antigravity

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
- `src/components/landing/` — **Sistema visual cinematográfico de la nueva landing.** Hero, Preguntas, Problema, Creencia, Sistema, Storytelling, Futura, Fundadores, Escenas, FAQ Video, CTA Final, etc. Reescritos en Sprint E/F alineados con [[15-BRAND-KIT-BRIEFING]].
  - `src/components/public/` — Componentes transversales para páginas públicas: `NavPublic`, `FooterPublic`, `FAQSection`, `FeatureTabs`, `CTABlock`, `StructuredData` (JSON-LD para SEO) y `LLMVisibilityContent`.
  - `src/components/shared/` — Componentes compartidos entre rutas públicas y panel.
  - `src/components/crear-cuenta/CrearCuentaForm.tsx` — Formulario de auto-registro de nuevas barberías (`/crear-cuenta`).
  - `src/lib/` — Utilidades. **Agregados en Sprint F:** `alianza-pdf.tsx` (render @react-pdf del contrato Alianza), `alianza-schema.ts` (Zod), `boxcode.ts` (códigos de caja rotativos), `customer-intervals.ts` (cálculo de intervalo entre visitas), `phone-normalizer.ts` (E.164), `planes.ts` (catálogo de planes), `progress.ts` (barras Unicode), `tenant-dictionary.ts` (cache multi-tenant), `time-ec.ts` (zona horaria Ecuador UTC-5).

### Variables de entorno requeridas
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — clave pública VAPID (expuesta al browser). **Pendiente configurar en Vercel Dashboard.**
- `VAPID_PRIVATE_KEY` — clave privada VAPID (solo servidor). **Pendiente configurar en Vercel Dashboard.**
- `VAPID_SUBJECT` — email `mailto:` para VAPID. Usado por web-push al firmar las notificaciones.
- `VAPID_EMAIL` — alias histórico mantenido por compatibilidad. Usar `VAPID_SUBJECT` en código nuevo.
- `JWT_SECRET` — secreto de firma del JWT. Default local: `JWT_SECRET_SUPER_CONFIDENCIAL_DESARROLLO_LOCAL`. **Configurar valor productivo en Vercel**.
- `GROQ_API_KEY` — API key del Director IA (Groq Llama 3.3 70B). **Configurada y operativa.** Decisión explícita: se mantiene la llave de pruebas del tier gratuito por la fase piloto. Backlog: migrar a llave productiva propia antes de escalar más allá de las 4 barberías piloto.
- `CRON_SECRET` — Bearer/query string compartido con `Authorization: Bearer <CRON_SECRET>` o `?secret=<CRON_SECRET>` para los endpoints `/api/cron/*`. Default local: `cron_secret_desarrollo_local`.
- `REFERRAL_WEBHOOK_KEY` — API key compartida con barberosplus.com para el sistema de referidos QR (header `x-api-key`). Configurada.
- `ADMIN_SECRET_KEY` — Bearer token para SuperAdmin.

> ⚠️ **Pendiente deploy:** las 3 vars VAPID (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VA, control de `planStatus` (TRIAL/ACTIVE/SUSPENDED), toggle PRO/PREMIUM, listado de **comisiones** (`/api/admin/comisiones`) y de **barberías** (`/api/admin/barbershops`). Autenticado con `ADMIN_SECRET_KEY` vía Bearer.
2. **`planStatus` / `trialEndsAt`**: Campos definidos en el modelo `Barbershop` para control comercial.
3. **`/panel/configuracion`**: UI con **tabs píldora** (`ConfigTabs`) que separa Configuración de Barbería de Configuración de WhatsApp. Permite editar `riskThresholdNormal`, `riskThresholdAt`, `loyaltyMode`, `visitDurationMin`. Protegido por sesión. Backend: `PATCH /api/barbershop/settings`.
4. **`/panel/whatsapp`**: Página dedicada (separada de `/panel/configuracion`) con `WhatsAppContent.tsx` para conexión con Evolution API, QR fresco y estado de instancia.
5. **`/panel/clientes`**: Dashboard de Perfiles (`CustomerProfile`) con atribución de Cuenta WhatsApp y cálculo de lealtad según `loyaltyMode` (BY_PROFILE vs BY_ACCOUNT).
6. **`/panel/barberos`**: Gestión de equipo (`BarberosView`) con creación/edición de barberos, `StaffManager` y foto de perfil.
7. **`/registro/[barbershopId]`**: Flujo público de auto-registro de clientes vía QR. Captura Nombre, WhatsApp, Fecha de Nacimiento (Día/Mes) y Canal de adquisición. Backend: `/api/clientes/registro` con validación Zod y rate limit persistente.
8. **`/crear-cuenta`**: Auto-registro de nuevas barberías. Convierte al dueño en su propio admin de la cuenta. `CrearCuentaForm.tsx` con flujo de 15 días gratis.
9. **`/alianza`**: Formulario público de **Alianza Comercial** para vendedores/Leones. Captura cédula, datos personales, datos del negocio, condiciones (`metodoPago`, `diasPagoComision`, `zonaTerritorio`) y firma digital. Persiste `AlianzaContract` + PDF renderizado con `@react-pdf/renderer`. Trazabilidad: `ipAceptacion`, `userAgent`, `aceptadoAt`.
10. **`/r/[id]`**: Ruta pública de redireccionamiento para QR de códigos legacy (`ReferralVendedor.codigoUnico`). Si la barbería tiene `googleMapsUrl`, redirige allí; si no, queda con UI mínima.
11. **`/checklist`**: Herramienta de coaching de barberos (no productiva, salvo para sesiones de mentoría). Guarda sesiones en `localStorage` del navegador. Estructura: nombre del barbero, avatar, bloque de preguntas (P0–P6), notas, notas históricas. No usa BD.
12. **`/login`**: Página canónica indexable de acceso. **CAMBIO IMPORTANTE 2026-08-07:** ya no usa Magic Link por WhatsApp — usa **PIN de 6-7 dígitos** (`loginPin` por barbería). Sesión JWT persistente 365 días. `/acceso` ahora es redirect a `/login`.
13. **Login Magic Link (`/api/auth/request-link` → `/api/auth/verify`)**: Sigue existiendo el código, pero dejó de ser la ruta primaria de acceso. Mantener para recuperación o casos de borde.
14. **Login PIN (`/api/auth/login-pin`)**: Ruta primaria real desde 2026-08-07. Cookie `session` httpOnly + secure + sameSite=lax, `expires` 365 días (`oneYearFromNow`). Crítico para PWA en Safari/Chrome móvil.
15. **`/api/barbershop/status`**: Verifica sesión activa (sin romper si falla). Usado por `/login` para redirigir al panel si ya hay sesión.
16. **`/api/barbershop/qr`**: Devuelve QR fresco de Evolution API para la instancia actual de la barbería. Llamado por `PushNotificationManager` o por UI de conexión WhatsApp.
17. **`/api/cron/check-connections`**: Cron que sincroniza `Barbershop.connectionStatus` con el estado real de Evolution API (`open` → CONNECTED, `qrcode` → WAITING_QR, otros → DISCONNECTED). No estaba documentado antes — implementado en Sprint G.
18. **Director IA Chat (`/api/director/chat`)**: Endpoint NUEVO para conversación libre con el Director. `DirectorChatWidget.tsx` en panel. Mismo `SYSTEM_PROMPT` que `DirectorWidget` pero con interfaz conversacional. Reglas duras: el modelo NUNCA ejecuta acciones, NUNCA menciona el modelo LLM, NUNCA usa tecnicismos.
19. **Sistema de Referidos QR + Alianza**: Implementado y en producción. Ver [[21-SISTEMA-REFERIDOS-QR]] (reescrito) y [[22-SISTEMA-COMISIONES-REFERRAL]] (reescrito). Reporte final en [[24-REPORTE-FINAL-INTEGRACION]].
20. **Sistema de Rediseño Visual** (`src/components/redesign/`): Sistema de componentes premium con glassmorfismo, paleta de marca coherente (#d97644 / #e8a33d / #0D0D0D / #f3ece1), tipografía editorial (Fraunces + Space Grotesk + JetBrains Mono). Ver [[13-COMPONENTES]].

### Tablas añadidas en producción (post-Fase 0)
- `CustomerProfile` — persona real dentro de una cuenta WhatsApp (modelo Cuenta/Perfil).
- `ProfileMotorContext` — contexto calculado por el Motor (frecuencia, riesgo, vigencia) por perfil.
- `MotorSnapshot` — resumen nocturno por barbería (dimensiones: Negocio, Clientes, Equipo).
- `TestExclusion` — números excluidos del cálculo (ej. barberos, dueños, números de prueba).
- `RateLimitAttempt` — intentos de rate-limit persistente en MySQL.
- `ReferralVendedor` — vendedor/León con campos `cedula` (10 dígitos EC, único), `negocio`, `direccion`, `codigoUnico` (8 chars alfanuméricos), `scansCount`.
- `ReferralLead` — cada teléfono que escaneó un QR (atribución first-touch 30 días).
- `ReferralComision` — comisión por venta referida (`transactionId` único, `pagada`, `pagadaAt`, `monto` opcional).
- `AlianzaContract` — contrato 1:1 firmado digitalmente con `ReferralVendedor`. Persiste `pdfBytes` (LongBlob), `pdfMimeType`, `pdfSize`, `ciudadFirma`, `diaFirma`, `mesFirma`, `anioFirma`, `metodoPago` (transferencia/payphone/efectivo/otro), `diasPagoComision`, `zonaTerritorio`, `ipAceptacion`, `userAgent`, `aceptadoAt`.
- `WalletConfig` — configuración de wallet/planes por barbería (alineación schema-DB).
- Campos en `BarberVisit`: `checkinMethod` (SELF, BARBER_ASSISTED_KNOWN, BARBER_ASSISTED_ANONYMOUS), `profileId`, `services`, `visitHour`.
- Campos en `Barbershop`: `riskThresholdNormal`, `riskThresholdAt`, `loyaltyMode` (BY_PROFILE/BY_ACCOUNT), `visitDurationMin`, `anonymousVisitCounter`, `salesAgent`, `businessInfo` (text declarado por el dueño, max 2000 chars), `loginPin` (PIN de acceso al panel, único por barbería), `currentBoxCode` (código de caja rotativo activo, default `RV55`).

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

## 🚀 Sprint F — Alianza Comercial + Login PIN + Comisiones Admin (2026-07-29 → 2026-08-07)

**Contexto:** Necesidad de cerrar el ciclo de adquisición del programa Leones Fundadores ([[17-PROGRAMA-LEONES-FUNDADORES]]) en producción. La nueva Alianza reemplaza el "Acuerdo Corto" como flujo formal de registro de Leones con PDF firmado digitalmente. En paralelo, simplificación radical del acceso del dueño: el Magic Link por WhatsApp requería flujo de 3 taps y dependía de Evolution API; el PIN de 6-7 dígitos resuelto en una sola pantalla con persistencia de 365 días fue la opción adoptada para PWA móvil.

### Sistema de Alianza Comercial (NUEVO — `/alianza`)

- **Página pública `/alianza`** con `AlianzaForm.tsx`. Captura: nombre, cédula (10 dígitos EC, único), celular, nombre del negocio, dirección, método de pago (transferencia/payphone/efectivo/otro), días de pago (1-30), zona de territorio (opcional), ciudad/fecha de firma.
- **Endpoint `POST /api/alianza`** con validación Zod (`alianza-schema.ts`). Genera `codigoUnico` de 8 chars alfanuméricos verificando unicidad, renderiza PDF con `@react-pdf/renderer` (`alianza-pdf.tsx`), persiste `ReferralVendedor` (reutilizando si ya existe por cédula) + `AlianzaContract` 1:1 en una sola transacción Prisma.
- **Trazabilidad de aceptación:** `ipAceptacion`, `userAgent`, `aceptadoAt` capturados del request.
- **Idempotencia:** Si la cédula ya existe, reutiliza el `ReferralVendedor` (no duplica). El `AlianzaContract` siempre se crea nuevo (uno por aceptación formal).
- **Idempotencia de código:** Si el código generado entra en colisión pero pertenece al mismo vendedor, se acepta. Si pertenece a otro, regenera hasta 8 veces.
- **Endpoints separados `/api/alianza/preview` y `/api/alianza/pdf/[id]`** para previsualización y descarga posterior del PDF.
- **Modelo `AlianzaContract` (nuevo):** relación 1:1 con `ReferralVendedor`. Campos contractuales (`metodoPago`, `diasPagoComision`, `zonaTerritorio`, `ciudadFirma`, `diaFirma`, `mesFirma`, `anioFirma`) + `pdfBytes` (LongBlob), `pdfMimeType`, `pdfSize`. Índices en `aceptadoAt` y `metodoPago`.
- **Campo `cedula` en `ReferralVendedor`:** único, nullable (null para registros legacy sin Alianza).

### Login por PIN (REEMPLAZA Magic Link — `/login`)

- **Página `/login` reescrita** con input único: PIN de 6-7 dígitos. No más WhatsApp, no más 3 taps, no más link externo.
- **Endpoint nuevo `POST /api/auth/login-pin`:** busca `Barbershop` por `loginPin`, genera JWT con `jose` (HS256, expiración 365 días), setea cookie `session` httpOnly + secure + sameSite=lax + `expires: oneYearFromNow`. **Crítico para PWA en Safari/Chrome móvil** (cookie persistente que sobrevive cierres de navegador).
- **`/acceso` ahora es redirect 308 a `/login`** (URL canónica indexable única).
- **Verificador de sesión `/api/barbershop/status`:** al cargar `/login`, si ya hay sesión válida, redirige automáticamente a `/panel`. Sin romper si la API falla.
- **Magic Link original (`/api/auth/request-link` + `/api/auth/verify`) sigue en código** pero ya no es la ruta primaria. Mantener para casos de recuperación / soporte.

### Daily Check-Connections Cron (Sprint G — `/api/cron/check-connections`)

- **Endpoint `POST /api/cron/check-connections`:** sincroniza `Barbershop.connectionStatus` con el estado real de Evolution API. Mappea `open`/`connected` → `CONNECTED`, `connecting`/`qrcode` → `WAITING_QR`, otros → `DISCONNECTED`.
- Solo actualiza si hay cambio (no escribe innecesariamente). Protegido por `CRON_SECRET`.
- **Uso:** Vercel Cron o crontab del cPanel. Complementa el `connectionStatus` que el dueño actualiza manualmente al escanear QR.

### Endpoint `/api/barbershop/qr` (NUEVO)

- Devuelve QR fresco de Evolution API (`getFreshQR(instance)`) en base64 para la instancia actual de la barbería.
- Usado por la nueva página `/panel/whatsapp` para refrescar el QR sin recargar la página completa.

### Sistema de Comisiones — Panel Admin completo

- **`GET /api/admin/comisiones`:** lista todas las comisiones, con filtros opcionales (`vendedorId`, `pagada`). Auth: Bearer `ADMIN_SECRET_KEY`.
- **`PATCH /api/admin/comisiones/[id]`:** marca comisión como pagada (setea `pagadaAt`) o actualiza `monto`.
- **`GET /api/admin/barbershops`:** listado de barberías para el admin.
- **Decisión de variable de entorno:** el header compartido con barberosplus.com se llama `REFERRAL_WEBHOOK_KEY` (no `BARBEROSPLUS_API_KEY` como decía la doc previa).

### Director IA — Chat Conversacional (NUEVO)

- **`POST /api/director/chat`** y `DirectorChatWidget.tsx` en panel.
- Mismo `SYSTEM_PROMPT` que `DirectorWidget` (regla 5 pasos: responder, explicar, evidencia, acción, incertidumbre) pero con interfaz de chat libre.
- Reglas duras del prompt (referencia para todo el sistema):
  - Modelo NUNCA ejecuta acciones — solo recomienda.
  - Modelo NUNCA menciona el nombre de un LLM, proveedor o tecnología (Groq, Llama, OpenAI, etc.). Si le preguntan directamente, responde con calidez sin entrar en detalles.
  - Modelo NUNCA inventa cifras, porcentajes, fechas, tendencias o nombres de clientes que no estén en `DATOS_DEL_NEGOCIO`.
  - Modelo NUNCA presenta conclusiones como sentencias absolutas.
  - Lenguaje sin tecnicismos: "retención" → "clientes que volvieron", "Lifetime Value" → "lo que realmente vale ese cliente", "clientes inactivos" → "clientes que hace tiempo no regresan".
  - Gating por `planType === "PREMIUM"` (validado con `checkPremiumAccess`). PRO recibe `UpgradeBanner`.

### Código de caja rotativo (Sprint E+)

- **`Barbershop.currentBoxCode`** (default `RV55`). Se regenera con `generateBoxCode()` en `src/lib/boxcode.ts`.
- **Webhook `/api/webhook/whatsapp`:** check-in se dispara cuando el mensaje del cliente **incluye** el código de caja activo (no importa mayúsculas). Esta validación es la única protección contra checks-in accidentales por ruido en el chat.
- **URL de reseña post-visita:** construida como `${proto}://${host}/r/${barbershopId}` (redirige a `googleMapsUrl` si existe). Centraliza la captación de leads y el redirect a Google.

### `businessInfo` en `Barbershop` (NUEVO)

- Campo de texto libre, máximo 2000 chars, declarado por el dueño en `/panel/configuracion`.
- Fuente 2 del Director IA (junto con el snapshot del Motor). Permite al Director IA entender contexto declarado (horario, ubicación, servicios especiales) sin tener que inferirlo.

### Landing pública reescrita (`src/components/landing/`)

- **16 secciones cinematográficas** que reemplazan el bloque monolítico anterior: `Hero`, `Preguntas`, `Problema`, `Creencia`, `Sistema`, `Storytelling`, `Futuro`, `Fundadores`, `CinematicScene`, `EscenaSlider`, `Reveal`, `MarqueeDivisor`, `Transicion`, `VideoScrollSection`, `VideoFundador`, `VideoFAQ`, `CTAFinal`.
- Cursor personalizado (`CustomCursor`), animaciones GSAP + Framer Motion.
- Componentes transversales `src/components/public/`: `NavPublic`, `FooterPublic`, `FAQSection`, `FeatureTabs`, `CTABlock`, `StructuredData` (JSON-LD para SEO), `LLMVisibilityContent` (optimización para LLMs).

### Cambios en la arquitectura web (resumen)

- **Nuevas rutas:** `/alianza`, `/crear-cuenta`, `/checklist`, `/r/[id]`, `/api/auth/login-pin`, `/api/cron/check-connections`, `/api/director/chat`, `/api/barbershop/qr`, `/api/barbershop/status`, `/api/admin/comisiones`, `/api/admin/barbershops`.
- **Rutas separadas de `/panel`:** `/panel/barberos` (equipo), `/panel/whatsapp` (conexión Evolution), `/panel/configuracion` (solo Motor/Sistema).
- **Rutas públicas separadas de `/`:** `/pro`, `/premium`, `/billing`, `/historias/[slug]`, `/como-funciona`, `/resenas`, `/acceso` (redirect a `/login`).

### Patrones aprendidos (Sprint F)

- **Prisma `LongBlob` para `pdfBytes`:** funciona en MySQL/MariaDB. Verificar que `prisma migrate` no rompa el tipo en migraciones posteriores.
- **`@react-pdf/renderer` en Next.js:** corre sin problemas en Node runtime. Render del PDF en transaction Prisma garantiza consistencia.
- **Idempotencia de `ReferralVendedor` por cédula:** valida primero con `findUnique({ where: { cedula } })`. Si existe, reutiliza. Si no, crea. El `AlianzaContract` 1:1 se crea siempre.
- **JWT misma cookie que Magic Link:** el switch de PIN no requirió migración. Solo cambió el endpoint que firma el JWT.
- **Cookie `expires` + `maxAge` simultáneos:** Safari/Chrome móvil usan `expires` para persistencia tras force-quit. Vercel/proxies usan `maxAge`. Setear ambos para PWA.
- **`findUnique` con `cedula` retorna error si no es unique constraint:** por eso `cedula` debe declararse como `@unique` en el schema (no solo indexado).

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
