# 🫀 SKILL-MADRE — BarberOS Project DNA & Governance

Este archivo es el **núcleo rector de contexto** para cualquier sesión de desarrollo o asistencia con Antigravity en el proyecto BarberOS. Debe ser leído **antes** de cualquier otra acción.

---

## 🔒 Privacidad y Seguridad del IP
> [!IMPORTANT]
> El directorio `Documentación/` actúa como un **Vault de Obsidian privado** que contiene la propiedad intelectual, lógica comercial, estrategias de marketing y pricing de la empresa.
> - Está protegido y excluido en el `.gitignore`.
> - **NUNCA** debes subir, exponer ni resumir partes sensibles de esta documentación en repositorios o canales públicos.

---

## 🗺️ Uso del Vault de Obsidian (Documentación Atómica)

Para evitar la relección constante de miles de líneas de texto y optimizar el consumo de tokens, la base de conocimiento está fragmentada en notas atómicas bajo `/Documentación`.

### Regla de lectura para agentes:
Antes de proponer código o cambios de estrategia:
1. Lee siempre **[[Documentación/_index.md]]** para obtener el mapa y la clasificación de los 14 documentos maestros.
2. Lee siempre **[[Documentación/CONTEXT.md]]** para conocer el estado actual exacto del código en producción y saber qué es realidad y qué sigue siendo hipótesis.
3. Carga únicamente el documento específico que necesitas modificar o consultar (ej. `13-COMPONENTES.md` si vas a construir interfaces).

---

## 🛠️ Normas de Desarrollo en Next.js 16

1. **Aislamiento Multi-tenant (Seguridad)**:
   - Toda página del panel (`src/app/(panel)/*`) debe verificar la sesión a través del DAL (`src/lib/dal.ts` -> `verifySession()`).
   - El `barbershopId` obtenido de la sesión descifrada en el servidor debe inyectarse en todas las queries de Prisma. **Nunca confíes en IDs enviados desde el cliente**.
2. **Next.js 16 - Convención `proxy.ts`**:
   - En esta versión de Next.js, el archivo de middleware se llama **`src/proxy.ts`** (no `middleware.ts`).
3. **Evolution API**:
   - Toda comunicación con WhatsApp debe pasar por `src/lib/evolution.ts`.

---

## 🚦 Gate obligatorio de comunicación

Antes de generar **cualquier** texto orientado al usuario final — titulares, taglines, CTAs, copy de página, nombres de producto, mensajes de WhatsApp, contenido de marketing — es obligatorio leer, en este orden, sin importar qué archivo esté activo en el editor:

1. `Documentación/04-SISTEMA-DE-COMUNICACION.md` completo.
2. La sección "Arquitectura de Avatares" dentro de `Documentación/02-ARQUITECTURA-ESTRATEGICA.md`.

No basta con que estos documentos estén abiertos por casualidad en el editor. Este gate se ejecuta siempre, como paso obligatorio previo, independientemente del contexto visual del IDE.

**Auto-chequeo antes de entregar cualquier copy:** ¿a qué avatar le hablo (1, 2, o ambos)? ¿qué emociones de las cuatro definidas activa este texto (máximo 2, según regla de `02`)? ¿alguna palabra de este texto está en la lista prohibida de `04`? Si no puedes responder las tres preguntas con certeza, no entregues el copy — vuelve a leer los documentos.

---

## 🎚️ Protocolo de razonamiento escalonado

El método se aplica según el **costo real de equivocarse**, no según el tipo mecánico de tarea.

### Nivel 1 — Razonamiento completo obligatorio

Aplica cuando la tarea es alguna de estas:

- Generar cualquier copy público (titulares, taglines, CTAs, textos de página, nombres).
- Decisiones de precio, planes o segmentación de avatar.
- Cambios a la arquitectura del sitio, del producto o a cualquier documento de `Documentación/`.
- Decisiones de seguridad multi-tenant o manejo de datos de clientes.
- Cualquier tarea donde el resultado se publique o se le muestre a un barbero real.

En estos casos:

1. Reformular qué se pide y para qué sirve, antes de ejecutar.
2. Ejecutar el gate de comunicación si aplica (ver arriba).
3. Generar al menos tres alternativas reales cuando exista una decisión de fondo — no una sola respuesta con seguridad falsa.
4. Auto-crítica antes de entregar: ¿qué avatar activa esto? ¿qué documento debí consultar y no consulté? ¿qué asumí de memoria en vez de verificar contra `Documentación/`?
5. Verificar contra la fuente real (leer el archivo, no recordarlo) antes de afirmar que algo cumple una regla del proyecto.

### Nivel 2 — Respuesta directa, sin protocolo pesado

Aplica cuando la tarea es mecánica y de bajo costo de error:

- Buscar o abrir un archivo específico.
- Preguntas de estado ("¿qué Sprint está activo?", "¿existe tal componente?").
- Formateo, renombrado, tareas de un solo paso claramente especificadas.
- Lectura o resumen de código ya escrito, sin proponer cambios.

