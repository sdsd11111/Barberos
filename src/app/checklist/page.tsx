"use client";

import { useEffect, useState } from "react";

interface SessionData {
  id: number;
  date: string;
  barberName: string;
  p0: string;
  p1: string;
  p2: string;
  p2_resp: string;
  p3: string;
  p4a: string;
  p4b: string;
  p5: string;
  p6: string;
  avatar: string;
  notes: string;
}

export default function ChecklistPage() {
  const [memoryStorage, setMemoryStorage] = useState<SessionData[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [selectedDetail, setSelectedDetail] = useState<SessionData | null>(null);

  // Campos de formulario
  const [barberName, setBarberName] = useState("");
  const [p0, setP0] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [p2Resp, setP2Resp] = useState("");
  const [showP2Extra, setShowP2Extra] = useState(false);
  const [p3, setP3] = useState("");
  const [p4a, setP4a] = useState("");
  const [p4b, setP4b] = useState("");
  const [showP4Extra, setShowP4Extra] = useState(false);
  const [p5, setP5] = useState("");
  const [p6, setP6] = useState("");
  const [notes, setNotes] = useState("");

  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("barberos_sessions");
      if (saved) {
        setMemoryStorage(JSON.parse(saved));
      }
    } catch {
      console.log("LocalStorage no disponible");
    }
  }, []);

  const saveToLocalStorage = (data: SessionData[]) => {
    setMemoryStorage(data);
    try {
      localStorage.setItem("barberos_sessions", JSON.stringify(data));
    } catch {
      // Ignorar bloqueo de storage
    }
  };

  const clearForm = () => {
    setBarberName("");
    setP0("");
    setP1("");
    setP2("");
    setP2Resp("");
    setShowP2Extra(false);
    setP3("");
    setP4a("");
    setP4b("");
    setShowP4Extra(false);
    setP5("");
    setP6("");
    setSelectedAvatar("");
    setNotes("");
  };

  const handleSaveSession = () => {
    if (!barberName && !p0) {
      alert("Escribe al menos el nombre o la primera respuesta.");
      return;
    }

    const newSession: SessionData = {
      id: Date.now(),
      date: new Date().toLocaleString("es-EC", { timeZone: "America/Guayaquil" }),
      barberName,
      p0,
      p1,
      p2,
      p2_resp: p2Resp,
      p3,
      p4a,
      p4b,
      p5,
      p6,
      avatar: selectedAvatar,
      notes,
    };

    const updated = [newSession, ...memoryStorage];
    saveToLocalStorage(updated);

    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(200);
    }

    setSaveStatus("saved");
    setTimeout(() => {
      setSaveStatus("idle");
      clearForm();
    }, 1500);
  };

  const handleDeleteSession = (id: number) => {
    if (!confirm("¿Eliminar esta sesión?")) return;
    const updated = memoryStorage.filter((s) => s.id !== id);
    saveToLocalStorage(updated);
    if (selectedDetail && selectedDetail.id === id) {
      setSelectedDetail(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-28">
      <div className="max-w-md mx-auto p-4">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-5">
          <h1 className="font-display text-3xl font-light text-[#FF6B1A] tracking-wider">
            BarberOS Checklist
          </h1>
          <button
            onClick={() => {
              setSelectedDetail(null);
              setShowHistoryModal(true);
            }}
            className="text-sm text-gray-400 underline font-mono"
          >
            Ver Historial ({memoryStorage.length})
          </button>
        </div>

        {/* Nombre del barbero / local */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 mb-4">
          <input
            type="text"
            value={barberName}
            onChange={(e) => setBarberName(e.target.value)}
            placeholder="Nombre del barbero / local"
            className="w-full bg-transparent border-none text-lg font-bold text-white focus:outline-none p-2 placeholder-gray-600"
          />
        </div>

        {/* Preguntas */}
        <div className="space-y-4">
          {/* P0 */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-[#FF6B1A] text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                0
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                "¿Cómo te va con la barbería? ¿Cómo la llevas ahora mismo?"
              </p>
            </div>
            <textarea
              rows={2}
              value={p0}
              onChange={(e) => setP0(e.target.value)}
              placeholder="Respuesta..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text.white focus:outline-none focus:border-[#FF6B1A] text-sm"
            />
          </div>

          {/* P1 */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-[#FF6B1A] text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                1
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                "¿Tienes idea de cuántos clientes reales tienes ahorita?"
              </p>
            </div>
            <span className="text-xs text-gray-400 italic block mb-2">
              Si duda ("unos 200, creo"), anotar "creo" textual.
            </span>
            <textarea
              rows={2}
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              placeholder="Respuesta..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6B1A] text-sm"
            />
          </div>

          {/* P2 */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-[#FF6B1A] text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                2
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                "¿Más o menos tienes calculado cuántos cortes necesitas al mes para cubrir arriendo, agua, luz, tu casa?"
              </p>
            </div>
            <textarea
              rows={2}
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              placeholder="Respuesta..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6B1A] text-sm"
            />

            <button
              type="button"
              onClick={() => setShowP2Extra(!showP2Extra)}
              className={`w-full mt-3 p-3 rounded-lg text-sm font-semibold border transition-colors ${
                showP2Extra
                  ? "bg-[#FF6B1A] text-black border-[#FF6B1A]"
                  : "bg-[#1a1a1a] text-gray-400 border-[#333] hover:text-white"
              }`}
            >
              Repreguntar (cruce de "no sé")
            </button>

            {showP2Extra && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-base font-bold text-white mb-2">
                  "¿Pero no tienes la cifra exacta, verdad? Y tampoco sabes exactamente cuántos clientes tienes, ¿no?"
                </p>
                <textarea
                  rows={2}
                  value={p2Resp}
                  onChange={(e) => setP2Resp(e.target.value)}
                  placeholder="Reacción al doble 'no sé'..."
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6B1A] text-sm"
                />
              </div>
            )}
          </div>

          {/* P3 */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-[#FF6B1A] text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                3
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                "De esos, ¿cuántos dirías que van a volver este mes?"
              </p>
            </div>
            <textarea
              rows={2}
              value={p3}
              onChange={(e) => setP3(e.target.value)}
              placeholder="Respuesta..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6B1A] text-sm"
            />
          </div>

          {/* P4 */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-[#FF6B1A] text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                4
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                Pregunta sobre sus barberos
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowP4Extra(!showP4Extra)}
              className={`w-full p-3 rounded-lg text-sm font-semibold border transition-colors ${
                showP4Extra
                  ? "bg-[#FF6B1A] text-black border-[#FF6B1A]"
                  : "bg-[#1a1a1a] text-gray-400 border-[#333] hover:text-white"
              }`}
            >
              Desplegar si tiene barberos
            </button>

            {showP4Extra && (
              <div className="mt-3 pt-3 border-t border-gray-800 space-y-4">
                <div>
                  <p className="text-base font-bold text-white mb-2">
                    4A: "¿Cuál de tus barberos hace que más clientes regresen?"
                  </p>
                  <textarea
                    rows={2}
                    value={p4a}
                    onChange={(e) => setP4a(e.target.value)}
                    placeholder='Respuesta (suele decir "se siente")...'
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6B1A] text-sm"
                  />
                </div>
                <div>
                  <p className="text-base font-bold text-white mb-2">
                    4B: "Si mañana ese barbero se va, ¿esos clientes se quedan contigo o se van con él?"
                  </p>
                  <textarea
                    rows={2}
                    value={p4b}
                    onChange={(e) => setP4b(e.target.value)}
                    placeholder="Respuesta..."
                    className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6B1A] text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* P5 */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="bg-[#FF6B1A] text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                5
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                "Este mes, ¿cuánto crees que se te fue por esa puerta sin que lo notaras?"
              </p>
            </div>
            <span className="text-xs text-gray-400 italic block mb-2">
              Silencio de 2-3 segundos. No completar tú el silencio.
            </span>
            <textarea
              rows={2}
              value={p5}
              onChange={(e) => setP5(e.target.value)}
              placeholder="Respuesta..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6B1A] text-sm"
            />
          </div>

          {/* P6 */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-[#FF6B1A] text-black w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                6
              </div>
              <p className="text-lg font-bold text-white leading-tight">
                "¿Vale la pena tener esas respuestas con certeza?"
              </p>
            </div>
            <textarea
              rows={2}
              value={p6}
              onChange={(e) => setP6(e.target.value)}
              placeholder="Cierre y respuesta..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6B1A] text-sm"
            />
          </div>

          {/* Avatar Detectado */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-4">
            <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
              Avatar Detectado
            </div>
            <div className="grid grid-cols-3 gap-2">
              {["1", "2", "fuera"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setSelectedAvatar(val)}
                  className={`p-3 rounded-lg text-sm font-semibold border transition-colors uppercase ${
                    selectedAvatar === val
                      ? "bg-[#FF6B1A] text-black border-[#FF6B1A]"
                      : "bg-[#1a1a1a] text-gray-400 border-[#333] hover:text-white"
                  }`}
                >
                  {val === "fuera" ? "Fuera" : `Avatar ${val}`}
                </button>
              ))}
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas finales..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-white focus:outline-none focus:border-[#FF6B1A] text-sm mt-3"
            />
          </div>
        </div>
      </div>

      {/* Barra inferior fija */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] p-4 border-t border-gray-800 max-w-md mx-auto z-30">
        <button
          onClick={handleSaveSession}
          style={{ backgroundColor: saveStatus === "saved" ? "#10b981" : "#FF6B1A" }}
          className="w-full font-extrabold py-4 rounded-xl text-lg text-black transition-all uppercase tracking-wide"
        >
          {saveStatus === "saved" ? "¡GUARDADO!" : "GUARDAR SESIÓN"}
        </button>
      </div>

      {/* Modal Historial */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto p-5">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Historial</h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-3xl text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {selectedDetail ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <h3 className="text-[#FF6B1A] text-xl font-bold">
                    {selectedDetail.barberName || "Sin nombre"}
                  </h3>
                  <span className="text-xs text-gray-500">{selectedDetail.date}</span>
                </div>

                {[
                  ["P0", selectedDetail.p0],
                  ["P1", selectedDetail.p1],
                  ["P2", selectedDetail.p2],
                  ["P2 Cruce", selectedDetail.p2_resp],
                  ["P3", selectedDetail.p3],
                  ["P4A", selectedDetail.p4a],
                  ["P4B", selectedDetail.p4b],
                  ["P5", selectedDetail.p5],
                  ["P6", selectedDetail.p6],
                  ["Avatar", selectedDetail.avatar],
                  ["Notas", selectedDetail.notes],
                ].map(([label, val]) =>
                  val ? (
                    <div key={label}>
                      <span className="text-xs text-gray-500 uppercase font-bold block mb-1">
                        {label}
                      </span>
                      <div className="bg-[#141414] p-3 rounded text-sm text-gray-200">
                        {val}
                      </div>
                    </div>
                  ) : null
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={() => handleDeleteSession(selectedDetail.id)}
                    className="bg-red-950 text-red-400 border border-red-800 px-4 py-3 rounded-lg text-sm font-bold flex-1"
                  >
                    Eliminar
                  </button>
                  <button
                    onClick={() => setSelectedDetail(null)}
                    className="bg-gray-800 text-gray-300 px-4 py-3 rounded-lg text-sm font-bold flex-1"
                  >
                    Volver al listado
                  </button>
                </div>
              </div>
            ) : memoryStorage.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">No hay sesiones guardadas.</p>
            ) : (
              <div className="space-y-3">
                {memoryStorage.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedDetail(s)}
                    className="bg-[#141414] border border-[#2a2a2a] p-4 rounded-lg cursor-pointer hover:border-[#FF6B1A] transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-bold text-base text-white">
                        {s.barberName || "Sin nombre"}
                      </div>
                      <div className="text-xs text-gray-500">{s.date}</div>
                    </div>
                    <div className="text-sm text-gray-400 mt-1 truncate">
                      {s.avatar && (
                        <span className="text-[#FF6B1A] font-bold uppercase mr-2">
                          Avatar {s.avatar}
                        </span>
                      )}
                      {s.p0 ? `${s.p0.substring(0, 40)}...` : "Sin respuesta"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
