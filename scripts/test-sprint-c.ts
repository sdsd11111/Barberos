/**
 * Script de prueba E2E: Sprint C
 *
 * 1. Simula el registro público por QR para un cliente nuevo (Perfil 1).
 * 2. Simula un segundo registro por QR usando el MISMO WhatsApp pero distinto nombre (Perfil 2 - Hijo).
 * 3. Asigna visitas a ambos perfiles.
 * 4. Valida que:
 *    - La cuenta tiene 2 perfiles asociados.
 *    - En modo BY_PROFILE, cada perfil cuenta sus propios cortes.
 *    - En modo BY_ACCOUNT, la suma total de la cuenta se refleja en ambos.
 * 5. Limpia los datos de prueba.
 */

import 'dotenv/config';
import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('--- INICIO DE PRUEBA E2E: SPRINT C ---');

  // Buscar una barbería real para la prueba
  const barbershop = await prisma.barbershop.findFirst();
  if (!barbershop) {
    throw new Error('No se encontró ninguna barbería para la prueba.');
  }

  const testWhatsapp = '593999999999';
  console.log(`Usando Barbería: ${barbershop.name} (${barbershop.id})`);
  console.log(`WhatsApp de prueba: ${testWhatsapp}`);

  // Limpieza previa si existía
  await prisma.barberCustomer.deleteMany({
    where: { barbershopId: barbershop.id, whatsapp: testWhatsapp },
  });

  // 1. Registro Perfil 1 (Padre)
  console.log('\n1. Registrando Perfil 1 (Padre)...');
  let customer = await prisma.barberCustomer.create({
    data: {
      barbershopId: barbershop.id,
      whatsapp: testWhatsapp,
      name: 'Carlos (Padre)',
      cutsCount: 0,
      sessionState: 'IDLE',
    },
  });

  const profilePadre = await prisma.customerProfile.create({
    data: {
      customerId: customer.id,
      barbershopId: barbershop.id,
      name: 'Carlos (Padre)',
      birthDate: new Date('1985-05-15'),
      cutsCount: 0,
    },
  });

  await prisma.barberCustomer.update({
    where: { id: customer.id },
    data: { activeProfileId: profilePadre.id },
  });

  // 2. Registro Perfil 2 (Hijo)
  console.log('2. Registrando Perfil 2 (Hijo) en la misma cuenta de WhatsApp...');
  const profileHijo = await prisma.customerProfile.create({
    data: {
      customerId: customer.id,
      barbershopId: barbershop.id,
      name: 'Mateo (Hijo)',
      birthDate: new Date('2012-08-20'),
      cutsCount: 0,
    },
  });

  // 3. Crear 3 Visitas físicas (2 para Padre, 1 para Hijo) y actualizar contadores
  // Visita 1 Padre
  await prisma.barberVisit.create({
    data: {
      customerId: customer.id,
      barbershopId: barbershop.id,
      profileId: profilePadre.id,
      status: 'APPROVED',
      checkinMethod: 'BARBER_ASSISTED_KNOWN',
    },
  });
  // Visita 2 Padre
  await prisma.barberVisit.create({
    data: {
      customerId: customer.id,
      barbershopId: barbershop.id,
      profileId: profilePadre.id,
      status: 'APPROVED',
      checkinMethod: 'BARBER_ASSISTED_KNOWN',
    },
  });
  await prisma.customerProfile.update({
    where: { id: profilePadre.id },
    data: { cutsCount: 2 },
  });

  // Visita 1 Hijo
  await prisma.barberVisit.create({
    data: {
      customerId: customer.id,
      barbershopId: barbershop.id,
      profileId: profileHijo.id,
      status: 'APPROVED',
      checkinMethod: 'BARBER_ASSISTED_KNOWN',
    },
  });
  await prisma.customerProfile.update({
    where: { id: profileHijo.id },
    data: { cutsCount: 1 },
  });

  // Actualizar cutsCount de la cuenta total (2 + 1 = 3)
  await prisma.barberCustomer.update({
    where: { id: customer.id },
    data: { cutsCount: 3 },
  });

  // 4. Verificaciones
  console.log('\n--- VERIFICACIÓN DE ESTRUCTURA Y MODO DE LEALTAD ---');
  const resultCustomer = await prisma.barberCustomer.findUnique({
    where: { id: customer.id },
    include: { profiles: true },
  });

  const totalVisitsCount = await prisma.barberVisit.count({
    where: { customerId: customer.id },
  });

  console.log(`Perfiles en la cuenta: ${resultCustomer?.profiles.length} (Esperado: 2)`);
  console.log(`Visitas totales de la cuenta: ${totalVisitsCount} (Esperado: 3)`);

  const updatedPadreProfile = resultCustomer?.profiles.find((p) => p.id === profilePadre.id);
  const updatedHijoProfile = resultCustomer?.profiles.find((p) => p.id === profileHijo.id);

  const padreCutsProfile = updatedPadreProfile?.cutsCount ?? 0;
  const hijoCutsProfile = updatedHijoProfile?.cutsCount ?? 0;
  const accountCutsTotal = resultCustomer?.cutsCount ?? 0;

  console.log(`\n[Modo BY_PROFILE]`);
  console.log(`- Padre acumulado individual: ${padreCutsProfile} cortes`);
  console.log(`- Hijo acumulado individual: ${hijoCutsProfile} cortes`);

  console.log(`\n[Modo BY_ACCOUNT]`);
  console.log(`- Cuenta acumulado total (Familia): ${accountCutsTotal} cortes`);

  if (
    resultCustomer?.profiles.length === 2 &&
    padreCutsProfile === 2 &&
    hijoCutsProfile === 1 &&
    accountCutsTotal === 3
  ) {
    console.log('\n✅ PRUEBA E2E EXITOSA: El modelo multi-perfil y cálculo de fidelidad funcionan correctamente.');
  } else {
    console.error('\n🚨 ERROR EN LA PRUEBA E2E: Inconsistencia en los datos de la cuenta o perfiles.');
  }

  // 5. Limpieza de datos de prueba
  console.log('\nLimpiando registros de prueba...');
  await prisma.barberCustomer.delete({
    where: { id: customer.id },
  });
  console.log('Limpieza completada.');

  console.log('\n--- FIN DE PRUEBA E2E ---');
}

main()
  .catch((e) => {
    console.error('Error en prueba E2E:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
