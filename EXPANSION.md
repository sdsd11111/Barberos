# Plan de Expansión - BarberOS

## Historial de Cambios

### 2026-07-22 - Cambios de Precios y UI

#### Home Page (`/`)
- Velocidad del marquee aumentada 25% (25s → 20s)
- Sección "Imagina conocer tus números" con iconos:
  - Total de clientes (icono personas)
  - Opiniones en Google (logo Google)
  - Notificaciones (icono campana)
  - Calificación a Barberos (icono estrella)
- Pregunta 5 del interrogatorio: "Cuánto proyectas ganar el siguiente mes?" (antes: "Cuánto de lo que no facturste este mes...")
- Eliminado texto "Si no puedes responder estas preguntas..." del hero

#### Página Cómo Funciona (`/como-funciona`)
- Paso 1: "Envía su número a tu WhatsApp" → "Envía un código por WhatsApp"
- Título h2 agregado: "Todo lo que usas hoy ¿Funciona?"

#### Página Precios (`/precios`)

##### BarberOS Pro

| Plan | Precio | Setup | Notas |
|------|--------|-------|-------|
| Prueba 15 días | $0 | $50 al activar | Plan Pro completo. Sin límite de clientes. |
| Mensual | $9.99/mes | $50 al activar | Pago mensual sin compromiso |
| Anual | $99/año | $50 al activar | Equivale a $8.25/mes |
| Lifetime | $500 único | Incluido | Pago único, acceso permanente |

##### BarberOS Premium

| Plan | Precio | Setup | Notas |
|------|--------|-------|-------|
| Mensual | $19.99/mes | $50 al activar | + $5/mes tokens IA |
| Anual | $199/año | $50 al activar | + tokens IA |
| Lifetime | $1000 único | Incluido | Tokens IA incluidos 2 años |

##### UI de Precios
- Cards con scroll horizontal en móvil (snap)
- Hint "Desliza →" con flecha animada (solo móvil, color #a89e90)
- Botón Payphone en Lifetime: tomate #d97644 con texto "Aceptamos Payphone"
- Nota al pie: "Prueba 15 días gratis. Sin tarjeta, sin compromiso."

---

## Setup Fee - $50 USD

El setup de $50 cubre:
- Activación de la cuenta
- Configuración inicial de WhatsApp
- Capacitación básica (1 sesión)
- Soporte durante los primeros 7 días

---

## Estrategia de Crecimiento

### Fase 1: Lanzamiento Controlado
- Prueba 15 días en lugar de tier gratuito permanente
- Reduce adopción masiva indiscriminada
- Mantiene la calidad del onboarding

### Fase 2: Escalabilidad
- Monitorear métricas de conversión trial → pago
- Ajustar duración de trial según resultados
- Considerar programas de referidos

### Fase 3: Expansión
- Agregar integraciones (agenda, POS, etc.)
- Expandir a otras ciudades/países
- Considerar代理商模式

---

## Métricas a Monitorear

- Tasa de conversión trial → pago (objetivo: 20%)
- Tiempo promedio de activación
- Churn rate mensual
- NPS / Satisfacción del cliente
- Tiempo de resolución de soporte

---

## Nota Importante

⚠️ El tier "Prueba 15 días" es el **mismo plan Pro completo**, no una versión limitada. El usuario tendrá acceso a todas las funcionalidades durante el trial para que pueda experimentar el valor completo del producto antes de pagar.

La limitación de "20 clientes/mes" en el tier gratuito **fue eliminada** porque:
1. Generaba confusión (¿qué pasa cuando llegas a 21?)
2. No incentiva la compra si el límite es muy alto
3. Dificulta el análisis de uso real

---

## OpenGraph Status

| Página | Estado |
|--------|--------|
| `/` (Home) | ✅ Listo |
| `/como-funciona` | ✅ Listo |
| `/precios` | ✅ Listo |
| `/historias` | ✅ Listo |
| `/historias/[slug]` | ✅ Listo |
| `/resenas` | ✅ Listo |
| `/acceso` | ❌ Falta |
| `/billing` | ❌ Falta |
| `/login` | ❌ Falta |

---

*Última actualización: 2026-07-22*
