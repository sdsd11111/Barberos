"use client";

import { useState } from "react";
import { getTenantTerms } from "@/lib/tenant-dictionary";

interface RegistrationFormProps {
  barbershopId: string;
  barbershopName: string;
  vertical?: string | null;
}

export default function RegistrationForm({
  barbershopId,
  barbershopName,
  vertical,
}: RegistrationFormProps) {
  const terms = getTenantTerms(vertical);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    whatsapp: "",
    birthDay: "",
    birthMonth: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Básica validación cliente (Zod en servidor hará la estricta)
    const cleanWhatsapp = formData.whatsapp.replace(/\D/g, "");
    if (cleanWhatsapp.length < 9) {
      setError("El número de WhatsApp es inválido.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        barbershopId,
        whatsapp: cleanWhatsapp,
        name: formData.name,
        birthDay: parseInt(formData.birthDay),
        birthMonth: parseInt(formData.birthMonth),
        notes: formData.notes,
      };

      const res = await fetch("/api/clientes/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">🎉</span>
        </div>
        <h2 className="font-display text-3xl font-light text-[#f3ece1] mb-2">
          ¡Registro Exitoso!
        </h2>
        <p className="text-[#a89e90] font-sans font-light max-w-sm mb-8">
          Ya estás en el sistema de {barbershopName}. ¡Avisa a tu barbero para comenzar a acumular cortes gratis!
        </p>
        <button
          onClick={() => window.location.reload()}
          className="font-mono text-xs uppercase tracking-widest text-[#d97644] hover:text-[#f3ece1] transition-colors"
        >
          Registrar otra persona
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-mono text-center">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-[#a89e90] font-mono">
          Tu Nombre
        </label>
        <input
          type="text"
          name="name"
          autoComplete="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej. Juan Pérez"
          className="w-full bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] p-3.5 focus:border-[#d97644] focus:outline-none transition-colors font-sans"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-[#a89e90] font-mono">
          Número de WhatsApp
        </label>
        <input
          type="tel"
          name="whatsapp"
          autoComplete="tel"
          value={formData.whatsapp}
          onChange={handleChange}
          placeholder="Ej. 0991234567"
          className="w-full bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] p-3.5 focus:border-[#d97644] focus:outline-none transition-colors font-sans"
          required
        />
        <p className="text-[10px] text-[#5c554c] font-mono mt-1">
          Lo usaremos para avisarte de tus premios.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-[#a89e90] font-mono">
          Fecha de Nacimiento
        </label>
        <div className="grid grid-cols-2 gap-4">
          <select
            name="birthDay"
            autoComplete="bday-day"
            value={formData.birthDay}
            onChange={handleChange}
            className="w-full bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] p-3.5 focus:border-[#d97644] focus:outline-none transition-colors font-sans appearance-none"
            required
          >
            <option value="" disabled>Día</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            name="birthMonth"
            autoComplete="bday-month"
            value={formData.birthMonth}
            onChange={handleChange}
            className="w-full bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] p-3.5 focus:border-[#d97644] focus:outline-none transition-colors font-sans appearance-none"
            required
          >
            <option value="" disabled>Mes</option>
            {[
              "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
              "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
            ].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-widest text-[#a89e90] font-mono flex items-center justify-between">
          <span>¿Cómo nos conociste?</span>
          <span className="text-[9px] text-[#5c554c]">(Opcional)</span>
        </label>
        <select
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] p-3.5 focus:border-[#d97644] focus:outline-none transition-colors font-sans appearance-none"
        >
          <option value="" disabled>Selecciona una opción...</option>
          <option value="Recomendación de un amigo">Recomendación de un amigo</option>
          <option value="Instagram / Redes Sociales">Instagram / Redes Sociales</option>
          <option value="Pasé por el local">Pasé por el local</option>
          <option value="Google Maps / Búsqueda">Google Maps / Búsqueda</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{ backgroundColor: terms.accentColor }}
        className="w-full text-[#0a0807] font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm tracking-[0.2em] uppercase py-4 transition-all mt-4 rounded"
      >
        {loading ? "Registrando..." : "Completar Registro"}
      </button>
    </form>
  );
}
