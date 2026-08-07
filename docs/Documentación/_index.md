# 🗺️ Mapa de Documentación — BarberOS (Vault Hub)

Este es el punto de acceso central a la base de conocimiento de BarberOS. Para optimizar el uso de tokens, lee este índice y navega únicamente hacia el archivo que contiene el detalle requerido.

> **📌 Regla del Grafo:** Al mencionar cualquier documento en esta documentación, usa siempre formato `[[nombre]]` — esto crea las conexiones del Grafo de Obsidian.

---

## 🏛️ Gobernanza y Estrategia (Reglas del Negocio)
- [[00-Constitución]] — **La Constitución**: Reglas inquebrantables, misión, visión y principios rectores del producto.
- [[01-MANIFIESTO]] — **El Manifiesto**: Filosofía comercial y la promesa del valor real que entregamos a las barberías.
- [[02-ARQUITECTURA-ESTRATEGICA]] — **Arquitectura Estratégica**: Plan estratégico de negocio y objetivos macro del SaaS.
- [[10-ROADMAP-COMERCIAL]] — **Roadmap Comercial**: Estrategia de penetración de mercado y adquisición de pilotos.
- [[11-ROADMAP-SEO]] — **Roadmap SEO**: Estructura de indexación y optimización para captar tráfico orgánico de dueños de barbería.
- [[17-PROGRAMA-LEONES-FUNDADORES]] — **Leones Fundadores**: Programa de distribución comercial sin pauta.
  - [[ACUERDO-CORTO-LEONES]] — **Acuerdo de Colaboración**: Documento de términos para Leones (firma simple).
  - [[GUION-CAMPO-LEONES-LOJA-2026-07-27]] — **Guion de Campo**: Paso a paso para reclutamiento de Leones en Loja.
- [[18-PLAN-ESTRATEGICO-MARKETING]] — **Plan Estratégico de Marketing**: Horizontes de posicionamiento y silencio estratégico.
- [[Skill de Guiones BarberOS]] — **Skill de Guiones**: Reglas de tono, microhooks y protocolo de validación para piezas publicitarias y pitches.

## 💻 Arquitectura y Desarrollo Técnico (El Software)
- [[03-ARQUITECTURA-WEB]] — **Arquitectura Web**: Estructura de páginas, sitemap y layouts del sitio y panel. *Actualizado 2026-08-07: incluye páginas `/alianza`, `/crear-cuenta`, `/checklist`, `/registro/[barbershopId]` y separación de `/pro` y `/premium`.*
- [[04-SISTEMA-DE-COMUNICACION]] — **Sistema de Comunicación**: Reglas de interacción por WhatsApp y flujos de mensajes automatizados.
- [[05-ARQUITECTURA-DEL-PRODUCTO]] — **Arquitectura del Producto**: Detalle técnico del motor multi-tenant y base de datos relacional. *Actualizado 2026-08-07: agregado modelo `AlianzaContract` (1:1 con `ReferralVendedor`) y campo `cedula` en `ReferralVendedor`.*
- [[06-DASHBOARD]] — **Especificaciones del Dashboard**: Mockups conceptuales y lógica del panel de control del dueño. *Actualizado 2026-08-07: `/panel/whatsapp` separado de `/panel/configuracion` vía `ConfigTabs`.*
- [[09-ROADMAP-TECNICO]] — **Roadmap Técnico**: Secuencia lógica y dependencias de construcción (Fases 0 a 3). *Actualizado 2026-08-07: Sprints F (Alianza PDF + Login PIN) y G (Daily Check-Connections) agregados.*
- [[12-UX]] — **Flujos de Experiencia**: Diseño de interacciones clave (login por PIN, flujo de check-in, registro de clientes por QR).
- [[13-COMPONENTES]] — **Biblioteca de Componentes**: Registro de componentes implementados. *Actualizado 2026-08-07: agregados `DirectorChatWidget`, `ConfigTabs`, `WhatsAppContent`, `CustomerRegistrationQRCard`, `BarberosView`, `StaffManager`, `CrearCuentaForm`, sistema de Alianza PDF y secciones de landing reescritas.*
- [[14-PRD]] — **Product Requirement Document (PRD)**: Requerimientos funcionales mínimos para el MVP comercial. *Actualizado 2026-08-07: método de acceso cambió de Magic Link a PIN de 6 dígitos.*
- [[15-BRAND-KIT-BRIEFING]] — **Brand Kit Briefing**: Especificaciones y consolidación de la esencia visual de BarberOS para el diseñador gráfico (Manus).
- [[20-SEGURIDAD-Y-CONTINUIDAD]] — **Seguridad y Continuidad**: Políticas de secretos, Rate-Limiting persistente en MySQL, aislamiento multi-tenant y Plan de Recuperación de BD (DRP). *Actualizado 2026-08-07: nuevo endpoint `/api/auth/login-pin` con JWT 365d.*

## 🤖 Inteligencia y Motor (Fase 2 en construcción)
- [[07-MOTOR-DE-CONOCIMIENTO]] — **Motor de Conocimiento**: Lógica de almacenamiento semántico y procesamiento de eventos históricos. *Estado 2026-08-07: capa determinística activa; cron nocturno envía push notifications a cuentas PREMIUM cuando se publica un nuevo snapshot con alertas relevantes.*
- [[08-ARQUITECTURA-IA]] — **Arquitectura de Inteligencia**: Red de agentes de IA especializados y orquestador maestro. *Estado 2026-08-07: Director General IA + chat conversacional (`/api/director/chat`) implementados.*
- [[19-INSTRUCCION-MOTOR-DIRECTOR]] — **Instrucción de Construcción del Motor + Director IA**: Especificación funcional para el constructor. Define la regla de Gating por planType y el contrato Motor↔IA. *Actualizado 2026-08-07: agregada sección sobre endpoint `/api/director/chat` + `DirectorChatWidget`.*

---

## ⚙️ Operaciones y Seguridad
- [[20-SEGURIDAD-Y-CONTINUIDAD]] — **Seguridad y Continuidad**: Rate-limiting persistente en MySQL, política de secretos (GROQ_API_KEY), aislamiento multi-tenant y Plan de Recuperación de BD (DRP).
- [[21-SISTEMA-REFERIDOS-QR]] — **Sistema de Referidos QR + Alianza**: Implementado y en producción. *Estado 2026-08-07: `ReferralVendedor` con `cedula`, `AlianzaContract` 1:1 con PDF persistido, formulario público `/alianza`, página `/r/[id]`.*
- [[22-SISTEMA-COMISIONES-REFERRAL]] — **Sistema de Comisiones por Referidos**: Implementado y en producción. *Estado 2026-08-07: webhook `/api/webhook/referral-sale` activo, panel `/api/admin/comisiones` con marcado de paga.*
- [[23-REPORTE-PROGRAMADOR-BARBEROPLUS]] — **Reporte para Programador de barberosplus.com**: Guía de integración de webhooks firmados.
- [[24-REPORTE-FINAL-INTEGRACION]] — **Reporte Final de Integración**: Estado final del flujo bidireccional BarberOS ↔ barberosplus.com (sistema de referidos QR).

---
## 📂 Documentos de Bitácora y Contexto Operativo
- [[CONTEXT]] — **Memoria de Ejecución**: Estado actual del código en producción. Fuente de verdad sobre sprints completados, schema de BD, variables de entorno y sistema de rediseño visual.
- [[BITACORA]] — **Bitácora**: Puente de memoria entre sesiones de trabajo con Antigravity. Máximo 5 sesiones activas.

---

> [!TIP]
> **Obsidian Graph View**: Si utilizas Obsidian, todas estas notas se mostrarán interconectadas gracias a los enlaces de arriba. Puedes usar el plugin **Dataview** para consultar dinámicamente el estado y sprint de cada documento.

---

> **📍 Última actualización del mapa:** 2026-08-07 (post-Sprint F: Alianza Comercial + Login PIN + Comisiones Admin).
> **Documentos que cambiaron de estado en esta actualización:**
> - [[05-ARQUITECTURA-DEL-PRODUCTO]]: agregado modelo `AlianzaContract` + campo `cedula` en `ReferralVendedor`.
> - [[06-DASHBOARD]]: `/panel/whatsapp` separado de `/panel/configuracion` (`ConfigTabs`).
> - [[09-ROADMAP-TECNICO]]: Sprints F (Alianza + Login PIN) y G (Daily Check-Connections) agregados.
> - [[13-COMPONENTES]]: agregados `DirectorChatWidget`, `ConfigTabs`, `WhatsAppContent`, `CustomerRegistrationQRCard`, `BarberosView`, `StaffManager`, `CrearCuentaForm`, `AlianzaForm`, sistema de Landing reescrita (16 secciones).
> - [[14-PRD]]: método de acceso del dueño cambió de Magic Link a PIN de 6-7 dígitos.
> - [[20-SEGURIDAD-Y-CONTINUIDAD]]: nuevo endpoint `/api/auth/login-pin` con JWT de 365 días.
> - [[21-SISTEMA-REFERIDOS-QR]]: documentación reescrita — sistema implementado en producción.
> - [[22-SISTEMA-COMISIONES-REFERRAL]]: documentación reescrita — sistema implementado en producción.
> - [[CONTEXT]]: sección "Sprint F — Alianza + Login PIN" agregada.
> - [[BITACORA]]: sesión 2026-07-29 → 2026-08-07 (Sprints F y G) agregada.