Aquí se responde directo, sin plan previo ni tres alternativas.

### Siempre, sin importar el nivel

- **Anti-deriva:** en tareas largas, detenerse a mitad de camino y confirmar que se sigue resolviendo el problema original, no uno adyacente.
- **Reportar sin suavizar:** si algo falló, quedó parcial, o hay un problema no detectado por César, decirlo primero y con claridad — nunca declarar terminado algo no verificado. No inventar procesos internos que no pueden confirmarse como ciertos.
- **Comunicación directa:** primera línea con el resultado, no con el proceso. Sin relleno. Si una idea de César es débil, decirlo con fundamento, no validarla por complacencia.

---

## 💾 Cómo funciona la memoria permanente entre sesiones

Antigravity **no tiene memoria de sesión anterior** de forma nativa. La memoria permanente se construye a través de archivos en disco que el agente lee al inicio de cada sesión. El mecanismo funciona así:

### ¿Qué se lee automáticamente al iniciar una sesión?

Este archivo (`skill-madre.md`) es el **primer documento que Antigravity está instruido a leer** al detectar el workspace `barberos-saas`. La ruta de carga es:

1. **`skill-madre.md`** (este archivo, en la raíz del proyecto) → Gobernador de reglas y protocolo.
2. **`Documentación/_index.md`** → Mapa de los 18 documentos y su clasificación.
3. **`Documentación/CONTEXT.md`** → Foto de estado actual del código en producción.

Esos tres archivos son la **memoria de arranque**. Todo lo demás se carga bajo demanda según la tarea.

### ¿Dónde se guarda la memoria que no debe perderse?

- **Decisiones de arquitectura o estrategia:** Se documentan en el documento `Documentación/` correspondiente (ej. `02-ARQUITECTURA-ESTRATEGICA.md`).
- **Estado actual del código:** Se actualiza en `Documentación/CONTEXT.md`.
- **Errores de proceso detectados:** Se documentan en `Documentación/CONTEXT.md` bajo la sección "Errores de proceso corregidos".
- **Cambios de gobernanza del agente:** Se actualizan directamente en este archivo (`skill-madre.md`).

### Regla operativa
Cualquier decisión, aprendizaje o corrección que deba sobrevivir al cierre de esta sesión **debe ser escrita en disco**. Si no está en un archivo, no existe en la próxima sesión.

---

## 📋 Nota sobre auto-mejora

Cuando se detecte un error de proceso, documentarlo en `Documentación/CONTEXT.md` bajo la sección "Errores de proceso corregidos", con fecha y causa raíz — no solo el fix, sino por qué pasó, para que el patrón sea reconocible si se repite.

---

## 📓 Protocolo de Bitácora de Sesiones (`Documentación/BITACORA.md`)

### Propósito
La bitácora es el **puente de memoria entre sesiones**. Registra tareas pendientes, decisiones que no llegaron a documento oficial, y preguntas de seguimiento que César quiere que el agente recuerde al iniciar la próxima sesión.

### Reglas de gestión

1. **Límite máximo: 5 sesiones activas.** Cuando se registre la sesión número 6, antes de escribirla el agente debe:
   - Generar un resumen comprimido de las 5 anteriores (máx. 10 líneas en total).
   - Preguntar: *"La bitácora tiene 5 sesiones acumuladas. ¿Puedo comprimir las sesiones 1-3 en un resumen y borrarlas para liberar espacio?"*
   - Solo borrar si César responde afirmativamente.

2. **Formato de cada entrada:**
   ```
   ### Sesión YYYY-MM-DD — [Título breve de la sesión]
   **Tareas pendientes para la próxima sesión:**
   - [ ] Tarea 1
   - [ ] Tarea 2
   **Decisiones tomadas (no en documento oficial):**
   - Decisión x: resumen
   **Pregunta de seguimiento para César al iniciar:**
   - ¿Pregunta concreta?
   ```

3. **Al iniciar una sesión:** Antigravity lee `Documentación/BITACORA.md` como parte de la memoria de arranque (junto con `skill-madre.md`, `_index.md` y `CONTEXT.md`) y, si hay tareas pendientes o preguntas de seguimiento, las presenta **al inicio**, antes de cualquier otra acción.

4. **Al detectar que una sesión está por terminar** (el usuario indica que se va, que va a salir, que terminó lo que tenía, o que pasará a otra actividad), el agente debe preguntar:
   > *"¿Deseas registrar los cambios de esta sesión en la bitácora?"*
   Si César dice sí, el agente escribe la entrada correspondiente en `Documentación/BITACORA.md` sin que César tenga que dictar nada — el agente construye el resumen desde el contexto de la conversación.

### La bitácora NO reemplaza los documentos oficiales
- Si una decisión es arquitectural o estratégica, va a su documento oficial en `Documentación/`.
- Si es un error de proceso, va a `CONTEXT.md`.
- La bitácora solo captura lo transitorio: tareas pendientes, hipótesis no validadas aún, y preguntas de seguimiento.

