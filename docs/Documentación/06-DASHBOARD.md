---
id: 06-dashboard
titulo: Especificaciones del Dashboard
categoria: tecnico
estado: activo
sprint: fase-1-piloto-activo
ultima_revision: 2026-07-29
relacionado:
  - 09-ROADMAP-TECNICO
  - 13-COMPONENTES
  - 12-UX
  - 15-BRAND-KIT-BRIEFING
  - 07-MOTOR-DE-CONOCIMIENTO
  - 08-ARQUITECTURA-IA
---

# 06-DASHBOARD.md

> Versión: 3.0
>
> Estado: Activo
>
> Tipo de documento: Arquitectura del Dashboard
>
> Audiencia: Desarrollo, UX/UI, IA y Producto.
>
> Depende de:
>
> 00-CONSTITUCION-BARBEROS.md
>
> 01-MANIFIESTO.md

>
> 02-ARQUITECTURA-ESTRATEGICA.md
>
> 05-ARQUITECTURA-DEL-PRODUCTO.md
>
> 13-COMPONENTES.md (sistema de rediseño)
>
> 15-BRAND-KIT-BRIEFING.md (paleta y dirección visual)

---

# Objetivo

Este documento define cómo debe pensar el Dashboard de BarberOS.

No explica cómo programarlo.

No define colores.

No diseña componentes.

Define la lógica con la que debe presentarse el conocimiento al empresario.

El Dashboard nunca será un panel administrativo.

Será un gerente digital.

---

# Filosofía

La mayoría de sistemas muestran información.

BarberOS mostrará comprensión.

Cuando un dueño abre el panel no debería preguntarse:

> ¿Qué significa este gráfico?

El sistema debería responder esa pregunta antes de que aparezca.

---

# El propósito del Dashboard

El objetivo no es informar.

El objetivo es reducir incertidumbre.

Cada pantalla debe terminar respondiendo:

> Ahora entiendo qué está pasando.

Nunca:

> Ahora tengo más datos.

---

# El Dashboard responde cuatro preguntas

Todo el panel gira alrededor de cuatro preguntas.

Nada más.

---

## 1

¿Cómo está hoy mi barbería?

---

## 2

¿Qué cambió desde la última vez?

---

## 3

¿Por qué ocurrió?

---

## 4

¿Qué debería hacer ahora?

Si una pantalla no responde alguna de estas preguntas probablemente no pertenece al Dashboard.

---

# Principio Fundamental

## Nunca mostrar un dato aislado.

Toda información deberá seguir esta estructura.

Dato

↓

Interpretación

↓

Recomendación

---

Ejemplo.

Incorrecto.

Clientes nuevos.

18

---

Correcto.

Llegaron 18 clientes nuevos.

Solo 4 regresaron.

Conviene revisar qué ocurrió durante la primera visita.

---

# La regla de las tres capas

Todo indicador tendrá tres niveles.

---

## Nivel 1

Qué ocurrió.

---

## Nivel 2

Qué significa.

---

## Nivel 3

Qué hacer.

---

Si falta uno de estos niveles el indicador está incompleto.

---

# El Dashboard cuenta historias

Las tarjetas no aparecen porque sí.

Cada una forma parte de una narrativa.

Orden obligatorio.

¿Cómo está mi negocio?

↓

¿Qué cambió?

↓

¿Por qué?

↓

¿Qué hago ahora?

---

# Las tarjetas

Cada tarjeta responde una sola pregunta.

Nunca dos.

---

Ejemplos.

Clientes que están dejando de regresar.

---

Barbero que genera mayor fidelidad.

---

Clientes recuperados este mes.

---

Probabilidad de perder clientes.

---

Nunca mezclar varias respuestas dentro de una misma tarjeta.

---

# Lenguaje

El Dashboard habla exactamente igual que BarberOS.

Nunca utilizará lenguaje técnico.

Ejemplos.

Incorrecto.

Retención.

Correcto.

Clientes que volvieron.

---

Incorrecto.

Clientes inactivos.

Correcto.

Clientes que hace tiempo no regresan.

---

Incorrecto.

Lifetime Value.

Correcto.

Lo que realmente vale un cliente para tu barbería.

---

# El papel de los colores

Los colores comunican decisiones.

Nunca decoración.

Verde.

Todo marcha correctamente.

---

Amarillo.

Hay algo que conviene revisar.

---

Rojo.

Existe un riesgo.

---

Azul.

Existe una oportunidad.

---

# Prioridad visual

El usuario nunca debería buscar lo importante.

El sistema debe mostrarlo primero.

La información urgente siempre aparece antes que la información interesante.

---

# El patrimonio

El Dashboard nunca hablará únicamente de clientes.

Hablará del patrimonio del negocio.

Ejemplo.

