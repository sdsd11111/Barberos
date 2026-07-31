import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const shops = await prisma.barbershop.findMany({
    where: {
      whatsappNumber: {
        contains: "967491847",
      },
    },
  });
  console.log("BARBERSHOPS ENCONTRADAS:", JSON.stringify(shops, null, 2));
}

main().finally(() => prisma.$disconnect());
