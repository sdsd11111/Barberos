---
id: 07-motor-de-conocimiento
titulo: Motor de Conocimiento
categoria: inteligente
estado: activo-capa-deterministica
sprint: fase-2-premium-en-construccion
ultima_revision: 2026-07-29
relacionado:
  - 08-ARQUITECTURA-IA
  - 19-INSTRUCCION-MOTOR-DIRECTOR
  - 09-ROADMAP-TECNICO
---

# 07-MOTOR-DE-CONOCIMIENTO.md

> Versión: 3.0
>
> Estado: Activo (capa determinística implementada y en producción)
>
> Clasificación: CONFIDENCIAL
>
> Tipo de documento: Arquitectura del Motor de Conocimiento
>
> Audiencia:
>
> Dirección
>
> Arquitectura
>
> IA
>
> Desarrollo Senior
>
> Este documento NO debe distribuirse públicamente.

---

# Objetivo

Este documento define el activo intelectual más importante de BarberOS.

No explica cómo almacenar datos.

No explica cómo programar algoritmos.

No explica cómo funciona la IA.

Explica cómo BarberOS transforma información cotidiana en conocimiento útil para el empresario.

El objetivo del producto nunca ha sido almacenar información.

Su objetivo siempre ha sido ayudar al dueño a comprender mejor su negocio.

---

# La diferencia entre dato e información

Un dato no tiene significado por sí mismo.

Ejemplo.

```
Cliente:

Carlos

Última visita:

Hace 34 días.
```

Eso es un dato.

Nada más.

---

Información sería:

Carlos suele regresar cada 18 días.

Ya pasaron 34.

Existe riesgo de perderlo.

---

Conocimiento sería:

Carlos pertenece al grupo de clientes con alta probabilidad de abandono.

Conviene contactarlo esta semana.

---

Sabiduría sería:

Si varios clientes con el mismo patrón comienzan a desaparecer, probablemente existe un problema operativo dentro de la barbería.

---

BarberOS debe trabajar siempre sobre esos cuatro niveles.

Dato.

↓

Información.

↓

Conocimiento.

↓

Decisión.

---

# El propósito del motor

El motor existe para responder preguntas.

Nunca para mostrar estadísticas.

Cada cálculo debe terminar respondiendo una pregunta real.

Ejemplos.

¿Por qué bajaron los clientes?

¿Quién genera mayor fidelidad?

¿Qué clientes estoy perdiendo?

¿Qué ocurre si no hago nada?

---

# Cómo piensa BarberOS

El sistema nunca comienza preguntando:

¿Qué datos tengo?

Comienza preguntando:

¿Qué necesita decidir hoy el dueño?

Después busca los datos necesarios.

Nunca al revés.

---

# El ciclo del conocimiento

Todo el sistema sigue siempre este flujo.

Evento

↓

Dato

↓

Contexto

↓

Patrón

↓

Interpretación

↓

Hipótesis

↓

Recomendación

↓

Aprendizaje

Nunca debe romperse este ciclo.

---

# Primera capa

## Eventos

Los eventos representan la realidad.

No son métricas.

Son hechos.

Ejemplos.

Cliente llegó.

Cliente no llegó.

Cliente calificó.

Cliente obtuvo premio.

Cliente recomendó.

Cliente cambió de frecuencia.

Cliente desapareció.

Barbero atendió.

Servicio realizado.

Todo comienza aquí.

---

# Segunda capa

## Contexto

El mismo evento puede significar cosas completamente distintas dependiendo del contexto.

Ejemplo.

Un cliente lleva 30 días sin regresar.

Para algunos negocios es normal.

Para otros significa abandono.

El contexto determina el significado.

---

**Contexto operativo del barbero:** el contexto de un cliente no solo lo determina el negocio (ej. "30 días es normal o no"). También puede venir de una nota operativa vigente escrita por el barbero (ej. "está de vacaciones hasta tal fecha"), que modifica temporalmente cómo se interpreta su inactividad. Este contexto tiene fecha de vencimiento y se descarta automáticamente al expirar. Este dato es determinista y estructurado — no requiere interpretación de IA — y alimenta la supresión de alertas de abandono durante la ventana vigente.

---

# Tercera capa

## Patrones

Los eventos aislados tienen poco valor.

Los patrones construyen conocimiento.

Ejemplo.

Un cliente faltó.

No dice mucho.

Treinta clientes con el mismo comportamiento durante dos semanas.

Eso ya representa un patrón.

---

# Cuarta capa

## Interpretación

Aquí BarberOS deja de describir.

Empieza a comprender.

Ejemplos.

La barbería crece.

La barbería se estancó.

Los clientes nuevos no regresan.

Un barbero genera más fidelidad.

Los premios dejaron de funcionar.

Las reseñas disminuyeron.

---

# Quinta capa

## Hipótesis

El sistema genera posibles explicaciones.

Nunca verdades absolutas.

Ejemplo.

Podría estar ocurriendo que...

↓

Los clientes ya no reciben el mismo servicio.

↓

Las promociones perdieron efectividad.

↓

Existe mayor competencia.

↓

El mejor barbero tiene demasiada carga.

Siempre se habla en términos probabilísticos.

Nunca categóricos.

---

# Sexta capa

## Recomendaciones

Toda interpretación debe terminar proponiendo una acción.

No una conclusión.

Ejemplo.

Durante las próximas dos semanas sería recomendable solicitar reseñas a los clientes nuevos.

---

# Séptima capa

## Aprendizaje

