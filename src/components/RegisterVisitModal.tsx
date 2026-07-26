"use client";

import { useEffect, useState } from "react";

interface StaffMember {
  id: string;
  name: string;
  role?: string;
}

interface RegisterVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbershopId?: string;
}

export default function RegisterVisitModal({
  isOpen,
  onClose,
  barbershopId = "",
}: RegisterVisitModalProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [isCF, setIsCF] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Cargar lista de barberos al abrir el modal
  useEffect(() => {
    if (!isOpen || !barbershopId) return;

    async function loadStaff() {
      setLoadingStaff(true);
      try {
        const res = await fetch(`/api/staff?barbershopId=${encodeURIComponent(barbershopId)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.staff)) {
          setStaffList(data.staff);
          // Si solo hay un barbero, autoseleccionarlo
          if (data.staff.length === 1) {
            setStaffId(data.staff[0].id);
          }
        }
      } catch (err) {
        console.error("[RegisterVisitModal] Error cargando barberos:", err);
      } finally {
        setLoadingStaff(false);
      }
    }

    loadStaff();
  }, [isOpen, barbershopId]);

  if (!isOpen) return null;

  const handleSetCF = () => {
    setIsCF(true);
    setPhone("");
    setName("Consumidor Final");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffId) {
      setStatus("error");
      setMessage("⚠️ Debes seleccionar un BARBERO para registrar el corte.");
      return;
    }

    if (!barbershopId) {
      setStatus("error");
      setMessage("Error: No se ha configurado la barbería");
      return;
    }

    setStatus("loading");
    setMessage("");

    const isAnonymousVisit = isCF || !phone.trim();

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barbershopId,
          staffId,
          customerWhatsapp: isAnonymousVisit ? undefined : phone.trim(),
          customerName: name.trim() || undefined,
          checkinMethod: isAnonymousVisit ? "BARBER_ASSISTED_ANONYMOUS" : "BARBER_ASSISTED_KNOWN",
        }),
      });

      if (response.status === 201) {
        setStatus("success");
        setMessage(
          isAnonymousVisit
            ? "✂️ Corte registrado para el Barbero (Consumidor Final)."
            : "✂️ Corte registrado con éxito. WhatsApp enviado."
        );
        setTimeout(() => {
          handleClose();
        }, 1800);
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.error || "Error al registrar el corte");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión");
    }
  };

  const handleClose = () => {
    if (status !== "loading") {
      onClose();
      setPhone("");
      setName("");
      setStaffId("");
      setIsCF(false);
      setStatus("idle");
      setMessage("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10,8,7,0.85)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#131110", border: "1px solid #2a2520" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#2a2520] pb-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#d97644]">
              Módulo de Caja
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-light text-[#f3ece1]">
              Registrar Nuevo Corte
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[#5c554c] hover:text-[#f3ece1] font-mono text-lg"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. SELECCIÓN DE BARBERO (OBLIGATORIO) */}
          <div>
            <label className="block font-mono text-xs tracking-[0.2em] uppercase text-[#d97644] mb-2 font-medium">
              Barbero / Atendido Por <span className="text-red-400">*</span>
            </label>
            {loadingStaff ? (
              <div className="p-3 font-mono text-xs text-[#5c554c] bg-[#0a0807] border border-[#2a2520] animate-pulse">
                Cargando barberos...
              </div>
            ) : staffList.length === 0 ? (
              <div className="p-3 font-mono text-xs text-amber-400 bg-amber-950/20 border border-amber-800/50">
                ⚠️ No hay barberos registrados. Ve a la pestaña Barberos para agregar a tu equipo.
              </div>
            ) : (
              <select
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                className="w-full py-3 px-4 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644] transition-colors"
                disabled={status === "loading"}
                required
              >
                <option value="">-- Selecciona un Barbero (Requerido) --</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    💈 {s.name} {s.role ? `(${s.role})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. BOTÓN RÁPIDO CONSUMIDOR FINAL */}
          <div className="p-4 bg-[#0a0807] border border-[#2a2520] space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-[#a89e90]">¿Cliente Ocasional o Anónimo?</span>
              <button
                type="button"
                onClick={handleSetCF}
                className={`px-3 py-1.5 font-mono text-[10px] tracking-wider uppercase border transition-colors ${
                  isCF
                    ? "bg-[#d97644] text-[#0a0807] border-[#d97644] font-bold"
                    : "bg-[#131110] text-[#d97644] border-[#d97644]/40 hover:bg-[#d97644]/10"
                }`}
              >
                {isCF ? "✓ Consumidor Final (CF)" : "🛒 Marcar Consumidor Final (CF)"}
              </button>
            </div>
            <p className="font-mono text-[10px] text-[#5c554c]">
              Si no se ingresa WhatsApp o se selecciona CF, el corte se asigna directamente al barbero sin requerir datos.
            </p>
          </div>

          {/* 3. NOMBRE DEL CLIENTE (OPCIONAL) */}
          <div>
            <label
              htmlFor="name"
              className="block font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] mb-1"
            >
              Nombre del Cliente <span className="text-[10px] opacity-70">(Opcional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (isCF && e.target.value !== "Consumidor Final") setIsCF(false);
              }}
              placeholder="Ej. Carlos Pérez"
              className="w-full px-4 py-2.5 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] placeholder-[#5c554c] focus:outline-none focus:border-[#d97644] transition-colors"
              disabled={status === "loading"}
            />
          </div>

          {/* 4. WHATSAPP DEL CLIENTE (OPCIONAL) */}
          <div>
            <label
              htmlFor="phone"
              className="block font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] mb-1"
            >
              WhatsApp del Cliente <span className="text-[10px] opacity-70">(Opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#5c554c]">
                +
              </span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (e.target.value.trim()) setIsCF(false);
                }}
                placeholder="593963410409"
                className="w-full pl-8 pr-4 py-2.5 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] placeholder-[#5c554c] focus:outline-none focus:border-[#d97644] transition-colors"
                disabled={status === "loading"}
              />
            </div>
          </div>

          {message && (
            <div
              className={`p-3 border font-mono text-xs ${
                status === "success"
                  ? "bg-green-950/30 text-green-400 border-green-800"
                  : "bg-red-950/30 text-red-400 border-red-800"
              }`}
            >
              {message}
            </div>
          )}

          {/* BOTONES DE ACCIÓN */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <button
              type="submit"
              disabled={status === "loading"}
              className="font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] px-6 py-3 hover:bg-[#e8854f] transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Registrando..." : "Registrar Corte"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={status === "loading"}
              className="px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] hover:text-[#a89e90] transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
