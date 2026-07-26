import { prisma } from "@/lib/prisma";
import RegistrationForm from "@/components/public/RegistrationForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function QRRegistrationPage({
  params,
}: {
  params: Promise<{ barbershopId: string }>;
}) {
  const { barbershopId } = await params;

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
    select: { name: true },
  });

  if (!barbershop) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex flex-col selection:bg-[#d97644] selection:text-[#0a0807]">
      {/* Header */}
      <header className="py-6 px-6 border-b border-[#2a2520] flex items-center justify-center bg-[#0a0807]/95 backdrop-blur-sm sticky top-0 z-10">
        <Link
          href="/"
          className="font-display text-xl font-light tracking-widest text-[#f3ece1]"
        >
          BarberOS
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl font-light tracking-wide mb-2 text-[#f3ece1]">
              Regístrate en <span className="text-[#d97644] font-medium">{barbershop.name}</span>
            </h1>
            <p className="text-[#a89e90] font-sans font-light">
              Completa tus datos para empezar a acumular cortes gratis y acceder a tus beneficios.
            </p>
          </div>

          <div className="bg-[#131110] border border-[#2a2520] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <RegistrationForm
              barbershopId={barbershopId}
              barbershopName={barbershop.name}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
