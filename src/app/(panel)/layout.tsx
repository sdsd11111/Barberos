import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";
import PanelNav from "@/components/panel/PanelNav";

async function logout() {
  "use server";
  await deleteSession();
  redirect("/login");
}

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0807] text-[#f3ece1]">
      <PanelNav logoutAction={logout} />

      {/* Main Content — con padding top para compensar el header fijo */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
