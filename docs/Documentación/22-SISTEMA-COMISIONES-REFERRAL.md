---
id: 22-sistema-comisiones-referral
titulo: Sistema de Comisiones por Referidos
categoria: comercial
estado: planning
relacionado:
  - 21-SISTEMA-REFERIDOS-QR
  - 00-CONSTITUCION
---

# 22-SISTEMA-COMISIONES-REFERRAL.md

## Resumen del Flujo

```
[1. VENDEDOR crea Barbería en /admin]
           ↓
[2. Enviamos webhook a barberosplus.com con datos de barbería nueva]
           ↓
[3. barberosplus.com recibe clientes por WhatsApp]
           ↓
[4. Cliente potencial ESCANEA QR → llega mensaje a César]
           ↓
[5. Cliente contacta a barberosplus.com (NO a BarberOS directamente)]
           ↓
[6. Cliente SUBSCRIBE/COMPRA en barberosplus.com]
           ↓
[7. barberosplus.com → POST /api/webhook/referral-sale a BarberOS]
           ↓
[8. BarberOS hace MATCH por teléfono]
           ↓
[9. Si hay match → Registrar comisión para el vendedor]
```

---

## Datos queTenemos

### Vendedor/Referido (ya existe en `ReferralVendedor`)
- Nombre
- Celular
- Negocio
- Dirección
- Código único QR
- Scans count

### Barbería (ya existe en `Barbershop`)
- Nombre
- WhatsApp (número del negocio)
- Código PIN

### Lo que FALTA
- Teléfono personal del representante/dueño de la barbería (para hacer match cuando el cliente escriba desde su número personal)

---

## Webhooks

### Webhook 1: BarberOS → barberosplus.com

Se dispara al crear una barbería nueva en `/admin`.

**URL destino:** `https://barberosplus.com/api/webhook/new-barbershop` (por confirmar con el otro programador)

**Headers:**
```
Content-Type: application/json
x-api-key: CLAVE_SECRETA_QUE_ACORDAREMOS
```

**Payload:**
```json
{
  "event": "barbershop_created",
  "barbershop": {
    "name": "Barbería El Elegante",
    "phoneBusiness": "593963410409",
    "phonePersonal": "593991234567",
    "plan": "PRO",
    "referralCode": "X989QMC8"
  },
  "timestamp": "2026-07-27T10:30:00Z"
}
```

| Campo | Descripción |
|-------|-------------|
| `event` | Siempre `"barbershop_created"` |
| `barbershop.name` | Nombre de la barbería |
| `barbershop.phoneBusiness` | WhatsApp del negocio (el que se conecta a BarberOS) |
| `barbershop.phonePersonal` | Teléfono personal del dueño/representante |
| `barbershop.plan` | "PRO" o "PREMIUM" |
| `barbershop.referralCode` | Código único del vendedor que la refiere |

---

### Webhook 2: barberosplus.com → BarberOS

Se dispara cuando un cliente compra/subscribe en barberosplus.com.

**URL:** `/api/webhook/referral-sale` (en BarberOS)

**Headers:**
```
Content-Type: application/json
x-api-key: CLAVE_SECRETA_QUE_ACORDAREMOS
```

**Payload:**
```json
{
  "event": "sale_completed",
  "transaction_id": "VENTA-10029",
  "client": {
    "name": "Carlos Mendoza",
    "phones": [
      "0991234567",
      "0987654321"
    ]
  },
  "timestamp": "2026-07-27T10:30:00Z"
}
```

| Campo | Descripción |
|-------|-------------|
| `event` | Siempre `"sale_completed"` |
| `transaction_id` | ID único de la venta en barberosplus |
| `client.name` | Nombre del cliente que compró |
| `client.phones` | Array de teléfonos (puede ser personal o del negocio) |
| `timestamp` | Fecha/hora de la venta |

---

## Lógica de Match

### Normalización de Teléfonos
Todos los teléfonos se normalizan a formato E.164 (ej: `593991234567`).

### Regla: First Touch
- Buscar en `ReferralLead` si alguno de los `phones` recibió un mensaje QR en los últimos **30 días**.
- El **primer lead** que coincida dentro de la ventana se lleva la atribución.

### Matching
1. Recibir array de `phones`
2. Por cada phone, buscar en `ReferralLead` donde `telefono` coincida
3. Filtrar por `capturedAt >= ahora - 30 días`
4. Tomar el **más antiguo** (first touch)
5. Asignar la venta a ese `ReferralVendedor`

---

## Modelos Prisma Necesarios

### Modificar: `ReferralVendedor` (existente)

```prisma
model ReferralVendedor {
  id            String   @id @default(cuid())
  nombre        String
  celular       String
  negocio       String
  direccion     String
  codigoUnico   String   @unique
  activo        Boolean  @default(true)
  scansCount    Int      @default(0)
  createdAt     DateTime @default(now())

  // RELACIONES NUEVAS
  leads         ReferralLead[]
  comisiones    ReferralComision[]
}
```

