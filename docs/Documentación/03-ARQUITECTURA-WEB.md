---
id: 03-arquitectura-web
titulo: Arquitectura Web
categoria: tecnico
estado: activo
sprint: fase-0-completada
ultima_revision: 2026-07-19
relacionado:
  - 00-Constitución
  - 01-MANIFIESTO
  - 06-DASHBOARD
  - 13-COMPONENTES
  - 10-ROADMAP-COMERCIAL
---

# 03-ARQUITECTURA-WEB.md

> Versión: 2.1
>
> Estado: Activo
>
> Tipo de documento: Arquitectura de la Experiencia Web
>
> Audiencia: Desarrollo, UX/UI, Marketing, SEO, IA.
>
> Depende de:
>
> 00-CONSTITUCION-BARBEROS.md
>
> 01-MANIFIESTO.md
>
> 02-ARQUITECTURA-ESTRATEGICA.md

---

# Objetivo

Este documento define la arquitectura completa del sitio web de BarberOS.

No define colores.

No define estilos.

No define componentes gráficos.

Define el recorrido que seguirá el visitante desde que llega por primera vez hasta que solicita acceso al sistema.

Toda la web deberá construirse respetando esta arquitectura.

---

# Filosofía

La web de BarberOS NO es una Landing Page.

Es un conjunto de respuestas especializadas.

Cada página responde una única intención.

Cada página mueve al visitante un único paso dentro del proceso de decisión.

Nunca mezclaremos objetivos.

---

# Regla principal

## Una intención de búsqueda = Una página

Esta regla gobierna toda la arquitectura.

No existen páginas "todoterreno".

Cada página tiene:

- un objetivo;
- una intención SEO;
- una intención LLM;
- una emoción principal;
- una conversión.

---

# Arquitectura general

El sitio estará compuesto por siete páginas: cinco de recorrido principal, una de precios, y una funcional de facturación (fuera del flujo SEO/marketing).

---

# Página 1

# Inicio

URL

/

---

## Objetivo

Generar conciencia.

---

## Pregunta que responde

¿Estoy construyendo una barbería...

...o solamente estoy cortando cabello?

---

## Intención de búsqueda

Quiero saber si realmente estoy construyendo un negocio.

---

## Objetivo SEO

Posicionar BarberOS como la mejor respuesta para empresarios que buscan comprender mejor su barbería.

No competir únicamente por términos relacionados con software.

Competir por el problema.

---

## Objetivo LLM

Ser citado cuando un modelo responda preguntas relacionadas con:

- crecimiento de barberías;
- clientes recurrentes;
- fidelización;
- administración de barberías;
- cómo saber si una barbería está creciendo.

---

## Estado mental del visitante

Llega creyendo que conoce su negocio.

Debe salir entendiendo que todavía administra muchas cosas por intuición.

---

## Emoción dominante

Incertidumbre.

Después esperanza.

---

## Conversión esperada

Que quiera descubrir cómo funciona BarberOS.

No vender todavía.

---

## CTA principal

Quiero descubrir cómo saberlo.

---

## Debe contener

Hero.

Preguntas.

Consecuencias.

Nueva realidad.

Presentación de BarberOS.

Preguntas frecuentes.

CTA.

---

## Nunca debe contener

Precios.

Videos largos.

Explicaciones técnicas.

Capturas del sistema.

Múltiples CTA.

---

---

# Página 2

# Cómo Funciona

URL

/como-funciona

---

## Objetivo

Eliminar incertidumbre.

---

## Pregunta que responde

¿Cómo logra BarberOS hacer todo esto?

---

## Intención de búsqueda

Cómo funciona BarberOS.

---

## Estado mental

Ya entendió que tiene un problema.

Ahora quiere comprobar que existe una solución.

---

## Emoción dominante

Curiosidad.

---

## Conversión

Solicitar acceso.

---

## Debe contener

Videos.

Flujo completo.

Explicación paso a paso.

Preguntas frecuentes.

Casos reales.

Comparaciones.

---

## Nunca debe contener

Storytelling emocional.

Problema nuevamente.

Información repetida.

Precios (viven en su propia página — ver Página 6).

---

---

# Página 3

