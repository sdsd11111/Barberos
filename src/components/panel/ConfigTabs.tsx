"use client";

import { useState } from "react";
import WhatsAppContent from "@/components/panel/WhatsAppContent";
import ConfigForm from "@/components/panel/ConfigForm";

interface ConfigTabsProps {
  configData: {
    riskThresholdNormal: number;
    riskThresholdAt: number;
    loyaltyMode: string;
    visitDurationMin: number | null;
    businessInfo: string | null;
    requiredCuts: number;
  };
}

const TABS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "ajustes", label: "Ajustes del Motor" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ConfigTabs({ configData }: ConfigTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("whatsapp");

  return (
    // min-w-0 permite que este grid item se encoja correctamente
    // dentro de su flex parent (evita overflow horizontal en móvil).
    // overflow-x-hidden es la red de seguridad final.
    <div className="space-y-6 min-w-0 overflow-x-hidden">
      {/* Tab bar — scroll horizontal interno para que si el texto no
          cabe se scrollee SOLO esta fila, sin propagarse al body. */}
      <div className="flex border-b border-[#2a2520] overflow-x-auto scrollbar-thin">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              relative px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase transition-colors
              whitespace-nowrap shrink-0
              ${activeTab === tab.id
                ? "text-[#d97644]"
                : "text-[#5c554c] hover:text-[#a89e90]"
              }
            `}
          >
            {tab.label}
            {/* Active indicator bar */}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#d97644]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "whatsapp" && <WhatsAppContent />}
        {activeTab === "ajustes" && (
          <div className="max-w-2xl">
            <ConfigForm initialData={configData} isPremium={true} />
          </div>
        )}
      </div>
    </div>
  );
}
