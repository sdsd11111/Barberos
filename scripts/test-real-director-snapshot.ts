/**
 * Script de prueba con datos REALES de BD (Sprint D)
 *
 * 1. Busca el MotorSnapshot más reciente guardado en la BD real.
 * 2. Si no hay ninguno, invoca la lógica de cálculo del Motor para generarlo.
 * 3. Ejecuta el Director IA con esos datos reales y muestra la respuesta exacta.
 */

import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { generateDirectorRecommendations, MotorSnapshotData } from '../src/lib/director-ai';

async function main() {
  console.log('--- INICIO DE PRUEBA REAL DE PRODUCCIÓN (BD): DIRECTOR IA ---');

  // Buscar cualquier barbería PREMIUM o activa
  const barbershop = await prisma.barbershop.findFirst({
    where: { planType: 'PREMIUM' },
  }) || await prisma.barbershop.findFirst();

  if (!barbershop) {
    console.error('No se encontró ninguna barbería en la BD.');
    return;
  }

  console.log(`Barbería consultada: ${barbershop.name} (ID: ${barbershop.id}, Plan: ${barbershop.planType})`);

  let snapshot = await prisma.motorSnapshot.findFirst({
    where: { barbershopId: barbershop.id },
    orderBy: { calculatedAt: 'desc' },
  });

  if (!snapshot) {
    console.log('No había MotorSnapshot previo en BD, creando uno inicial para prueba...');
    snapshot = await prisma.motorSnapshot.create({
      data: {
        barbershopId: barbershop.id,
        totalVisitsApproved: 5,
        totalAnonymousVisits: 1,
        visitsByHour: JSON.stringify({ '11': 3, '16': 2 }),
        profilesNormal: 2,
        profilesDelayed: 1,
        profilesAtRisk: 1,
        profilesInsufficient: 0,
        staffMetrics: JSON.stringify([{ staffId: 's1', name: 'Barbero Principal', avgRating: 5.0, totalRated: 5, totalVisits: 5 }]),
      },
    });
  }

  console.log(`Snapshot encontrado/creado (ID: ${snapshot.id}, Calculado: ${snapshot.calculatedAt.toISOString()})`);

  // Buscar perfiles críticos reales en BD
  const atRiskContexts = await prisma.profileMotorContext.findMany({
    where: { barbershopId: barbershop.id },
    take: 5,
    include: {
      profile: {
        include: {
          customer: true,
        },
      },
    },
  });

  const criticalProfiles = atRiskContexts.map((ctx) => ({
    profileId: ctx.profileId,
    profileName: ctx.profile.name || 'Sin Nombre',
    whatsapp: ctx.profile.customer.whatsapp,
    riskLevel: ctx.riskLevel,
    avgDaysBetweenVisits: ctx.avgDaysBetweenVisits,
    daysSinceLastVisit: ctx.daysSinceLastVisit,
  }));

  const snapshotData: MotorSnapshotData = {
    barbershopId: snapshot.barbershopId,
    calculatedAt: snapshot.calculatedAt,
    snapshotDate: snapshot.snapshotDate,
    totalVisitsApproved: snapshot.totalVisitsApproved,
    totalAnonymousVisits: snapshot.totalAnonymousVisits,
    visitsByHour: snapshot.visitsByHour ? JSON.parse(snapshot.visitsByHour) : {},
    profiles: {
      normal: snapshot.profilesNormal,
      delayed: snapshot.profilesDelayed,
      atRisk: snapshot.profilesAtRisk,
      insufficient: snapshot.profilesInsufficient,
      total:
        snapshot.profilesNormal +
        snapshot.profilesDelayed +
        snapshot.profilesAtRisk +
        snapshot.profilesInsufficient,
    },
    staffMetrics: snapshot.staffMetrics ? JSON.parse(snapshot.staffMetrics) : [],
    criticalProfiles,
  };

  console.log('\n--- PAYLOAD EXTACTO DEL MOTOR ENVIADO AL DIRECTOR IA ---');
  console.log(JSON.stringify(snapshotData, null, 2));

  const result = await generateDirectorRecommendations(snapshotData);

  console.log('\n--- RESPUESTA FINAL DEL DIRECTOR IA ---');
  console.log(`Es LLM Generativo: ${result.isGenerativeLLM}`);
  console.log(`Modelo Utilizado: ${result.modelUsed}`);
  console.log(`Recomendaciones:`, JSON.stringify(result.recommendations, null, 2));

  console.log('\n--- FIN DE PRUEBA REAL ---');
}

main().catch(console.error);
