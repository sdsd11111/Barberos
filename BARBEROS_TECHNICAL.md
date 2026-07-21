# BarberOS — Documentación Técnica

## 1. Modelos de Datos (Prisma Schema)

```
User
├── evolutionInstance  → Nombre de instancia en Evolution API
├── whatsappSender      → Número conectado
├── hasBarberia        → Boolean para activar el módulo
├── hasBarberiaPremium → Plan premium
├── barberRequiredCuts  → Cortes para recompensa (default 5)
├── barberGoogleMapsUrl → URL para reseñas Google
│
├── BarberStaff         → Peluqueros/Barberos
│   └── BarberCut[]     → Cortes realizados
│
├── BarberCustomer      → Clientes (identificados por WhatsApp)
│   ├── cutsCount       → Número de cortes
│   ├── lastVisit       → Última visita
│   ├── hasReviewed     → Si ya dejó reseña
│   └── BarberCut[]     → Histórico de cortes
│
├── BarberCut           → Registro de cada corte
│   ├── codeUsed        → Código de 4 caracteres usado
│   ├── rating          → 1-5 estrellas
│   └── BarberReview[]  → Reseñas
│
├── BarberCode          → Códigos de validación activos
│   └── isUsed          → Si ya fue canjeado
│
└── BarberReview        → Reseñas capturadas
```

### Schema Detallado (schema.prisma)

```prisma
model User {
  id                     String   @id @default(uuid())
  email                  String   @unique
  evolutionInstance      String?  @map("evolution_instance")
  whatsappSender         String?  @map("whatsapp_sender")
  hasBarberia            Boolean  @default(false) @map("has_barberia")
  hasBarberiaPremium     Boolean  @default(false) @map("has_barberia_premium")
  barberRequiredCuts      Int      @default(5) @map("barber_required_cuts")
  barberGoogleMapsUrl     String?  @map("barber_google_maps_url")

  barberStaff    BarberStaff[]
  barberCustomers BarberCustomer[]
  barberCuts     BarberCut[]
  barberCodes    BarberCode[]
  barberReviews  BarberReview[]
}

model BarberStaff {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  name      String
  createdAt DateTime @default(now()) @map("created_at")

  user User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cuts BarberCut[]

  @@map("barber_staff")
}

model BarberCustomer {
  id                   String    @id @default(uuid())
  userId               String    @map("user_id")
  whatsapp             String
  name                 String?
  cutsCount            Int       @default(0) @map("cuts_count")
  lastVisit            DateTime  @default(now()) @map("last_visit")
  hasReviewed          Boolean   @default(false) @map("has_reviewed")
  reviewRequestSent    Boolean   @default(false) @map("review_request_sent")
  lastCutAt            DateTime? @map("last_cut_at")
  birthday             DateTime? @map("birthday")
  lastNotifiedInactive DateTime? @map("last_notified_inactive")
  createdAt            DateTime  @default(now()) @map("created_at")

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  cuts     BarberCut[]
  reviews  BarberReview[]

  @@unique([userId, whatsapp])
  @@map("barber_customers")
}

model BarberCut {
  id         String    @id @default(uuid())
  userId     String    @map("user_id")
  customerId String    @map("customer_id")
  staffId    String?   @map("staff_id")
  rating     Int?
  codeUsed   String    @map("code_used")
  createdAt  DateTime  @default(now()) @map("created_at")

  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  customer  BarberCustomer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  staff     BarberStaff?   @relation(fields: [staffId], references: [id], onDelete: SetNull)

  @@map("barber_cuts")
}

model BarberReview {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  customerId  String   @map("customer_id")
  rating      Int
  comment     String?  @db.Text
  googleReview Boolean @default(false) @map("google_review")
  createdAt   DateTime @default(now()) @map("created_at")

  user     User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  customer BarberCustomer @relation(fields: [customerId], references: [id], onDelete: Cascade)

  @@map("barber_reviews")
}

model BarberCode {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  code      String
  isUsed    Boolean  @default(false) @map("is_used")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, code])
  @@map("barber_codes")
}
```

---

## 2. Creación de Instancia Evolution (WhatsApp)

**Archivo:** `src/app/api/whatsapp/route.ts`

### Flujo GET /api/whatsapp

