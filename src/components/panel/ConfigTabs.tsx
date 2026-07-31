"use client";

import { useState } from "react";
import WhatsAppContent from "@/components/panel/WhatsAppContent";
import ConfigForm from "@/components/panel/ConfigForm";
import { getTenantTerms } from "@/lib/tenant-dictionary";

interface ConfigTabsProps {
  configData: {
    riskThresholdNormal: number;
    riskThresholdAt: number;
    loyaltyMode: string;
    visitDurationMin: number | null;
    businessInfo: string | null;
    requiredCuts: number;
    vertical?: string | null;
  };
}

const TABS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "ajustes", label: "Ajustes del Motor" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ConfigTabs({ configData }: ConfigTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("whatsapp");
  const terms = getTenantTerms(configData.vertical);

  return (
    <div className="space-y-6 min-w-0 overflow-x-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-[#2a2520] overflow-x-auto scrollbar-thin">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={isActive ? { color: terms.accentColor } : undefined}
              className={`
                relative px-6 py-3 font-mono text-xs tracking-[0.15em] uppercase transition-colors
                whitespace-nowrap shrink-0
                ${isActive ? "font-bold" : "text-[#5c554c] hover:text-[#a89e90]"}
              `}
            >
              {tab.label}
              {/* Active indicator bar */}
              {isActive && (
                <span
                  style={{ backgroundColor: terms.accentColor }}
                  className="absolute bottom-0 left-0 right-0 h-[2px]"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "whatsapp" && <WhatsAppContent vertical={configData.vertical} />}
        {activeTab === "ajustes" && (
          <div className="max-w-2xl">
            <ConfigForm initialData={configData} isPremium={true} />
          </div>
        )}
      </div>
    </div>
  );
}
