# 📋 Guía de Integración para el Programador de barberosplus.com

> **Fecha:** 2026-07-27  
> **De:** Equipo BarberOS (César Reyes)  
> **Para:** Programador de barberosplus.com  
> **Estado:** ✅ Backend verificado y listo para recibir webhooks

---

## 🔑 Credenciales de Integración

| Concepto | Valor |
|----------|-------|
| **API Key compartida** | `bk_live_9f83a710e42d8c91b53e77f0a421bc06` |
| **Header de autenticación** | `x-api-key: bk_live_9f83a710e42d8c91b53e77f0a421bc06` |

> ⚠️ **CAUTION:** Esta clave es **SECRETA**. No debe estar en código frontend, repositorios públicos, ni compartirse fuera de este documento. Ambos sistemas la usan para autenticarse mutuamente.

---

## 📡 Webhook 1: BarberOS → barberosplus.com

**Nosotros enviamos esto a ustedes** cada vez que se crea una barbería nueva en nuestro panel /admin.

### Endpoint que necesitamos de ustedes

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
    "id": "clx123abc456",
    "name": "Barbería El Elegante",
    "phoneBusiness": "593963410409",
    "phonePersonal": "593991234567",
    "plan": "PRO",
    "referralCode": "X989QMC8"
  },
  "timestamp": "2026-07-27T10:30:00Z"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `event` | string | Siempre `"barbershop_created"` |
| `barbershop.id` | string | ID único de la barbería en BarberOS |
| `barbershop.name` | string | Nombre de la barbería |
| `barbershop.phoneBusiness` | string | WhatsApp del negocio (formato E.164 sin +) |
| `barbershop.phonePersonal` | string \| null | Teléfono personal del dueño (puede ser null) |
| `barbershop.plan` | string | `"PRO"` o `"PREMIUM"` |
| `barbershop.referralCode` | string \| null | Código del vendedor que la refirió (puede ser null si es orgánica) |
| `timestamp` | string | Fecha/hora ISO 8601 |

### Respuesta que esperamos de ustedes

**IMPORTANTE:** Esta respuesta es **SÍNCRONA**. Nuestro backend espera hasta 5 segundos por tu respuesta para saber si la barbería tiene comisión o no. Si tardas más, dejamos el estado como `PENDING`.

#### ✅ Caso 1: La barbería TIENE comisión (vino referida)

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

#### ℹ️ Caso 2: La barbería NO tiene comisión (cliente orgánico)

```json
{
  "success": true,
  "hasCommission": false,
  "message": "Sin comisión"
}
```

#### ❌ Error de auth (401)

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Tu lógica:** Cuando recibas este webhook, debes comparar los teléfonos (`phoneBusiness` y `phonePersonal`) con tus registros de chats. Si alguno coincide con un cliente que vino referido por un vendedor, respondes con `hasCommission: true` y los datos del vendedor. Si no coincide con ningún referido, respondes con `hasCommission: false`.

---

## 📡 Webhook 2: barberosplus.com → BarberOS

**Ustedes nos envían esto a nosotros** cada vez que un cliente paga/suscribe en barberosplus.com.

### Endpoint nuestro (ya está en producción)

```
POST https://barberos-rho-henna.vercel.app/api/webhook/referral-sale
```

### Headers que deben enviar

```
Content-Type: application/json
x-api-key: bk_live_9f83a710e42d8c91b53e77f0a421bc06
```

### Payload que deben enviar

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

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `event` | string | **Obligatorio.** Siempre `"sale_completed"` |
| `transaction_id` | string | **Obligatorio.** ID único de la venta (evita comisiones duplicadas) |
| `client.name` | string | Nombre del cliente que compró |
| `client.phones` | string[] | **Obligatorio.** Array con todos los teléfonos del cliente. Pueden enviar en cualquier formato (`0991234567`, `+593991234567`, `099 123 4567`), nuestro backend los normaliza automáticamente |
| `timestamp` | string | Fecha/hora ISO 8601 |

> 📌 **IMPORTANT:** El campo `client.phones` **DEBE ser un array**, aunque sea un solo número. Ejemplo: `["0991234567"]`.
> Si tienen más de un teléfono del cliente (personal + negocio), envíenlos todos para maximizar la tasa de match.

---

## 📬 Respuestas de nuestro endpoint

### ✅ Match exitoso — HTTP 200

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

### ℹ️ Sin match — HTTP 200

```json
{
  "success": true,
  "matched": false,
  "message": "No se encontró ningún referidor activo en los últimos 30 días"
}
```

### ❌ Sin autenticación — HTTP 401

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### ❌ Payload inválido — HTTP 400

```json
{
  "success": false,
  "error": "Formato de payload inválido. Se requiere event: 'sale_completed' y client.phones como array."
}
```

---

## 🧪 Ejemplo de código para probar (cURL)

### Prueba rápida desde terminal

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

### Ejemplo en Node.js / JavaScript

```javascript
const response = await fetch("https://barberos-rho-henna.vercel.app/api/webhook/referral-sale", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "bk_live_9f83a710e42d8c91b53e77f0a421bc06",
  },
  body: JSON.stringify({
    event: "sale_completed",
    transaction_id: "VENTA-10029",
    client: {
      name: "Carlos Mendoza",
      phones: ["0991234567", "0987654321"],
    },
    timestamp: new Date().toISOString(),
  }),
});

const data = await response.json();
console.log(data);
// Si data.matched === true → la comisión fue asignada al vendedor indicado en data.referrer
```

---

## ✅ Verificación realizada

Nuestro endpoint fue probado localmente con los siguientes resultados:

| Test | Descripción | Resultado |
|------|-------------|-----------|
| TEST 1 | Petición sin `x-api-key` | ✅ Rechazado con 401 |
| TEST 2 | API Key correcta + teléfono sin lead registrado | ✅ `matched: false` |
| TEST 3 | API Key correcta + teléfono CON lead registrado | ✅ `matched: true` + comisión creada |
| TEST 4 | Payload mal formado (sin phones) | ✅ Rechazado con 400 |

---

## 📌 Resumen de acciones para el programador

1. **Configurar en su backend** la `x-api-key` como variable de entorno secreta
2. **Crear endpoint** `POST /api/webhook/barbershop-created` en `https://www.barberosplus.com` para recibir nuestro Webhook 1
3. **Implementar el disparo** del Webhook 2 (`sale_completed`) cada vez que un cliente pague, apuntando a nuestro endpoint
4. **Probar con el cURL** de arriba para verificar conectividad antes de integrar en código

---

> **Contacto técnico:** César Reyes  
> **URL producción BarberOS:** https://barberos-rho-henna.vercel.app
