# 📋 Reporte Final de Integración BarberOS ↔ barberosplus.com

> **Fecha:** 2026-07-27
> **De:** Equipo BarberOS (César Reyes)
> **Para:** Programador de barberosplus.com
> **Estado:** ✅ Backend listo y desplegado en producción

---

## 🎯 Resumen del Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. CREACIÓN DE BARBERÍA (BarberOS → barberosplus.com)         │
│     ┌────────────────────────────────────────────────┐         │
│     │ Creamos barbería en /admin                     │         │
│     │         ↓                                      │         │
│     │ POST con datos de la barbería                  │         │
│     │         ↓                                      │         │
│     │ barberosplus compara con sus chats             │         │
│     │         ↓                                      │         │
│     │ RESPONDE con hasCommission: true/false         │         │
│     │         ↓                                      │         │
│     │ BarberOS guarda el resultado                   │         │
│     └────────────────────────────────────────────────┘         │
│                                                                 │
│  2. VENTA REFERRIDA (barberosplus.com → BarberOS)              │
│     ┌────────────────────────────────────────────────┐         │
│     │ Cliente paga en barberosplus.com               │         │
│     │         ↓                                      │         │
│     │ POST con datos de la venta                     │         │
│     │         ↓                                      │         │
│     │ BarberOS busca match en últimos 30 días        │         │
│     │         ↓                                      │         │
│     │ Si hay match → asigna comisión al vendedor     │         │
│     └────────────────────────────────────────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Credenciales Compartidas

| Concepto | Valor |
|----------|-------|
| **API Key** | `bk_live_9f83a710e42d8c91b53e77f0a421bc06` |
| **Header** | `x-api-key: bk_live_9f83a710e42d8c91b53e77f0a421bc06` |

> ⚠️ **CAUTION:** Esta clave es **SECRETA**. No debe estar en código frontend, repositorios públicos, ni compartirse fuera de este documento.

---

## 📡 WEBHOOK 1: BarberOS → barberosplus.com

### ¿Cuándo se dispara?

Cada vez que **creamos una barbería nueva** desde el panel `/admin` de BarberOS.

### Endpoint que necesitamos que ustedes implementen

```
POST https://www.barberosplus.com/api/webhook/barbershop-created
```

### Headers que enviamos

```
Content-Type: application/json
x-api-key: bk_live_9f83a710e42d8c91b53e77f0a421bc06
```

### Payload que enviamos

```json
{
  "event": "barbershop_created",
  "barbershop": {
    "name": "Barbería El Elegante",
    "phoneBusiness": "593963410409",
    "phonePersonal": "593991234567",
    "plan": "PRO"
  },
  "timestamp": "2026-07-27T10:30:00Z"
}
```

### Campos del Payload

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `event` | string | ✅ | Siempre `"barbershop_created"` |
| `barbershop.name` | string | ✅ | Nombre de la barbería |
| `barbershop.phoneBusiness` | string | ✅ | WhatsApp del negocio (formato E.164: `593963410409`) |
| `barbershop.phonePersonal` | string \| null | ❌ | Teléfono personal del dueño (puede ser null) |
| `barbershop.plan` | string | ✅ | `"PRO"` o `"PREMIUM"` |
| `timestamp` | string | ✅ | Fecha/hora ISO 8601 |

### ⚠️ IMPORTANTE: Esta respuesta es SÍNCRONA

Nuestro backend **espera hasta 5 segundos** por la respuesta. Si tardan más o hay error, dejamos el estado como `PENDING` (sin comisión confirmada aún).

### Respuestas que esperamos de ustedes

#### ✅ Caso A: La barbería TIENE comisión (vino referida)

```json
{
  "success": true,
  "hasCommission": true,
  "referredBy": {
    "name": "Juan Pérez",
    "code": "X989QMC8"
  },
  "message": "Comisión confirmada"
}
```

#### ℹ️ Caso B: La barbería NO tiene comisión (cliente orgánico)

```json
{
  "success": true,
  "hasCommission": false,
  "message": "Sin comisión"
}
```

#### ❌ Error de autenticación (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### Lógica que ustedes deben implementar

1. Validar el header `x-api-key`
2. Comparar `phoneBusiness` y `phonePersonal` con sus registros de chats
3. Si alguno coincide con un cliente que vino referido por un vendedor:
   - Responder con `hasCommission: true` y datos del vendedor (`referredBy.name` y `referredBy.code`)
4. Si no coincide con ningún referido:
   - Responder con `hasCommission: false`

---

## 📡 WEBHOOK 2: barberosplus.com → BarberOS

### ¿Cuándo se dispara?

Cada vez que un cliente **paga o suscribe** en barberosplus.com.

### Endpoint nuestro (ya en producción)

```
POST https://barberos-rho-henna.vercel.app/api/webhook/referral-sale
```

### Headers que ustedes deben enviar

```
Content-Type: application/json
x-api-key: bk_live_9f83a710e42d8c91b53e77f0a421bc06
```

### Payload que ustedes deben enviar

```json
{
  "event": "sale_completed",
  "transaction_id": "VENTA-10029",
  "client": {
    "name": "Carlos Mendoza",
    "phones": ["0991234567", "0987654321"]
  },
  "timestamp": "2026-07-27T10:30:00Z"
}
```

