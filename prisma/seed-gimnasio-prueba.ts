// prisma/seed-gimnasio-prueba.ts
// Seed dedicado para "Gimnasio Prueba" — datos de prueba realistas.
// NO reemplaza al seed principal. Se ejecuta con: `npx tsx prisma/seed-gimnasio-prueba.ts`
//
// IMPORTANTE: este script es IDEMPOTENTE.
// Si la barbería "Gimnasio Prueba" ya existe, NO la borra — solo agrega clientes
// y visitas que falten. Para reiniciar los datos, hay que borrarlos manualmente
// (o usar el flag --reset al final del comando).
//
// Lo que crea:
// - 1 barbería "Gimnasio Prueba" (si no existe)
// - 3 barberos (1 dueño + 2 staff)
// - 18 clientes con perfiles y visitas distribuidas en los últimos 60 días
// - Mezcla de: clientes frecuentes (4-8 cortes), regulares (2-3), nuevos (0-1),
//   en riesgo (sin venir hace 35-50 días), ganadores de premio
// - MotorContext calculado para cada perfil
// - MotorSnapshot del día

import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Cargar .env desde la raíz del proyecto (tsx no lo hace automático como Next.js)
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set (revisa que .env exista en la raíz)");
}

const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

// ── Helpers ────────────────────────────────────────────────────────

/** Fecha aleatoria en los últimos N días */
function daysAgo(maxDays: number, minDays = 0): Date {
  const now = new Date();
  const offset = Math.floor(Math.random() * (maxDays - minDays)) + minDays;
  const d = new Date(now);
  d.setDate(d.getDate() - offset);
  return d;
}

/** Fecha a una hora específica del día */
function atHour(daysAgoDate: Date, hour: number): Date {
  const d = new Date(daysAgoDate);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d;
}

/** Nombres ecuatorianos/latinos realistas */
const NOMBRES = [
  "Carlos Mendoza", "Andrés López", "María Pérez", "Diego Ramírez",
  "Lucía Torres", "Sebastián Vega", "Valentina Castro", "Mateo Ríos",
  "Camila Salazar", "Joaquín Ortega", "Isabella Navarrete", "Tomás Brito",
  "Sofía Calderón", "Nicolás Pazmiño", "Daniela Aguirre", "Emilio Cevallos",
  "Renata Jaramillo", "Iván Quishpe",
];

/** Comentarios realistas de barberos */
const COMENTARIOS_POSITIVOS = [
  "Cliente muy puntual, recomienda servicios a amigos.",
  "Viene siempre con buena actitud. Le gusta el corte clásico.",
  "Excelente trato. Pide el mismo barbero siempre.",
  "Fiel al local desde hace años. Muy respetuoso.",
  "Le gusta conversar mientras espera. Cliente VIP.",
];
const COMENTARIOS_NEUTRALES = [
  "Viene de vez en cuando. Sin preferencias claras.",
  "Cliente nuevo, todavía evaluando.",
];
const COMENTARIOS_NEGATIVOS = [
  "Tuvo una mala experiencia con la espera — volver a contactarlo.",
  "Última vez se quejó del precio. Ofrecerle promo de reactivación.",
];

/** Servicios típicos de barbería */
const SERVICIOS = ["corte", "barba", "corte+barba", "corte+ninos", "diseno"];

