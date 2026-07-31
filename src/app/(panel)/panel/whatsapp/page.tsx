import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { isPremiumBarbershop } from "@/lib/plan-guard";
import { redirect } from "next/navigation";
import WhatsAppContent from "@/components/panel/WhatsAppContent";
import ConfigTabs from "@/components/panel/ConfigTabs";
import { getTenantTerms } from "@/lib/tenant-dictionary";

export default async function WhatsAppPage() {
  const session = await verifySession();
  const barbershopId = session.barbershopId;

  if (!barbershopId) {
    redirect("/login");
  }

  const isPremium = await isPremiumBarbershop(barbershopId);

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
    select: {
      riskThresholdNormal: true,
      riskThresholdAt: true,
      loyaltyMode: true,
      visitDurationMin: true,
      businessInfo: true,
      requiredCuts: true,
      vertical: true,
    },
  });

  if (!barbershop) {
    redirect("/login");
  }

  const terms = getTenantTerms(barbershop.vertical);

  // PREMIUM: cargar datos de configuración para las tabs
  if (isPremium) {
    return (
      <div className="space-y-6 overflow-x-hidden">
        <header>
          <p style={{ color: terms.accentColor }} className="font-mono text-xs tracking-[0.3em] uppercase mb-2">
            Ajustes de {terms.businessTypeName}
          </p>
          <h2 className="font-display text-5xl font-light text-[#f3ece1]">Configuración</h2>
        </header>

        <ConfigTabs configData={barbershop} />
      </div>
    );
  }

  // PRO: solo WhatsApp + StaffManager
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <header className="mb-8">
        <p style={{ color: terms.accentColor }} className="font-mono text-xs tracking-[0.3em] uppercase mb-2">
          Ajustes de {terms.businessTypeName}
        </p>
        <h2 className="font-display text-5xl font-light text-[#f3ece1]">Configuración</h2>
      </header>

      <WhatsAppContent vertical={barbershop.vertical} />
    </div>
  );
}
