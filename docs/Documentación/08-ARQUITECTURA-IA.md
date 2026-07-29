---
id: 08-arquitectura-ia
titulo: Arquitectura IA
categoria: inteligente
estado: activo-director-general-implementado
sprint: fase-2-premium-en-construccion
ultima_revision: 2026-07-29
relacionado:
  - 07-MOTOR-DE-CONOCIMIENTO
  - 19-INSTRUCCION-MOTOR-DIRECTOR
  - 09-ROADMAP-TECNICO
  - 20-SEGURIDAD-Y-CONTINUIDAD
---

# 08-ARQUITECTURA-IA.md

> Versión: 3.0
>
> Estado: Activo (Director General IA implementado y en producción)
>
> Clasificación: CONFIDENCIAL
>
> Tipo de documento: Arquitectura de Inteligencia Artificial
>
> Audiencia:
>
> Dirección
>
> Arquitectura
>
> Desarrollo
>
> IA
>
> Este documento NO debe publicarse.

---

# Objetivo

Definir cómo la Inteligencia Artificial forma parte de BarberOS.

La IA no constituye el producto.

La IA amplifica el producto.

BarberOS seguiría siendo valioso incluso sin IA.

La IA existe para acelerar la comprensión del negocio.

Nunca para reemplazar el criterio del empresario.

---

# Filosofía

La mayoría de aplicaciones incorporan IA para responder preguntas.

BarberOS utiliza IA para ayudar a tomar mejores decisiones.

La diferencia parece pequeña.

En realidad cambia completamente la arquitectura.

---

# Principio Fundamental

## La IA nunca analiza datos directamente.

Siempre consume conocimiento previamente construido por el Motor de Conocimiento.

Esto garantiza:

• respuestas coherentes;

• menor riesgo de alucinaciones;

• explicaciones consistentes;

• trazabilidad.

---

# Flujo General

Realidad

↓

Eventos

↓

Base de Datos

↓

Motor de Conocimiento

↓

Contexto Empresarial

↓

IA

↓

Respuesta

Nunca alterar este flujo.

---

# La IA nunca será un ChatGPT genérico

Cuando un usuario pregunte:

> ¿Cómo va mi barbería?

La IA nunca buscará improvisar una respuesta.

Primero consultará el conocimiento generado por BarberOS.

Luego responderá utilizando ese conocimiento.

---

# Roles de la IA

La IA evolucionará mediante agentes especializados.

Todos compartirán el mismo contexto empresarial.

Pero cada uno tendrá una responsabilidad diferente.

---

# Agente 1

## Director General IA

Es el coordinador.

No analiza una especialidad.

Comprende el negocio completo.

Responde preguntas generales.

Ejemplos.

¿Cómo está mi barbería?

¿Qué debería priorizar?

¿Cuáles son mis principales problemas?

¿Qué oportunidades ves?

---

# Agente 2

## Especialista en Clientes

Analiza comportamiento.

Frecuencia.

Abandono.

Lealtad.

Segmentación.

Valor del cliente.

Ejemplos.

¿Qué clientes podría perder?

¿Quiénes son mis mejores clientes?

¿Quién merece una campaña especial?

---

# Agente 3

## Especialista en Equipo

Analiza únicamente al personal.

Ejemplos.

¿Qué barbero genera más clientes recurrentes?

¿Quién obtiene mejores reseñas?

¿Quién necesita apoyo?

---

# Agente 4

## Especialista en Reputación

Analiza reseñas.

Calificaciones.

Opiniones.

Google Business Profile.

Ejemplos.

¿Qué opinan mis clientes?

¿Qué patrones encuentras?

¿Qué debería mejorar?

---

# Agente 5

## Especialista Comercial

Analiza crecimiento.

Campañas.

Promociones.

Adquisición.

Recomendaciones comerciales.

---

# Agente 6

## Especialista en Contenido

Su misión no será escribir publicaciones.

Su misión será descubrir oportunidades.

Ejemplos.

¿Qué contenido debería publicar esta semana?

¿Qué servicio conviene promocionar?

¿Qué preguntas hacen más mis clientes?

¿Qué video podría atraer nuevos clientes?

---

# El Director IA

Todos los agentes reportan al Director.

Cuando el usuario haga una pregunta amplia.

El Director consulta a los especialistas necesarios.

Integra la respuesta.

La presenta como una única conversación.

---

# Lo que la IA jamás hará

Inventar información.

Ocultar incertidumbre.

Dar respuestas absolutas.

Tomar decisiones por el empresario.

Modificar información histórica.

---

# Cómo responderá

Siempre seguirá esta estructura.

## 1

Responder la pregunta.

---

## 2

Explicar por qué llegó a esa conclusión.

---

## 3

Mostrar evidencia.

---

## 4

Proponer acciones.

---

## 5

Indicar posibles riesgos.

Nunca responder únicamente con una conclusión.

---

# Memoria

La IA utilizará tres niveles de memoria.

---

## Memoria inmediata

Conversación actual.

---

## Memoria empresarial

Motor de Conocimiento.

---

## Memoria estratégica

Objetivos del dueño.

Metas.

Preferencias.

Decisiones anteriores.

Esta memoria permitirá respuestas cada vez más personalizadas.

---

# Aprendizaje

La IA nunca aprenderá directamente del usuario.

Aprenderá del conocimiento validado.

Las decisiones importantes deberán confirmarse antes de incorporarse a la memoria estratégica.

---

# Explicabilidad

