"use client";

import { useState } from "react";
import RegisterVisitModal from "@/components/RegisterVisitModal";
import { getTenantTerms } from "@/lib/tenant-dictionary";

interface RegisterVisitButtonProps {
  barbershopId: string;
  vertical?: string | null;
}

export default function RegisterVisitButton({ barbershopId, vertical }: RegisterVisitButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const terms = getTenantTerms(vertical);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{ backgroundColor: terms.accentColor }}
        className="font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] px-6 py-3 hover:brightness-110 transition-all font-bold shadow-lg"
      >
        {terms.actionButtonText}
      </button>

      <RegisterVisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        barbershopId={barbershopId}
      />
    </>
  );
}
