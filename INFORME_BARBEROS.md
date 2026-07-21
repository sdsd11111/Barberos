# 📋 Informe Completo del Proyecto BarberOS

## 1. INICIALIZACIÓN DEL PROYECTO

### 1.1 Creación de Proyecto Next.js
```bash
npx create-next-app@latest barberos-saas --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-git
```

**Resultado:** Proyecto creado en `c:\Users\Cesar\Documents\GRUPO EMPRESARIAL REYES\PROYECTOS\Barberos\barberos-saas`

### 1.2 Dependencias Instaladas
| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `prisma` | ^7.8.0 | ORM de base de datos |
| `@prisma/client` | ^7.8.0 | Cliente de Prisma |
| `@prisma/adapter-pg` | ^7.8.0 | Adapter PostgreSQL para Prisma 7 |
| `pg` | ^8.22.0 | Driver nativo de PostgreSQL |
| `axios` | ^1.18.1 | Cliente HTTP para Evolution API |
| `zod` | ^4.4.3 | Validación de esquemas |
| `dotenv` | ^17.4.2 | Carga de variables de entorno |
| `tsx` | ^4.22.0 | Ejecutor de scripts TypeScript |

---

## 2. ESTRUCTURA DE ARCHIVOS CREADA

```
barberos-saas/
├── prisma/
│   ├── schema.prisma          # Schema de base de datos
│   ├── migrations/            # Migraciones de Prisma
│   │   └── 20260718203921_initial/
│   │       └── migration.sql
│   └── seed.ts               # Script de seeding
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Layout raíz con fuentes de Google
│   │   ├── globals.css       # Estilos globales + Theme Tailwind v4
│   │   ├── page.tsx          # Landing page (eliminada)
│   │   ├── (public)/
│   │   │   └── page.tsx      # Landing "BarberOS"
│   │   ├── (panel)/
│   │   │   ├── layout.tsx    # Layout del panel con sidebar
│   │   │   └── panel/
│   │   │       ├── page.tsx  # Dashboard principal
│   │   │       └── clientes/
│   │   │           └── page.tsx  # Página de clientes
│   │   └── api/
│   │       ├── barbershop/
│   │       │   └── route.ts  # GET /api/barbershop
│   │       ├── visits/
│   │       │   └── route.ts  # POST /api/visits
│   │       └── webhook/
│   │           └── whatsapp/
│   │               └── route.ts  # Webhook de Evolution API
│   ├── components/
│   │   └── RegisterVisitModal.tsx  # Modal de registro de cortes
│   └── lib/
│       ├── prisma.ts        # Cliente Prisma singleton
│       ├── evolution.ts     # Helper de Evolution API
│       └── progress.ts      # Utilidad de barra de progreso
├── .env                      # Variables de entorno
├── .env.example             # Template de variables
├── .gitignore
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 3. SCHEMA DE BASE DE DATOS (Prisma)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model Barbershop {
  id               String         @id @default(cuid())
  name             String
  whatsappNumber   String         @unique
  evolutionInstance String
  evolutionApiKey  String
  requiredCuts     Int            @default(5)
  googleMapsUrl    String?
  createdAt        DateTime       @default(now())
  staff            BarberStaff[]
  customers        BarberCustomer[]
}

model BarberStaff {
  id           String    @id @default(cuid())
  barbershopId String
  name         String
  role         String    @default("BARBER")
  barbershop   Barbershop @relation(fields: [barbershopId], references: [id], onDelete: Cascade)
}

model BarberCustomer {
  id           String    @id @default(cuid())
  barbershopId String
  whatsapp     String
  name         String?
  cutsCount    Int       @default(0)
  sessionState String    @default("IDLE")
  lastVisitAt  DateTime?
  barbershop   Barbershop @relation(fields: [barbershopId], references: [id], onDelete: Cascade)
  @@unique([barbershopId, whatsapp])
}

model BarberVisit {
  id         String   @id @default(cuid())
  customerId String
  staffId    String?
  rating     Int?
  createdAt  DateTime @default(now())
}
```

