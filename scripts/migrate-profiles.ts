/**
 * Script de migración: Sprint C (Cuentas a Perfiles)
 *
 * 1. Encuentra todos los BarberCustomer sin perfiles asociados.
 * 2. Crea un CustomerProfile 'Default' para cada uno usando su nombre o "Sin Nombre".
 * 3. Asocia TODAS las visitas de ese BarberCustomer al nuevo CustomerProfile.
 */

import 'dotenv/config';
import { prisma } from '../src/lib/prisma';


async function main() {
  console.log('--- INICIO DE MIGRACIÓN: CUENTAS A PERFILES ---');

  // Conteo ANTES
  const totalVisitsBefore = await prisma.barberVisit.count();
  const visitsWithoutProfileBefore = await prisma.barberVisit.count({
    where: { profileId: null },
  });

  console.log(`[BEFORE] Total Visitas: ${totalVisitsBefore}`);
  console.log(`[BEFORE] Visitas sin profileId: ${visitsWithoutProfileBefore}`);

  // Encontrar clientes (cuentas) que existen
  const customers = await prisma.barberCustomer.findMany({
    include: { profiles: true },
  });

  console.log(`\nClientes encontrados: ${customers.length}`);

  let profilesCreated = 0;
  let visitsUpdated = 0;

  for (const customer of customers) {
    let defaultProfileId: string;

    // Si el cliente no tiene perfiles, creamos uno
    if (customer.profiles.length === 0) {
      const newProfile = await prisma.customerProfile.create({
        data: {
          customerId: customer.id,
          barbershopId: customer.barbershopId,
          name: customer.name || 'Sin Nombre',
          isActive: true,
          cutsCount: customer.cutsCount, // Migramos también el conteo actual
        },
      });
      defaultProfileId = newProfile.id;
      profilesCreated++;

      // Actualizar el cliente para que activeProfileId apunte al nuevo perfil
      await prisma.barberCustomer.update({
        where: { id: customer.id },
        data: { activeProfileId: defaultProfileId },
      });
    } else {
      // Si ya tiene perfil (raro antes de Sprint C, pero por seguridad)
      defaultProfileId = customer.profiles[0].id;
    }

    // Atar las visitas sin profileId de este cliente a su perfil por defecto
    const updated = await prisma.barberVisit.updateMany({
      where: {
        customerId: customer.id,
        profileId: null,
      },
      data: {
        profileId: defaultProfileId,
      },
    });

    visitsUpdated += updated.count;
  }

  console.log(`\n[RESULTADOS] Perfiles creados: ${profilesCreated}`);
  console.log(`[RESULTADOS] Visitas actualizadas con profileId: ${visitsUpdated}`);

  // Conteo DESPUÉS
  const visitsWithoutProfileAfter = await prisma.barberVisit.count({
    where: { profileId: null, customerId: { not: null } }, 
    // Nota: Las visitas CF (customerId: null) también tendrán profileId: null,
    // y eso es correcto porque son anónimas. Nos importan las visitas identificadas.
  });

  const totalAnonymousVisits = await prisma.barberVisit.count({
    where: { customerId: null },
  });

  console.log(`\n[AFTER] Visitas anónimas (CF) sin perfil (Correcto): ${totalAnonymousVisits}`);
  console.log(`[AFTER] Visitas IDENTIFICADAS que siguen sin profileId: ${visitsWithoutProfileAfter}`);

  if (visitsWithoutProfileAfter > 0) {
    console.error(`🚨 ALERTA: Quedaron ${visitsWithoutProfileAfter} visitas identificadas sin migrar.`);
  } else {
    console.log(`✅ ÉXITO: 100% de las visitas identificadas tienen un profileId asignado.`);
  }

  console.log('\n--- FIN DE MIGRACIÓN ---');
}

main()
  .catch((e) => {
    console.error('Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
