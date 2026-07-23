"use client";

import { useState, useEffect } from "react";

interface Barbershop {
  id: string;
  name: string;
  whatsappNumber: string;
  evolutionInstance: string;
  planStatus: string;
  trialEndsAt: string | null;
  createdAt: string;
  loginPin: string;
  googleMapsUrl: string | null;
  requiredCuts: number;
}

export default function AdminDashboard() {
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Formulario de creación
  const [name, setName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [requiredCuts, setRequiredCuts] = useState(5);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");

  // Estado para la barbería en edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editWhatsappNumber, setEditWhatsappNumber] = useState("");
  const [editRequiredCuts, setEditRequiredCuts] = useState(5);
  const [editGoogleMapsUrl, setEditGoogleMapsUrl] = useState("");

  // Éxito de creación reciente
  const [createdPin, setCreatedPin] = useState("");
  const [createdShopName, setCreatedShopName] = useState("");

  const fetchBarbershops = async (secret: string) => {
    try {
      const response = await fetch("/api/admin/barbershops", {
        headers: {
          Authorization: `Bearer ${secret}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setBarbershops(data);
        setIsAuthenticated(true);
        setAdminSecret(secret);
        setError("");
        // Persistir sesión
        try { localStorage.setItem("admin_secret", secret); } catch {}
      } else {
        setError("Secreto de administración inválido.");
        try { localStorage.removeItem("admin_secret"); } catch {}
      }
    } catch {
      setError("Error de red.");
    }
  };

  // Auto-login al cargar la página si hay sesión guardada
  useEffect(() => {
    const saved = localStorage.getItem("admin_secret");
    if (saved) {
      setAdminSecret(saved);
      fetchBarbershops(saved).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBarbershops(adminSecret);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/barbershops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          name,
          whatsappNumber,
          requiredCuts: Number(requiredCuts),
          googleMapsUrl,
        }),
      });

      if (response.ok) {
        const newShop = await response.json();
        setCreatedPin(newShop.loginPin || "");
        setCreatedShopName(newShop.name || "");

        // Limpiar form y refrescar lista
        setName("");
        setWhatsappNumber("");
        setGoogleMapsUrl("");
        fetchBarbershops(adminSecret);
      } else {
        const errData = await response.json();
        alert(errData.error || "Error al crear barbería.");
      }
    } catch {
      alert("Error al conectar con la API.");
    }
  };

  const handleChangeStatus = async (barbershopId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/admin/barbershops", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          barbershopId,
          planStatus: newStatus,
        }),
      });

      if (response.ok) {
        fetchBarbershops(adminSecret);
      } else {
        alert("Error al cambiar estado.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  const handleDelete = async (barbershopId: string, shopName: string) => {
    const confirmed = confirm(`¿Estás seguro de eliminar la barbería "${shopName}"?\n\nEsto eliminará:\n- La barbería y todos sus datos\n- Sus clientes y visitas\n- La instancia de WhatsApp en Evolution API\n\nEsta acción NO se puede deshacer.`);
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/barbershops?id=${barbershopId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminSecret}`,
        },
      });

      if (response.ok) {
        fetchBarbershops(adminSecret);
      } else {
        const errData = await response.json();
        alert(errData.error || "Error al eliminar barbería.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  const handleStartEdit = (shop: Barbershop) => {
    setEditingId(shop.id);
    setEditName(shop.name);
    setEditWhatsappNumber(shop.whatsappNumber);
    setEditRequiredCuts(shop.requiredCuts);
    setEditGoogleMapsUrl(shop.googleMapsUrl || "");
  };

  const handleSaveEdit = async (barbershopId: string) => {
    if (!editName.trim() || !editWhatsappNumber.trim()) {
      alert("Nombre y WhatsApp son requeridos.");
      return;
    }

    try {
      const response = await fetch("/api/admin/barbershops", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          barbershopId,
          name: editName,
          whatsappNumber: editWhatsappNumber,
          requiredCuts: Number(editRequiredCuts),
          googleMapsUrl: editGoogleMapsUrl.trim() || null,
        }),
      });

      if (response.ok) {
        setEditingId(null);
        fetchBarbershops(adminSecret);
      } else {
        const errData = await response.json();
        alert(errData.error || "Error al actualizar barbería.");
      }
    } catch {
      alert("Error de conexión.");
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0a0807] text-[#f3ece1] flex items-center justify-center p-6">
        <div className="w-full max-w-md p-10 bg-[#131110] border border-[#2a2520]">
          <h2 className="font-display text-3xl font-light mb-8 text-[#d97644] text-center">
            SuperAdmin BarberOS
          </h2>
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] mb-2">
                ADMIN SECRET KEY
              </label>
              <input
                type="password"
                value={adminSecret}
                onChange={(e) => setAdminSecret(e.target.value)}
                placeholder="Ingresa la clave maestra"
                className="w-full px-4 py-3 font-mono text-sm bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
              />
            </div>
            {error && <p className="font-display italic text-xs text-[#d97644]">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] transition-colors"
            >
              Autenticar Panel
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0807] text-[#f3ece1] p-10">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-end border-b border-[#2a2520] pb-6">
          <div>
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#5c554c] block mb-2">
              Panel Maestro
            </span>
            <h1 className="font-display text-5xl font-light">SuperAdmin</h1>
          </div>
          <button
            onClick={() => {
              try { localStorage.removeItem("admin_secret"); } catch {}
              setIsAuthenticated(false);
              setAdminSecret("");
            }}
            className="font-mono text-xs tracking-[0.2em] uppercase text-[#5c554c] hover:text-[#d97644] transition-colors"
          >
            Cerrar Sesión
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Formulario de Onboarding */}
          <div className="lg:col-span-1 bg-[#131110] border border-[#2a2520] p-8 space-y-6">
            <h3 className="font-display text-2xl font-light text-[#d97644]">
              Nueva Barbería (Onboarding)
            </h3>

            {createdPin && (
              <div className="p-4 bg-green-950/40 border border-green-800 text-green-400 font-mono text-xs rounded space-y-2 animate-pulse-short">
                <p className="font-bold text-[10px] tracking-wider uppercase">✨ ¡BARBERÍA CREADA CON ÉXITO!</p>
                <p>Nombre: <span className="text-white">{createdShopName}</span></p>
                <div className="p-3 bg-[#0a0807] border border-green-900 text-center rounded">
                  <p className="text-[10px] uppercase text-[#5c554c] tracking-wider mb-1">CÓDIGO PIN DE ACCESO</p>
                  <p className="text-2xl font-bold text-white tracking-[0.2em]">{createdPin}</p>
                </div>
                <p className="text-[9px] text-[#5c554c] text-center">Pásale este código al barbero para que ingrese desde /login.</p>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-1">
                  Nombre de la Barbería
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Barbería El Elegante"
                  className="w-full px-3 py-2 font-mono text-xs bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-1">
                  WhatsApp (con prefijo país)
                </label>
                <input
                  type="tel"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Ej. 593963410409"
                  className="w-full px-3 py-2 font-mono text-xs bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-1">
                  Cortes Requeridos para Premio
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={requiredCuts}
                  onChange={(e) => setRequiredCuts(Number(e.target.value))}
                  className="w-full px-3 py-2 font-mono text-xs bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-wider uppercase text-[#5c554c] mb-1">
                  Link Reseña Google (Opcional)
                </label>
                <input
                  type="text"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="Pegar enlace directo de reseña Google"
                  className="w-full px-3 py-2 font-mono text-xs bg-[#0a0807] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 font-mono text-xs tracking-[0.2em] uppercase text-[#0a0807] bg-[#d97644] hover:bg-[#e8854f] transition-colors pt-2"
              >
                Crear Barbería
              </button>
            </form>
          </div>

          {/* Listado y Gestión */}
          <div className="lg:col-span-2 bg-[#131110] border border-[#2a2520] p-8 space-y-6">
            <h3 className="font-display text-2xl font-light text-[#f3ece1]">
              Barberías Registradas ({barbershops.length})
            </h3>
            {barbershops.length === 0 ? (
              <p className="font-mono text-xs text-[#5c554c]">No hay barberías registradas aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs text-[#a89e90]">
                  <thead>
                    <tr className="border-b border-[#2a2520] text-[#5c554c] uppercase">
                      <th className="py-3">Barbería</th>
                      <th className="py-3">WhatsApp</th>
                      <th className="py-3">Código PIN</th>
                      <th className="py-3">Plan</th>
                      <th className="py-3">Vence</th>
                      <th className="py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barbershops.map((shop) => (
                      <tr key={shop.id} className="border-b border-[#1c1917] hover:bg-[#0a0807]">
                        {editingId === shop.id ? (
                          <>
                            {/* Formulario Inline de Edición */}
                            <td className="py-4" colSpan={5}>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#0a0807] border border-[#2a2520]">
                                <div>
                                  <label className="block font-mono text-[9px] uppercase text-[#5c554c] mb-1">Nombre</label>
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="w-full px-2 py-1 font-mono text-xs bg-[#131110] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-mono text-[9px] uppercase text-[#5c554c] mb-1">WhatsApp</label>
                                  <input
                                    type="text"
                                    value={editWhatsappNumber}
                                    onChange={(e) => setEditWhatsappNumber(e.target.value)}
                                    className="w-full px-2 py-1 font-mono text-xs bg-[#131110] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-mono text-[9px] uppercase text-[#5c554c] mb-1">Cortes Meta</label>
                                  <input
                                    type="number"
                                    value={editRequiredCuts}
                                    onChange={(e) => setEditRequiredCuts(Number(e.target.value))}
                                    className="w-full px-2 py-1 font-mono text-xs bg-[#131110] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
                                  />
                                </div>
                                <div>
                                  <label className="block font-mono text-[9px] uppercase text-[#5c554c] mb-1">Link Reseña Google</label>
                                  <input
                                    type="text"
                                    value={editGoogleMapsUrl}
                                    onChange={(e) => setEditGoogleMapsUrl(e.target.value)}
                                    placeholder="Pegar enlace directo de reseña Google"
                                    className="w-full px-2 py-1 font-mono text-xs bg-[#131110] border border-[#2a2520] text-[#f3ece1] focus:outline-none focus:border-[#d97644]"
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-right space-y-2">
                              <button
                                onClick={() => handleSaveEdit(shop.id)}
                                className="w-full px-2 py-1 bg-green-900/30 text-green-400 hover:bg-green-800 border border-green-700 rounded block text-center font-bold"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="w-full px-2 py-1 bg-red-950/40 text-red-400 hover:bg-red-800/60 border border-red-700 rounded block text-center"
                              >
                                Cancelar
                              </button>
                            </td>
                          </>
                        ) : (
                          <>
                            {/* Fila de Lectura Normal */}
                            <td className="py-4 font-display text-base text-[#f3ece1] font-light">
                              <div>{shop.name}</div>
                              {shop.googleMapsUrl ? (
                                <a
                                  href={shop.googleMapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] text-[#d97644] hover:underline block mt-0.5"
                                >
                                  Ver Reseña Google ↗
                                </a>
                              ) : (
                                <span className="text-[9px] text-[#5c554c] block mt-0.5">Sin Link de Reseña</span>
                              )}
                            </td>
                            <td className="py-4">+{shop.whatsappNumber}</td>
                            <td className="py-4 font-mono font-bold text-amber-500">{shop.loginPin || "---"}</td>
                            <td className="py-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] ${
                                  shop.planStatus === "ACTIVE"
                                    ? "bg-green-950/40 text-green-400 border border-green-800"
                                    : shop.planStatus === "TRIAL"
                                    ? "bg-blue-950/40 text-blue-400 border border-blue-800"
                                    : "bg-red-950/40 text-red-400 border border-red-800"
                                }`}
                              >
                                {shop.planStatus}
                              </span>
                            </td>
                            <td className="py-4">
                              {shop.trialEndsAt
                                ? new Date(shop.trialEndsAt).toLocaleDateString("es-EC", { timeZone: "America/Guayaquil" })
                                : "N/A"}
                            </td>
                            <td className="py-4 text-right space-x-1 space-y-1">
                              <button
                                onClick={() => handleStartEdit(shop)}
                                className="px-2 py-1 bg-[#2a2520] text-[#a89e90] hover:text-[#f3ece1] border border-[#2a2520] rounded"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleChangeStatus(shop.id, "ACTIVE")}
                                className="px-2 py-1 bg-green-900/20 text-green-500 hover:bg-green-900/40 border border-green-900/60 rounded"
                              >
                                Activar
                              </button>
                              <button
                                onClick={() => handleChangeStatus(shop.id, "SUSPENDED")}
                                className="px-2 py-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 border border-red-900/60 rounded"
                              >
                                Pausar
                              </button>
                              <button
                                onClick={() => handleDelete(shop.id, shop.name)}
                                className="px-2 py-1 bg-red-950/40 text-red-400 hover:bg-red-800/60 border border-red-700 rounded"
                              >
                                Eliminar
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