### Nuevo: `ReferralLead`
Registro de cada teléfono que escaneó un QR y escribió a César.

```prisma
model ReferralLead {
  id            String   @id @default(cuid())
  vendedorId    String   // FK a ReferralVendedor
  telefono      String   // Teléfono que escribió (normalizado)
  codigoQr      String   // Código QR que escaneó
  clienteNombre String?  // Nombre si lo proporcionó
  capturedAt    DateTime @default(now())
  // Flag si ya se convirtió en venta
  converted     Boolean  @default(false)
  convertedAt   DateTime?

  vendedor      ReferralVendedor @relation(fields: [vendedorId], references: [id])

  @@index([telefono])
  @@index([capturedAt])
  @@index([vendedorId])
}
```

### Nuevo: `ReferralComision`
Registro de comisiones por cada venta referida.

```prisma
model ReferralComision {
  id            String   @id @default(cuid())
  vendedorId    String   // FK a ReferralVendedor
  leadId        String?  // FK a ReferralLead que originó la venta
  transactionId String   // ID de la venta en barberosplus
  clienteNombre String
  telefonos     String   // JSON array de teléfonos
  monto         Float?   // Monto de la comisión (si aplica)
  pagada        Boolean  @default(false)
  pagadaAt      DateTime?
  createdAt     DateTime @default(now())

  vendedor      ReferralVendedor @relation(fields: [vendedorId], references: [id])

  @@index([vendedorId])
  @@index([transactionId])
}
```

---

## API Endpoints

### POST /api/webhook/referral-sale
Recibe ventas de barberosplus.com.

**Request:**
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

**Response - Match exitoso (200):**
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

**Response - Sin match (200):**
```json
{
  "success": true,
  "matched": false,
  "message": "No se encontró ningún referidor activo en los últimos 30 días"
}
```

**Response - Error (401/500):**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

### GET /api/admin/comisiones (dentro de /admin)
Ver lista de comisiones.

**Query params:**
- `vendedorId` (opcional): filtrar por vendedor
- `pagada` (opcional): true/false

**Response:**
```json
{
  "comisiones": [
    {
      "id": "com_001",
      "vendedor": { "nombre": "Juan Pérez", "negocio": "Barbería VIP" },
      "transactionId": "VENTA-10029",
      "clienteNombre": "Carlos Mendoza",
      "monto": null,
      "pagada": false,
      "createdAt": "2026-07-27T10:30:00Z"
    }
  ],
  "total": 1
}
```

### PATCH /api/admin/comisiones/[id]
Marcar comisión como pagada.

**Request:**
```json
{
  "pagada": true
}
```

---

## Cambios en Formulario de Creación de Barbería (/admin)

### Agregar campo: Teléfono Personal

**Campo nuevo:**
- Label: "Teléfono Personal del Representante"
- Placeholder: "Ej. 593991234567"
- Ubicación: Después de "WhatsApp (con prefijo país)"

---

## Vistas Necesarias

### 1. Tab en /admin: "Comisiones"
Accesible desde el tabs existing: Barberías | Vendedores | **Comisiones**

**Tabla de Comisiones:**
| Vendedor | Cliente | Transaction ID | Fecha | Estado | Acción |
|----------|---------|---------------|-------|--------|--------|
| Juan P.  | Carlos M.| VENTA-10029  | 27/07 | Pendiente | [Marcar pagada] |

**Filtros:**
- Por vendedor
- Por estado (pagada/pendiente)
- Por fecha

### 2. Detalle de Vendedor (/admin?vendedor=X)
Ver todas las comisiones de un vendedor específico.

---

## Pendientes

- [ ] Crear modelos Prisma: `ReferralLead`, `ReferralComision`
- [ ] Modificar modelo `ReferralVendedor` con relaciones
- [ ] Crear endpoint `POST /api/webhook/referral-sale`
- [ ] Crear endpoint `GET /api/admin/comisiones`
- [ ] Crear endpoint `PATCH /api/admin/comisiones/[id]`
- [ ] Agregar campo "Teléfono Personal" en form de creación barbería
- [ ] Agregar tab "Comisiones" en /admin
- [ ] Implementar lógica de normalización de teléfonos
- [ ] Implementar lógica First Touch de matching
- [ ] Acordar CLAVE_SECRETA con programador de barberosplus.com
- [ ] Definir si hay monto de comisión fijo o porcentaje

---

## Preguntas Resueltas

1. **barberosplus.com ya existe** - Está en producción, necesitamos la URL exacta del webhook
2. **Teléfono negocio vs personal** - El teléfono del negocio es el que se conecta a BarberOS, el personal es el del representante/dueño (para hacer match cuando el cliente escriba desde su número privado)
3. **Mostrar comisiones** - Sí, el sistema mostrará cuándo hay comisión y cuándo no
4. **El vendedor ya tiene código QR** - Sí, el sistema ya captura el código por el cual llega el lead
