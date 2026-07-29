"use client";

// src/app/(public)/alianza/AlianzaForm.tsx
// Formulario del Programa de Aliados Comerciales.
// 3 secciones: (1) datos del aliado, (2) código/territorio, (3) comisiones + firma.
// Validación inline + botón "Generar PDF" que descarga al instante.

import { useMemo, useState } from "react";
import { METODOS_PAGO, MESES_FIRMA } from "@/lib/alianza-schema";
import type { AlianzaInput } from "@/lib/alianza-schema";

type FormState = {
  nombreCompleto: string;
  cedula: string;
  celular: string;
  nombreNegocio: string;
  direccion: string;

  codigoAsignado: string;
  fechaAsignacion: string; // yyyy-mm-dd, viene del server (hoy)

  zonaTerritorio: string;

  diasPagoComision: number;
  metodoPago: "" | (typeof METODOS_PAGO)[number];

  ciudadFirma: string;
  diaFirma: number;
  mesFirma: (typeof MESES_FIRMA)[number];
  anioFirma: number;
};

// Genera código de 8 chars (mismo alfabeto que el backend).
function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 8; i++) c += chars[Math.floor(Math.random() * chars.length)];
  return c;
}

// Validador minimalista cliente-side (la verdad vive en el server).
type FieldErrors = Partial<Record<keyof FormState, string>>;
function validate(form: FormState): FieldErrors {
  const e: FieldErrors = {};
  if (!form.nombreCompleto.trim() || form.nombreCompleto.trim().length < 2)
    e.nombreCompleto = "Mínimo 2 caracteres";
  if (!/^[0-9]{6,13}$/.test(form.cedula.trim()))
    e.cedula = "Cédula: solo dígitos (6 a 13)";
  if (!/^593\d{9,10}$/.test(form.celular.replace(/\D/g, "").replace(/^0/, "593").replace(/^([^5])/, "593$1")))
    e.celular = "Celular ecuatoriano (ej. 593991234567)";
  if (!form.nombreNegocio.trim() || form.nombreNegocio.trim().length < 2)
    e.nombreNegocio = "Mínimo 2 caracteres";
  if (!form.direccion.trim() || form.direccion.trim().length < 3)
    e.direccion = "Mínimo 3 caracteres";
  if (!/^[A-Z0-9]{8}$/.test(form.codigoAsignado))
    e.codigoAsignado = "8 caracteres A-Z/0-9";
  if (!form.metodoPago) e.metodoPago = "Selecciona método";
  if (form.diasPagoComision < 1 || form.diasPagoComision > 30)
    e.diasPagoComision = "1 a 30";
  if (!form.ciudadFirma.trim()) e.ciudadFirma = "Requerido";
  if (form.diaFirma < 1 || form.diaFirma > 31) e.diaFirma = "1 a 31";
  if (!form.mesFirma) e.mesFirma = "Requerido";
  if (form.anioFirma < 2026) e.anioFirma = "2026 o posterior";
  return e;
}

function todayISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export default function AlianzaForm() {
  const [form, setForm] = useState<FormState>({
    nombreCompleto: "",
    cedula: "",
    celular: "",
    nombreNegocio: "",
    direccion: "",
    codigoAsignado: genCode(),
    fechaAsignacion: todayISO(),
    zonaTerritorio: "",
    diasPagoComision: 5,
    metodoPago: "",
    ciudadFirma: "Loja",
    diaFirma: new Date().getDate(),
    mesFirma: MESES_FIRMA[new Date().getMonth()],
    anioFirma: 2026,
  });

  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<
    { codigo: string; vendedorId: string; alianzaId: string; signedPayload: AlianzaInput } | null
  >(null);

  const errors = useMemo(() => validate(form), [form]);
  const isValid = Object.keys(errors).length === 0;

  const showError = (key: keyof FormState): string | undefined =>
    touched[key] ? errors[key] : undefined;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
  };
  const markTouched = (k: keyof FormState) =>
    setTouched((prev) => ({ ...prev, [k]: true }));

  const payload = (): AlianzaInput => ({
    nombreCompleto: form.nombreCompleto.trim(),
    cedula: form.cedula.trim(),
    celular: form.celular.trim(),
    nombreNegocio: form.nombreNegocio.trim(),
    direccion: form.direccion.trim(),
    codigoAsignado: form.codigoAsignado,
    zonaTerritorio: form.zonaTerritorio,
    diasPagoComision: Number(form.diasPagoComision),
    metodoPago: (form.metodoPago || "transferencia") as AlianzaInput["metodoPago"],
    ciudadFirma: form.ciudadFirma.trim(),
    diaFirma: Number(form.diaFirma),
    mesFirma: form.mesFirma,
    anioFirma: Number(form.anioFirma),
  });

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setPreviewError(null);

    const allKeys = Object.keys(form) as (keyof FormState)[];
    setTouched(Object.fromEntries(allKeys.map((k) => [k, true])) as typeof touched);

    if (!isValid) return;

    setPreviewing(true);
    try {
      const res = await fetch("/api/alianza/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setPreviewError(
          body?.error ||
            (res.status === 422
              ? "Datos inválidos — revisa los campos marcados"
              : "Error del servidor")
        );
        setPreviewing(false);
        return;
      }

      // Convertimos el blob a URL para el iframe
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch {
      setPreviewError("Error de conexión");
    } finally {
      // NO cerramos previewing aquí: el modal queda abierto con el PDF
    }
  };

  const handleSign = async () => {
    setSigning(true);
    setServerError(null);
    try {
      const res = await fetch("/api/alianza", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setServerError(
          body?.error ||
            (res.status === 422
              ? "Datos inválidos — revisa los campos marcados"
              : "Error del servidor")
        );
        setSigning(false);
        return;
      }

      const data = await res.json();
      // cerrar preview antes de mostrar success
      closePreview();
      setSuccess({
        codigo: data.codigo,
        vendedorId: data.vendedorId,
        alianzaId: data.alianzaId,
        signedPayload: payload(),
      });
    } catch {
      setServerError("Error de conexión");
    } finally {
      setSigning(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewing(false);
  };

  // ============ ESTADO POST-SUBMIT ============
  if (success) {
    return <SuccessCard
      codigo={success.codigo}
      payload={success.signedPayload}
      onReset={() => {
        setSuccess(null);
        setTouched({});
        setForm((prev) => ({ ...prev, codigoAsignado: genCode() }));
      }}
    />;
  }

  // ============ FORMULARIO ============
  return (
    <>
    <form
      onSubmit={handlePreview}
      className="space-y-12"
      noValidate
    >
      <SectionHeader index="01" title="Datos del Aliado" subtitle="Persona natural que firma como ALIADO" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Nombre completo" required error={showError("nombreCompleto")}>
          <input
            type="text"
            value={form.nombreCompleto}
            onChange={(e) => set("nombreCompleto", e.target.value)}
            onBlur={() => markTouched("nombreCompleto")}
            placeholder="Ej. María Fernanda Vega"
            className={inputClass(!!showError("nombreCompleto"))}
            autoComplete="name"
          />
        </Field>

        <Field label="Cédula de identidad" required error={showError("cedula")}>
          <input
            type="text"
            inputMode="numeric"
            value={form.cedula}
            onChange={(e) => set("cedula", e.target.value.replace(/\D/g, ""))}
            onBlur={() => markTouched("cedula")}
            placeholder="10 dígitos, sin guiones"
            maxLength={13}
            className={inputClass(!!showError("cedula"))}
          />
        </Field>

        <Field label="Teléfono / WhatsApp" required error={showError("celular")}>
          <input
            type="tel"
            inputMode="numeric"
            value={form.celular}
            onChange={(e) => set("celular", e.target.value.replace(/\D/g, ""))}
            onBlur={() => markTouched("celular")}
            placeholder="593991234567"
            className={inputClass(!!showError("celular"))}
            autoComplete="tel"
          />
        </Field>

        <Field label="Nombre del negocio" required error={showError("nombreNegocio")}>
          <input
            type="text"
            value={form.nombreNegocio}
            onChange={(e) => set("nombreNegocio", e.target.value)}
            onBlur={() => markTouched("nombreNegocio")}
            placeholder="Ej. Distribuidora Vega"
            className={inputClass(!!showError("nombreNegocio"))}
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Dirección" required error={showError("direccion")}>
            <input
              type="text"
              value={form.direccion}
              onChange={(e) => set("direccion", e.target.value)}
              onBlur={() => markTouched("direccion")}
              placeholder="Calle, número, ciudad"
              className={inputClass(!!showError("direccion"))}
              autoComplete="street-address"
            />
          </Field>
        </div>
      </div>

      <SectionHeader index="02" title="Código y territorio" subtitle="Identificador único del ALIADO en el sistema" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Field label="Código asignado" required error={showError("codigoAsignado")}>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.codigoAsignado}
              onChange={(e) =>
                set("codigoAsignado", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))
              }
              onBlur={() => markTouched("codigoAsignado")}
              className={inputClass(!!showError("codigoAsignado"), true)}
              maxLength={8}
            />
            <button
              type="button"
              onClick={() => set("codigoAsignado", genCode())}
              className="shrink-0 px-3 py-2 border border-[#2a2520] hover:border-[#d97644] hover:text-[#d97644] text-[#5c554c] font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
            >
              Regenerar
            </button>
          </div>
        </Field>

        <Field label="Fecha de asignación" required>
          <input
            type="date"
            value={form.fechaAsignacion}
            onChange={(e) => set("fechaAsignacion", e.target.value)}
            className={inputClass(false, true)}
            disabled
          />
        </Field>

        <Field label="Zona / territorio" hint="Opcional — ver Cláusula 2">
          <input
            type="text"
            value={form.zonaTerritorio}
            onChange={(e) => set("zonaTerritorio", e.target.value)}
            placeholder="Ej. Zona sur de Loja"
            className={inputClass(false)}
          />
        </Field>
      </div>

      <SectionHeader index="03" title="Comisiones y firma" subtitle="Cláusulas 3.6 y bloque de firma" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Día límite de pago (1–30)" required error={showError("diasPagoComision")}>
          <input
            type="number"
            min={1}
            max={30}
            value={form.diasPagoComision}
            onChange={(e) => set("diasPagoComision", Number(e.target.value))}
            onBlur={() => markTouched("diasPagoComision")}
            className={inputClass(!!showError("diasPagoComision"), true)}
          />
        </Field>

        <Field label="Método de pago" required error={showError("metodoPago")}>
          <select
            value={form.metodoPago}
            onChange={(e) => set("metodoPago", e.target.value as FormState["metodoPago"])}
            onBlur={() => markTouched("metodoPago")}
            className={inputClass(!!showError("metodoPago"), true)}
          >
            <option value="">— Selecciona —</option>
            <option value="transferencia">Transferencia bancaria</option>
            <option value="payphone">Payphone</option>
            <option value="efectivo">Efectivo</option>
            <option value="otro">Otro</option>
          </select>
        </Field>

        <Field label="Ciudad de firma" required error={showError("ciudadFirma")}>
          <input
            type="text"
            value={form.ciudadFirma}
            onChange={(e) => set("ciudadFirma", e.target.value)}
            onBlur={() => markTouched("ciudadFirma")}
            placeholder="Ej. Loja"
            className={inputClass(!!showError("ciudadFirma"))}
          />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Día" required error={showError("diaFirma")}>
            <input
              type="number"
              min={1}
              max={31}
              value={form.diaFirma}
              onChange={(e) => set("diaFirma", Number(e.target.value))}
              onBlur={() => markTouched("diaFirma")}
              className={inputClass(!!showError("diaFirma"), true)}
            />
          </Field>
          <Field label="Mes" required error={showError("mesFirma")}>
            <select
              value={form.mesFirma}
              onChange={(e) => set("mesFirma", e.target.value as FormState["mesFirma"])}
              onBlur={() => markTouched("mesFirma")}
              className={inputClass(!!showError("mesFirma"), true)}
            >
              {MESES_FIRMA.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Año" required error={showError("anioFirma")}>
            <input
              type="number"
              min={2026}
              max={2099}
              value={form.anioFirma}
              onChange={(e) => set("anioFirma", Number(e.target.value))}
              onBlur={() => markTouched("anioFirma")}
              className={inputClass(!!showError("anioFirma"), true)}
            />
          </Field>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border border-[#2a2520] bg-[#131110] p-5 text-sm text-[#a89e90] leading-relaxed">
        Al hacer clic en <span className="text-[#d97644] font-medium">"Vista previa"</span>,
        verás el PDF del contrato con tus datos antes de firmar. Solo cuando confirmes
        en la vista previa se creará tu registro de Aliado y se guardará el documento.
      </div>

      {serverError && (
        <div className="border border-red-800 bg-red-950/40 p-4 text-red-400 font-mono text-xs">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={previewing && !previewUrl}
        className="w-full py-4 bg-[#d97644] hover:bg-[#e28b5c] disabled:bg-[#5c554c] disabled:cursor-not-allowed text-[#0a0807] font-mono text-xs tracking-[0.3em] uppercase font-bold transition-colors"
      >
        {previewing && !previewUrl ? "Generando vista previa…" : "Vista previa del contrato →"}
      </button>
    </form>

    {/* Modal de Vista Previa */}
    {previewing && (
      <PreviewModal
        pdfUrl={previewUrl}
        error={previewError}
        signing={signing}
        onClose={closePreview}
        onSign={handleSign}
      />
    )}
    </>
  );
}

// =============================================================
// SUBCOMPONENTES
// =============================================================

/**
 * Modal de vista previa del PDF. Muestra el contrato con los datos del form
 * antes de persistir. Tiene 2 acciones: cerrar (volver al form) y
 * "Confirmar y firmar" (crea vendedor + alianza + descarga PDF persistido).
 */
function PreviewModal({
  pdfUrl,
  error,
  signing,
  onClose,
  onSign,
}: {
  pdfUrl: string | null;
  error: string | null;
  signing: boolean;
  onClose: () => void;
  onSign: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-title"
    >
      <div className="bg-[#131110] border border-[#2a2520] w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2520]">
          <div>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#d97644] block">
              Vista previa · no firmado
            </span>
            <h2
              id="preview-title"
              className="font-display text-xl text-[#f3ece1] mt-0.5"
            >
              Revisa el contrato antes de firmar
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={signing}
            className="font-mono text-xs tracking-wider uppercase text-[#5c554c] hover:text-[#f3ece1] disabled:opacity-50 transition-colors"
            aria-label="Cerrar vista previa"
          >
            ✕ Cerrar
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 bg-[#0a0807] overflow-hidden relative">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <div className="max-w-md">
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-red-400 mb-3">
                  Error al generar vista previa
                </p>
                <p className="text-[#a89e90]">{error}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 py-2 px-5 border border-[#2a2520] hover:border-[#d97644] hover:text-[#d97644] text-[#5c554c] font-mono text-[10px] uppercase tracking-[0.2em] transition-colors"
                >
                  Volver al formulario
                </button>
              </div>
            </div>
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="Vista previa del contrato"
              className="w-full h-full border-0"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#d97644] mb-3 animate-pulse">
                  Generando PDF
                </div>
                <div className="w-10 h-10 border-2 border-[#2a2520] border-t-[#d97644] rounded-full animate-spin mx-auto" />
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {pdfUrl && !error && (
          <div className="px-5 py-4 border-t border-[#2a2520] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <p className="font-mono text-[10px] tracking-wider uppercase text-[#5c554c]">
              {signing
                ? "Firmando y guardando…"
                : "Al confirmar, se creará tu registro y se guardará el PDF."}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={signing}
                className="py-3 px-5 border border-[#2a2520] hover:border-[#d97644] hover:text-[#d97644] text-[#5c554c] font-mono text-[10px] uppercase tracking-[0.2em] disabled:opacity-50 transition-colors"
              >
                Editar datos
              </button>
              <button
                type="button"
                onClick={onSign}
                disabled={signing}
                className="py-3 px-5 bg-[#d97644] hover:bg-[#e28b5c] disabled:bg-[#5c554c] text-[#0a0807] font-mono text-[10px] uppercase tracking-[0.2em] font-bold transition-colors"
              >
                {signing ? "Firmando…" : "Confirmar y firmar →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  index,
  title,
  subtitle,
}: {
  index: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-baseline gap-4 pb-3 border-b border-[#2a2520]">
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#d97644]">
        {index}
      </span>
      <div className="flex-1">
        <h2 className="font-display text-2xl text-[#f3ece1] leading-tight">
          {title}
        </h2>
        <p className="font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mb-2">
        {label}
        {required && <span className="text-[#d97644] ml-1">*</span>}
        {hint && (
          <span className="ml-2 text-[#5c554c] normal-case tracking-normal">
            · {hint}
          </span>
        )}
      </span>
      {children}
      {error && (
        <span className="block mt-1.5 text-[10px] text-red-400 font-mono">
          {error}
        </span>
      )}
    </label>
  );
}

function inputClass(hasError: boolean, mono: boolean = false): string {
  const fonts: string = mono ? "font-mono tracking-wider" : "font-sans";
  const border: string = hasError
    ? "border-red-700 focus:border-red-500"
    : "border-[#2a2520] focus:border-[#d97644]";
  const out: string = [
    "w-full px-4 py-3 text-sm bg-[#0a0807] border focus:outline-none transition-colors",
    fonts,
    border,
    "text-[#f3ece1] placeholder:text-[#5c554c]",
  ].join(" ");
  return out;
}

function SuccessCard({
  codigo,
  payload,
  onReset,
}: {
  codigo: string;
  payload: AlianzaInput;
  onReset: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  const downloadPdf = async () => {
    setDownloading(true);
    try {
      const res = await fetch("/api/alianza/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Alianza-BarberosPlus-${codigo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("No se pudo generar el PDF. Contáctanos por WhatsApp.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="border border-[#2a2520] bg-[#131110] p-8 sm:p-10 text-center">
      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4ADE80] mb-3">
        Alianza firmada
      </div>
      <h2 className="font-display text-4xl text-[#f3ece1] mb-2">¡Listo!</h2>
      <p className="text-[#a89e90] mb-8 max-w-md mx-auto">
        Tu Alianza Estratégica Comercial fue registrada. El PDF ya está guardado
        en la base de datos y listo para descargar.
      </p>

      <div className="border border-[#2a2520] bg-[#0a0807] py-4 px-6 mb-8 inline-block">
        <span className="block font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] mb-1">
          Tu código
        </span>
        <span className="font-mono text-2xl text-[#d97644] tracking-[0.3em] font-bold">
          {codigo}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          onClick={downloadPdf}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-[#d97644] hover:bg-[#e28b5c] disabled:bg-[#5c554c] text-[#0a0807] font-mono text-xs tracking-[0.2em] uppercase font-bold transition-colors"
        >
          {downloading ? "Generando…" : "↓ Descargar PDF firmado"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="py-3 px-6 border border-[#2a2520] hover:border-[#d97644] hover:text-[#d97644] text-[#5c554c] font-mono text-xs tracking-[0.2em] uppercase transition-colors"
        >
          Crear otra alianza
        </button>
      </div>

      <p className="font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mt-8">
        Tu código quedó registrado. Si necesitas una copia adicional, contáctanos por WhatsApp.
      </p>
    </div>
  );
}