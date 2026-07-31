const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shops = await prisma.barbershop.findMany({
    where: {
      whatsappNumber: {
        contains: '593967491847',
      },
    },
  });
  console.log('Barberías encontradas:', shops);
}

main().finally(() => prisma.$disconnect());
