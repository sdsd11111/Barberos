"use client";

import { useState } from "react";

interface DownloadQRButtonProps {
  qrUrl: string;
  barbershopName: string;
}

export default function DownloadQRButton({ qrUrl, barbershopName }: DownloadQRButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Descargar la imagen como Blob para forzar descarga limpia de archivo en el navegador
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const cleanName = barbershopName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      link.download = `qr_barberia_${cleanName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error descargando el código QR:", err);
      // Fallback si la descarga por blob se bloquea
      window.open(qrUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="mt-2 px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] uppercase text-[#d97644] border border-[#d97644]/40 hover:border-[#d97644] hover:bg-[#d97644]/10 transition-all rounded disabled:opacity-50 flex items-center gap-1.5"
    >
      <span>⬇</span>
      <span>{downloading ? "Guardando..." : "Descargar QR"}</span>
    </button>
  );
}
