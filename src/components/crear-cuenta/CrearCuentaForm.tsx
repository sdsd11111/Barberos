"use client";

import { useState } from "react";

interface CreatedShop {
  id: string;
  name: string;
  whatsappNumber: string;
  loginPin: string;
  trialEndsAt: string | null;
}

export default function CrearCuentaForm() {
  const [formData, setFormData] = useState({
    name: "",
    whatsappNumber: "",
    requiredCuts: 5,
    ownerPhone: "",
    googleMapsUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<CreatedShop | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "requiredCuts" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/public/crear-barbershop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          whatsappNumber: formData.whatsappNumber.trim(),
          requiredCuts: formData.requiredCuts,
          ownerPhone: formData.ownerPhone.trim() || undefined,
          googleMapsUrl: formData.googleMapsUrl.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data: CreatedShop = await response.json();
        setCreated(data);
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData.error || "No pudimos crear la cuenta. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      whatsappNumber: "",
      requiredCuts: 5,
      ownerPhone: "",
      googleMapsUrl: "",
    });
    setCreated(null);
    setError("");
  };

  // ─── Pantalla de éxito ────────────────────────────────────────────────
  if (created) {
    const trialDate = created.trialEndsAt
      ? new Date(created.trialEndsAt).toLocaleDateString("es-EC", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

    // Mensaje pre-armado para el asesor — incluye contexto clave para que sepa qué acaba de crear el cliente
    const advisorMessage = encodeURIComponent(
      `Hola, acabo de crear mi cuenta en BarberOS.\n\n` +
        `• Barbería: ${created.name}\n` +
        `• WhatsApp Business: ${created.whatsappNumber}\n` +
        `• PIN de acceso: ${created.loginPin}\n` +
        `• Prueba termina: ${trialDate}\n\n` +
        `¿Me pueden ayudar con el ingreso al panel y la conexión de mi WhatsApp?`
    );
    const advisorWhatsAppUrl = `https://wa.me/593963410409?text=${advisorMessage}`;

    return (
      <div className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 bg-[#131110] border border-[#2a2520] space-y-6">
          <div className="space-y-2 text-center">
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c]">
              Cuenta Activa
            </span>
            <h2 className="font-display text-3xl font-light text-[#d97644]">
              Bienvenido, {created.name}
            </h2>
            <p className="font-sans text-sm text-[#a89e90] pt-2 leading-relaxed">
              Tu prueba de 15 días está corriendo. Para terminar de configurar
              tu cuenta, un asesor te va a acompañar personalmente.
            </p>
          </div>

          {/* Detalle del trial */}
          <div className="space-y-2 bg-[#0a0807] border border-[#2a2520] p-4">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#5c554c]">Prueba termina:</span>
              <span className="text-[#f3ece1]">{trialDate}</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#5c554c]">Plan:</span>
              <span className="text-[#d97644] font-bold tracking-wider">PRO</span>
            </div>
          </div>

          {/* CTA principal: hablar con un asesor */}
          <div className="space-y-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#5c554c] text-center">
              Siguiente paso
            </p>
            <a
              href={advisorWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] transition-colors text-center"
            >
              Hablar con un Asesor →
            </a>
            <p className="font-sans text-[11px] text-[#a89e90] text-center leading-relaxed">
              Te ayudamos a ingresar al panel y a conectar tu WhatsApp Business.
              Es rápido.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="w-full py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] border border-[#2a2520] hover:border-[#d97644] hover:text-[#d97644] transition-colors"
          >
            Crear Otra Cuenta
          </button>
        </div>
      </div>
    );
  }

  // ─── Formulario ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 bg-[#131110] border border-[#2a2520]">
        <div className="space-y-2 mb-8">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] block">
            Prueba 15 Días · Sin Compromiso
          </span>
          <h1 className="font-display text-4xl font-light">
            Activa tu Barbería
          </h1>
          <p className="font-sans text-sm text-[#a89e90] pt-2 leading-relaxed">
            Crea tu cuenta gratis. Sin tarjeta, sin contratos. Si te sirve,
            la activas. Si no, se suspende sola.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-800 text-red-400 font-mono text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-2">
              Nombre de tu Barbería *
            </label>
            <input
              type="text"
              name="name"
              required
              minLength={2}
              maxLength={80}
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej. Barbería El Elegante"
              className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644] transition-colors"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-2">
              WhatsApp Business (con prefijo país) *
            </label>
            <input
              type="tel"
              name="whatsappNumber"
              required
              value={formData.whatsappNumber}
              onChange={handleChange}
              placeholder="Ej. 593963410409"
              className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644] transition-colors"
            />
            <p className="mt-1 font-mono text-[10px] text-[#5c554c]">
              Usaremos este número para conectar tu WhatsApp Business.
            </p>
          </div>

          {/* Cortes requeridos */}
          <div>
            <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-2">
              ¿Cada cuántos cortes el cliente gana un premio?
            </label>
            <input
              type="number"
              name="requiredCuts"
              required
              min={1}
              max={50}
              value={formData.requiredCuts}
              onChange={handleChange}
              className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644] transition-colors"
            />
            <p className="mt-1 font-mono text-[10px] text-[#5c554c]">
              Ej. 5 = al quinto corte el cliente gana uno gratis.
            </p>
          </div>

          {/* Link Google Reviews */}
          <div>
            <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-2">
              Link de Reseña Google (opcional)
            </label>
            <input
              type="url"
              name="googleMapsUrl"
              value={formData.googleMapsUrl}
              onChange={handleChange}
              placeholder="https://g.page/r/..."
              className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644] transition-colors"
            />
            <p className="mt-1 font-mono text-[10px] text-[#5c554c]">
              Lo puedes agregar después desde tu panel.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
          >
            {loading ? "Creando tu cuenta..." : "Activar 15 Días Gratis"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#2a2520] space-y-2 text-center">
          <p className="font-mono text-[10px] text-[#5c554c]">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/login"
              className="text-[#d97644] hover:text-[#e8854f] transition-colors tracking-wider"
            >
              Ingresar con mi PIN →
            </a>
          </p>
          <p className="font-mono text-[9px] text-[#5c554c]/70 tracking-wider">
            Al activar aceptas los términos. Sin cobros automáticos.
          </p>
        </div>
      </div>
    </div>
  );
}