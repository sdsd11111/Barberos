"use client";

import { useEffect, useState } from "react";

interface AIRecommendation {
  id: string;
  type: "REACTIVATION" | "CAPACITY" | "STAFF" | "GENERAL";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  disclaimer?: string;
  actionText?: string;
  actionUrl?: string;
  whatsappMessage?: string;
  targetWhatsapp?: string;
}

export default function DirectorWidget() {
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(false);
  const [isGenerativeLLM, setIsGenerativeLLM] = useState(false);
  const [modelUsed, setModelUsed] = useState("");
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);

  useEffect(() => {
    async function fetchDirectorData() {
      try {
        const res = await fetch("/api/director/recommendations");
        if (res.status === 403) {
          setAvailable(false);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.available) {
          setAvailable(true);
          setIsGenerativeLLM(data.isGenerativeLLM ?? false);
          setModelUsed(data.modelUsed ?? "TypeScript Engine");
          setRecommendations(data.recommendations || []);
        }
      } catch (err) {
        console.error("[DirectorWidget Error]", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDirectorData();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#131110] border border-[#2a2520] p-6 space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-[#2a2520] rounded" />
        <div className="h-20 bg-[#0a0807] rounded border border-[#2a2520]" />
      </div>
    );
  }

  if (!available || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#131110] border border-[#d97644]/30 p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <h2 className="font-display text-xl font-light text-[#f3ece1] tracking-wide">
              Director IA — Recomendaciones
            </h2>
            <p className="text-xs text-[#a89e90] font-mono">
              Estrategias generadas a partir del snapshot determinístico del Motor.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-[#d97644]/10 border border-[#d97644]/40 text-[#d97644] font-mono text-[9px] uppercase tracking-widest">
            Director BarberOS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((item) => {
          const isHigh = item.priority === "HIGH";
          const waUrl = item.targetWhatsapp && item.whatsappMessage
            ? `https://wa.me/${item.targetWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(item.whatsappMessage)}`
            : null;

          return (
            <div
              key={item.id}
              className={`p-5 bg-[#0a0807] border flex flex-col justify-between space-y-4 ${
                isHigh ? "border-[#d97644]/50" : "border-[#2a2520]"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 ${
                      isHigh
                        ? "bg-red-950/40 text-red-400 border border-red-800"
                        : "bg-[#2a2520] text-[#a89e90]"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                <h3 className="font-display text-base font-light text-[#f3ece1]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#a89e90] font-sans leading-relaxed">
                  {item.description}
                </p>
                {item.disclaimer && (
                  <p className="text-[10px] text-[#5c554c] font-mono italic mt-1 bg-[#131110] p-2 border border-[#2a2520]/50 rounded-sm">
                    {item.disclaimer}
                  </p>
                )}
              </div>

              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#d97644] text-[#0a0807] hover:bg-[#e08b60] transition-colors py-2.5 px-4 font-mono text-xs uppercase tracking-wider font-medium text-center"
                >
                  <span>📱 Enviar WhatsApp 1-Clic</span>
                  <span className="text-[10px]">↗</span>
                </a>
              ) : item.actionUrl ? (
                <a
                  href={item.actionUrl}
                  className="inline-flex items-center justify-center bg-[#2a2520] text-[#f3ece1] hover:bg-[#3a3530] transition-colors py-2.5 px-4 font-mono text-xs uppercase tracking-wider text-center"
                >
                  {item.actionText || "Ver más"}
                </a>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
