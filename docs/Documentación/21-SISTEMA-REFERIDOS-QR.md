---
id: 21-sistema-referidos-qr
titulo: Sistema de Referidos QR
categoria: comercial
estado: draft
sprint:下一个
relacionado:
  - 00-CONSTITUCION
  - 08-ARQUITECTURA-IA
---

# 21-SISTEMA-REFERIDOS-QR.md

## Objetivo

Crear un sistema de códigos QR personales para referidos/vendedores. Cada vendedor tendrá un código QR único que, al escanearse, enviará un mensaje de WhatsApp predefinido a César con un código de referencia.

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

##Pendientes

- [ ] Agregar modelo `ReferralVendedor` a schema.prisma
- [ ] Crear migración
- [ ] Implementar API routes
- [ ] Crear formulario `/registro`
- [ ] Crear vista `/superadmin`
- [ ] Implementar generación de QR
- [ ] Agregar botón "Vendedores" en `/admin`
