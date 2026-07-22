"use client";

import { useState, useEffect } from "react";

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

export default function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/barbershop/staff");
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (e) {
      console.error("Error cargando equipo:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/barbershop/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        setNewName("");
        await fetchStaff();
      }
    } catch (e) {
      console.error("Error agregando miembro:", e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    try {
      const res = await fetch(`/api/barbershop/staff?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStaff((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error("Error eliminando miembro:", e);
    }
  };

  return (
    <div className="border border-[#2a2520] bg-[#131110] p-8 space-y-6">
      <div className="border-b border-[#2a2520] pb-4">
        <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c]">
          Equipo de Trabajo / Profesionales
        </span>
        <p className="font-mono text-xs text-[#a89e90] mt-1">
          Agrega a las personas que atienden en tu establecimiento para que tus clientes puedan seleccionarlos al calificar por WhatsApp.
        </p>
      </div>

      {/* Formulario para agregar */}
      <form onSubmit={handleAddStaff} className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nombre del profesional (ej: Carlos, Juan)"
          className="flex-1 bg-[#0a0807] border border-[#2a2520] px-4 py-2.5 font-mono text-xs text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
        />
        <button
          type="submit"
          disabled={submitting || !newName.trim()}
          className="px-5 py-2.5 font-mono text-xs tracking-widest uppercase bg-[#d97644] text-[#0a0807] hover:bg-[#e8854f] transition-all disabled:opacity-50 font-bold"
        >
          {submitting ? "Agregando..." : "+ Agregar"}
        </button>
      </form>

      {/* Lista de miembros */}
      {loading ? (
        <p className="font-mono text-xs text-[#5c554c]">Cargando lista...</p>
      ) : staff.length === 0 ? (
        <p className="font-mono text-xs text-[#5c554c] italic">
          No has registrado miembros aún. Si no agregas ninguno, la pregunta por WhatsApp se omitirá automáticamente.
        </p>
      ) : (
        <ul className="space-y-2 pt-2">
          {staff.map((s, idx) => (
            <li
              key={s.id}
              className="flex justify-between items-center bg-[#0a0807] border border-[#2a2520] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#d97644] font-bold">
                  {idx + 1}.
                </span>
                <span className="font-display text-base text-[#f3ece1]">
                  {s.name}
                </span>
              </div>
              <button
                onClick={() => handleDeleteStaff(s.id)}
                className="font-mono text-[10px] tracking-widest uppercase text-red-400 hover:text-red-300 transition-colors"
              >
                Eliminar ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
