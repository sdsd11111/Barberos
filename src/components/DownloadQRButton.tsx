"use client";

import { useState, type ReactNode } from "react";

interface DownloadQRButtonProps {
  /** URL (externa o interna) del QR a descargar */
  qrUrl: string;
  /** Nombre legible, se sanitiza para el archivo final */
  barbershopName: string;
  /** Prefijo del nombre del archivo descargado. Default: "qr_barberia" */
  filePrefix?: string;
  /** Variante visual: "panel" (botón pequeño con borde) o "solid" (botón grande naranja) */
  variant?: "panel" | "solid";
  /** Texto del botón (opcional, sobrescribe el default) */
  label?: string;
  /** Icono opcional a la izquierda del texto */
  icon?: ReactNode;
  /** Clases extra para sobreescribir estilos */
  className?: string;
}

export default function DownloadQRButton({
  qrUrl,
  barbershopName,
  filePrefix = "qr_barberia",
  variant = "panel",
  label,
  icon,
  className = "",
}: DownloadQRButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // 1) Traer la imagen como Blob para forzar descarga real en el navegador.
      //    El atributo `download` del <a> SOLO funciona con URLs del mismo origen
      //    o con data:/blob: URLs — por eso un <a href="https://api.qrserver...">
      //    abre en pestaña en lugar de descargar.
      const response = await fetch(qrUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      const cleanName = barbershopName.toLowerCase().replace(/[^a-z0-9]/g, "_");
      link.download = `${filePrefix}_${cleanName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error descargando el código QR:", err);
      // Fallback: si el fetch falla (CORS, offline, etc.) abrir en nueva pestaña
      window.open(qrUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const baseClasses =
    "font-mono tracking-[0.2em] uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  const variantClasses =
    variant === "solid"
      ? "w-full py-3 text-xs text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f]"
      : "mt-2 px-3 py-1.5 text-[10px] tracking-[0.15em] text-[#d97644] border border-[#d97644]/40 hover:border-[#d97644] hover:bg-[#d97644]/10 rounded";

  const defaultIcon = variant === "solid" ? <span>⬇</span> : <span>⬇</span>;
  const defaultLabel = variant === "solid"
    ? (downloading ? "Guardando..." : "Descargar QR")
    : (downloading ? "Guardando..." : "Descargar QR");

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className={`${baseClasses} ${variantClasses} ${className}`}
    >
      {icon ?? defaultIcon}
      <span>{label ?? defaultLabel}</span>
    </button>
  );
}