**Relaciones:**
- `Barbershop` → `BarberStaff[]` (uno a muchos)
- `Barbershop` → `BarberCustomer[]` (uno a muchos)
- `BarberCustomer` → `BarberVisit[]` (uno a muchos)

---

## 4. VARIABLES DE ENTORNO (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barberos?schema=public"
EVOLUTION_API_URL="http://129.153.116.213:8080"
EVOLUTION_API_KEY="42a447c1-3d74-4b52-9571-042c174f7621"
EVOLUTION_INSTANCE="Automatizotunegocio"
NOTIFY_WHATSAPP_NUMBER="593963410409"
```

---

## 5. COMPONENTES Y MÓDULOS

### 5.1 `src/lib/prisma.ts` - Cliente Prisma Singleton
```typescript
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Nota:** Prisma 7 requiere usar un adapter para PostgreSQL en lugar de la URL en el schema.

### 5.2 `src/lib/evolution.ts` - Helper de Evolution API
```typescript
export async function sendWhatsAppMessage({
  instance,
  apiKey,
  to,
  message,
}: SendMessageParams): Promise<void> {
  const url = `${EVOLUTION_API_URL}/message/sendText/${instance}`;
  const number = to.replace(/\D/g, "");

  await axios.post(url, {
    number,
    options: { delay: 1200 },
    textMessage: { text: message },
  }, {
    headers: { apikey: apiKey, "Content-Type": "application/json" },
  });
}
```

### 5.3 `src/lib/progress.ts` - Barra de Progreso Visual
```typescript
export function getProgressBar(current: number, target: number): string {
  const filled = "█";
  const empty = "░";
  const filledCount = Math.min(current, target);
  const emptyCount = target - filledCount;
  const bar = filled.repeat(filledCount) + empty.repeat(emptyCount);
  return `[${bar}] ${current} de ${target}`;
}
```
**Ejemplo:** `getProgressBar(3, 5)` → `"[███░░] 3 de 5"`

### 5.4 `src/components/RegisterVisitModal.tsx`
- Client Component (`'use client'`)
- Overlay con `backdrop-blur-sm` y fondo `rgba(10,8,7,0.8)`
- Input para número de WhatsApp con prefijo `+`
- Estados: `idle` → `loading` → `success` | `error`
- Cierre automático a los 2 segundos tras éxito
- Fetch a `/api/visits` con `barbershopId` dinámico

---

## 6. API ROUTES

### 6.1 `POST /api/visits` - Registrar Corte
**Propósito:** registrar un nuevo corte y enviar WhatsApp

**Validación Zod:**
```typescript
const VisitSchema = z.object({
  barbershopId: z.string().min(1),
  customerWhatsapp: z.string().min(1),
  staffId: z.string().optional(),
});
```

**Lógica:**
1. Buscar `Barbershop` por ID
2. Upsert `BarberCustomer` (incrementar `cutsCount`)
3. Crear `BarberVisit`
4. Construir mensaje con barra de progreso Unicode
5. Si `cutsCount >= requiredCuts` → mensaje de premio
6. Enviar WhatsApp via `sendWhatsAppMessage`

### 6.2 `GET /api/barbershop` - Obtener Barbería Activa
**Propósito:** Proveer el `barbershopId` al frontend

**Respuesta:**
```json
{
  "id": "cmrqtz68e000038ve4x53u0yc",
  "name": "Barbería Tuneche",
  "whatsappNumber": "593963410409",
  "requiredCuts": 5,
  "googleMapsUrl": "https://g.page/tu-barberia"
}
```

### 6.3 `POST /api/webhook/whatsapp` - Webhook de Evolution API
**Propósito:** Recibir mensajes de WhatsApp y manejar estados

**Payload esperado:**
```typescript
interface WebhookPayload {
  event: "messages.upsert";
  data: {
    key: { remoteJid: string; fromMe: boolean };
    message: { conversation?: string };
  };
}
```

