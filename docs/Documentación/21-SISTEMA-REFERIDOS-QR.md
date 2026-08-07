---
id: 21-sistema-referidos-qr
titulo: Sistema de Referidos QR + Alianza Comercial
categoria: comercial
estado: activo-implementado
sprint: fase-1-piloto-activo
ultima_revision: 2026-08-07
relacionado:
  - 00-Constitución
  - 08-ARQUITECTURA-IA
  - 17-PROGRAMA-LEONES-FUNDADORES
  - 22-SISTEMA-COMISIONES-REFERRAL
  - 20-SEGURIDAD-Y-CONTINUIDAD
---

# 21-SISTEMA-REFERIDOS-QR.md

## Objetivo

Crear un sistema de códigos QR personales para Leones / Aliados Comerciales. Cada vendedor firma digitalmente un **Acuerdo de Alianza** que se persiste como PDF en la base de datos y recibe un código QR único de 8 caracteres. Al escanear el QR, el prospecto es redirigido al WhatsApp de César o al `googleMapsUrl` de la barbería afiliada.

---

## Flujo

```
[Vendedor/Referido] → [Escanea QR] → [WhatsApp: +593 96 341 0409] 
→ "Hola, me interesa, soy [CODIGO_UNICO]"
                                          ↓
                              [César recibe mensaje]
                                          ↓
                              [Registra al referido manualmente]
```

---

## Modelo de Datos

### Prisma: Nuevo modelo `ReferralVendedor`

```prisma
model ReferralVendedor {
  id          String   @id @default(cuid())
  nombre      String
  celular     String
  negocio     String
  direccion   String
  codigoUnico String   @unique // 8 caracteres, ej: "X7K9M2A1"
  activo      Boolean  @default(true)
  scansCount  Int      @default(0) // cuántas veces se escaneó su QR
  createdAt   DateTime @default(now())
}
```

---

## Estructura de Archivos

```
src/
├── app/
│   ├── registro/              # Página pública del formulario
│   │   └── page.tsx
│   ├── admin/
│   │   └── page.tsx          # MODIFICADO: agregar tabs Vendedores
│   └── api/
│       └── referidos/
│           ├── route.ts       # GET (listar) / POST (crear)
│           └── [id]/
│               └── route.ts   # GET (uno) / DELETE / PATCH
├── components/
│   ├── ReferralForm.tsx       # Formulario de registro (público)
│   ├── ReferralTable.tsx      # Tabla en admin
│   └── QrCodeDisplay.tsx      # Mostrar QR con descarga
└── lib/
    └── qr-generator.ts        # Utilidad para generar QR
```

---

## Plan de Implementación

### Fase 1: Base de Datos

1. **Agregar modelo `ReferralVendedor`** en `prisma/schema.prisma`
2. **Crear migración**: `npx prisma migrate dev --name add_referral_vendedor`

### Fase 2: API Routes

3. **POST `/api/referidos`** - Crear vendedor
   - Input: `{ nombre, celular, negocio, direccion }`
   - Genera `codigoUnico` de 8 caracteres
   - Output: `{ id, nombre, celular, negocio, direccion, codigoUnico }`

4. **GET `/api/referidos`** - Listar todos (requiere auth de superadmin)
   - Output: Array de vendedores con `scansCount`

5. **DELETE `/api/referidos/[id]`** - Eliminar vendedor

6. **PATCH `/api/referidos/[id]`** - Editar vendedor

### Fase 3: Formulario de Registro

7. **Crear `/registro/page.tsx`**
   - Formulario con: Nombre, Celular, Negocio, Dirección
   - Al enviar → POST `/api/referidos`
   - Mostrar QR generado + botón de descarga
   - El QR apunta a: `https://wa.me/593963410409?text=Hola%2C%20me%20interesa%2C%20soy%20[CODIGO]`

### Fase 4: Superadmin - Vista Vendedores

