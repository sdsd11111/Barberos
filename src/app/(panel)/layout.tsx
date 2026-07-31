import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";
import { verifySession } from "@/lib/dal";
import { isPremiumBarbershop } from "@/lib/plan-guard";
import { prisma } from "@/lib/prisma";
import PanelNav from "@/components/panel/PanelNav";
import DirectorChatWidget from "@/components/panel/DirectorChatWidget";

async function logout() {
  "use server";
  await deleteSession();
  redirect("/login");
}

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifySession();
  const isPremium = await isPremiumBarbershop(session.barbershopId);

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: session.barbershopId },
    select: { vertical: true },
  });

  const isGabinete = (barbershop?.vertical || "").toUpperCase() === "GABINETE" || (barbershop?.vertical || "").toUpperCase() === "SALON";

  return (
    <div className={`min-h-screen ${isGabinete ? 'bg-[#0d0a0b]' : 'bg-[#0a0807]'} text-[#f3ece1] overflow-x-hidden relative`}>
      {isGabinete && (
        <div
          className="pointer-events-none fixed inset-0 z-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 50% 10%, rgba(254, 136, 159, 0.15) 0%, transparent 60%)",
          }}
        />
      )}
      <PanelNav logoutAction={logout} isPremium={isPremium} vertical={barbershop?.vertical} />

      {/* Main Content — con padding top para compensar el header fijo */}
      <main className="pt-16 min-h-screen relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          {children}
        </div>
      </main>

      {/* Consultor Director IA 24/7 Chatbot (Exclusivo para Premium) */}
      {isPremium && <DirectorChatWidget />}
    </div>
  );
}