Cada decisión tomada alimenta nuevamente al sistema.

Con el tiempo BarberOS comprenderá mejor esa barbería específica.

Nunca existirá un modelo único para todos.

Cada negocio desarrollará su propio conocimiento.

---

# El conocimiento empresarial

El sistema construirá conocimiento sobre cuatro dimensiones.

## Clientes

¿Quién vuelve?

¿Quién deja de venir?

¿Cuál es su frecuencia?

¿Cuánto vale?

---

## Equipo

¿Quién genera mayor confianza?

¿Quién obtiene mejores reseñas?

¿Quién fideliza más?

---

## Negocio

¿Cómo está creciendo?

¿Qué promociones funcionan?

¿Qué servicios fortalecen la fidelidad?

---

## Mercado

¿Qué tendencias comienzan a aparecer?

¿Qué cambia respecto a meses anteriores?

¿Qué oportunidades existen?

---

# La Memoria Empresarial

Uno de los objetivos más importantes de BarberOS será construir la memoria del negocio.

Los dueños cambian.

Los empleados cambian.

Pero el conocimiento permanece.

El sistema nunca debe olvidar.

---

# Integración con IA

La inteligencia artificial nunca analizará datos crudos.

Consumirá conocimiento previamente estructurado por este motor.

Eso garantiza respuestas más consistentes.

Más explicables.

Más útiles.

La IA no reemplaza el motor.

Lo utiliza.

---

# La ventaja competitiva

La mayoría de software responde:

¿Qué pasó?

BarberOS responderá:

¿Por qué pasó?

¿Qué significa?

¿Qué podría pasar después?

¿Qué deberías hacer?

Ahí reside la verdadera diferencia.

---

# Principio Final

Mientras otros sistemas administran barberías...

BarberOS aprenderá cómo funciona cada una.

Y cuanto más aprenda...

más valioso se volverá para su dueño.

Ese conocimiento constituye el principal activo intelectual de BarberOS.

Debe protegerse, evolucionar y documentarse con el mismo cuidado que el código fuente.

---

# 📍 Estado de implementación (cotejo 2026-07-29)

## Lo que ya existe en código

**Capa Determinística — IMPLEMENTADA Y EN PRODUCCIÓN desde 2026-07-25:**

### Modelo de datos
- `CustomerProfile` — persona real dentro de una cuenta WhatsApp (modelo Cuenta/Perfil).
- `ProfileMotorContext` — contexto calculado por el Motor por perfil: frecuencia, riesgo, vigencia, distribución horaria.
- `MotorSnapshot` — resumen nocturno por barbería en 3 dimensiones: Negocio, Clientes, Equipo.
- `TestExclusion` — tabla editable de números excluidos del cálculo (ej. barberos, dueños, números de prueba).
- Campos nuevos en `BarberVisit`: `checkinMethod` (`SELF` / `BARBER_ASSISTED_KNOWN` / `BARBER_ASSISTED_ANONYMOUS`), `profileId`, `services`, `visitHour`.
- Campos nuevos en `Barbershop`: `riskThresholdNormal`, `riskThresholdAt`, `loyaltyMode` (`BY_PROFILE` / `BY_ACCOUNT`), `visitDurationMin`, `anonymousVisitCounter`.

### Librería determinística (`src/lib/motor.ts`)
- `calculateAvgDaysBetween()` — ventana móvil de 8 visitas por perfil.
- `calculateRiskLevel()` — umbrales configurables por barbería: `AT_RISK` / `DELAYED` / `NORMAL` / `INSUFFICIENT_DATA`.
- `calculateProfileFrequency()` — frecuencia e indicadores por perfil.
- `calculateStaffMetrics()` — promedios de equipo (solo visitas con barbero real).
- `calculateVisitsByHour()` — distribución horaria para análisis de capacidad.
- `runMotorForBarbershop()` — runner completo para una barbería.
- `persistMotorResults()` — persiste snapshot y contextos en BD.

### Cron nocturno
- `/api/cron/motor` — ejecución diaria a las **3am** (Vercel Cron).
- Solo procesa barberías con `planType === "PREMIUM"` y `planStatus` ACTIVE o TRIAL.
- Paginación secuencial + manejo de errores por barbería (no aborta el batch).

### Reglas de diseño aplicadas
- **Separación dura entre Motor e IA:** la IA (Groq Llama 3.3 70B) consume el snapshot del Motor. Nunca toca datos crudos. Cero alucinación de datos.
- **Regla de Gating por planType:** los endpoints del Motor y los componentes del panel verifican `planType === "PREMIUM"`. Cuentas PRO ven `UpgradeBanner` decorativo en lugar de pantallas rotas.
- **Historial legacy de `checkinMethod`:** las 23 visitas pre-existentes en BD tienen `checkinMethod = "SELF"` por default. Decisión documentada: no se migra retroactivamente. El Director IA debe comunicar esta limitación al analizar periodos anteriores.

## Pendiente de evolución

- **Aprendizaje por barbería (capa 7):** actualmente cada barbería se mide contra sus propios umbrales; no hay todavía un motor que detecte automáticamente cambios de tendencia y los proponga como sugerencia al dueño.
- **Análisis de Mercado (cuarta dimensión):** no hay datos suficientes para construirla (1 barbería real con volumen + 1 piloto fundador + datos de prueba).
- **Notas operativas del barbero (override temporal de contexto):** la columna existe como intención en este documento, pero no está modelada en `schema.prisma` todavía. Queda como backlog si la demanda real lo justifica.