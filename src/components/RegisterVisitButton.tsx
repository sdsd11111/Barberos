"use client";

import { useState } from "react";
import RegisterVisitModal from "@/components/RegisterVisitModal";

interface RegisterVisitButtonProps {
  barbershopId: string;
}

export default function RegisterVisitButton({ barbershopId }: RegisterVisitButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] px-6 py-3 hover:bg-[#e8854f] transition-colors"
      >
        Registrar Corte
      </button>

      <RegisterVisitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        barbershopId={barbershopId}
      />
    </>
  );
}
