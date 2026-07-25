import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import ApprovalQueue from "@/components/ApprovalQueue";
import RegisterVisitButton from "@/components/RegisterVisitButton";
import DownloadQRButton from "@/components/DownloadQRButton";

export default async function DashboardPage() {
  const session = await verifySession();
  const barbershopId = session.barbershopId;

  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
  });

  if (!barbershop) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl text-[#d97644]">Error: Barbería no encontrada</h2>
      </div>
    );
  }

  const customers = await prisma.barberCustomer.findMany({
    where: { barbershopId },
  });
  const customerIds = customers.map((c) => c.id);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const cutsToday = await prisma.barberVisit.count({
    where: {
      customerId: { in: customerIds },
      status: "APPROVED",
      createdAt: { gte: startOfDay },
    },
  });

  const totalCustomers = customers.length;

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newCustomersThisMonth = await prisma.barberCustomer.count({
    where: {
      barbershopId,
      lastVisitAt: { gte: startOfMonth },
    },
  });

  const recurrentCustomers = customers.filter((c) => c.cutsCount >= 2).length;

  const recentVisitsData = await prisma.barberVisit.findMany({
    where: {
      customerId: { in: customerIds },
      createdAt: { gte: startOfDay },
    },
    orderBy: { createdAt: "desc" },
  });

  const recentVisits = recentVisitsData.map((visit) => {
    const customer = customers.find((c) => c.id === visit.customerId);
    return {
      ...visit,
      customerName: customer?.name || "Cliente Registrado",
      customerWhatsapp: customer?.whatsapp || "",
      cutsCount: customer?.cutsCount || 0,
    };
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] mb-1">
            Resumen General
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-light leading-tight">
            {barbershop.name}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-[#d97644] rounded-full animate-pulse" />
          <span className="font-mono text-xs text-[#d97644]">
            {barbershop.connectionStatus === "CONNECTED" ? "Activo" : "Desconectado"}
          </span>
        </div>
      </header>

      {/* QR + Código de caja */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Código */}
        <div className="bg-[#131110] border border-[#2a2520] p-6 flex flex-col justify-between min-h-[200px]">
          <div className="flex justify-between items-center">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c]">
              Código de Caja
            </p>
            <span className="font-mono text-[10px] text-[#d97644]">● EN VIVO</span>
          </div>
          <p className="font-display text-7xl sm:text-8xl font-light tracking-wider text-[#d97644] text-center my-4">
            {barbershop.currentBoxCode}
          </p>
          <p className="font-mono text-[10px] text-[#5c554c] text-center">
            Se renueva con cada check-in
          </p>
        </div>

        {/* QR */}
        <div className="bg-[#131110] border border-[#2a2520] p-6 flex flex-col items-center justify-center gap-3">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c]">
            QR Para Cliente
          </p>
          {(() => {
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
              `https://wa.me/${barbershop.whatsappNumber}?text=Hola,%20mi%20código%20de%20caja%20es%20${barbershop.currentBoxCode}`
            )}`;
            return (
              <>
                <div className="bg-[#f3ece1] p-3 w-32 h-32 sm:w-36 sm:h-36">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url('${qrImageUrl}')`,
                      backgroundSize: "cover",
                    }}
                  />
                </div>
                <DownloadQRButton qrUrl={qrImageUrl} barbershopName={barbershop.name} />
              </>
            );
          })()}
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#2a2520] border border-[#2a2520]">
        {/* Cortes hoy - no es clickeable */}
        <div className="bg-[#0a0807] p-4 sm:p-6">
          <p className="font-display text-4xl sm:text-5xl font-light">{cutsToday}</p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mt-1">Cortes hoy</p>
        </div>

        {/* Clientes → tab=todos */}
        <a href="/panel/clientes?tab=todos" className="bg-[#0a0807] p-4 sm:p-6 group hover:bg-[#131110] transition-colors cursor-pointer border-l border-[#2a2520]">
          <p className="font-display text-4xl sm:text-5xl font-light group-hover:text-[#d97644] transition-colors">{totalCustomers}</p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mt-1 group-hover:text-[#d97644] transition-colors">Clientes ↗</p>
        </a>

        {/* Nuevos / mes → tab=nuevos */}
        <a href="/panel/clientes?tab=nuevos" className="bg-[#0a0807] p-4 sm:p-6 group hover:bg-[#131110] transition-colors cursor-pointer border-l border-[#2a2520]">
          <p className="font-display text-4xl sm:text-5xl font-light text-[#d97644] group-hover:opacity-80 transition-opacity">{newCustomersThisMonth}</p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mt-1 group-hover:text-[#d97644] transition-colors">Nuevos / mes ↗</p>
        </a>

        {/* Recurrentes → tab=recurrentes */}
        <a href="/panel/clientes?tab=recurrentes" className="bg-[#0a0807] p-4 sm:p-6 group hover:bg-[#131110] transition-colors cursor-pointer border-l border-[#2a2520]">
          <p className="font-display text-4xl sm:text-5xl font-light group-hover:text-[#d97644] transition-colors">{recurrentCustomers}</p>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mt-1 group-hover:text-[#d97644] transition-colors">Recurrentes ↗</p>
        </a>
      </div>

      {/* Cola de aprobaciones */}
      <ApprovalQueue barbershopId={barbershopId} />

      {/* Historial */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="font-display text-xl sm:text-2xl font-light">
            Libro Diario{" "}
            <span className="text-[#5c554c] text-sm font-mono">/ Historial</span>
          </h3>
          <RegisterVisitButton barbershopId={barbershopId} />
        </div>

        {recentVisits.length === 0 ? (
          <div className="border border-[#2a2520] bg-[#131110] p-10 text-center">
            <p className="font-display italic text-lg text-[#5c554c] mb-2">
              No hay visitas registradas el día de hoy
            </p>
            <p className="font-mono text-[10px] text-[#5c554c] tracking-widest">
              Usa el botón "Registrar corte" para registrar una visita de forma manual.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE: tarjetas */}
            <div className="sm:hidden space-y-3">
              {recentVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="bg-[#131110] border border-[#2a2520] p-4 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-display text-lg text-[#f3ece1] font-light">
                      {visit.customerName}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ml-2 ${
                        visit.status === "APPROVED"
                          ? "bg-green-950/40 text-green-400 border border-green-800"
                          : visit.status === "PENDING"
                          ? "bg-amber-950/40 text-amber-400 border border-amber-800 animate-pulse"
                          : "bg-red-950/40 text-red-400 border border-red-800"
                      }`}
                    >
                      {visit.status}
                    </span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px] text-[#5c554c]">
                    <span>+{visit.customerWhatsapp}</span>
                    <span>{visit.cutsCount} cortes</span>
                  </div>
                  <div className="flex justify-between font-mono text-[10px]">
                    <span className="text-amber-400">
                      {visit.rating
                        ? "★".repeat(visit.rating) + "☆".repeat(5 - visit.rating)
                        : "Sin calificar"}
                    </span>
                    <span className="text-[#5c554c]">
                      {new Date(visit.createdAt).toLocaleDateString("es-EC", {
                        timeZone: "America/Guayaquil",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP: tabla */}
            <div className="hidden sm:block border border-[#2a2520] bg-[#131110] overflow-x-auto">
              <table className="w-full text-left font-mono text-xs text-[#a89e90]">
                <thead>
                  <tr className="border-b border-[#2a2520] text-[#5c554c] uppercase bg-[#0a0807]">
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">WhatsApp</th>
                    <th className="py-3 px-4">Cortes</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Calificación</th>
                    <th className="py-3 px-4 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((visit) => (
                    <tr key={visit.id} className="border-b border-[#1c1917] hover:bg-[#0a0807]/50">
                      <td className="py-3 px-4 font-display text-base text-[#f3ece1] font-light">
                        {visit.customerName}
                      </td>
                      <td className="py-3 px-4">+{visit.customerWhatsapp}</td>
                      <td className="py-3 px-4">{visit.cutsCount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] ${
                            visit.status === "APPROVED"
                              ? "bg-green-950/40 text-green-400 border border-green-800"
                              : visit.status === "PENDING"
                              ? "bg-amber-950/40 text-amber-400 border border-amber-800 animate-pulse"
                              : "bg-red-950/40 text-red-400 border border-red-800"
                          }`}
                        >
                          {visit.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-amber-400">
                        {visit.rating
                          ? "★".repeat(visit.rating) + "☆".repeat(5 - visit.rating)
                          : "Sin calificar"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {new Date(visit.createdAt).toLocaleDateString("es-EC", {
                          timeZone: "America/Guayaquil",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ver Más */}
            <div className="mt-4 flex justify-end">
              <a
                href="/panel/clientes?tab=todos"
                className="font-mono text-[10px] tracking-widest text-[#d97644] hover:text-[#f3ece1] uppercase transition-colors"
              >
                Ver listado completo de clientes ↗
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