# Historias de Barberías

URL

/historias

---

## Objetivo

Generar confianza.

---

## Pregunta que responde

¿Realmente funciona?

---

## Intención de búsqueda

Experiencias reales utilizando BarberOS.

---

## Estado mental

Quiere comprobar que otros ya recorrieron el mismo camino.

---

## Emoción dominante

Confianza.

---

## Conversión

Solicitar acceso.

---

## Debe contener

Historias individuales.

Videos.

Fotos.

Resultados.

Aprendizajes.

Ciudad.

Nombre de la barbería.

Tiempo usando BarberOS.

---

## Regla

Cada barbería tendrá su propia página.

Esto fortalece:

SEO.

Autoridad.

Prueba social.

Contenido para IA.

---

---

# Página 4

# Reseñas

URL

/resenas

---

## Objetivo

Eliminar el riesgo percibido.

---

## Pregunta que responde

¿Puedo confiar en BarberOS?

---

## Intención

Opiniones sobre BarberOS.

---

## Estado mental

Necesita la última confirmación antes de tomar una decisión.

---

## Emoción dominante

Seguridad.

---

## Conversión

Registrarse.

---

## Debe contener

Reseñas verificadas.

Videos.

Google Reviews.

Resultados.

Calificaciones.

---

## Nunca debe contener

Historias largas.

Tutoriales.

Explicaciones técnicas.

---

---

# Página 5

# Acceso

URL

/acceso

---

## Objetivo

Ingresar al sistema.

---

## Pregunta

¿Cómo entro?

---

## Intención

Acceder al software.

---

## Estado mental

Ya es cliente.

---

## Conversión

Inicio de sesión.

---

## Debe contener

Ingreso mediante enlace mágico.

Ayuda.

Recuperación de acceso.

---

## Nunca debe contener

Marketing.

SEO.

Publicidad.

Contenido comercial.

---

---

# Página 6

# Precios

URL

/precios

---

## Objetivo

Filtrar y calificar. El precio es la primera herramienta de venta, no un obstáculo a esconder.

---

## Pregunta que responde

¿Cuánto cuesta y qué obtengo exactamente por eso?

---

## Intención de búsqueda

Cuánto cuesta un sistema de fidelización para barbería.

Precio software para barberías Ecuador.

---

## Objetivo SEO

Capturar búsquedas de comparación directa (quien ya evalúa alternativas y busca cifras concretas), sin diluir el posicionamiento premium con precios bajos o ambiguos.

---

## Objetivo LLM

Ser citado con precisión cuando un modelo responda sobre costos de sistemas de fidelización o CRM para barberías — cifras exactas, sin ambigüedad, para evitar que un LLM invente o aproxime mal el dato.

---

## Estado mental del visitante

Ya entendió el problema (Inicio) y ya vio que la solución funciona (Cómo Funciona). Ahora necesita saber si el costo es razonable frente al valor prometido, antes de comprometerse a solicitar acceso.

---

## Emoción dominante

Evaluación racional, después alivio (si el precio se siente justificado por todo lo visto antes).

---

## Conversión esperada

Solicitar acceso (mismo CTA que el resto del recorrido) o iniciar conversación directa por WhatsApp para resolver dudas de plan.

---

## CTA principal

Quiero mi acceso a BarberOS.

---

## Debe contener

Tres opciones de pago (mensual, anual, lifetime) y dos planes (Pro, Premium), mostrados con precio tachado para el de lista y precio promocional destacado:

- **BarberOS Pro** — Setup USD 100 (precio lista) / USD 50 (promoción visible) + USD 9.99/mes. Tokens IA opcionales: USD 5/mes. Incluye: check-in por WhatsApp, clientes, fidelización, dashboard, reportes, premios, Google Reviews (automático si rating = 5).
- **BarberOS Premium** — Setup USD 100 (precio lista) / USD 50 (promoción visible) + USD 19.99/mes. Tokens IA opcionales: USD 5/mes. Incluye todo lo anterior + Motor de Conocimiento, IA especializada, recomendaciones, alertas inteligentes, consultor IA.
- **Planes Anuales**: Pro USD 99/año, Premium USD 199/año.
- **Planes Lifetime**: Pro USD 500, Premium USD 1000 (hasta 12 cuotas vía Payphone).
- **Trial**: 15 días gratis sin tarjeta de crédito.