```typescript
// 1. Verifica si user.evolutionInstance existe
const user = await prisma.user.findUnique({
  where: { id: auth.userId },
  select: { evolutionInstance: true, email: true },
});

// 2. Si NO existe → crear instancia
if (!user?.evolutionInstance) {
  const instanceName = `user_${email.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`;
  
  // Llamada a Evolution API
  const result = await createEvolutionInstance(instanceName);
  // POST ${EVOLUTION_API_URL}/instance/create
  // Body: { instanceName, qrcode: true, integration: "WHATSAPP-BAILEYS" }
  
  // Guardar en DB
  await prisma.user.update({
    where: { id: auth.userId },
    data: { evolutionInstance: instanceName },
  });
  
  // Obtener QR fresco
  const qrResult = await getFreshQR(instanceName);
  return NextResponse.json({ status: "disconnected", qrcode: qrResult.qrcode });
}

// 3. Verificar estado de conexión
const statusResult = await getEvolutionStatus(instanceName);
// GET ${EVOLUTION_API_URL}/instance/connectionState/${instanceName}

// Estados posibles:
// - "open" / "connected" → WhatsApp vinculado
// - "connecting" → Esperando QR
// - 404 → Instancia no existe en servidor
```

### Función createEvolutionInstance (lib/evolution.ts)

```typescript
export async function createEvolutionInstance(instanceName: string) {
  const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": EVOLUTION_API_KEY,
    },
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",  // Protocolo WhatsApp
    }),
  });

  // Si 409 (ya existe), se trata como éxito
  if (response.status === 409) {
    await configureEvolutionWebhook(instanceName);
    return { success: true };
  }

  // Configurar webhook automáticamente
  await configureEvolutionWebhook(instanceName);
  return { success: response.ok };
}
```

### Configuración de Webhook

```typescript
export async function configureEvolutionWebhook(instanceName: string) {
  await fetch(`${EVOLUTION_API_URL}/webhook/set/${instanceName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": EVOLUTION_API_KEY,
    },
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: "https://cobranza-app-ochre.vercel.app/api/whatsapp/webhook",
        byEvents: false,
        events: ["MESSAGES_UPSERT"],
      },
    }),
  });
}
```

---

## 3. Registro de un Corte (Flujo Completo)

```
┌─────────────────────────────────────────────────────────────┐
│  BARBERO (Dashboard)                                        │
│  1. Genera código 4 chars (ej: "X7K2")                     │
│     → BarberCode creado en DB (isUsed: false)                │
│  2. Puede descargar QR → wa.me/593XXXXXXXX?text=X7K2        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  CLIENTE en WhatsApp                                         │
│  1. Escanea QR o toca enlace                                │
│  2. Se abre WhatsApp con texto: "X7K2"                     │
│  3. Envía el mensaje                                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  WHATSAPP WEBHOOK (receive message)                         │
│  POST /api/whatsapp/webhook                                 │
│                                                              │
│  1. Identifica al dueño via instanceName                    │
│  2. Busca o crea BarberCustomer por WhatsApp                │
│     → Si es nuevo: cutsCount = 2 (arranque con ventaja)     │
│  3. Valida código contra BarberCode                        │
│  4. Si código válido:                                      │
│     - Marca código como isUsed: true                         │
│     - Crea BarberCut (rating: null, staffId: null)           │
│     - Genera nuevo código automáticamente                   │
│  5. Solicita estilista (si hay staff)                      │
│  6. Solicita rating 1-5                                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  RESPUESTA AL CLIENTE                                       │
│  "¡Código validado! ¿Quién te atendió?"                    │
│  "1. Juan"                                                  │
│  "2. Pedro"                                                 │
│                              ↓                               │
│  Cliente selecciona número → staffId asignado               │
│                              ↓                               │
│  "Califica del 1 al 5"                                      │
│                              ↓                               │
│  Cliente responde 5 → rating asignado                      │
│                              ↓                               │
│  "Llevas: [███░░] 3 de 5 para corte gratis"               │
│  "¿Nos dejas una reseña en Google?"                         │
└─────────────────────────────────────────────────────────────┘
```

### Webhook - State Machine (src/app/api/whatsapp/webhook/route.ts)

```typescript
export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // 1. Identificar usuario por instanceName
  const instanceName = body.instance;
  const barberOwner = await prisma.user.findFirst({
    where: { evolutionInstance: instanceName, hasBarberia: true },
  });

  // 2. Buscar o crear cliente
  let customer = await prisma.barberCustomer.findUnique({
    where: { userId_whatsapp: { userId: barberOwner.id, whatsapp: number } },
  });

  if (!customer) {
    customer = await prisma.barberCustomer.create({
      data: {
        userId: barberOwner.id,
        whatsapp: number,
        name: pushName || null,
        cutsCount: 2, // Head Start!
      },
    });
  }

  // 3. State Machine: verificar si hay flujo activo
  const incompleteCut = await prisma.barberCut.findFirst({
    where: {
      userId: barberOwner.id,
      customerId: customer.id,
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // 5 mins
      OR: [{ staffId: null }, { rating: null }],
    },
  });

  // 3A. FLOW: Solicitar Staff
  if (incompleteCut && !incompleteCut.staffId) {
    const staffList = await prisma.barberStaff.findMany({ where: { userId: barberOwner.id } });
    const selectedStaff = staffList[parseInt(messageText) - 1];
    
    await prisma.barberCut.update({
      where: { id: incompleteCut.id },
      data: { staffId: selectedStaff.id },
    });

    await sendWhatsAppMessage(instanceName, number,
      `¡Perfecto! Califica la atención de *${selectedStaff.name}* del 1 al 5...`
    );
    return;
  }

  // 3B. FLOW: Solicitar Rating
  if (incompleteCut && incompleteCut.rating === null) {
    const rating = parseInt(messageText);
    
    await prisma.barberCut.update({ where: { id: incompleteCut.id }, data: { rating } });
    
    const updatedCustomer = await prisma.barberCustomer.update({
      where: { id: customer.id },
      data: { cutsCount: { increment: 1 }, lastVisit: new Date() },
    });

    // Calcular progreso del cliente
    const targetCuts = barberOwner.barberRequiredCuts || 5;
    const currentCount = updatedCustomer.cutsCount % targetCuts;

    // Enviar mensaje con progress bar
    await sendWhatsAppMessage(instanceName, number, `Llevas: [███░░] ${currentCount}/${targetCuts}...`);

    // Solicitar Google Review si rating >= 4
    if (rating >= 4 && !customer.hasReviewed && barberOwner.barberGoogleMapsUrl) {
      await sendWhatsAppMessage(instanceName, number, `¿Nos ayudarías con una reseña en Google?\n${barberOwner.barberGoogleMapsUrl}`);
    }
    return;
  }

  // 4. FLOW PRINCIPAL: Validar código
  const codeObj = await prisma.barberCode.findFirst({
    where: { userId: barberOwner.id, code: messageText.toUpperCase(), isUsed: false },
  });

  if (codeObj) {
    // Marcar código usado
    await prisma.barberCode.update({ where: { id: codeObj.id }, data: { isUsed: true } });

    // Crear corte pendiente
    await prisma.barberCut.create({
      data: { userId: barberOwner.id, customerId: customer.id, codeUsed: codeObj.code },
    });

    // Generar nuevo código automáticamente
    const nextCode = generateRandomCode();
    await prisma.barberCode.create({ data: { userId: barberOwner.id, code: nextCode } });

    // Solicitar staff
    const staffList = await prisma.barberStaff.findMany({ where: { userId: barberOwner.id } });
    await sendWhatsAppMessage(instanceName, number, "¡Código validado! ¿Quién te atendió?\n1. Juan\n2. Pedro...");
  }
}
```

---

## 4. Sistema de Staff (Peluqueros)

### Endpoints API

**GET /api/barberia** → Lista staff
```typescript
const staff = await prisma.barberStaff.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: "desc" },
});
```

**POST /api/barberia { action: "addStaff", name: "Juan" }**
```typescript
if (action === "addStaff") {
  const newStaff = await prisma.barberStaff.create({
    data: { userId: user.id, name: name.trim() },
  });
  return NextResponse.json({ success: true, staff: newStaff });
}
```

**DELETE /api/barberia?staffId=xxx**
```typescript
await prisma.barberStaff.delete({ where: { id: staffId } });
```

---

## 5. Generación de Códigos

```typescript
// Función para generar código aleatorio de 4 caracteres
const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sin O, 0, 1, I
let code = "";
for (let i = 0; i < 4; i++) {
  code += chars.charAt(Math.floor(Math.random() * chars.length));
}