8. **Modificar `/admin/page.tsx`**
   - Agregar botón "Vendedores" junto a "Barberías"
   - Ruta: `/superadmin`

9. **Crear `/superadmin/page.tsx`**
   - Tabla con todos los vendedores
   - Columnas: Nombre, Celular, Negocio, Código, Scans, Acciones
   - Acciones: Ver QR, Editar, Eliminar
   - Botón: "Nuevo Vendedor" → abre modal o redirige a `/registro`

### Fase 5: Utilidades QR

10. **Instalar `qrcode`** (o usar API externa):
    ```bash
    npm install qrcode
    ```

11. **Crear `lib/qr-generator.ts`**:
    - Función para generar URL del QR
    - QR encode: `https://wa.me/593963410409?text=Hola,%20me%20interesa,%20soy%20[CODIGO]`

12. **Crear `components/QrCodeDisplay.tsx`**:
    - Muestra QR con la URL
    - Botón "Descargar QR" (descarga como imagen PNG)

---

## Detalle de Componentes

### ReferralForm

```typescript
// Campos
- nombre: string (requerido)
- celular: string (requerido, formato E.164 recomendado)
- negocio: string (requerido)
- direccion: string (requerido)

// Comportamiento
1. Validación de campos
2. POST /api/referidos
3. Mostrar resultado: "Vendedor creado" + QR
4. Opción de crear otro o ir a lista
```

### ReferralTable

```typescript
// Columnas
| Nombre | Celular | Negocio | Código | Scans | Acciones |
|--------|---------|---------|--------|-------|----------|
| Juan   | +593... | Barber  | X7K9M  | 12    | [Ver QR] [Editar] [X] |

// Acciones
- Ver QR: Modal o página con QR grande + descarga
- Editar: Modal con formulario pre-poblado
- Eliminar: Confirmación antes de delete
```

### QrCodeDisplay

```typescript
// Props
- codigoUnico: string
- size?: number (default 256)

// Render
- QR como imagen (base64 o URL a API)
- Enlace de WhatsApp visible
- Botón "Descargar QR"
```

---

## URLs de WhatsApp

```typescript
const WHATSAPP_NUMBER = "593963425323";
const getWhatsAppUrl = (codigo: string) => 
  `https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20me%20interesa,%20soy%20${codigo}`;
```

---

## Autenticación

- `/registro` - Pública (cualquiera puede registrarse)
- `/superadmin` - Requiere same auth que `/admin` ( Bearer token)
- `/api/referidos` - Mismo auth que admin

---

## Pendientes (estado al 2026-08-07)

> **Todos los pendientes originales están cerrados.** El sistema fue migrado a Alianza Comercial formal. Pendientes actuales (en backlog):

- [ ] **Cron de cumpleaños (`/api/cron/birthday`):** no es parte del sistema de referidos, pero `CustomerProfile.birthDate` ya está en BD. *(Backlog general, no bloqueante del sistema de Leones.)*
- [ ] **Renovación de Alianza:** la AlianzaContract no tiene `vigenciaHasta`. Las firmas se asumen de duración indefinida mientras el León esté activo. Si se decide renovar periódicamente, agregar campo y recordatorio.
- [ ] **Reasignación de código tras inactividad:** la regla de "15 días sin activaciones" del programa Leones no está todavía automatizada. Hoy se hace manualmente en `/admin`.

---

## Anexo — Implementación real (Sprint F, 2026-07-29 → 2026-08-07)

### Modelos Prisma efectivamente desplegados