### Campos del Payload

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|:-----------:|-------------|
| `event` | string | ✅ | Siempre `"sale_completed"` |
| `transaction_id` | string | ✅ | ID único de la venta (evita comisiones duplicadas) |
| `client.name` | string | ❌ | Nombre del cliente |
| `client.phones` | string[] | ✅ | **Array** con todos los teléfonos del cliente |
| `timestamp` | string | ❌ | Fecha/hora ISO 8601 |

### ⚠️ IMPORTANTE sobre `client.phones`

- **DEBE ser un array**, aunque sea un solo número
- Ejemplo correcto: `["0991234567"]`
- Pueden enviarlo en cualquier formato (`0991234567`, `+593991234567`, `099 123 4567`) — nuestro backend lo normaliza automáticamente
- Si tienen más de un teléfono del cliente (personal + negocio), **envíenlos todos** para maximizar la tasa de match

### Respuestas que devolvemos

#### ✅ Match exitoso (HTTP 200)

```json
{
  "success": true,
  "matched": true,
  "referrer": {
    "id": "ref_clk123",
    "businessName": "Barbería VIP Guayaquil",
    "representative": "Juan Pérez",
    "whatsapp": "593988888888"
  },
  "message": "Comisión asignada exitosamente"
}
```

#### ℹ️ Sin match (HTTP 200)

```json
{
  "success": true,
  "matched": false,
  "message": "No se encontró ningún referidor activo en los últimos 30 días"
}
```

#### ❌ Sin autenticación (HTTP 401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

#### ⚠️ Transacción duplicada (HTTP 409)

```json
{
  "success": false,
  "error": "Transaction already processed"
}
```

### Lógica que nosotros implementamos

1. Validamos la `x-api-key`
2. Normalizamos los teléfonos a formato E.164 (`593...`)
3. Buscamos en los últimos 30 días si alguno de esos teléfonos escaneó un QR de algún vendedor
4. Si hay match → asignamos comisión al vendedor (First Touch: el primero que registró el lead gana)
5. Si ya recibimos esa `transaction_id` antes → devolvemos 409

---

## 🧪 Ejemplos de Código para Probar

### Probar nuestro Webhook 2 (ustedes nos envían)

```bash
curl -X POST https://barberos-rho-henna.vercel.app/api/webhook/referral-sale \
  -H "Content-Type: application/json" \
  -H "x-api-key: bk_live_9f83a710e42d8c91b53e77f0a421bc06" \
  -d '{
    "event": "sale_completed",
    "transaction_id": "TEST-001",
    "client": {
      "name": "Cliente de Prueba",
      "phones": ["0991234567"]
    },
    "timestamp": "2026-07-27T12:00:00Z"
  }'
```

### Ejemplo en Node.js / JavaScript (Webhook 1)

```javascript
// USTEDES implementan este endpoint
app.post("/api/webhook/barbershop-created", async (req, res) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== "bk_live_9f83a710e42d8c91b53e77f0a421bc06") {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  const { barbershop } = req.body;

  // Comparar con sus chats
  const isReferred = await checkIfReferred(
    barbershop.phoneBusiness,
    barbershop.phonePersonal
  );

  if (isReferred) {
    return res.json({
      success: true,
      hasCommission: true,
      referredBy: {
        name: isReferred.vendorName,
        code: isReferred.vendorCode,
      },
      message: "Comisión confirmada",
    });
  }

  return res.json({
    success: true,
    hasCommission: false,
    message: "Sin comisión",
  });
});
```

---

## ✅ Tests Verificados por Nuestro Equipo

| Test | Descripción | Resultado |
|------|-------------|-----------|
| TEST 1 | Petición al Webhook 2 sin `x-api-key` | ✅ Rechazado con 401 |
| TEST 2 | Webhook 2 con API Key correcta + teléfono sin lead | ✅ `matched: false` |
| TEST 3 | Webhook 2 con API Key correcta + teléfono CON lead | ✅ `matched: true` + comisión creada |
| TEST 4 | Webhook 2 con `transaction_id` duplicado | ✅ Rechazado con 409 |
| TEST 5 | Webhook 1 (BarberOS → barberosplus) | ✅ POST enviado correctamente |

---

## 📌 Resumen de Acciones para el Programador de barberosplus.com

1. **Crear endpoint** `POST /api/webhook/barbershop-created` en `https://www.barberosplus.com`
2. **Validar** el header `x-api-key: bk_live_9f83a710e42d8c91b53e77f0a421bc06`
3. **Comparar** los teléfonos recibidos con sus chats de referidos
4. **Responder de forma SÍNCRONA** con `{ hasCommission: true/false, referredBy: {...} }`
5. **Disparar** el Webhook 2 (`sale_completed`) cuando un cliente pague
6. **Probar** la conectividad con el cURL de arriba antes de integrar

---

## 📞 Datos de Contacto

- **Proyecto:** BarberOS
- **URL Producción:** https://barberos-rho-henna.vercel.app
- **Panel Admin:** https://barberos-rho-henna.vercel.app/admin
- **Registro Vendedores:** https://barberos-rho-henna.vercel.app/registro
- **Contacto Técnico:** César Reyes