// Crear código en DB
await prisma.barberCode.create({
  data: { userId: user.id, code },
});

// Invalidar códigos anteriores no usados
await prisma.barberCode.updateMany({
  where: { userId: user.id, isUsed: false },
  data: { isUsed: true },
});
```

---

## 6. Flujo de Reseñas de Google

**Activado cuando:**
- Rating >= 4 estrellas
- Cliente aún no ha dejado reseña (`hasReviewed: false`)
- Barbero tiene `barberGoogleMapsUrl` configurado

```typescript
// En webhook, después de calificar
if (rating >= 4 && !customer.hasReviewed && barberOwner.barberGoogleMapsUrl) {
  const reviewMsg = `¿Nos ayudarías con una reseña en Google?
👉 ${barberOwner.barberGoogleMapsUrl}
⏳ ¡Vence en 48 horas!`;
  
  await sendWhatsAppMessage(instanceName, whatsappNumber, reviewMsg);
}
```

---

## 7. Automatizaciones (CRON Jobs)

### barber-automations/route.ts

```typescript
// Busca usuarios con barbería activa
const users = await prisma.user.findMany({
  where: { hasBarberia: true, isActive: true, evolutionInstance: { not: null } },
});

// Por cada usuario, buscar clientes inactivos (>30 días)
const inactiveCustomers = await prisma.barberCustomer.findMany({
  where: {
    userId: user.id,
    lastVisit: { lt: thirtyDaysAgo },
  },
});

