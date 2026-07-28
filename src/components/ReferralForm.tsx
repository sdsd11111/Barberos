"use client";

import { useState } from "react";
import { getQrDataUrl, getWhatsAppUrl } from "@/lib/qr-generator";
import DownloadQRButton from "@/components/DownloadQRButton";

interface Vendedor {
  id: string;
  nombre: string;
  celular: string;
  negocio: string;
  direccion: string;
  codigoUnico: string;
  scansCount: number;
}

export default function ReferralForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    celular: "",
    negocio: "",
    direccion: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdVendedor, setCreatedVendedor] = useState<Vendedor | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/referidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const vendedor = await response.json();
        setCreatedVendedor(vendedor);
      } else {
        const errData = await response.json();
        setError(errData.error || "Error al crear");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ nombre: "", celular: "", negocio: "", direccion: "" });
    setCreatedVendedor(null);
  };

  if (createdVendedor) {
    const qrUrl = getQrDataUrl(createdVendedor.codigoUnico, 300);
    const whatsappUrl = getWhatsAppUrl(createdVendedor.codigoUnico);

    return (
      <div className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 bg-[#131110] border border-[#2a2520] space-y-6 text-center">
          <div className="space-y-2">
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c]">
              Registro Exitoso
            </span>
            <h2 className="font-display text-3xl font-light text-[#d97644]">
              ¡Listo, {createdVendedor.nombre}!
            </h2>
          </div>

          <p className="font-mono text-xs text-[#a89e90]">
            Tu código QR ha sido generado. Muéstralo a potenciales clientes.
          </p>

          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white">
            <img src={qrUrl} alt="QR Code" width={200} height={200} />
          </div>

          {/* Descargar QR */}
          <DownloadQRButton
            qrUrl={qrUrl}
            barbershopName={createdVendedor.codigoUnico}
            filePrefix="QR"
            variant="solid"
          />

          {/* Info */}
          <div className="space-y-2 text-left bg-[#0a0807] border border-[#2a2520] p-4">
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#5c554c]">Código:</span>
              <span className="text-[#d97644] font-bold tracking-wider">{createdVendedor.codigoUnico}</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#5c554c]">Negocio:</span>
              <span className="text-[#f3ece1]">{createdVendedor.negocio}</span>
            </div>
            <div className="flex justify-between font-mono text-xs">
              <span className="text-[#5c554c]">Dirección:</span>
              <span className="text-[#f3ece1]">{createdVendedor.direccion}</span>
            </div>
          </div>

          {/* WhatsApp link */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#25D366] hover:bg-[#128C7E] transition-colors text-center"
          >
            Probar WhatsApp ↗
          </a>

          <button
            onClick={resetForm}
            className="w-full py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] border border-[#2a2520] hover:border-[#d97644] hover:text-[#d97644] transition-colors"
          >
            Crear Otro Vendedor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 bg-[#131110] border border-[#2a2520]">
        <div className="space-y-2 mb-8">
          <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] block">
            Conviértete en Vendedor
          </span>
          <h1 className="font-display text-4xl font-light">Registro QR</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-800 text-red-400 font-mono text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej. Juan Pérez"
              className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-2">
              Celular (con prefijo país)
            </label>
            <input
              type="tel"
              name="celular"
              required
              value={formData.celular}
              onChange={handleChange}
              placeholder="Ej. 593991234567"
              className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-2">
              Nombre del Negocio
            </label>
            <input
              type="text"
              name="negocio"
              required
              value={formData.negocio}
              onChange={handleChange}
              placeholder="Ej. Barbería El Elegante"
              className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-2">
              Dirección
            </label>
            <input
              type="text"
              name="direccion"
              required
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej. Av. Principal 123, Centro"
              className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] disabled:opacity-50 transition-colors"
          >
            {loading ? "Creando..." : "Generar Mi Código QR"}
          </button>
        </form>

        <p className="mt-6 font-mono text-[10px] text-[#5c554c] text-center">
          Al registrarte, generarás un código QR único que podrás compartir.
        </p>
      </div>
    </div>
  );
}
