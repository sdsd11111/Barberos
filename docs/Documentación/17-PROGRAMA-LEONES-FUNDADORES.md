# 17-PROGRAMA-LEONES-FUNDADORES.md

```yaml
id: 17-programa-leones-fundadores
titulo: Programa de Distribución Comercial — Leones Fundadores
categoria: comercial
estado: activo
sprint: lanzamiento-inmediato
ultima_revision: 2026-07-26
enmienda: 17-programa-leones-fundadores-enmienda-2026-07-26
relacionado:
  - 10-ROADMAP-COMERCIAL
  - 09-ROADMAP-TECNICO
  - 13-COMPONENTES
  - 04-SISTEMA-DE-COMUNICACION
  - Skill de Guiones BarberOS
  - ACUERDO-CORTO-LEONES
  - GUION-CAMPO-LEONES-LOJA-2026-07-27
  - 18-PLAN-ESTRATEGICO-MARKETING
```

> **Versión:** 1.0
> **Estado:** Activo — reemplaza cualquier discusión anterior sobre "Embajadores" o "Socios de Crecimiento"
> **Tipo de documento:** Estrategia comercial y de distribución
> **Audiencia:** César, futuros Leones, Desarrollo (SuperAdmin), Documentación

---

## Objetivo del documento

Definir cómo BarberOS se distribuye a través de terceros con acceso directo a barberías ("Leones"), sin depender de venta puerta a puerta ni de campañas pagadas. Este documento **no modifica la Constitución** — es estrategia de canal, vive al mismo nivel que [[10-ROADMAP-COMERCIAL]].

> **Alineación Estratégica:** Este programa es el motor de adquisición **exclusivo y principal** durante el Horizonte 1 (Silencio Estratégico) definido en [[18-PLAN-ESTRATEGICO-MARKETING]].

---

## Por qué existe este programa (diagnóstico validado por César)

La venta directa (llamar o visitar barberías desconocidas) falla no porque el producto sea débil, sino porque **el prospecto no confía en un desconocido**. La solución no es mejorar el guion de venta fría — es eliminar la venta fría. Un León ya tiene esa confianza construida. BarberOS solo necesita darle una razón económica para usarla a nuestro favor.

---

## Los dos roles — nunca confundir estas palabras

| Rol | Quién es | Qué recibe | Documento que lo rige |
|---|---|---|---|
| **Barbería Fundadora** | El dueño de barbería piloto (Loja/Cuenca) | Setup gratis a cambio de reseña + video + 60 días de uso | [[10-ROADMAP-COMERCIAL]] (sin cambios) |
| **León Fundador** | Vendedor/distribuidor con acceso ya construido a barberos (vende cera, alarmas, máquinas, etc.) | Comisión en efectivo por cada barbería que activa | Este documento |

**Regla dura:** nunca se le dice "Fundador" a secas a un León en conversación — siempre "León Fundador" o simplemente "León", para que no se cruce con el programa de barberías piloto.

---

## Modelo de negocio del León

### Cómo gana dinero

1. **$25 dólares** al activarse el pago de setup de una barbería que él presentó (el setup público sigue siendo $50; el León se lleva la mitad).
2. **10% de la mensualidad** de esa barbería, mientras siga activa pagando — de por vida, sin límite de tiempo.
   - Base de cálculo: **solo sobre la mensualidad del plan (Pro $9.99 o Premium $19.99)**.
   - **Los tokens de IA ($5/mes) NO generan comisión** bajo ninguna circunstancia.
   - Si el cliente sube de Pro a Premium, la comisión sube automáticamente sobre la nueva mensualidad — sin negociación adicional.

### Ejemplo real (el que ya usaste, validado)

20 Leones × 5 activaciones cada uno en el primer mes = 100 barberías nuevas.
- Ingreso de setup: 100 × $25 (la mitad que se queda la empresa) = **$2,500 para BarberOS**.
- Ingreso mensual recurrente (asumiendo mezcla Pro/Premium ~$12 promedio): **~$1,080/mes brutos**, de los cuales ~10% ($108) se va en comisión — **~$972 netos recurrentes**, que crecen mes a mes mientras las barberías se queden.

---

## Cómo se busca al León — perfil "león, no oveja"

Buscamos personas que **ya tocan la puerta de barberos por otro motivo**: vendedores de cera, insumos, máquinas de corte, alarmas, seguros, cualquiera con cartera activa de contactos en el nicho o adyacente. No se recluta gente sin cartera previa — eso es "oveja", no León.

---

## Reglas de desempeño (para que la selección sea real, no un favor)

