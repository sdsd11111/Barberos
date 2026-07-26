import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { isPremiumBarbershop } from "@/lib/plan-guard";
import { redirect } from "next/navigation";
import WhatsAppContent from "@/components/panel/WhatsAppContent";
import ConfigTabs from "@/components/panel/ConfigTabs";

export default async function WhatsAppPage() {
  const session = await verifySession();
  const barbershopId = session.barbershopId;

  if (!barbershopId) {
    redirect("/login");
  }

  const isPremium = await isPremiumBarbershop(barbershopId);

  // PREMIUM: cargar datos de configuración para las tabs
  if (isPremium) {
    const barbershop = await prisma.barbershop.findUnique({
      where: { id: barbershopId },
      select: {
        riskThresholdNormal: true,
        riskThresholdAt: true,
        loyaltyMode: true,
        visitDurationMin: true,
        businessInfo: true,
        requiredCuts: true,
      },
    });

    if (!barbershop) {
      redirect("/login");
    }

    return (
      <div className="space-y-6">
        <header>
          <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-2">
            Ajustes de la Barbería
          </p>
          <h2 className="font-display text-5xl font-light text-[#f3ece1]">Configuración</h2>
        </header>

        <ConfigTabs configData={barbershop} />
      </div>
    );
  }

  // PRO: solo WhatsApp + StaffManager (comportamiento original)
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <header className="mb-8">
        <p className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] mb-2">
          Ajustes de la Barbería
        </p>
        <h2 className="font-display text-5xl font-light text-[#f3ece1]">Configuración</h2>
      </header>

      <WhatsAppContent />
    </div>
  );
}
