"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setStatus("error");
      setMessage("Por favor, ingresa tu código PIN.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/auth/login-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage("¡Acceso correcto! Redirigiendo...");
        // Redirigir al panel de control
        setTimeout(() => {
          router.push("/panel");
        }, 1000);
      } else {
        setStatus("error");
        setMessage(data.error || "El código PIN ingresado es incorrecto.");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión con el servidor.");
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-10 bg-[#131110] border border-[#2a2520] relative font-mono">
        {/* Decoración superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#d97644]" />

        <h2 className="font-display text-4xl font-light mb-4 text-[#f3ece1] text-center">
          BarberOS
        </h2>
        <p className="font-mono text-xs tracking-wider text-[#5c554c] text-center mb-8 uppercase">
          Acceso rápido por PIN
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] mb-2">
              Código PIN de Barbería
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Ej. 123456"
              disabled={status === "loading"}
              className="w-full px-4 py-3 font-mono text-lg text-center tracking-[0.35em] bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] placeholder-[#5c554c] focus:outline-none focus:border-[#d97644]"
            />
          </div>

          {message && (
            <p
              className={`font-display italic text-sm text-center ${
                status === "success" ? "text-green-400" : "text-[#d97644]"
              }`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-4 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] transition-all disabled:opacity-50 font-bold"
          >
            {status === "loading" ? "VERIFICANDO..." : "INGRESAR AL PANEL"}
          </button>
        </form>
      </div>
    </main>
  );
}
