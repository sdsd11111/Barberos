"use client";

import { useState } from "react";

interface RegisterVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  barbershopId?: string;
}

export default function RegisterVisitModal({
  isOpen,
  onClose,
  barbershopId = "ID_DE_PRUEBA",
}: RegisterVisitModalProps) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim()) {
      setStatus("error");
      setMessage("Ingresa un número de WhatsApp");
      return;
    }

    if (!barbershopId) {
      setStatus("error");
      setMessage("Error: No se ha configurado la barbería");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barbershopId,
          customerWhatsapp: phone,
        }),
      });

      if (response.status === 201) {
        setStatus("success");
        setMessage("Corte registrado. WhatsApp enviado.");
        setTimeout(() => {
          onClose();
          setPhone("");
          setStatus("idle");
          setMessage("");
        }, 2000);
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
      setStatus("idle");
      setMessage("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(10,8,7,0.8)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md p-10"
        style={{ backgroundColor: "#131110", border: "1px solid #2a2520" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-3xl font-light mb-8 text-[#f3ece1]">
          Registrar Nuevo Corte
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="phone"
              className="block font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] mb-2"
            >
              WhatsApp del Cliente
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[#5c554c]">
                +
              </span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="593963410409"
                className="w-full pl-8 pr-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] placeholder-[#5c554c] focus:outline-none focus:border-[#d97644] transition-colors"
                disabled={status === "loading"}
              />
            </div>
          </div>

          {message && (
            <p
              className={`font-display italic text-sm ${
                status === "success" ? "text-[#f3ece1]" : "text-[#d97644]"
              }`}
            >
              {message}
            </p>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex-1 py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] transition-colors disabled:opacity-50"
            >
              {status === "loading" ? "Enviando..." : "Confirmar y Enviar"}
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
