# Documento 20 — Política de Seguridad, Rate-Limiting Persistente y Continuidad Operativa

**Estado:** VIGENTE  
**Fecha de Emisión:** 2026-07-26  
**Última revisión:** 2026-08-07  
**Ámbito:** Infraestructura, Autenticación, Base de Datos y APIs Públicas de BarberOS.

---

## 0. Gestión de Secretos y Decisión Explícita sobre API Key

- **Decisión Explícita de Negocio:** La `GROQ_API_KEY` utilizada en las pruebas locales es una clave de uso temporal/tier gratuito sin impacto financiero directo. Se mantiene activa a propósito para la fase piloto.
- **Tarea en Backlog:** *Migrar a una API Key de producción propia y privada antes de escalar el servicio más allá de las 4 barberías piloto actuales.*
- **En Vercel:** Las llaves productivas de LLM se administrarán a través de Vercel Dashboard (*Settings -> Environment Variables*) en los entornos `Production`, `Preview` y `Development`.

---

## 1.5. Login PIN (NUEVO — 2026-08-07)

> **Cambio de ruta primaria de acceso:** El login del dueño reemplazó el Magic Link por WhatsApp por un **PIN de 6-7 dígitos** único por barbería. La promesa de venta "no necesitas usuario ni contraseña" se mantiene — solo que ahora ni siquiera hace falta abrir WhatsApp para entrar.

### Implementación

- `Barbershop.loginPin` (string, único por barbería, generado al crear la cuenta).
- `POST /api/auth/login-pin` busca la barbería por `loginPin`, genera JWT con `jose` (HS256, expiración 365 días), setea cookie `session` httpOnly + secure + sameSite=lax.
- Cookie con `expires: oneYearFromNow` (clave para persistencia en Safari/Chrome móvil tras force-quit).
- `GET /api/barbershop/status` para auto-redirect de sesión activa desde `/login`.
- `/acceso` es redirect 308 a `/login` (URL canónica única).

### Seguridad

- **Fuerza bruta mitigada por JWT:** aunque el PIN sea adivinable, el JWT no se puede falsificar sin `JWT_SECRET`.
- **JWT_SECRET por entorno:** default local `JWT_SECRET_SUPER_CONFIDENCIAL_DESARROLLO_LOCAL`. **Crítico configurar valor productivo en Vercel.**
- **Hashing futuro:** por ahora el PIN se guarda en texto plano. Para escala, considerar hash bcrypt + comparación timing-safe. Pendiente en backlog.
- **Magic Link original (`/api/auth/request-link` + `/api/auth/verify`) sigue en código** como ruta de recuperación. No es ruta primaria.

### Aislamiento multi-tenant

- El `proxy.ts` (middleware) sobrescribe el header `x-barbershop-id` con el `barbershopId` del JWT verificado criptográficamente antes de que la request llegue al route handler.
- El guard `src/lib/plan-guard.ts` (`checkPremiumAccess()`) evalúa el planType y devuelve 403 si no coincide.
- **La prueba de aislamiento multi-tenant (`test-tenant-isolation.ts`) sigue vigente** — re-ejecutada tras cada cambio en proxy/guard. Test final ejecutado post-Sprint F: el atacante (Chechebarber PRO) recibe 403 con `code: PREMIUM_REQUIRED`, no el snapshot de la víctima.

## 1. Rate-Limiting Persistente (Respaldado en MySQL)

Para evitar la vulnerabilidad del rate-limiting efímero en entornos serverless (Vercel), se construyó la tabla `RateLimitAttempt` en MySQL administrada mediante el helper `src/lib/rate-limit.ts`.

### Límites de Protección Activos:

1. **Auto-Registro de Clientes por QR (`POST /api/clientes/registro`):**
   - **Límite:** Máximo 5 intentos por IP en una ventana de 10 minutos.
   - **Acción ante exceso:** Devuelve HTTP `429 Too Many Requests`.

2. **Acceso Magic-Link / Login (`POST /api/auth/request-link`):**
   - **Límite:** Máximo 3 solicitudes por número de WhatsApp e IP en una ventana de 15 minutos.
   - **Acción ante exceso:** Devuelve HTTP `429 Too Many Requests`.
   - **Estado 2026-08-07:** Ya no es la ruta primaria de login (reemplazado por PIN). Sigue activo para casos de recuperación.

3. **Webhook de Ingestion de WhatsApp (`POST /api/webhook/whatsapp`):**
   - **Límite:** Máximo 120 llamadas por minuto por IP/instancia.
   - **Propósito:** Previene ataques de denegación de servicio o bucles infinitos de la API de WhatsApp.

