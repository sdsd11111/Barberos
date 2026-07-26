/**
 * Script de prueba: Director IA (Sprint D)
 *
 * 1. Simula un MotorSnapshot con clientes en riesgo, horas pico y métricas de equipo.
 * 2. Invoca generateDirectorRecommendations().
 * 3. Valida que se generen recomendaciones con copys de WhatsApp de 1-clic.
 */

import 'dotenv/config';
import { generateDirectorRecommendations, MotorSnapshotData } from '../src/lib/director-ai';

async function main() {
  console.log('--- INICIO DE PRUEBA: DIRECTOR IA (SPRINT D) ---');

  const mockSnapshot: MotorSnapshotData = {
    barbershopId: 'test-barbershop-123',
    calculatedAt: new Date().toISOString(),
    snapshotDate: new Date().toISOString(),
    totalVisitsApproved: 120,
    totalAnonymousVisits: 5,
    visitsByHour: {
      '10': 12,
      '11': 25, // Pico
      '15': 3,  // Flojo
    },
    profiles: {
      normal: 40,
      delayed: 5,
      atRisk: 2,
      insufficient: 10,
      total: 57,
    },
    staffMetrics: [
      {
        staffId: 'staff-1',
        staffName: 'Carlos Barbero',
        totalCuts: 50,
        avgRating: 4.9,
      },
    ],
    criticalProfiles: [
      {
        profileId: 'profile-risk-1',
        profileName: 'Esteban Paredes',
        whatsapp: '593987654321',
        riskLevel: 'AT_RISK',
        avgDaysBetweenVisits: 14,
        daysSinceLastVisit: 35,
      },
    ],
  };

  console.log('Generando recomendaciones del Director IA...');
  const result = await generateDirectorRecommendations(mockSnapshot);
  const recommendations = result.recommendations;

  console.log(`\nRecomendaciones generadas: ${recommendations.length}`);

  recommendations.forEach((rec, idx) => {
    console.log(`\n[Recomendación #${idx + 1}]`);
    console.log(`- Tipo: ${rec.type}`);
    console.log(`- Prioridad: ${rec.priority}`);
    console.log(`- Título: ${rec.title}`);
    console.log(`- Descripción: ${rec.description}`);
    if (rec.whatsappMessage) {
      console.log(`- Copy WhatsApp: "${rec.whatsappMessage}"`);
      console.log(`- WhatsApp Destino: +${rec.targetWhatsapp}`);
    }
  });

  if (recommendations.length > 0 && recommendations.some((r) => r.type === 'REACTIVATION')) {
    console.log('\n✅ PRUEBA EXITOSA: El Director IA generó copys y estrategias accionables desde el Snapshot.');
  } else {
    console.error('\n🚨 ERROR EN LA PRUEBA: No se generaron las recomendaciones esperadas.');
  }

  console.log('\n--- FIN DE PRUEBA DIRECTOR IA ---');
}

main().catch(console.error);
