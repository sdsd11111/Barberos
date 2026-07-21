"use client";

export default function BillingPage() {
  return (
    <main className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex items-center justify-center p-6">
      <div className="w-full max-w-xl p-12 bg-[#131110] border border-[#d97644] text-center relative overflow-hidden">
        {/* Glow de suspensión */}
        <div
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(217,118,68,0.1) 0%, transparent 70%)",
          }}
        />

        <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#d97644] block mb-4 animate-pulse">
          ⚠️ SUSCRIPCIÓN SUSPENDIDA O TRIAL EXPIRADO
        </span>
        
        <h1 className="font-display text-5xl font-light mb-6 text-[#f3ece1]">
          El corte no ha terminado.
        </h1>
        
        <p className="font-mono text-sm text-[#a89e90] max-w-md mx-auto mb-8 leading-relaxed">
          Tu período de prueba ha vencido o el pago no pudo procesarse. 
          Tus clientes siguen intentando hacer check-in por WhatsApp, pero necesitas activar tu suscripción para ver y aprobar sus visitas.
        </p>

        <div className="bg-[#0a0807] border border-[#2a2520] p-6 max-w-sm mx-auto mb-8">
          <p className="font-mono text-xs text-[#5c554c] uppercase tracking-widest mb-2">
            Membresía Mensual
          </p>
          <p className="font-display text-4xl text-[#d97644] font-light">
            $29.00 <span className="text-sm font-mono text-[#5c554c]">/ mes</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => alert("Próximamente integración con pasarela de pagos.")}
            className="px-8 py-4 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] transition-all font-bold"
          >
            ACTIVAR MI CUENTA
          </button>
          <a
            href="https://wa.me/593963410409"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 font-mono text-xs tracking-[0.2em] uppercase text-[#a89e90] border border-[#2a2520] hover:border-[#d97644] hover:text-[#d97644] transition-all"
          >
            HABLAR CON SOPORTE
          </a>
        </div>
      </div>
    </main>
  );
}
