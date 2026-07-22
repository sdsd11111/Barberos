---
id: 14-prd
titulo: Product Requirements Document
categoria: tecnico
estado: activo
sprint: fase-0-completada
ultima_revision: 2026-07-19
relacionado:
  - 09-ROADMAP-TECNICO
  - 13-COMPONENTES
---

# 14-PRD.md

> Versión: 1.0
>
> Estado: Activo
>
> Clasificación: CONFIDENCIAL
>
> Tipo de documento: Product Requirements Document
>
> Audiencia: Dirección, Desarrollo, Ventas
>
> Este documento NO debe distribuirse públicamente.

---

# Resumen ejecutivo

BarberOS es un sistema de fidelización y conocimiento de clientes para barberías, operado enteramente a través de WhatsApp para el cliente final, y un panel simple para el dueño. No vende software. Vende tranquilidad: que el dueño deje de trabajar a ciegas sobre su propio negocio.

---

# El problema real (validado, no supuesto)

El dueño de barbería no articula su problema como "necesito un CRM". Lo articula como incertidumbre concreta:

- No sabe cuántos clientes tiene realmente.
- No sabe cuáles van a volver.
- No sabe cuál de sus barberos genera más lealtad.
- No sabe cuánto dinero pierde cada mes por clientes que no regresan.

La frase que resume el problema: *"El trabajo termina cuando acaba el corte. El negocio empieza cuando el cliente sale por la puerta."* Antes de BarberOS, nadie está mirando lo que pasa después de esa puerta.

---

# Las cuatro emociones que vende el producto

No se vende por funcionalidad. Se vende por transformación emocional:

1. **Control** — saber exactamente cuántos clientes tiene, quiénes son.
2. **Tranquilidad** — dejar de cruzar los dedos para que el cliente regrese.
3. **Orgullo** — ver reseñas y reputación creciendo sin esfuerzo activo.
4. **Crecimiento** — entender qué mueve más ingresos con los mismos clientes.

Toda funcionalidad del producto existe para sostener una de estas cuatro emociones, nunca al revés.

---

# Usuarios y roles

- **Dueño (OWNER)** — usa el panel, aprueba/rechaza check-ins, ve métricas.
- **Barbero (BARBER)** — puede registrar cortes, no accede a configuración ni reportes completos (dependiendo de Sprint 5).
- **Cliente final** — no tiene cuenta ni login. Interactúa exclusivamente vía WhatsApp.

---

# Alcance por versión

## BarberOS Pro

- **Setup: USD 50** (pago único)
- Mensualidad: USD 9.99/mes
- Tokens IA: USD 5/mes ( uso discrecional)
- Incluye: check-in vía WhatsApp con barra de progreso, cola de aprobación anti-fraude, registro y gestión de clientes, premios automáticos, Google Reviews (a discreción del barbero), dashboard, reportes, configuración, actualizaciones.
- Plan Anual: USD 99/año
- Plan Lifetime: USD 500 (hasta 12 cuotas vía Payphone)
- Trial: 15 días gratis sin tarjeta

## BarberOS Premium

- **Setup: USD 50** (pago único — mismo valor que Pro)
- Mensualidad: USD 19.99/mes
- Tokens IA: USD 5/mes ( uso discrecional)
- Incluye todo lo de Pro + Motor de Conocimiento (documento 07), IA especializada, recomendaciones, alertas inteligentes, consultor IA.
- Plan Anual: USD 199/año
- Plan Lifetime: USD 1000 (hasta 12 cuotas vía Payphone)
- Trial: 15 días gratis sin tarjeta

**Nota:** La solicitud de reseñas de Google **no es automática por defecto**. El barbero decide si el cliente salió satisfecho antes de aprobar el envío del mensaje de reseña. Esto evita reseñas negativas de clientes que no quedaron conformes.

## BarberOS Enterprise

Fuera de alcance de este PRD. Ver `15-PROYECTOS-Y-PROYECCIONES.md`.

---

# Fuera de alcance (explícitamente, para evitar scope creep)

- Multi-sede / multi-local (pertenece a fase posterior).
- App móvil nativa — el canal es WhatsApp, deliberadamente, no una app que nadie descarga.
- Integraciones POS — quedan para Enterprise.
- Cualquier feature de IA antes de validar Pro en producción con barberías reales.

---

# Criterios de éxito del MVP (Fase Piloto)

- 10 barberías fundadoras usando el sistema en producción sin caídas.
- Al menos 5 testimonios en video utilizables comercialmente.
- Al menos 5 reseñas nuevas de Google generadas a través del sistema.
- Cero incidentes de fuga de datos entre tenants (validación de la regla multi-tenant).
- El primer cliente que paga precio de lista completo, sin negociación, atraído por evidencia real.
- **Primera venta Lifetime cerrada (2026-07-22): USD 500 — Pro Lifetime.** Criterio de éxito ya cumplido.

---

# Riesgos conocidos

- **Riesgo de coherencia comercial:** si el trato de "piloto gratuito" se filtra públicamente, se rompe el ancla de precio premium. Mitigación: acuerdo de confidencialidad implícito en el mensaje de compromiso de WhatsApp (documento 10).
- **Riesgo de sobre-construcción:** la tentación de construir el Motor de Conocimiento y los agentes antes de validar Pro. Mitigación: las fases del roadmap técnico (documento 09) son de cumplimiento obligatorio, no sugerencias.
- **Riesgo de soporte remoto (Cuenca):** el dueño puede sentir menor atención al no ser onboarding presencial. Mitigación: comunicarlo explícitamente como parte de la propuesta, no ocultarlo.

---

# Relación con el resto de la documentación

Este PRD es el resumen ejecutable de los documentos 00 a 13. Cualquier cambio a las emociones, el alcance por versión o los criterios de éxito debe reflejarse también en `00-CONSTITUCION-BARBEROS.md` para mantener coherencia total del sistema documental.