// Enviar recordatorio por WhatsApp
const msg = `¡Hola ${customer.name}! Te extrañamos en ${bizName}. Han pasado ${daysSince} días...`;
await sendWhatsAppMessage(user.evolutionInstance, customer.whatsapp, msg);
```

### barber-reviews/route.ts

```typescript
// 2 horas después del corte → solicitar reseña
const msg = `¿Cómo estuvo tu experiencia en ${bizName}? Califica del 1 al 5...`;
await sendWhatsAppMessage(customer.user.evolutionInstance, customer.whatsapp, msg);
```

---

## 8. Premium Analytics

**Endpoint:** `GET /api/barberia/premium` (requiere `hasBarberiaPremium: true`)

### Secciones

| Sección | Datos |
|---------|-------|
| **reputation** | Rating promedio, distribución estrellas, evolución semanal, ranking staff |
| **intelligence** | Cortes por hora/día, hora pico, mejor día, tendencia semanal, predicción, retención |
| **automations** | Clientes inactivos, cumpleaños próximos, horas de baja demanda |

### Endpoints de Acciones (POST /api/barberia/premium)

| Action | Descripción |
|--------|-------------|
| `remindInactive` | Enviar recordatorio a cliente inactivo |
| `sendBirthday` | Enviar mensaje de cumpleaños |
| `sendPromo` | Enviar promoción en hora de baja demanda |

---

## 9. AI Manager

**Endpoint:** `POST /api/barberia/ai` (requiere `hasBarberiaPremium: true`)

**Funcionamiento:** Pattern matching en español

```typescript
// Pregunta: "¿Cómo estuvo esta semana?"
if (q.includes("semana") || q.includes("resumen")) {
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - 7);
  
  const weekCuts = await prisma.barberCut.count({
    where: { userId: user.id, createdAt: { gte: weekStart } },
  });
  
  return NextResponse.json({
    answer: `📊 Resumen Semanal\n\n✂️ Cortes: ${weekCuts}...`,
  });
}
```

**Patrones soportados:**
- "¿Cómo estuvo esta semana?" → Resumen semanal
- "¿Quién fue mi mejor peluquero?" → Ranking staff
- "¿Qué clientes dejaron de venir?" → Inactivos
- "¿Cuál fue mi mejor día?" → Estadísticas

---

## 10. Archivos Clave

| Archivo | Función |
|---------|---------|
| `src/lib/evolution.ts` | Wrapper de Evolution API |
| `src/app/api/whatsapp/route.ts` | Conexión/desconexión WhatsApp |
| `src/app/api/whatsapp/webhook/route.ts` | Recibe mensajes, state machine |
| `src/app/api/barberia/route.ts` | Dashboard, CRUD staff, códigos |
| `src/app/api/barberia/premium/route.ts` | Analytics premium |
| `src/app/api/barberia/ai/route.ts` | Chat AI con pattern matching |
| `src/app/api/cron/barber-automations/route.ts` | Recordatorios inactivos |
| `src/app/api/cron/barber-reviews/route.ts` | Solicitud de reseñas 2h después |
| `src/app/(user)/app/barberia/page.tsx` | Dashboard UI |
| `src/app/(user)/app/barberia/premium/page.tsx` | Premium UI |
| `src/app/(public)/barberos/page.tsx` | Landing page |

---

## 11. Variables de Entorno

```env
EVOLUTION_API_URL=http://178.238.238.158:8080
EVOLUTION_API_KEY=tu_api_key_aqui
DATABASE_URL=mysql://usuario:password@host:3306/base_de_datos
```

---

## 12. Diagrama de Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Barbero       │     │   Next.js App    │     │  Evolution API  │
│   Dashboard     │────▶│   (BarberOS)     │────▶│  (WhatsApp)     │
│                 │     │                  │     │                 │
│  - Genera код   │     │  - Prisma DB     │     │  - Instancias   │
│  - Ve stats     │     │  - API Routes    │     │  - QR Code      │
│  - Agrega staff │     │  - Webhook       │     │  - Webhook      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                              │
                              ▼
                        ┌──────────────────┐
                        │   MySQL DB       │
                        │                  │
                        │  - Users         │
                        │  - BarberStaff   │
                        │  - BarberCustomer│
                        │  - BarberCut     │
                        │  - BarberCode    │
                        │  - BarberReview  │
                        └──────────────────┘
```
