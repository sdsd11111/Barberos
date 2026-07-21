"use client";

import { useEffect, useState } from "react";

interface PendingVisit {
  id: string;
  createdAt: string;
  customer: {
    id: string;
    whatsapp: string;
    name: string;
  };
}

interface ApprovalQueueProps {
  barbershopId: string | null;
}

export default function ApprovalQueue({ barbershopId }: ApprovalQueueProps) {
  const [pendingVisits, setPendingVisits] = useState<PendingVisit[]>([]);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!barbershopId) return;

    const fetchPending = async () => {
      try {
        const response = await fetch(`/api/visits/pending?barbershopId=${barbershopId}`);
        if (response.ok) {
          const data = await response.json();
          setPendingVisits(data);
        }
      } catch (error) {
        console.error("Error fetching pending visits:", error);
      }
    };

    // Polling cada 2 segundos
    fetchPending();
    const interval = setInterval(fetchPending, 2000);

    return () => clearInterval(interval);
  }, [barbershopId]);

  const handleApprove = async (visitId: string) => {
    setIsProcessing(visitId);
    try {
      const response = await fetch("/api/visits/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId }),
      });
      if (response.ok) {
        setPendingVisits((prev) => prev.filter((v) => v.id !== visitId));
      }
    } catch (error) {
      console.error("Error approving visit:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (visitId: string) => {
    setIsProcessing(visitId);
    try {
      const response = await fetch("/api/visits/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId }),
      });
      if (response.ok) {
        setPendingVisits((prev) => prev.filter((v) => v.id !== visitId));
      }
    } catch (error) {
      console.error("Error rejecting visit:", error);
    } finally {
      setIsProcessing(null);
    }
  };

  if (!barbershopId) return null;

  if (pendingVisits.length === 0) {
    return (
      <div className="fixed bottom-4 right-4 z-40 bg-[#131110] border border-[#2a2520] px-4 py-2 text-center">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c]">
          Esperando check-ins...
        </p>
      </div>
    );
  }

  // Tomamos el primero de la cola para procesar uno a uno
  const currentVisit = pendingVisits[0];
  const disabled = isProcessing === currentVisit.id;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-bounce-short">
      <div
        className="p-6 bg-[#131110] border border-[#d97644] shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: "0 0 30px rgba(217,118,68,0.15)",
        }}
      >
        {/* Glow sutil */}
        <div
          className="absolute -top-10 -right-10 w-24 h-24 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(217,118,68,0.15) 0%, transparent 70%)",
          }}
        />

        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-[#d97644] block mb-1">
              ● Solicitud de Check-In
            </span>
            <h4 className="font-display text-2xl font-light text-[#f3ece1]">
              {currentVisit.customer.name}
            </h4>
          </div>
          <span className="font-mono text-[10px] text-[#5c554c]">
            {new Date(currentVisit.createdAt).toLocaleTimeString("es-EC", {
              timeZone: "America/Guayaquil",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="mb-6">
          <p className="font-mono text-lg tracking-wider text-[#a89e90] bg-[#0a0807] border border-[#2a2520] px-3 py-2 text-center">
            +{currentVisit.customer.whatsapp}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleApprove(currentVisit.id)}
            disabled={disabled}
            className="flex-1 py-4 font-mono text-xs tracking-[0.25em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] active:scale-[0.98] transition-all disabled:opacity-50 font-bold"
          >
            {disabled ? "PROCESANDO..." : "APROBAR"}
          </button>
          <button
            onClick={() => handleReject(currentVisit.id)}
            disabled={disabled}
            className="px-6 py-4 font-mono text-xs tracking-[0.25em] uppercase text-[#5c554c] hover:text-[#f3ece1] border border-[#2a2520] hover:border-[#d97644] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            RECHAZAR
          </button>
        </div>
      </div>
    </div>
  );
}