```prisma
model ReferralVendedor {
  id          String   @id @default(cuid())
  nombre      String
  celular     String
  negocio     String
  direccion   String
  codigoUnico String   @unique // 8 chars alfanuméricos (sin O/I)
  // Nuevos (Sprint F):
  cedula      String?  @unique // Cédula 10 dígitos EC. Nullable para registros legacy.
  activo      Boolean  @default(true)
  scansCount  Int      @default(0)
  createdAt   DateTime @default(now())

  leads       ReferralLead[]
  comisiones  ReferralComision[]
  alianza     AlianzaContract?
}

model ReferralLead {
  id            String   @id @default(cuid())
  vendedorId    String
  telefono      String   // Normalizado E.164
  codigoQr      String
  clienteNombre String?
  capturedAt    DateTime @default(now())
  converted     Boolean  @default(false)
  convertedAt   DateTime?

  vendedor      ReferralVendedor @relation(fields: [vendedorId], references: [id])
}

model ReferralComision {
  id            String   @id @default(cuid())
  vendedorId    String
  leadId        String?
  transactionId String   @unique // Evita comisiones duplicadas
  clienteNombre String
  telefonos     String   // JSON array
  monto         Float?
  pagada        Boolean  @default(false)
  pagadaAt      DateTime?
  createdAt     DateTime @default(now())

  vendedor      ReferralVendedor @relation(fields: [vendedorId], references: [id])
}

model AlianzaContract {
  id               String   @id @default(cuid())
  vendedorId       String   @unique
  fechaAsignacion  DateTime @default(now())
  zonaTerritorio   String?
  diasPagoComision Int
  metodoPago       String   // "transferencia" | "payphone" | "efectivo" | "otro"
  ciudadFirma      String
  diaFirma         Int
  mesFirma         String
  anioFirma        Int      @default(2026)

  pdfBytes         Bytes    @db.LongBlob
  pdfMimeType      String   @default("application/pdf")
  pdfSize          Int

  ipAceptacion     String?
  userAgent        String?  @db.Text
  aceptadoAt       DateTime @default(now())

  vendedor         ReferralVendedor @relation(fields: [vendedorId], references: [id], onDelete: Cascade)
}
```

### Flujo público de captura de Alianza

```
[Visitante] → /alianza (AlianzaForm)
   ↓ POST /api/alianza con datos
[Validación Zod (alianza-schema.ts)]
   ↓
[Idempotencia por cédula — reuse si existe]
   ↓
[Generate codigoUnico 8 chars alfanuméricos]
   ↓
[Render PDF con @react-pdf/renderer (alianza-pdf.tsx)]
   ↓
[Prisma transaction: upsert ReferralVendedor + create AlianzaContract]
   ↓
[Return { vendedorId, alianzaId, codigo, pdfUrl }]
   ↓
[UI muestra PDF inline + botón descarga]
```

### Rate limit y seguridad

- `POST /api/alianza`: protegido por rate-limit de Next.js (no persistente). Para producción real, mover a `RateLimitAttempt`.
- `GET /api/alianza/pdf/[id]`: solo retorna PDFs de AlianzaContracts propios (sin auth por ahora — pendiente agregar `ADMIN_SECRET_KEY` o sesión del León).
- `GET /api/alianza/preview`: solo para preview del PDF antes de enviar (no persiste).

### Redirect de QR legacy

URL `/r/[id]` busca `ReferralVendedor` por `codigoUnico`:
- Si la barbería afiliada tiene `googleMapsUrl`, redirige allí.
- Si no, redirige al WhatsApp de César (+593 96 341 0409).
- Incrementa `scansCount` (métrica de adopción).

### Decisiones técnicas que se tomaron en el camino

- **Idempotencia por cédula** en vez de crear registros duplicados. Si la Alianza se firma dos veces con la misma cédula, se reutiliza el `ReferralVendedor` y se crea un `AlianzaContract` adicional.
- **PDF en `LongBlob`:** @react-pdf/renderer entrega `Buffer`. Se guarda como `Bytes` con `LongBlob`. Para volúmenes altos, mover a S3/Cloudflare R2 en una futura iteración.
- **Mismo alfabeto del código QR** que `/api/referidos`: 8 chars sin `O/I` para evitar confusión lectora.
- **Decisión de `cedula` como `@unique`:** permite `findUnique` y previene duplicados. Los registros legacy sin Alianza siguen funcionando con `cedula: null`.

