import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";
import { verifySession } from "@/lib/dal";
import { isPremiumBarbershop } from "@/lib/plan-guard";
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

  return (
    <div className="min-h-screen bg-[#0a0807] text-[#f3ece1]">
      <PanelNav logoutAction={logout} isPremium={isPremium} />

      {/* Main Content — con padding top para compensar el header fijo */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          {children}
        </div>
      </main>

      {/* Consultor Director IA 24/7 Chatbot (Exclusivo para Premium) */}
      {isPremium && <DirectorChatWidget />}
    </div>
  );
}
