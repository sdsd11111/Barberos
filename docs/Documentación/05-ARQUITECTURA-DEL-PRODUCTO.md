---
id: 05-arquitectura-del-producto
titulo: Arquitectura de Producto
categoria: tecnico
estado: activo
sprint: fase-0-completada
ultima_revision: 2026-07-19
relacionado:
  - 00-Constitución
  - 01-MANIFIESTO
  - 03-ARQUITECTURA-WEB
---

# 05-ARQUITECTURA-DEL-PRODUCTO.md

> Versión: 2.0
>
> Estado: Activo
>
> Tipo de documento: Arquitectura Funcional del Producto
>
> Audiencia: Desarrollo, Producto, UX/UI, IA y Dirección.
>
> Depende de:
>
> 00-CONSTITUCION-BARBEROS.md
>
> 01-MANIFIESTO.md
>
> 02-ARQUITECTURA-ESTRATEGICA.md
>
> 03-ARQUITECTURA-WEB.md
>
> 04-SISTEMA-DE-COMUNICACION.md

---

# Objetivo

Este documento define la arquitectura funcional de BarberOS.

No describe pantallas.

No describe tablas.

No describe tecnologías.

Describe las capacidades que forman el producto.

Todo desarrollo deberá pertenecer a alguna de estas capacidades.

Si una funcionalidad no pertenece a ninguna, probablemente no deba existir.

---

# Filosofía

BarberOS no es un conjunto de pantallas.

Es un sistema que convierte información en conocimiento.

Las pantallas solamente son la forma de mostrar ese conocimiento.

El producto siempre deberá diseñarse desde el problema del empresario.

Nunca desde la tecnología.

---

# Arquitectura General

BarberOS estará compuesto por ocho grandes capacidades.

Todas trabajan juntas.

Ninguna existe de manera aislada.

---

# CAPACIDAD 1

## Captura de información

### Misión

Convertir las acciones cotidianas de la barbería en datos confiables.

---

Actualmente captura:

Clientes.

Visitas.

Check-in.

Barbero que atendió.

Fecha.

Hora.

Calificación.

Premios.

---

En el futuro podrá capturar:

Productos vendidos.

Tiempo del servicio.

Servicios adicionales.

Canales de adquisición.

Campañas.

---

Sin captura confiable no existe conocimiento.

---

# CAPACIDAD 2

## Construcción del historial

Toda interacción debe enriquecer la historia del cliente.

Nunca sobrescribirla.

Cada cliente debe convertirse en una línea de tiempo.

Ejemplo.

Cliente creado.

↓

Primer corte.

↓

Segundo corte.

↓

Premio obtenido.

↓

Reseña.

↓

Recomendación.

↓

Última visita.

La historia tiene más valor que el dato aislado.

---

# CAPACIDAD 3

## Comprensión del cliente

El sistema deberá responder preguntas como:

¿Cuántas veces vino?

¿Cuándo fue la última vez?

¿Cuánto tarda normalmente en regresar?

¿Qué servicios consume?

¿Quién suele atenderlo?

¿Cuál es su nivel de fidelidad?

No muestra información.

Construye conocimiento.

---

# CAPACIDAD 4

## Comprensión de la barbería

El producto debe comprender el negocio completo.

Ejemplos.

¿Cuántos clientes activos existen?

¿Cuántos dejaron de regresar?

¿Cuál es el mejor mes?

¿Qué barbero genera mayor retorno?

¿Qué promociones funcionan?

¿Qué servicio fideliza más?

Esta capacidad será la base del Dashboard.

---

# CAPACIDAD 5

## Motor de recomendaciones

Una vez comprendido el negocio...

el sistema comienza a recomendar acciones.

Ejemplos.

Hace dos semanas que disminuyeron los clientes nuevos.

---

Carlos lleva 45 días sin regresar.

---

Pedro genera mejores reseñas que el promedio.

---

Sería buena idea solicitar más opiniones esta semana.

El sistema no administra.

Sugiere.

---

# CAPACIDAD 6

## Comunicación

Todo contacto con clientes ocurre aquí.

Actualmente.

WhatsApp.

Push nativo (PWA, Sprint 8).

En el futuro.

Correo.

SMS.

Google Wallet.

Apple Wallet.

Lo importante no es el canal.

Lo importante es mantener viva la relación.

**Nota sobre reseñas de Google (2026-07-22):** La solicitud de reseña de Google **no es automática por defecto**. El barbero decide si el cliente salió satisfecho antes de aprobar el envío del mensaje de reseña. Esto evita reseñas negativas de clientes que no quedaron conformes. El copy del sitio que promete "envío automático a las 2h" debe actualizarse para reflejar esta decisión — tarea pendiente de alinear con la web.

---

# CAPACIDAD 7

## Inteligencia Empresarial

Esta será la evolución natural del producto.

No analiza únicamente datos.

Analiza el negocio.

Permitirá responder preguntas como:

¿Qué está pasando?

¿Por qué ocurre?

¿Qué debería hacer?

¿Qué puede pasar si no hago nada?

Aquí vivirá el asesor inteligente.

---

# CAPACIDAD 8

## Aprendizaje

El sistema deberá aprender del negocio.

Ejemplos.

Frecuencia habitual.

Temporadas.

Servicios más solicitados.

Comportamiento de clientes.

Ritmo de crecimiento.

Este conocimiento permitirá ofrecer recomendaciones cada vez más precisas.

---

# Cómo interactúan

La arquitectura sigue siempre este flujo.

Capturar.

↓

Organizar.

↓

Comprender.

↓

Interpretar.

↓

Recomendar.

↓

Aprender.

Nunca alterarlo.

---

# Lo que NO es BarberOS

No es una agenda.

Aunque pueda tener agenda.

---

No es un CRM.

Aunque gestione clientes.

---

No es un programa de puntos.

Aunque entregue premios.

---

No es un chatbot.

Aunque converse por WhatsApp.

---

No es un dashboard.

Aunque muestre indicadores.

Todo eso son herramientas.

El producto es mucho más grande.

---

# Principios de evolución

Toda nueva funcionalidad deberá fortalecer alguna capacidad existente.

No crear capacidades nuevas innecesariamente.

Si una mejora puede integrarse dentro de una capacidad existente, deberá hacerse.

El crecimiento del producto debe ser orgánico.

Nunca caótico.

---

# Dependencias

Las capacidades no tienen el mismo nivel.

Existe una jerarquía.

Captura

↓

Historial

↓

Comprensión

↓

Interpretación

↓

Recomendaciones

↓

Aprendizaje

Si falla la captura...

todo falla.

Por ello la calidad de los datos será siempre una prioridad.

---

# Indicadores de éxito

Esta arquitectura estará correctamente implementada cuando:

- cada dato capturado tenga un propósito;
- ninguna pantalla muestre información sin contexto;
- todas las recomendaciones provengan de información real;
- el usuario sienta que el sistema comprende su negocio;
- el producto pueda evolucionar sin romper esta arquitectura.

---

# Relación con el siguiente documento

Este documento describe qué capacidades tiene BarberOS.

El siguiente documento:

06-DASHBOARD.md

explicará cómo esas capacidades se presentan al empresario para ayudarle a tomar mejores decisiones.

El Dashboard será la manifestación visual del conocimiento generado por toda esta arquitectura.