No decir:

Tienes 326 clientes.

Preferir:

Tu patrimonio actual está formado por 326 personas que ya confiaron en tu barbería.

---

# El conocimiento oculto

Muchos datos parecen simples.

En realidad contienen conocimiento.

Ejemplo.

lastVisitAt

No representa una fecha.

Representa el tiempo que un cliente lleva sin regresar.

---

cutsCount

No representa cortes.

Representa confianza construida.

---

rating

No representa estrellas.

Representa satisfacción.

---

staffId

No representa quién atendió.

Representa quién fortalece el negocio.

---

# Las recomendaciones

Toda recomendación debe cumplir tres condiciones.

Debe ser:

específica;

comprensible;

accionable.

Ejemplo.

Incorrecto.

Mejorar fidelización.

---

Correcto.

Hace varias semanas que disminuyen los clientes recurrentes.

Podría ser un buen momento para solicitar más reseñas y recordar los premios disponibles.

---

# Evolución

El Dashboard crecerá en cuatro etapas.

---

## Nivel 1

Información.

---

## Nivel 2

Interpretación.

---

## Nivel 3

Recomendaciones.

---

## Nivel 4

Predicciones.

El usuario siempre deberá percibir esta evolución.

---

# Integración con IA

El Dashboard no será reemplazado por la IA.

La IA ampliará el Dashboard.

Cada indicador podrá convertirse en una conversación.

Ejemplo.

¿Por qué bajaron mis clientes este mes?

La IA utilizará los datos del Dashboard para responder.

---

# Componentes visuales del Dashboard (Sprint E, 2026-07-29)

A partir del Sprint E, el Dashboard se renderiza sobre el **sistema de rediseño** descrito en [[13-COMPONENTES]]. Las tarjetas conceptuales definidas en este documento se traducen a:

| Concepto narrativo | Componente |
|---|---|
| Hero "¿Cómo está tu barbería?" | `PanelHero` (imagen real + degradado + eyebrow + título + acción) |
| Selector de sección narrativa | `SectionTabs` (variante `pill`) envuelto en `TabsCarousel` para móvil |
| Métrica individual (Capa 1, 2, 3) | `MetricTile` (acento `orange` para primario, `amber` para预警, `green` para positivo, `neutral` para estándar) |
| Contenedor de bloque | `GlassCard` (con `elevated` cuando está sobre `PanelHero`) |
| Anillo de progreso (lealtad / retención) | `ProgressRing` |
| Navegación principal | `FloatingNav` (móvil/tablet) + sidebar heredado (desktop) |
| Botón de acción | `PillButton` (variante `primary` para CTAs) |

**Regla de uso:** todo nuevo desarrollo del Dashboard debe construirse sobre estos componentes. Los componentes heredados (sidebar fijo, métricas en grid sólido, etc.) siguen activos pero son candidatos a reemplazo gradual.

---

# Dimensiones del Snapshot del Motor (conexión con [[07-MOTOR-DE-CONOCIMIENTO]])

El Dashboard Premium consume el `MotorSnapshot` producido por el Motor de Conocimiento. La narrativa se estructura en 3 dimensiones:

## Dimensión Negocio
- Volumen total de cortes (incluye `BARBER_ASSISTED_ANONYMOUS`).
- Visitas por hora (para análisis de capacidad).
- Tendencia semanal.

## Dimensión Clientes
- Perfiles en Riesgo Crítico (`AT_RISK`).
- Perfiles en Atraso Inicial (`DELAYED`).
- Perfiles Normales (`NORMAL`).
- Perfiles con datos insuficientes (`INSUFFICIENT_DATA`).

## Dimensión Equipo
- Top barberos por rating.
- Promedio de cortes por barbero (solo visitas con barbero real).

**Regla de Gating:** cuentas `PRO` ven `UpgradeBanner` en lugar de estas 3 dimensiones. Documentado en [[19-INSTRUCCION-MOTOR-DIRECTOR]] sección 1.1.

---

# Lo que nunca debe ocurrir

Gráficos sin explicación.

Tarjetas decorativas.

Indicadores sin acción.

Lenguaje técnico.

Pantallas llenas de números.

Información irrelevante.

---

# Indicadores de éxito

Este documento estará correctamente implementado cuando:

- el usuario comprenda su negocio más rápido que antes;
- cada pantalla termine con una acción sugerida;
- el Dashboard pueda utilizarse sin capacitación;
- el dueño sienta que alguien ya analizó la información antes que él.

---

# Relación con el siguiente documento

El Dashboard muestra conocimiento.

El siguiente documento explicará cómo se genera ese conocimiento.

07-MOTOR-DE-CONOCIMIENTO.md

Ese documento constituye el corazón intelectual de BarberOS.

Todo el producto depende de él.