Toda recomendación deberá responder:

¿Por qué me dices esto?

Si la IA no puede justificar una recomendación.

No debe mostrarla.

---

# Versiones del producto

## BarberOS Pro

Incluye.

• Dashboard.

• Reportes.

• Captura de información.

• Historial.

• Fidelización.

No incluye agentes inteligentes.

---

## BarberOS Premium

Incluye todo lo anterior.

Más.

• Director IA.

• Motor de Conocimiento.

• Recomendaciones.

• Alertas inteligentes.

• Especialistas.

• Estrategias de crecimiento.

• Consultor empresarial.

---

# Evolución

La arquitectura está diseñada para incorporar nuevos especialistas.

Ejemplos.

Especialista Financiero.

Especialista SEO Local.

Especialista Marketing.

Especialista Inventario.

Especialista Recursos Humanos.

Todos utilizarán el mismo conocimiento empresarial.

Nunca construirán conocimiento por separado.

---

# Indicadores de éxito

La arquitectura estará correctamente implementada cuando:

✓ la IA responda utilizando conocimiento y no datos aislados;

✓ todas las respuestas sean explicables;

✓ las recomendaciones puedan justificarse;

✓ el empresario sienta que conversa con alguien que conoce su negocio;

✓ el conocimiento aumente con el tiempo.

---

# Relación con el siguiente documento

La IA ya quedó definida.

El siguiente documento:

09-ROADMAP-TECNICO.md

describirá el orden correcto para construir BarberOS.

No todo debe desarrollarse al mismo tiempo.

La arquitectura técnica deberá respetar las prioridades del negocio.

---

# 📍 Estado de implementación (cotejo 2026-07-29)

## Director General IA — IMPLEMENTADO Y EN PRODUCCIÓN (Sprint D, 2026-07-26)

**Modelo:** Groq Llama 3.3 70B Versatile (`https://api.groq.com/openai/v1/chat/completions`).
**Variable de entorno:** `GROQ_API_KEY`. Decisión documentada: se mantiene la llave de pruebas del tier gratuito durante la fase piloto. Backlog: migrar a llave productiva propia antes de escalar más allá de las 4 barberías piloto. Ver [[20-SEGURIDAD-Y-CONTINUIDAD]].

### Principios arquitectónicos respetados

1. **La IA nunca analiza datos crudos.** Consume el `MotorSnapshot` producido por [[07-MOTOR-DE-CONOCIMIENTO]]. Cero alucinación de datos numéricos.
2. **Estructura de 5 pasos obligatoria** (definida en [[19-INSTRUCCION-MOTOR-DIRECTOR]] sección 5):
   1. Responder la pregunta.
   2. Explicar por qué llegó a esa conclusión.
   3. Mostrar evidencia (datos del snapshot).
   4. Proponer acciones (botones de 1-Clic a WhatsApp).
   5. Indicar posibles riesgos.
3. **Disclaimer obligatorio de incertidumbre** por tarjeta: *"⚠️ Esto es un patrón detectado en datos, no una certeza absoluta — revisa la situación y decide tú como dueño."*

### Detección temprana

- **Riesgo Crítico (`AT_RISK`):** clientes que sobrepasan el `riskThresholdAt` configurado por la barbería.
- **Atraso Inicial (`DELAYED`):** clientes que sobrepasan `riskThresholdNormal` pero todavía no llegan a `riskThresholdAt`. Esto permite rescatar antes de la pérdida total.

### Fallback transparente

- Si la API key falla, no responde, o devuelve error: el sistema activa el **motor de reglas determinístico local** (mismo snapshot, lógica de umbrales hard-coded).
- Logging explícito en consola (`isGenerativeLLM: false` en metadata de la respuesta).
- En el UI, el `DirectorWidget` muestra badge dinámico: `LLM Real (Groq llama-3.3-70b-versatile)` o `Motor Determinístico`.

### Gating por planType

- Toda llamada al Director IA valida `planType === "PREMIUM"` antes de invocar la API del modelo.
- Cuentas `PRO` ven `UpgradeBanner` decorativo en lugar de pantalla rota o error.
- Documentado en [[19-INSTRUCCION-MOTOR-DIRECTOR]] sección 1.1.

### Rate limit y escalabilidad

- Tier Groq gratuito: 30 req/minuto y 14,400/día.
- Suficiente para las barberías Premium actuales (1-2 reales).
- **Backlog:** si el número de clientes Premium supera las 30 barberías ejecutando el cron a las 3am en simultáneo, se debe implementar una cola secuencial o delay de 500ms entre barberías.

### Limitación histórica documentada

- Las 23 visitas pre-existentes en BD tienen `checkinMethod = "SELF"` por default (no verificado).
- El Director IA **debe comunicar esta limitación** cuando analice periodos anteriores a la implantación del Motor — nunca presentar esos datos como verificados.
- Sin script de migración retroactiva (sería una suposición, no un dato real).

## Pendiente de evolución

- **Agentes especializados (Clientes, Equipo, Reputación, Comercial, Contenido):** se activan uno a uno, en el orden que determine la demanda real observada en Fase 1. Sin prisa.
- **Memoria estratégica (preferencias del dueño, metas, decisiones anteriores):** conceptualmente definida en este documento, pero no modelada todavía. Queda como backlog si la demanda real lo justifica.
- **Aprendizaje validado:** la IA aún no confirma decisiones del dueño antes de incorporarlas a la memoria estratégica. La regla arquitectónica está, la implementación no.