- **Meta mínima: 5 activaciones pagadas por mes**, por cada código de León.
- **Filtro de entrada de 15 días:** si un León recién asignado no logra ninguna activación en sus primeros 15 días, se le retira el código y se reasigna a otro candidato. Se comunica **en la primera llamada de reclutamiento**, como filtro de selección, nunca como sorpresa después.
- **Límite de Escala Manual (Regla Dura):** Máximo **3 Leones Fundadores activos simultáneamente** mientras se lleven las comisiones en Excel. Queda estrictamente prohibido reclutar al León #4 hasta que el panel de comisiones esté 100% construido y funcional en código.
- Cuando la cartera de un León empiece a agotarse (menos activaciones mes a mes), se le ofrece una nueva vertical/producto para reincentivarlo — pendiente de definir cuál, no es parte de este lanzamiento.
- **Atribución:** cada barbería activada queda ligada permanentemente al código del León en el SuperAdmin (campo `salesAgent`, ya existe en schema). Esa barbería es de ese León de por vida, incluso si después habla directo con César.

> ⚠️ **Nota técnica pendiente para Desarrollo:** `salesAgent` existe en el schema (confirmado en [[13-COMPONENTES]], sesión 2026-07-24) pero **no tiene todavía lógica de cálculo de comisión ni panel de visualización para el León**. Esto es bloqueante antes de escalar a los 20 Leones — sin esto, no hay forma de que el León "vea sus ganancias" como promete el pitch.

---

## El proceso operativo (el que ya describiste, formalizado)

1. El León contacta a un barbero de su cartera existente y aplica el pitch (ver abajo).
2. El barbero dice sí o no en el momento — sin intermedios.
3. Si dice sí, el León le escribe/llama a César: **"Actívale a [Nombre del barbero]."**
4. César activa la cuenta en el SuperAdmin, asigna `salesAgent` = código del León.
5. El León le indica al barbero: imprimir el QR, pegarlo donde convenga, y abrir la app PWA.
6. César no interviene en la venta — solo en la activación técnica.

---

## PITCH DEL LEÓN — Guion de campo

*(Ya validado en la conversación con César — versión final para entrenamiento por Zoom antes de soltar al León solo)*

**Apertura — pregunta, nunca acusación:**
> "[Nombre], ¿cuántos de los clientes que vinieron esta semana crees que van a volver el próximo mes?"

*(Silencio real. No completar la respuesta por él.)*

**Reencuadre — nunca juicio personal (Error 002, ya documentado en [[CONTEXT]]):**
> "Normal no saberlo — nadie te dio cómo medirlo. Por eso te muestro esto."

**Demostración — siempre con evidencia real, nunca hipotética:**
El León muestra su celular con el QR real o el dashboard real (ej. captura de "Barberos" con calificaciones de Zar Rutten, 4.3 estrellas):
> "Esto es de una barbería que ya lo usa. Cada corte que recibe un cliente, esto se actualiza solo. Ves qué barbero tiene mejor calificación, y al quinto corte el sistema regala uno gratis sin que tú hagas nada."

**Cierre directo — sin intermedios:**
> "¿Lo activamos ahorita o prefieres pensarlo?"

Si dice sí → el León contacta a César con el mensaje de activación descrito arriba.

---

## Límites duros del guion — lo que el León NUNCA promete

(Obligatorio explicarlo al León antes de soltarlo solo — es su entrenamiento, no solo el guion)

- **Nunca** menciona "inteligencia artificial" como gancho de venta — contradice Constitución Art. 6 y Sistema de Comunicación.
- **Nunca** promete envío automático de reseña de Google en un plazo fijo — hoy es automático **solo si el rating es 5 estrellas**; si es menor, se pide feedback, no reseña pública.
- **Nunca** inventa precios ni descuentos en el momento — los precios son los publicados en [[10-ROADMAP-COMERCIAL]] / `/precios`, sin negociación de campo.
- **Nunca** promete plazos de soporte que César no haya confirmado.
- **Nunca** usa la palabra "gratis" para el setup — el setup del León **es pagado ($50)**, solo la Barbería Fundadora (Loja/Cuenca, programa aparte) tiene setup gratis.

---

## El kit del León (entregable físico/digital)

1. **Video de 30-45 segundos** — grabación real de pantalla del sistema en producción + celular mostrando el escaneo del QR. **Nunca actor ni simulación de IA como si fuera un cliente real** (viola la regla "Cero Anécdotas Sintéticas" de [[Skill de Guiones BarberOS]]). Si se necesita un video explicativo genérico para `/como-funciona`, se etiqueta claramente como demostración del mecanismo, no como testimonio.
2. El guion de apertura, reencuadre, demostración y cierre (arriba).
3. Contacto directo de César para activaciones.
4. Tabla resumen de comisión ($25 setup + 10% mensual, solo sobre mensualidad).

---

## Lo que queda abierto (para que no se pierda)

- Nombre y estructura del "nuevo producto/vertical" para reincentivar Leones cuando su cartera se agote — sin definir todavía.
- Construcción técnica del panel de comisiones para el León (bloqueante antes de escalar más allá del primer León piloto).
- Copy final del video del León (quién lo graba, con qué barbería real de referencia).
---

# ENMIENDA 2026-07-26 — Expansión, doble rol de León y modelo de comisión adaptativo

