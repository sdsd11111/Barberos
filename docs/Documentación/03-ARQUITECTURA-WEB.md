---
id: 03-arquitectura-web
titulo: Arquitectura Web
categoria: tecnico
estado: activo
sprint: fase-1-piloto-activo
ultima_revision: 2026-08-07
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

/acceso → redirige a /login

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

Ingreso mediante PIN de 6-7 dígitos (ruta primaria desde 2026-08-07).

Ayuda.

Recuperación de acceso (sigue disponible vía Magic Link).

---

## Nunca debe contener

Marketing.

SEO.

Publicidad.

Contenido comercial.

---

## Cambio de método de acceso (2026-08-07)

> **Decisión:** El login del dueño cambió de Magic Link por WhatsApp a **PIN de 6-7 dígitos** único por barbería. La promesa de venta "no necesitas usuario ni contraseña" se mantiene — solo que ahora ni siquiera hace falta abrir WhatsApp para entrar.

- `/login` (URL canónica indexable) — input único de PIN.
- `/acceso` — redirect 308 a `/login`. Mantiene la URL histórica para no romper enlaces externos.
- Cookie `session` JWT persistente 365 días — crítico para PWA en Safari/Chrome móvil.
- Auto-redirect de sesión activa: al cargar `/login`, si ya hay sesión válida, salta directo a `/panel`.
- Magic Link original queda en código como ruta de recuperación, no como ruta primaria.

---

# Página 6 — Precios

URL `/precios` — Sin cambios en arquitectura, ver [[10-ROADMAP-COMERCIAL]] para el detalle.

---

# Páginas adicionales (Sprint F — 2026-08-07)

> Las siguientes páginas fueron agregadas a partir del Sprint F para soportar flujos de adquisición, aliados y conversión sin sobrecargar las páginas existentes.

## Página Alianza

URL `/alianza`

### Objetivo
Captar nuevos Leones / Aliados Comerciales firmando electrónicamente un contrato de comisión.

### Pregunta que responde
"¿Cómo me uno como vendedor y arranco a ganar comisiones?"

### Intención de búsqueda
Registro de vendedor / aliado comercial de BarberOS. Público especializado, no SEO masivo.

### Estado mental
Ya conoce BarberOS. Ya tuvo contacto con César o con un León activo. Quiere formalizar.

### Emoción dominante
Decisión + claridad económica.

### Conversión esperada
Firma digital del contrato + descarga del PDF.

### Debe contener
- `AlianzaForm` con captura de: nombre, cédula (10 dígitos EC), celular, nombre del negocio, dirección.
- Configuración de comisión: método de pago (`transferencia` / `payphone` / `efectivo` / `otro`), días de pago (1-30), zona de territorio (opcional).
- Datos de firma: ciudad, día, mes, año.
- Disclaimer legal visible.
- PDF generado en transacción con la base de datos.

### Nunca debe contener
- Marketing masivo.
- Comparativas con otras plataformas.
- Información de precios de planes.

---

## Página Crear Cuenta

URL `/crear-cuenta`

### Objetivo
Convertir visitantes en cuentas activas de BarberOS (auto-registro de nuevas barberías).

### Pregunta que responde
"¿Cómo empiezo a usar BarberOS ya mismo?"

### Intención de búsqueda
"crear cuenta software barbería", "registro barbería Ecuador".

### Estado mental
Convencido. Quiere empezar. No quiere esperar un email.

### Emoción dominante
Impulso + velocidad.

### Conversión esperada
Cuenta creada + sesión abierta + instrucción para el primer acceso.

### Debe contener
- `CrearCuentaForm` con: nombre de la barbería, WhatsApp del negocio, PIN propuesto, ciudad, datos del dueño.
- Trial de 15 días sin tarjeta (igual que el flujo público).
- Redirección a `/crear-cuenta/confirmacion` con pasos siguientes.

### Nunca debe contener
- Información de Pagos / Payphone.
- Pasos de onboarding extensos (lo hacen en el panel).

---

## Página Login

URL `/login` (canónica) — Ver [[12-UX]] para el detalle de UX del login PIN.

### Reglas SEO
- `robots: index, follow` (no es página noindex como `/acceso`).
- Schema markup `WebPage` con `name = "Acceso a BarberOS"`.

---

## Página Registro de Clientes (auto-registro por QR)

URL `/registro/[barbershopId]` (URL pública, no debe requerir autenticación)

### Objetivo
Capturar datos estructurados de un cliente nuevo: nombre, WhatsApp, fecha de nacimiento (Día/Mes), canal de adquisición.