**Máquina de Estados:**
| Estado | Mensaje Recibido | Acción |
|--------|------------------|--------|
| `AWAITING_RATING` | "5" → rating 1-5 | Actualiza `BarberVisit.rating`, cambia a `IDLE`, envía gracias |
| `AWAITING_RATING` | texto no numérico | Pide calificación válida |
| `IDLE` | cualquier texto | Envía recordatorio "Pasa por la barbería" |

**Importante:** Responde 200 OK inmediatamente para evitar timeout de Evolution API. El procesamiento pesado se hace en segundo plano.

---

## 7. DISEÑO DEL PANEL (Design System Cinematográfico)

### 7.1 Fuentes en `layout.tsx`
```typescript
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });
```

### 7.2 Tema de Colores (Tailwind v4)
```css
/* globals.css */
:root {
  --background: #0a0807;   /* Negro cálido */
  --foreground: #f3ece1;  /* Crema */
  --accent: #d97644;      /* Naranja cobrizo */
  --muted: #5c554c;      /* Gris café */
  --border: #2a2520;      /* Borde oscuro */
  --card: #131110;        /* Fondo de tarjeta */
}
```

### 7.3 Layout del Panel (Sidebar)
- Ancho: 256px (w-64)
- Fondo: `#0a0807`
- Links con `font-mono` uppercase y tracking amplio
- Link activo: borde izquierdo naranja + fondo `#131110`
- Botón de logout en la parte inferior

### 7.4 Dashboard
- Header con nombre de barbería en `font-display` (Fraunces)
- Grid 3 columnas: código de caja (2 cols) + QR (1 col)
- Código "RV55" en `text-9xl` con fuente Fraunces
- Métricas en grid sin gaps (bordes de 1px)
- Empty state del Libro Diario con tipografía italic

---

## 8. SCRIPT DE SEED (`prisma/seed.ts`)

```typescript
// Limpia tablas en orden
await prisma.barberVisit.deleteMany();
await prisma.barberCustomer.deleteMany();
await prisma.barberStaff.deleteMany();
await prisma.barbershop.deleteMany();

// Crea Barbería "Tunerche"
// Crea 2 Staff: Carlos (OWNER), Juan (BARBER)
// Crea 3 Clientes:
//   - Cliente Frecuente: 3 cortes
//   - Cliente Nuevo: 1 corte  
//   - Cliente Premio: 4 cortes (falta 1 para premio)
```

---

## 9. CONFIGURACIÓN DE SCRIPTS (`package.json`)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "db:seed": "tsx prisma/seed.ts",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

---

## 10. BASE DE DATOS (PostgreSQL en Docker)

### 10.1 Contenedor Docker
```bash
docker run -d --name barberos-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=barberos \
  -p 5432:5432 \
  postgres:16-alpine
```

### 10.2 Migración Aplicada
```
prisma/migrations/20260718203921_initial/migration.sql
```

---

## 11. FLUJO COMPLETO DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRO DE CORTE                             │
│                                                                  │
│  Frontend (Panel) ──POST /api/visits──▶ API Route              │
│                                                │                 │
│                                                ▼                 │
│                                         ┌─────────────┐          │
│                                         │  Prisma     │          │
│                                         │  Upsert     │          │
│                                         │  Customer   │          │
│                                         └─────────────┘          │
│                                                │                 │
│                                                ▼                 │
│                                         ┌─────────────┐          │
│                                         │  Evolution  │          │
│                                         │  API        │          │
│                                         │  WhatsApp   │          │
│                                         └─────────────┘          │
│                                                │                 │
│                                                ▼                 │
│  Cliente ────────────────────────── 📱 "Tu progreso: [█░░░░]"     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CALIFICACIÓN (Webhook)                        │
│                                                                  │
│  Cliente ──"5"──▶ Evolution API ──POST /api/webhook/whatsapp    │
│                                              │                  │
│                                              ▼                  │
│                                    ┌──────────────────┐          │
│                                    │  Validar rating  │          │
│                                    │  (1-5)           │          │
│                                    └──────────────────┘          │
│                                              │                  │
│                                              ▼                  │
│                                    ┌──────────────────┐          │
│                                    │  Update          │          │
│                                    │  BarberVisit     │          │
│                                    │  + sessionState  │          │
│                                    └──────────────────┘          │
│                                              │                  │
│                                              ▼                  │
│  Cliente ────────────────────────── 📱 "¡Gracias por tu          │
│                                       calificación!"             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. ESTADO ACTUAL DEL SISTEMA