```yaml
id: 17-programa-leones-fundadores-enmienda-2026-07-26
titulo: Enmienda — Expansión, doble rol de León y modelo de comisión adaptativo
categoria: comercial
estado: activo — reemplaza secciones equivalentes del documento base 17
sprint: lanzamiento-inmediato
ultima_revision: 2026-07-26
relacionado:
  - 17-PROGRAMA-LEONES-FUNDADORES (documento base, no se reemplaza completo)
  - 18-PLAN-ESTRATEGICO-MARKETING
  - ACUERDO-CORTO-LEONES
  - GUION-CAMPO-LEONES-LOJA-2026-07-27
```

> **Naturaleza de este documento:** enmienda formal, con fecha, sobre el documento base 17. No reescribe el documento base — lo amplía y corrige puntualmente donde se indica.

---

## 1. Techo de Leones activos

Se amplía de 3 a 5 el techo de **Leones Operativos** activos simultáneos.

**Condición de desbloqueo cumplida:** wallet de comisiones en producción — cada León ve sus ventas y comisiones acumuladas en tiempo real.

**El techo de 5 aplica solo a Leones Operativos.** Los Leones Referidores (sección 3) no están sujetos a este techo.

---

## 2. Alcance geográfico

Se autoriza expansión de Loja a alcance nacional, como excepción consciente a la secuencia original Loja→Cuenca del documento base.

**Aplica exclusivamente a:**
- Reclutamiento de Leones (ambos roles).

**No aplica a:**
- Apertura de mercado de clientes finales fuera de Loja, que sigue las reglas de Horizonte 1/2/3 de [[18-PLAN-ESTRATEGICO-MARKETING]] sin cambios.

---

## 3. Los dos roles de León — no confundir

### 3.1 León Operativo

**Quién es:** persona que hace la venta activa completa — apertura, pregunta gancho, demostración, manejo de objeciones, cierre o acompañamiento hasta el cierre. Perfil: **barbero activo**, con red de colegas, compañeros de formación y contactos del gremio.

**Filtro de entrada:**
- Entrevista breve antes de asignar código — se evalúa si tiene "madera de vendedor"
- **Exclusividad territorial:** no se ponen a competir dos Leones Operativos por el mismo círculo de contactos
- Filtro de 15 días se mantiene (si no logra ninguna activación en 15 días, se retira el código)

**Comisión:** $25 por activación pagada + 10% de la mensualidad de por vida (solo sobre Pro/Premium, nunca sobre tokens IA)

**Regla de veracidad del pitch (dura):** solo puede afirmar el número de barberías con las que **realmente ya trabaja o tiene relación confirmada**

**Regla de autorreferido (dura):** el local donde trabaja actualmente queda excluido de su propia comisión.

**Orden de acercamiento recomendado:** primero círculo cercano (para construir casos de éxito reales), luego prospección a desconocidos.

### 3.2 León Referidor

**Quién es:** persona con acceso a dueños de barbería pero que **no hace la venta activa** — solo entrega el contacto o menciona el servicio con su código.

**Filtro de entrada:** ninguno formal.

**Comisión:** $10 dólares por cada activación pagada. Sin componente recurrente.

**Regla de atribución:** el pago solo se dispara cuando el barbero activa **y paga** el setup.

---

## 4. Cuenta Enterprise — no es un León

Cadenas/franquicias con múltiples locales se tratan como venta directa de alto valor, fuera del programa de Leones. Requiere definir paquete Enterprise. Comisión propuesta: 10-15% flat del valor del deal.

---

## 5. Reglas duras que aplican a ambos roles

- **Anti-pirámide:** comisión únicamente por barbería activada y pagando. Nunca comisión por reclutar a otro León.
- **Atribución técnica:** cada activación se liga a un slug/código QR personalizado por León, mapeado 1:1 al campo `salesAgent`.
- **Setup de $50 no cambia**.
- **Regla de "gratis" y de IA siguen vigentes**: nunca se usa "gratis" para el setup del León, nunca se menciona IA como gancho de venta.

---

## 6.1 El trial de 15 días gratis solo aplica al plan Pro

Confirmado en `barberosplus.com/precios`: el trial de $0/15 días está publicado únicamente bajo BarberOS Pro. El plan Premium no tiene trial gratis.

**Implicaciones:**
- **Comisión del León en cierres Premium:** se dispara el mismo día de la activación, no a los 15 días.
- **Pitch:** el León nunca debe ofrecer "prueba gratis de 15 días" a un prospecto interesado en Premium.

## 6.2 Cierre técnico y operativo

- **Formulario post-cierre:** al aceptar, el prospecto llena un formulario que dispara el trial gratis de 15 días directo en backend — la comisión se dispara en la conversión a pago, no en el registro del trial.
- **Acuerdo mínimo por escrito:** requisito satisfecho mediante [[ACUERDO-CORTO-LEONES]].
- **Cesar como cuello de botella:** con el modelo de autoconfiguración, César deja de ser el punto de activación técnica para el flujo estándar.

---

## 7. Pendiente sin resolver (no bloqueante)

- Confirmar si el techo de 5 aplica solo a Operativos.
- Nombre oficial del rol Cuenta Enterprise y su comisión definitiva.
- Definir si existe un tercer perfil de León Operativo además del barbero.
- Actualizar el guion de campo para reflejar el flujo abreviado del León Referidor.