// ── Programa principal ────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const reset = args.includes("--reset");

  console.log("🏋️ Gimnasio Prueba — Seed de datos realistas\n");

  // 1. Buscar o crear la barbería
  let barbershop = await prisma.barbershop.findFirst({
    where: { name: "Gimnasio Prueba" },
  });

  if (barbershop && reset) {
    console.log("🧹 --reset detectado: limpiando datos del Gimnasio Prueba...");
    await prisma.profileMotorContext.deleteMany({ where: { barbershopId: barbershop.id } });
    await prisma.barberVisit.deleteMany({ where: { barbershopId: barbershop.id } });
    await prisma.customerProfile.deleteMany({ where: { barbershopId: barbershop.id } });
    await prisma.barberCustomer.deleteMany({ where: { barbershopId: barbershop.id } });
    await prisma.barberStaff.deleteMany({ where: { barbershopId: barbershop.id } });
    await prisma.motorSnapshot.deleteMany({ where: { barbershopId: barbershop.id } });
    await prisma.barbershop.delete({ where: { id: barbershop.id } });
    barbershop = null;
  }

  if (!barbershop) {
    console.log("🏪 Creando barbería 'Gimnasio Prueba'...");
    barbershop = await prisma.barbershop.create({
      data: {
        name: "Gimnasio Prueba",
        whatsappNumber: `gimnasio${Date.now()}`, // único, no choca con el principal
        evolutionInstance: process.env.EVOLUTION_INSTANCE || "Automatizotunegocio",
        evolutionApiKey: process.env.EVOLUTION_API_KEY || "",
        requiredCuts: 5,
        googleMapsUrl: "https://g.page/gimnasio-prueba",
        planStatus: "TRIAL",
        planType: "PREMIUM",
        connectionStatus: "CONNECTED",
        loginPin: "999111",
        currentBoxCode: "GP77",
        businessInfo:
          "Gimnasio de barrio con barbería interna. Atendemos de 8am a 8pm. Equipo de 3 personas.",
      },
    });
    console.log(`   ✓ Creada: ${barbershop.name} (PIN: ${barbershop.loginPin})`);
  } else {
    console.log(`🏪 Barbería existente: ${barbershop.name} (PIN: ${barbershop.loginPin})`);
  }

  // 2. Crear staff (dueño + 2 barberos) si no existen
  const existingStaff = await prisma.barberStaff.count({
    where: { barbershopId: barbershop.id },
  });

  if (existingStaff === 0) {
    console.log("👥 Creando equipo (1 dueño + 2 barberos)...");
    await prisma.barberStaff.createMany({
      data: [
        { barbershopId: barbershop.id, name: "Roberto Sánchez", role: "OWNER" },
        { barbershopId: barbershop.id, name: "Luis Pérez", role: "BARBER" },
        { barbershopId: barbershop.id, name: "Miguel Torres", role: "BARBER" },
      ],
    });
  } else {
    console.log(`👥 Equipo ya existente (${existingStaff} miembros)`);
  }

  const staffList = await prisma.barberStaff.findMany({
    where: { barbershopId: barbershop.id },
  });

  // 3. Verificar si ya hay clientes — si los hay y no es --reset, salir
  const existingCustomers = await prisma.barberCustomer.count({
    where: { barbershopId: barbershop.id },
  });

  if (existingCustomers > 0 && !reset) {
    console.log(
      `\n⚠️  Ya hay ${existingCustomers} clientes. Usa --reset para reiniciar.`
    );
    console.log(`   Comando: npx tsx prisma/seed-gimnasio-prueba.ts --reset\n`);
    await prisma.$disconnect();
    return;
  }

  // 4. Crear 18 clientes con perfiles y visitas
  console.log("👤 Creando 18 clientes con perfiles y visitas...\n");

  // Definir el "tipo" de cada cliente para que los datos cuenten una historia
  type ClienteTipo = "frecuente" | "regular" | "nuevo" | "riesgo" | "ganador";
  const clientesPlan: { nombre: string; tipo: ClienteTipo }[] = [
    { nombre: NOMBRES[0], tipo: "frecuente" }, // Carlos Mendoza
    { nombre: NOMBRES[1], tipo: "frecuente" }, // Andrés López
    { nombre: NOMBRES[2], tipo: "frecuente" }, // María Pérez
    { nombre: NOMBRES[3], tipo: "frecuente" }, // Diego Ramírez
    { nombre: NOMBRES[4], tipo: "frecuente" }, // Lucía Torres
    { nombre: NOMBRES[5], tipo: "regular" },   // Sebastián Vega
    { nombre: NOMBRES[6], tipo: "regular" },   // Valentina Castro
    { nombre: NOMBRES[7], tipo: "regular" },   // Mateo Ríos
    { nombre: NOMBRES[8], tipo: "regular" },   // Camila Salazar
    { nombre: NOMBRES[9], tipo: "regular" },   // Joaquín Ortega
    { nombre: NOMBRES[10], tipo: "nuevo" },    // Isabella Navarrete
    { nombre: NOMBRES[11], tipo: "nuevo" },    // Tomás Brito
    { nombre: NOMBRES[12], tipo: "nuevo" },    // Sofía Calderón
    { nombre: NOMBRES[13], tipo: "nuevo" },    // Nicolás Pazmiño
    { nombre: NOMBRES[14], tipo: "riesgo" },   // Daniela Aguirre
    { nombre: NOMBRES[15], tipo: "riesgo" },   // Emilio Cevallos
    { nombre: NOMBRES[16], tipo: "ganador" },  // Renata Jaramillo
    { nombre: NOMBRES[17], tipo: "ganador" },  // Iván Quishpe
  ];

  let contadorCortesTotales = 0;

  for (let i = 0; i < clientesPlan.length; i++) {
    const { nombre, tipo } = clientesPlan[i];
    const whatsapp = `5939${String(1000000 + i * 137).padStart(7, "0")}`;

    // Crear BarberCustomer (cuenta)
    const customer = await prisma.barberCustomer.create({
      data: {
        barbershopId: barbershop.id,
        whatsapp,
        name: nombre,
        sessionState: "IDLE",
      },
    });

    // Crear perfil (1:1 con la cuenta, modo BY_PROFILE)
    const profile = await prisma.customerProfile.create({
      data: {
        customerId: customer.id,
        barbershopId: barbershop.id,
        name: nombre,
        cutsCount: 0, // se actualiza abajo
        isActive: true,
      },
    });

    // Definir cantidad y distribución de visitas según tipo
    let numVisitas = 0;
    let ultimaVisita: Date | null = null;
    const visitasParaCrear: Array<{
      fecha: Date;
      rating: number;
      comment: string | null;
    }> = [];

    if (tipo === "frecuente") {
      // 6-8 visitas en últimos 60 días, una cada ~9 días
      numVisitas = 6 + Math.floor(Math.random() * 3);
      let fechaCursor = daysAgo(7);
      for (let v = 0; v < numVisitas; v++) {
        const rating = 4 + Math.floor(Math.random() * 2); // 4 o 5
        const comment =
          Math.random() > 0.3
            ? COMENTARIOS_POSITIVOS[Math.floor(Math.random() * COMENTARIOS_POSITIVOS.length)]
            : null;
        visitasParaCrear.push({ fecha: fechaCursor, rating, comment });
        fechaCursor = daysAgo(7 + v * 9);
      }
    } else if (tipo === "regular") {
      // 2-4 visitas
      numVisitas = 2 + Math.floor(Math.random() * 3);
      let fechaCursor = daysAgo(14);
      for (let v = 0; v < numVisitas; v++) {
        const rating = 3 + Math.floor(Math.random() * 3); // 3-5
        const comment =
          Math.random() > 0.5
            ? COMENTARIOS_NEUTRALES[Math.floor(Math.random() * COMENTARIOS_NEUTRALES.length)]
            : null;
        visitasParaCrear.push({ fecha: fechaCursor, rating, comment });
        fechaCursor = daysAgo(14 + v * 18);
      }
    } else if (tipo === "nuevo") {
      // 0-1 visitas
      numVisitas = Math.random() > 0.5 ? 1 : 0;
      if (numVisitas === 1) {
        const rating = 4 + Math.floor(Math.random() * 2);
        visitasParaCrear.push({
          fecha: daysAgo(5),
          rating,
          comment: null,
        });
      }
    } else if (tipo === "riesgo") {
      // 1-2 visitas, la última hace 35-50 días (ya no viene)
      numVisitas = 1 + Math.floor(Math.random() * 2);
      const diasUltima = 35 + Math.floor(Math.random() * 16);
      visitasParaCrear.push({
        fecha: daysAgo(diasUltima),
        rating: 2 + Math.floor(Math.random() * 3), // 2-4
        comment:
          Math.random() > 0.5
            ? COMENTARIOS_NEGATIVOS[Math.floor(Math.random() * COMENTARIOS_NEGATIVOS.length)]
            : null,
      });
      if (numVisitas === 2) {
        visitasParaCrear.push({
          fecha: daysAgo(diasUltima + 12),
          rating: 3,
          comment: null,
        });
      }
    } else if (tipo === "ganador") {
      // 5+ visitas, ya cobró premio, viene seguido
      numVisitas = 5 + Math.floor(Math.random() * 3);
      let fechaCursor = daysAgo(4);
      for (let v = 0; v < numVisitas; v++) {
        const rating = 5;
        const comment = "Cliente que ya cobró su premio — sigue viniendo.";
        visitasParaCrear.push({ fecha: fechaCursor, rating, comment });
        fechaCursor = daysAgo(4 + v * 10);
      }
    }

    // Ordenar visitas cronológicamente
    visitasParaCrear.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());

    // Crear visitas en BD
    for (const v of visitasParaCrear) {
      const staff = staffList[Math.floor(Math.random() * staffList.length)];
      const hora = 8 + Math.floor(Math.random() * 12); // 8am-8pm
      const services = JSON.stringify([
        SERVICIOS[Math.floor(Math.random() * SERVICIOS.length)],
      ]);

      await prisma.barberVisit.create({
        data: {
          customerId: customer.id,
          barbershopId: barbershop.id,
          profileId: profile.id,
          staffId: staff.id,
          rating: v.rating,
          comment: v.comment,
          status: "APPROVED",
          checkinMethod: "SELF",
          services,
          visitHour: hora,
          createdAt: atHour(v.fecha, hora),
        },
      });
    }

    // Actualizar cutsCount y lastVisitAt en el perfil y la cuenta
    if (visitasParaCrear.length > 0) {
      ultimaVisita = visitasParaCrear[visitasParaCrear.length - 1].fecha;
      await prisma.customerProfile.update({
        where: { id: profile.id },
        data: { cutsCount: visitasParaCrear.length },
      });
      await prisma.barberCustomer.update({
        where: { id: customer.id },
        data: {
          cutsCount: visitasParaCrear.length,
          lastVisitAt: ultimaVisita,
        },
      });
    }

    contadorCortesTotales += visitasParaCrear.length;

    // Calcular ProfileMotorContext para este perfil
    const avgDays =
      visitasParaCrear.length > 1
        ? Math.round(
            (visitasParaCrear[visitasParaCrear.length - 1].fecha.getTime() -
              visitasParaCrear[0].fecha.getTime()) /
              (1000 * 60 * 60 * 24 * (visitasParaCrear.length - 1))
          )
        : null;

    const daysSinceLast =
      ultimaVisita
        ? Math.floor(
            (Date.now() - ultimaVisita.getTime()) / (1000 * 60 * 60 * 24)
          )
        : null;

    let riskLevel: "NORMAL" | "DELAYED" | "AT_RISK" | "INSUFFICIENT_DATA" =
      "INSUFFICIENT_DATA";

    if (avgDays !== null && daysSinceLast !== null) {
      if (daysSinceLast <= avgDays * 0.8) riskLevel = "NORMAL";
      else if (daysSinceLast <= avgDays * 1.2) riskLevel = "DELAYED";
      else riskLevel = "AT_RISK";
    } else if (daysSinceLast !== null && daysSinceLast > 30) {
      riskLevel = "AT_RISK";
    }

    await prisma.profileMotorContext.create({
      data: {
        profileId: profile.id,
        barbershopId: barbershop.id,
        avgDaysBetweenVisits: avgDays,
        daysSinceLastVisit: daysSinceLast,
        riskLevel,
        totalVisits: visitasParaCrear.length,
        calculatedAt: new Date(),
      },
    });

    const riskEmoji =
      riskLevel === "NORMAL"
        ? "✓"
        : riskLevel === "DELAYED"
          ? "⚠"
          : riskLevel === "AT_RISK"
            ? "✗"
            : "?";

    console.log(
      `   ${riskEmoji} ${nombre.padEnd(22)} [${tipo.padEnd(9)}] ${visitasParaCrear.length} visitas, riesgo: ${riskLevel}`
    );
  }

  // 5. Crear MotorSnapshot del día
  console.log("\n📊 Calculando MotorSnapshot del día...");

  const profilesByRisk = await prisma.profileMotorContext.groupBy({
    by: ["riskLevel"],
    where: { barbershopId: barbershop.id },
    _count: { _all: true },
  });

  const visitsByHour: Record<string, number> = {};
  const visits = await prisma.barberVisit.findMany({
    where: { barbershopId: barbershop.id, status: "APPROVED" },
    select: { visitHour: true },
  });
  visits.forEach((v) => {
    if (v.visitHour !== null) {
      visitsByHour[String(v.visitHour)] = (visitsByHour[String(v.visitHour)] || 0) + 1;
    }
  });

  // Métricas por barbero
  const staffMetrics = await Promise.all(
    staffList.map(async (s) => {
      const staffVisits = await prisma.barberVisit.findMany({
        where: {
          barbershopId: barbershop.id,
          staffId: s.id,
          status: "APPROVED",
          rating: { not: null },
        },
        select: { rating: true },
      });
      const totalVisits = await prisma.barberVisit.count({
        where: { barbershopId: barbershop.id, staffId: s.id, status: "APPROVED" },
      });
      const avgRating =
        staffVisits.length > 0
          ? staffVisits.reduce((acc, v) => acc + (v.rating || 0), 0) /
            staffVisits.length
          : 0;
      return {
        staffId: s.id,
        name: s.name,
        avgRating: Math.round(avgRating * 10) / 10,
        totalRated: staffVisits.length,
        totalVisits,
      };
    })
  );

  const counts = {
    NORMAL: 0,
    DELAYED: 0,
    AT_RISK: 0,
    INSUFFICIENT_DATA: 0,
  };
  profilesByRisk.forEach((p) => {
    counts[p.riskLevel as keyof typeof counts] = p._count._all;
  });

  const snapshotData = {
    barbershopId: barbershop.id,
    totalVisitsApproved: visits.length,
    totalAnonymousVisits: 0,
    visitsByHour: JSON.stringify(visitsByHour),
    profilesNormal: counts.NORMAL,
    profilesDelayed: counts.DELAYED,
    profilesAtRisk: counts.AT_RISK,
    profilesInsufficient: counts.INSUFFICIENT_DATA,
    staffMetrics: JSON.stringify(staffMetrics),
  };

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const existingSnapshot = await prisma.motorSnapshot.findFirst({
    where: { barbershopId: barbershop.id, snapshotDate: todayStart },
  });

  if (existingSnapshot) {
    await prisma.motorSnapshot.update({
      where: { id: existingSnapshot.id },
      data: { ...snapshotData, calculatedAt: new Date() },
    });
  } else {
    await prisma.motorSnapshot.create({
      data: { ...snapshotData, snapshotDate: todayStart },
    });
  }

  console.log(`   ✓ Snapshot guardado`);

  // 6. Resumen final
  console.log("\n" + "═".repeat(60));
  console.log("✅ SEED COMPLETADO");
  console.log("═".repeat(60));
  console.log(`   Barbería:        ${barbershop.name}`);
  console.log(`   PIN de acceso:   ${barbershop.loginPin}`);
  console.log(`   Box code activo: ${barbershop.currentBoxCode}`);
  console.log(`   Equipo:          ${staffList.length} personas`);
  console.log(`   Clientes:        ${clientesPlan.length}`);
  console.log(`   Visitas totales: ${contadorCortesTotales}`);
  console.log(
    `   Riesgo:          ${counts.NORMAL} normales · ${counts.DELAYED} delayed · ${counts.AT_RISK} en riesgo · ${counts.INSUFFICIENT_DATA} sin datos`
  );
  console.log(`\n   📱 Para entrar al panel: usa PIN ${barbershop.loginPin}`);
  console.log(`   🔗 URL: /login\n`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });