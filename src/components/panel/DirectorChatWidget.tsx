"use client";

import { useState, useRef, useEffect } from "react";
import { getTenantTerms } from "@/lib/tenant-dictionary";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function DirectorChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [vertical, setVertical] = useState<string | null>(null);
  const terms = getTenantTerms(vertical);
  
  useEffect(() => {
    fetch("/api/barbershop/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.vertical) setVertical(data.vertical);
      })
      .catch(() => {});
  }, []);

  const suggestions = [
    "¿A quién estoy a punto de perder esta semana?",
    "¿Qué horas tengo vacías que debería llenar?",
    `¿Cómo va el rendimiento de mis ${terms.staffTitle.toLowerCase()}?`,
    "¿Qué me recomiendas hacer hoy?",
  ];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hola. Soy el Director de ${terms.brandName}, el asesor de tu ${terms.businessTypeName.toLowerCase()}.

He revisado la información calculada por el Motor de Conocimiento. ¿En qué aspecto de tu negocio quieres enfocarte hoy? Puedes hacerme cualquier pregunta sobre tus clientes, equipo u horarios.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const historyToSend = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/director/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyToSend }),
      });

      if (res.status === 403) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: `👑 Esta funcionalidad es exclusiva de **${terms.brandName} Premium**. Puedes actualizar tu plan en la sección de Precios para activar el Director IA.`,
          },
        ]);
        return;
      }

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.reply,
          },
        ]);
      } else {
        throw new Error(data.error || "Sin respuesta");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "No pude conectar con el Director en este momento. Por favor reintenta en unos segundos.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante desplegable */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        style={{ borderColor: terms.accentColor }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#131110] text-[#f3ece1] px-5 py-3 shadow-2xl transition-all duration-300 group hover:bg-[#1a1715]"
      >
        <span className="text-xl animate-bounce">🤖</span>
        <div className="text-left hidden sm:block">
          <p style={{ color: terms.accentColor }} className="font-mono text-xs tracking-wider uppercase font-bold">
            Director IA 24/7
          </p>
          <p className="font-mono text-[9px] text-[#a89e90]">Consultor Especializado</p>
        </div>
        <span style={{ color: terms.accentColor, backgroundColor: `${terms.accentColor}33`, borderColor: `${terms.accentColor}66` }} className="px-2 py-0.5 border font-mono text-[9px] uppercase tracking-widest rounded-sm font-bold">
          PREMIUM
        </span>
      </button>

      {/* Ventana flotante de Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[440px] h-[550px] max-h-[80vh] bg-[#131110] border border-[#2a2520] flex flex-col shadow-2xl overflow-hidden rounded-sm animate-fade-in">
          {/* Header del Chat */}
          <div className="p-4 bg-[#0a0807] border-b border-[#2a2520] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: `${terms.accentColor}1A`, borderColor: `${terms.accentColor}66` }} className="w-9 h-9 border rounded-full flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h3 className="font-display text-base font-light text-[#f3ece1] flex items-center gap-2">
                  Director {terms.brandName}
                  <span style={{ color: terms.accentColor, borderColor: `${terms.accentColor}66`, backgroundColor: `${terms.accentColor}1A` }} className="px-1.5 py-0.2 border font-mono text-[9px] uppercase font-bold">
                    24/7
                  </span>
                </h3>
                <p className="font-mono text-[10px] text-[#5c554c]">
                  Asesor de tu {terms.businessTypeName.toLowerCase()} (Basado en datos del Motor)
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#5c554c] hover:text-[#f3ece1] font-mono text-base p-1"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#0a0807]/50 font-sans text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  style={m.role === "user" ? { backgroundColor: terms.accentColor, color: "#0a0807" } : undefined}
                  className={`max-w-[88%] p-3.5 rounded-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "font-mono font-bold"
                      : "bg-[#131110] border border-[#2a2520] text-[#f3ece1]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[#5c554c] font-mono text-xs p-2">
                <span style={{ backgroundColor: terms.accentColor }} className="w-2 h-2 rounded-full animate-ping" />
                <span>El Director está analizando tus datos...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          {messages.length <= 2 && (
            <div className="p-3 bg-[#0a0807] border-t border-[#2a2520] space-y-1.5">
              <p className="font-mono text-[9px] text-[#5c554c] uppercase tracking-wider">
                Preguntas recomendadas:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="font-mono text-[10px] bg-[#131110] hover:bg-[#1f1b18] border border-[#2a2520] hover:border-[#f3ece1] text-[#a89e90] hover:text-[#f3ece1] px-2.5 py-1 transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input de Chat */}
          <div className="p-3 bg-[#0a0807] border-t border-[#2a2520] flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={`Haz una pregunta al Director sobre tu ${terms.businessTypeName.toLowerCase()}...`}
              disabled={loading}
              className="flex-1 bg-[#131110] border border-[#2a2520] text-[#f3ece1] px-3 py-2 font-mono text-xs focus:outline-none focus:border-[#f3ece1]"
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{ backgroundColor: terms.accentColor }}
              className="px-4 py-2 font-mono text-xs uppercase font-bold text-[#0a0807] hover:brightness-110 disabled:opacity-50 transition-colors"
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
