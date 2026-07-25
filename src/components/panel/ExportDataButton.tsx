"use client";

import { useState } from "react";

const MESES = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
];

export default function ExportDataButton({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const [showModal, setShowModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString();

  const [filterType, setFilterType] = useState<"all" | "month">("all");
  const [formatType, setFormatType] = useState<"csv" | "json">("csv");
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

  const handleDownload = async () => {
    try {
      setDownloading(true);
      let url = `/api/export?format=${formatType}`;
      if (filterType === "month") {
        url += `&month=${selectedMonth}&year=${selectedYear}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Error al exportar los datos");
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get("Content-Disposition");
      let filename = "respaldo_barberOS.json";

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setShowModal(false);
    } catch (err) {
      console.error("Error descargando respaldo:", err);
      alert("Hubo un error al descargar los datos. Por favor reintenta.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      {variant === "compact" ? (
        <button
          onClick={() => setShowModal(true)}
          title="Descargar datos de clientes, barberos y visitas"
          className="flex items-center gap-2 bg-[#131110] border border-[#2a2520] hover:border-[#d97644] text-[#f3ece1] hover:text-[#d97644] px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all"
        >
          <svg
            className="w-4 h-4 text-[#d97644]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Descargar Datos</span>
        </button>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-[#131110] hover:bg-[#1a1715] border border-[#2a2520] hover:border-[#d97644] text-[#f3ece1] hover:text-[#d97644] px-4 py-2 text-xs font-mono tracking-[0.15em] uppercase transition-all duration-200 shadow-sm group"
        >
          <svg
            className="w-4 h-4 text-[#d97644] group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span>Descargar Datos</span>
        </button>
      )}

      {/* Modal de selección de periodo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#131110] border border-[#2a2520] max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-[#2a2520] pb-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#d97644]">
                  Exportación de Datos
                </p>
                <h3 className="font-display text-xl font-light text-[#f3ece1]">
                  Seleccionar Periodo
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#5c554c] hover:text-[#f3ece1] text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Formato de archivo */}
              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] block mb-2">
                  Formato de archivo:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormatType("csv")}
                    className={`p-3 border font-mono text-xs text-left transition-all ${
                      formatType === "csv"
                        ? "border-[#d97644] bg-[#d97644]/10 text-[#d97644]"
                        : "border-[#2a2520] bg-[#0a0807] text-[#5c554c] hover:text-[#f3ece1]"
                    }`}
                  >
                    <p className="font-bold text-sm">📊 Excel (.XLSX)</p>
                    <p className="text-[10px] mt-0.5 opacity-80">Libro nativo con pestañas separadas y columnas ordenadas.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormatType("json")}
                    className={`p-3 border font-mono text-xs text-left transition-all ${
                      formatType === "json"
                        ? "border-[#d97644] bg-[#d97644]/10 text-[#d97644]"
                        : "border-[#2a2520] bg-[#0a0807] text-[#5c554c] hover:text-[#f3ece1]"
                    }`}
                  >
                    <p className="font-bold text-sm">📁 JSON (Respaldo)</p>
                    <p className="text-[10px] mt-0.5 opacity-80">Copia técnica estructurada de todos los datos.</p>
                  </button>
                </div>
              </div>

              {/* Rango de periodo */}
              <div>
                <label className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#5c554c] block mb-2">
                  Periodo a exportar:
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 bg-[#0a0807] border border-[#2a2520] cursor-pointer hover:border-[#d97644]/50 transition-colors">
                    <input
                      type="radio"
                      name="filterType"
                      checked={filterType === "all"}
                      onChange={() => setFilterType("all")}
                      className="accent-[#d97644]"
                    />
                    <div>
                      <p className="font-mono text-xs text-[#f3ece1]">Todo el Histórico</p>
                      <p className="font-mono text-[10px] text-[#5c554c]">
                        Descarga completa de todos los tiempos (clientes, barberos, visitas y reseñas).
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 bg-[#0a0807] border border-[#2a2520] cursor-pointer hover:border-[#d97644]/50 transition-colors">
                    <input
                      type="radio"
                      name="filterType"
                      checked={filterType === "month"}
                      onChange={() => setFilterType("month")}
                      className="accent-[#d97644] mt-1"
                    />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="font-mono text-xs text-[#f3ece1]">Filtrar por Mes Específico</p>
                        <p className="font-mono text-[10px] text-[#5c554c]">
                          Descarga únicamente la actividad y visitas del mes seleccionado.
                        </p>
                      </div>

                      {filterType === "month" && (
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div>
                            <label className="font-mono text-[10px] text-[#5c554c] block mb-1">
                              Mes:
                            </label>
                            <select
                              value={selectedMonth}
                              onChange={(e) => setSelectedMonth(e.target.value)}
                              className="w-full bg-[#131110] border border-[#2a2520] text-[#f3ece1] text-xs font-mono p-2 focus:border-[#d97644] focus:outline-none"
                            >
                              {MESES.map((m) => (
                                <option key={m.value} value={m.value}>
                                  {m.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="font-mono text-[10px] text-[#5c554c] block mb-1">
                              Año:
                            </label>
                            <select
                              value={selectedYear}
                              onChange={(e) => setSelectedYear(e.target.value)}
                              className="w-full bg-[#131110] border border-[#2a2520] text-[#f3ece1] text-xs font-mono p-2 focus:border-[#d97644] focus:outline-none"
                            >
                              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                                <option key={y} value={y.toString()}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-[#2a2520] text-[#5c554c] hover:text-[#f3ece1] font-mono text-xs uppercase"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="px-5 py-2 bg-[#d97644] hover:bg-[#c26535] text-black font-mono text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {downloading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    <span>Descargando...</span>
                  </>
                ) : (
                  <span>Descargar Archivo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