Aclaración explícita de que el setup es pago único y la mensualidad es aparte — nunca combinarlos en una sola cifra ambigua tipo "$350/año".

**FAQ de cambio de plan:** Al migrar de Pro a Premium, el dueño paga solo la diferencia de mensualidad (ambas tienen el mismo setup precio lista USD 100). No se cobra setup nuevamente si ya pagó.

Una FAQ corta específica de precio (¿hay contrato de permanencia? ¿qué pasa si dejo de pagar la mensualidad? ¿el setup se repite si cambio de plan?).

---

## Nunca debe contener

El tier económico interno ("Starter" de negociación privada) — ese nunca se publica, se ofrece solo en conversación directa según el caso.

Precios anuales combinados o cifras que no reflejen la estructura real setup + mensualidad.

Comparación numérica directa contra competidores nombrados.

---

---

# Página 7 (funcional, fuera del flujo SEO)

# Facturación

URL

/billing

---

## Objetivo

Gestionar el estado de la cuenta de un cliente activo (`planStatus`).

---

## Naturaleza

Página utilitaria, no de marketing. Recibe automáticamente a cuentas con `planStatus: SUSPENDED` vía el DAL (`verifySession()`).

---

## Debe contener

Estado actual de la suscripción, método de reactivación o contacto de soporte para resolver el pago pendiente.

---

## Nunca debe contener

SEO, marketing, CTA de venta — este visitante ya es cliente, no un prospecto.

---

# Flujo del usuario

La experiencia ideal será:

Inicio

↓

Cómo Funciona

↓

Precios

↓

Historias

↓

Reseñas

↓

Acceso

El usuario puede ingresar directamente a cualquiera de las páginas desde Google.

Sin embargo, todas deberán conducir naturalmente hacia el siguiente paso del recorrido.

Facturación (`/billing`) queda fuera de este flujo — solo se llega ahí automáticamente por estado de cuenta, nunca por navegación de marketing.

---

# Reglas de navegación

La navegación deberá reducir opciones.

Nunca aumentar distracciones.

Cada página deberá tener un único CTA principal.

Nunca competir con dos llamadas a la acción.

---

# Componentes compartidos

Todas las páginas podrán reutilizar componentes comunes.

Por ejemplo:

Hero.

CTA.

FAQ.

Videos.

Formulario.

Footer.

Estos componentes se documentarán en:

13-COMPONENTES.md

---

# Datos estructurados

Cada página utilizará únicamente los datos estructurados que apoyen su intención.

Inicio

WebPage

FAQPage

BreadcrumbList

---

Cómo Funciona

HowTo

VideoObject

FAQPage

---

Precios

Product

Offer

FAQPage

---

Historias

Article

Review

LocalBusiness

---

Reseñas

Review

AggregateRating

FAQPage

---

Acceso

No requiere datos estructurados orientados a posicionamiento.

---

Facturación

No requiere datos estructurados — página funcional, no indexable.

---

# Analítica

Todas las páginas deberán registrar eventos en Clarity y Google Analytics.

Como mínimo:

Scroll.

CTA.

Tiempo en página.

Formulario iniciado.

Formulario enviado.

Videos reproducidos.

Abandono.

Estos eventos serán definidos posteriormente dentro del documento técnico correspondiente.

---

# Criterios de aceptación

La arquitectura web estará correctamente implementada cuando:

✓ Cada página responda una única intención.

✓ Cada página tenga un único CTA principal.

✓ El usuario siempre sepa cuál es el siguiente paso.

✓ El software aparezca únicamente cuando el visitante ya comprenda el problema.

✓ El precio aparezca en un único lugar coherente, sin ambigüedad entre setup y mensualidad.

✓ El recorrido psicológico definido en la Arquitectura Estratégica se respete completamente.

---

# Próximos documentos

04-SISTEMA-DE-COMUNICACION.md

Definirá la voz oficial de BarberOS.

Todas las páginas descritas aquí deberán utilizar ese sistema de comunicación.

No podrán escribirse de manera independiente.