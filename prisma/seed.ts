import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...");

  // Limpiar tablas en orden (por las foreign keys)
  console.log("🧹 Cleaning existing data...");
  await prisma.barberVisit.deleteMany();
  await prisma.barberCustomer.deleteMany();
  await prisma.barberStaff.deleteMany();
  await prisma.barbershop.deleteMany();

  // Crear barbería
  console.log("🏪 Creating barbershop...");
  const barbershop = await prisma.barbershop.create({
    data: {
      name: "Barbería Tuneche",
      whatsappNumber: process.env.NOTIFY_WHATSAPP_NUMBER || "593963410409",
      evolutionInstance: process.env.EVOLUTION_INSTANCE || "Automatizotunegocio",
      evolutionApiKey: process.env.EVOLUTION_API_KEY || "42a447c1-3d74-4b52-9571-042c174f7621",
      requiredCuts: 5,
      googleMapsUrl: "https://g.page/tu-barberia",
    },
  });

  console.log(`   Created: ${barbershop.name} (ID: ${barbershop.id})`);

  // Crear staff
  console.log("👥 Creating staff...");
  const owner = await prisma.barberStaff.create({
    data: {
      barbershopId: barbershop.id,
      name: "Carlos (Dueño)",
      role: "OWNER",
    },
  });

  const barber = await prisma.barberStaff.create({
    data: {
      barbershopId: barbershop.id,
      name: "Juan (Barbero)",
      role: "BARBER",
    },
  });

  console.log(`   Created: ${owner.name} (${owner.role})`);
  console.log(`   Created: ${barber.name} (${barber.role})`);

  // Crear clientes de prueba
  console.log("📱 Creating test customers...");
  const customer1 = await prisma.barberCustomer.create({
    data: {
      barbershopId: barbershop.id,
      whatsapp: "593963410409",
      name: "Cliente Frecuente",
      cutsCount: 3,
      sessionState: "IDLE",
    },
  });

  const customer2 = await prisma.barberCustomer.create({
    data: {
      barbershopId: barbershop.id,
      whatsapp: "593999999999",
      name: "Cliente Nuevo",
      cutsCount: 1,
      sessionState: "IDLE",
    },
  });

  const customer3 = await prisma.barberCustomer.create({
    data: {
      barbershopId: barbershop.id,
      whatsapp: "593888888888",
      name: "Cliente Premio",
      cutsCount: 4,
      sessionState: "IDLE",
    },
  });

  console.log(`   Created: ${customer1.name} (${customer1.cutsCount} cortes)`);
  console.log(`   Created: ${customer2.name} (${customer2.cutsCount} cortes)`);
  console.log(`   Created: ${customer3.name} (${customer3.cutsCount} cortes - 1 para premio!)`);

  console.log("\n✅ Seed completed successfully!");
  console.log(`   Barbershop ID: ${barbershop.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
