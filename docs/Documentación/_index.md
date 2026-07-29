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
- [[03-ARQUITECTURA-WEB]] — **Arquitectura Web**: Estructura de páginas, sitemap y layouts del sitio y panel.
- [[04-SISTEMA-DE-COMUNICACION]] — **Sistema de Comunicación**: Reglas de interacción por WhatsApp y flujos de mensajes automatizados.
- [[05-ARQUITECTURA-DEL-PRODUCTO]] — **Arquitectura del Producto**: Detalle técnico del motor multi-tenant y base de datos relacional.
- [[06-DASHBOARD]] — **Especificaciones del Dashboard**: Mockups conceptuales y lógica del panel de control del dueño.
- [[09-ROADMAP-TECNICO]] — **Roadmap Técnico**: Secuencia lógica y dependencias de construcción (Fases 0 a 3).
- [[12-UX]] — **Flujos de Experiencia**: Diseño de interacciones clave (login sin contraseña, flujo de check-in).
- [[13-COMPONENTES]] — **Biblioteca de Componentes**: Registro de componentes implementados (Fase 0) y pendientes (Sprints 5, 6, 7).
- [[14-PRD]] — **Product Requirement Document (PRD)**: Requerimientos funcionales mínimos para el MVP comercial.
- [[15-BRAND-KIT-BRIEFING]] — **Brand Kit Briefing**: Especificaciones y consolidación de la esencia visual de BarberOS para el diseñador gráfico (Manus).
- [[20-SEGURIDAD-Y-CONTINUIDAD]] — **Seguridad y Continuidad**: Políticas de secretos, Rate-Limiting persistente en MySQL, aislamiento multi-tenant y Plan de Recuperación de BD (DRP).

## 🤖 Inteligencia y Motor (Fase 2 en construcción)
- [[07-MOTOR-DE-CONOCIMIENTO]] — **Motor de Conocimiento**: Lógica de almacenamiento semántico y procesamiento de eventos históricos. *Estado 2026-07-29: capa determinística implementada y en producción.*
- [[08-ARQUITECTURA-IA]] — **Arquitectura de Inteligencia**: Red de agentes de IA especializados y orquestador maestro. *Estado 2026-07-29: Director General IA implementado con Groq Llama 3.3 70B.*
- [[19-INSTRUCCION-MOTOR-DIRECTOR]] — **Instrucción de Construcción del Motor + Director IA**: Especificación funcional para el constructor. Define la regla de Gating por planType y el contrato Motor↔IA.

---

## ⚙️ Operaciones y Seguridad
- [[20-SEGURIDAD-Y-CONTINUIDAD]] — **Seguridad y Continuidad**: Rate-limiting persistente en MySQL, política de secretos (GROQ_API_KEY), aislamiento multi-tenant y Plan de Recuperación de BD (DRP).
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

> **📍 Última actualización del mapa:** 2026-07-29 (post-Sprint E de Rediseño Visual).
> **Documentos que cambiaron de estado en esta actualización:**
> - [[07-MOTOR-DE-CONOCIMIENTO]]: `congelado` → `activo-capa-deterministica`
> - [[08-ARQUITECTURA-IA]]: `congelado` → `activo-director-general-implementado`
> - [[09-ROADMAP-TECNICO]]: `fase-0-completada` → `fase-1-piloto-activo`
> - [[13-COMPONENTES]]: agregado Sistema de Rediseño Visual (`src/components/redesign/`)
> - [[CONTEXT]]: sección "Rediseño Visual del Panel" agregada
> - [[BITACORA]]: sesión 2026-07-27→29 (Sprint E) agregada