| Componente | Estado | Detalle |
|------------|--------|---------|
| Proyecto Next.js | ✅ Listo | Versión 16.2.10 |
| Tailwind CSS | ✅ Configurado | v4 con tema oscuro |
| Prisma ORM | ✅ Configurado | v7.8.0 con adapter pg |
| PostgreSQL | ✅ Corriendo | Docker container |
| Migration | ✅ Aplicada | `add_visit_status` (campo `status` en BarberVisit) |
| Seed | ✅ Ejecutado | Barbería Tuneche |
| Servidor Dev | ✅ Corriendo | localhost:3000 |
| Landing Page | ✅ Cinematográfica | `/` — 12 secciones + cursor custom |
| Panel | ✅ Funcionando | `/panel` con cola de aprobación |
| Clientes | ✅ Funcionando | `/panel/clientes` |
| API Visits | ✅ Implementada | POST `/api/visits` |
| API Barbershop | ✅ Implementada | GET `/api/barbershop` |
| API Approve | ✅ Nueva | POST `/api/visits/approve` |
| API Reject | ✅ Nueva | POST `/api/visits/reject` |
| API Pending | ✅ Nueva | GET `/api/visits/pending` |
| Webhook CHECKIN | ✅ Actualizado | Detecta "CHECKIN", límite 24h por cliente |
| ApprovalQueue | ✅ Nuevo | Polling 2s, sticky bottom, mobile-first |
| Modal Registro | ✅ Implementado | RegisterVisitModal |
| Evolution API | ✅ Configurado | Credenciales seteadas |
| framer-motion | ✅ Instalado | Animaciones landing page |

---

## 13. FLUJO DE APROBACIÓN (Sprint 4.5)

### Reglas de Negocio Implementadas

1. **Límite diario**: Un cliente solo puede hacer check-in una vez cada 24 horas.
2. **Estado PENDING por defecto**: Todo check-in vía WhatsApp empieza como PENDING.
3. **Regla de integridad**: Un barbero solo puede aprobar/rechazar visitas en estado PENDING (Regla 2).
4. **Multi-tenant seguro**: La búsqueda de clientes es siempre `barbershopId_whatsapp`, nunca global.

### Estados de BarberVisit
```
PENDING  → APPROVED (+ cutsCount++)
PENDING  → REJECTED
```

### Flujo de Usuario
```
Cliente escanea QR → WhatsApp (CHECKIN) → BarberVisit(PENDING)
                                                    ↓
Panel del barbero ← ApprovalQueue (polling 2s) ←─┘
                          ↓
              [APROBAR] → APPROVED + WhatsApp con barra de progreso
              [RECHAZAR] → REJECTED + WhatsApp de aviso
```

---

## 14. PRÓXIMOS SPRINTS

1. **Sprint 4:** Modal de Registro de Corte ✅
2. **Sprint 4.5:** Flujo de Aprobación Anti-Fraude ✅
3. **Sprint 5:** Sistema de Roles y Autenticación (multi-tenant)
4. **Sprint 6:** Automatizaciones (Cron Jobs - "Te extrañamos")
5. **Sprint 7:** Dashboard con métricas reales

---

## 14. COMANDOS ÚTILES

```bash
# Desarrollo
cd barberos-saas
npm run dev

# Base de datos
npm run db:migrate    # Crear/modificar tablas
npm run db:seed      # Poblar datos de prueba
npm run db:studio    # Abrir Prisma Studio

# Construcción
npm run build        # Build de producción
npm run start        # Iniciar producción
```

---

*Informe actualizado el 2026-07-18*

