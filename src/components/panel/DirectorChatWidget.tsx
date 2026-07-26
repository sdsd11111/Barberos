"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "¿A quién estoy a punto de perder esta semana?",
  "¿Qué horas tengo vacías que debería llenar?",
  "¿Cómo va el rendimiento de mis barberos?",
  "¿Qué me recomiendas hacer hoy?",
];

export default function DirectorChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hola. Soy el Director de BarberOS, el asesor de tu barbería.

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
            content: "👑 Esta funcionalidad es exclusiva de **BarberOS Premium**. Puedes actualizar tu plan en la sección de Precios para activar el Director IA.",
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
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#131110] border border-[#d97644] text-[#f3ece1] hover:text-[#d97644] px-5 py-3 shadow-2xl transition-all duration-300 group hover:bg-[#1a1715]"
      >
        <span className="text-xl animate-bounce">🤖</span>
        <div className="text-left hidden sm:block">
          <p className="font-mono text-xs tracking-wider uppercase font-bold text-[#f3ece1] group-hover:text-[#d97644]">
            Director IA 24/7
          </p>
          <p className="font-mono text-[9px] text-[#d97644]">Consultor Especializado</p>
        </div>
        <span className="px-2 py-0.5 bg-[#d97644]/20 text-[#d97644] border border-[#d97644]/40 font-mono text-[9px] uppercase tracking-widest rounded-sm">
          PREMIUM
        </span>
      </button>

      {/* Ventana flotante de Chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[440px] h-[550px] max-h-[80vh] bg-[#131110] border border-[#2a2520] flex flex-col shadow-2xl overflow-hidden rounded-sm animate-fade-in">
          {/* Header del Chat */}
          <div className="p-4 bg-[#0a0807] border-b border-[#2a2520] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#d97644]/10 border border-[#d97644]/40 rounded-full flex items-center justify-center text-lg">
                🤖
              </div>
              <div>
                <h3 className="font-display text-base font-light text-[#f3ece1] flex items-center gap-2">
                  Director BarberOS
                  <span className="px-1.5 py-0.2 bg-amber-950/40 border border-amber-800 text-amber-400 font-mono text-[9px] uppercase">
                    24/7
                  </span>
                </h3>
                <p className="font-mono text-[10px] text-[#5c554c]">
                  Asesor de tu barbería (Basado en datos del Motor)
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
                  className={`max-w-[88%] p-3.5 rounded-sm whitespace-pre-wrap leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#d97644] text-[#0a0807] font-mono font-medium"
                      : "bg-[#131110] border border-[#2a2520] text-[#f3ece1]"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-[#5c554c] font-mono text-xs p-2">
                <span className="w-2 h-2 bg-[#d97644] rounded-full animate-ping" />
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
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="font-mono text-[10px] bg-[#131110] hover:bg-[#1f1b18] border border-[#2a2520] hover:border-[#d97644] text-[#a89e90] hover:text-[#f3ece1] px-2.5 py-1 transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#131110] border-t border-[#2a2520] flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hazle una pregunta al Director sobre tu negocio..."
              className="flex-1 bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] font-mono text-xs px-3 py-2.5 focus:outline-none focus:border-[#d97644]"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#d97644] text-[#0a0807] font-mono text-xs uppercase px-4 py-2.5 hover:bg-[#e8854f] transition-colors disabled:opacity-50 font-bold shrink-0"
            >
              Enviar
            </button>
          </form>
        </div>
      )}
    </>
  );
}