### Pregunta que responde
El cliente escaneó un QR del mostrador y quiere dejar sus datos para ser reconocido.

### Debe contener
- `RegistrationForm` con validación Zod.
- Mensaje de éxito que confirme que ya quedó registrado.
- Rate limit persistente por IP (`/api/clientes/registro`).

### Nunca debe contener
- Cualquier elemento de la interfaz del panel.
- Branding del dueño (la marca es BarberOS, no la barbería).

---

## Página Redirect QR Legacy

URL `/r/[id]`

Redirige al cliente que escaneó un QR legacy (código de 8 chars de `ReferralVendedor`) al WhatsApp de César o al `googleMapsUrl` de la barbería. Ver [[21-SISTEMA-REFERIDOS-QR]].

---

## Páginas de Pricing de Plan

URL `/pro` y `/premium` — separadas desde Sprint F para diferenciación clara del pitch.

- `/pro` — Pitch emocional + funcional de BarberOS Pro. CTA: "Quiero empezar".
- `/premium` — Pitch Premium: Motor + Director IA + chat. CTA: "Quiero Premium".

---

## Página Billing

URL `/billing`

Checkout externo (Payphone). Pantalla transitoria de validación antes de redirigir al gateway.

---

## Páginas de Historias (casos)

URL `/historias` (listado) + `/historias/[slug]` (detalle)

- `/historias` — grid de casos reales con video + imagen + nombre de la barbería + ciudad.
- `/historias/[slug]` — historia completa: antes / implementación / resultados / aprendizajes.

Cada historia debe ser verificable (con consentimiento del dueño). No anecdótico.

---

## Página Checklist (interna / coaching)

URL `/checklist`

> **No es producto para el cliente.** Es una herramienta de César para sesiones de coaching con barberos. Guarda en `localStorage` (no en BD). Estructura: nombre del barbero, avatar, bloque de preguntas (P0–P6), notas, notas históricas.

`robots: noindex`. No aparece en `sitemap.xml`.

---

## Páginas de Cuenta (panel)

URL `/panel` (raíz) con `FloatingNav` (móvil/tablet) y sidebar tradicional (desktop).

Subpáginas:
- `/panel` — Dashboard principal con `PanelHero`, `MetricTile`, `MotorSummaryWidget`, `DirectorWidget`.
- `/panel/clientes` — Perfiles con `ClientesTabs`.
- `/panel/barberos` — Equipo con `BarberosView` + `StaffManager`.
- `/panel/configuracion` — Configuración del Motor (con `ConfigTabs` que separa de WhatsApp).
- `/panel/whatsapp` — Conexión Evolution API con `WhatsAppContent` (separada en Sprint F).
- `/panel/...` otras secciones con `GlassCard` + `SectionTabs`.

---

## Páginas admin (SuperAdmin)

URL `/admin` — Bearer `ADMIN_SECRET_KEY`.

Subpáginas internas:
- Listado de barberías con `planStatus`, `planType`, `trialEndsAt`.
- Listado de Leones / Aliados con comisiones acumuladas.
- Tab "Comisiones" con filtros por vendedor, estado y fecha.

Endpoints equivalentes:
- `GET /api/admin/barbershops` — listado.
- `GET /api/admin/comisiones` — listado con filtros.
- `PATCH /api/admin/comisiones/[id]` — marcar pagada o actualizar monto.

---

# Criterios de aceptación

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

[[13-COMPONENTES]]

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

- Cada página responda una única intención.
- Cada página tenga un único CTA principal.
- El usuario siempre sepa cuál es el siguiente paso.
- El software aparezca únicamente cuando el visitante ya comprenda el problema.
- El precio aparezca en un único lugar coherente, sin ambigüedad entre setup y mensualidad.
- El recorrido psicológico definido en la Arquitectura Estratégica se respete completamente.
- Las páginas de adquisición (`/crear-cuenta`, `/alianza`) **no contaminen** el flujo emocional de la landing principal.
- Las páginas internas (`/checklist`, `/admin`) estén marcadas como `noindex` y excluidas de `sitemap.xml`.
- `/login` sea la URL canónica indexable. `/acceso` solo debe existir como redirect 308 a `/login`.

---

# Próximos documentos

[[04-SISTEMA-DE-COMUNICACION]]

Definirá la voz oficial de BarberOS.

Todas las páginas descritas aquí deberán utilizar ese sistema de comunicación.

No podrán escribirse de manera independiente.