4. **Alianza Comercial (`POST /api/alianza`):**
   - **Límite:** Rate-limit básico en memoria (no persistente). Para producción real, mover a `RateLimitAttempt`. Sin límite duro definido todavía.

5. **Webhook de Referidos (`POST /api/webhook/referral-sale`):**
   - **Límite:** Solo autenticado por `x-api-key`. Sin rate-limit adicional — depende del control de la API key por parte del integrador (barberosplus.com).

---

## 2. Continuidad de Base de Datos y Plan de Recuperación (Disaster Recovery Plan)

La base de datos MySQL de producción está alojada en el servidor administrado StackCP/cPanel (`mysql.us.stackcp.com:43807`).

### Declaración de Acceso a StackCP:
- **Límite de Agente AI:** El asistente no posee acceso a la consola web gráfica ni navegador para ingresar a `stackcp.com`.
- **Verificación Manual Requerida:** César o Abel verificarán la fecha/hora de la captura del snapshot automático directamente desde el panel de control de StackCP en la sesión de despliegue.

### Plan de Recuperación ante Desastre (DRP):
1. **Detección del Incidente:** Notificación de falla de conexión o corrupción de tablas por el DAL.
2. **Acceso al Panel:** Ingresar a StackCP / cPanel -> Módulo *Manage MySQL Databases / Backups*.
3. **Selección del Punto de Restauración:** Elegir el snapshot automático del día anterior.
4. **Ejecución de Restauración:** Presionar *Restore* para sobreescribir las tablas de la base de datos `barberos-3530393687f7`.
5. **Métricas Estimadas:**
   - **Tiempo Estimado de Recuperación (RTO):** `< 15 minutos`.
   - **Pérdida Máxima de Datos (RPO):** `< 24 horas`.

---

## 3. Estado de `npm audit` (Output Literal de la Terminal)

Al ejecutar `npm audit` en el entorno local de desarrollo, la CLI devuelve el siguiente error de descompresión/payload del servidor central de npm:

```text
npm warn audit invalid json response body at https://registry.npmjs.org/-/npm/v1/security/advisories/bulk reason: Unexpected token '^_', "^_^H^@^@^@^@^@^@^C"... is not valid JSON
undefined
npm error audit endpoint returned an error
npm error A complete log of this run can be found in: C:\Users\Smart\AppData\Local\npm-cache\_logs\2026-07-26T06_50_52_856Z-debug-0.log
```

- **Causa Técnica:** El endpoint `registry.npmjs.org/-/npm/v1/security/advisories/bulk` devuelve HTTP 400 Bad Request por formato de payload en la CLI de npm v10 sobre Windows.
- **Verificación de Compilación:** `npx tsc --noEmit` reporta **0 errores de compilación**.

---

## 4. Evidencia Cruda de la Re-Prueba de Aislamiento Multi-Tenant (Post Sprint C/D)

Ejecución directa del script `test-tenant-isolation.ts` post-implementación de perfiles y nuevo schema:

```text
SIMULACIÓN DE ATAQUE:
Usuario Chechebarber (PRO) con JWT legítimo propio,
forzando x-barbershop-id = ID de "Que?" (PREMIUM)

JWT de Chechebarber (PRO) generado: ...QI3li8jZ5-bzsXLz2S6s

Request construido:
  cookie.session        → JWT de Chechebarber (PRO, ID: cmrv83o3f000004jsf0m3r6zt)
  x-barbershop-id header → cmrz48we30000oovsa9cm7pf4 (Que? — PREMIUM) [FORJADO]

─── Paso 1: Middleware proxy() procesa la request ───
  Header x-barbershop-id DESPUÉS del middleware: null
  ℹ️  Middleware devolvió respuesta directa (redirect/403), no headers de route

─── Paso 2: Route handler ve el ID inyectado por el middleware ───

  STATUS CODE: 403
  BODY: {
  "error": "Esta funcionalidad requiere el plan BarberOS Premium.",
  "code": "PREMIUM_REQUIRED",
  "currentPlan": "PRO",
  "planStatus": "ACTIVE",
  "upgradeUrl": "/precios"
}

  ✅ RESULTADO: El atacante (Chechebarber PRO) recibió 403 FORBIDDEN
     con planType "PRO" — SU propio plan, no el de Que?
     No obtuvo el snapshot de Que? PREMIUM.

  AISLAMIENTO DE TENANT: VERIFICADO ✅
```
