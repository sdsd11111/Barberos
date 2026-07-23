"use client";

import { useState } from "react";

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customerName: string;
  customerWhatsapp: string;
}

interface StaffStat {
  id: string;
  name: string;
  role: string;
  avgRating: number;
  totalRatings: number;
  distribution: number[]; // [1★, 2★, 3★, 4★, 5★]
  reviews: ReviewItem[];
}

interface BarberosViewProps {
  generalAvg: number;
  generalCount: number;
  generalDistribution: number[];
  staffStats: StaffStat[];
  unassignedCount: number;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 tracking-wider">
      {"★".repeat(Math.round(rating))}
      {"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className="text-[#5c554c] w-4 text-right">{stars}</span>
      <span className="text-amber-400">★</span>
      <div className="flex-1 h-2 bg-[#1c1917] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[#5c554c] w-8 text-right">{count}</span>
    </div>
  );
}

function StaffCard({ staff, isSelected, onClick }: { staff: StaffStat; isSelected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 sm:p-5 border transition-all duration-200 ${
        isSelected
          ? "bg-[#131110] border-[#d97644]"
          : "bg-[#0a0807] border-[#2a2520] hover:border-[#3a3530]"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-display text-lg font-light text-[#f3ece1]">{staff.name}</h4>
        {staff.totalRatings > 0 && (
          <span className="font-display text-2xl font-light text-[#d97644]">
            {staff.avgRating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] text-[#5c554c] uppercase tracking-wider">
          {staff.role === "OWNER" ? "Dueño" : "Barbero"}
        </span>
        {staff.totalRatings > 0 ? (
          <div className="flex items-center gap-2">
            <StarDisplay rating={staff.avgRating} />
            <span className="font-mono text-[10px] text-[#5c554c]">
              ({staff.totalRatings})
            </span>
          </div>
        ) : (
          <span className="font-mono text-[10px] text-[#5c554c] italic">
            Sin calificaciones aún
          </span>
        )}
      </div>
    </button>
  );
}

export default function BarberosView({
  generalAvg,
  generalCount,
  generalDistribution,
  staffStats,
  unassignedCount,
}: BarberosViewProps) {
  const [selectedView, setSelectedView] = useState<"general" | string>("general");
  const [visibleReviewsCount, setVisibleReviewsCount] = useState<number>(10);

  const selectedStaff = selectedView !== "general"
    ? staffStats.find((s) => s.id === selectedView)
    : null;

  const currentAvg = selectedStaff ? selectedStaff.avgRating : generalAvg;
  const currentCount = selectedStaff ? selectedStaff.totalRatings : generalCount;
  const currentDistribution = selectedStaff ? selectedStaff.distribution : generalDistribution;

  const handleSelectTab = (view: string) => {
    setSelectedView(view);
    setVisibleReviewsCount(10);
  };

  const reviewsList = selectedStaff ? selectedStaff.reviews : [];
  const visibleReviews = reviewsList.slice(0, visibleReviewsCount);

  return (
    <div className="space-y-6">
      {/* Tabs: General vs por barbero */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => handleSelectTab("general")}
          className={`px-4 py-2 font-mono text-xs tracking-[0.15em] uppercase whitespace-nowrap border transition-colors ${
            selectedView === "general"
              ? "bg-[#d97644] text-[#0a0807] border-[#d97644]"
              : "bg-transparent text-[#5c554c] border-[#2a2520] hover:text-[#a89e90] hover:border-[#3a3530]"
          }`}
        >
          Todos
        </button>
        {staffStats.map((staff) => (
          <button
            key={staff.id}
            onClick={() => handleSelectTab(staff.id)}
            className={`px-4 py-2 font-mono text-xs tracking-[0.15em] uppercase whitespace-nowrap border transition-colors ${
              selectedView === staff.id
                ? "bg-[#d97644] text-[#0a0807] border-[#d97644]"
                : "bg-transparent text-[#5c554c] border-[#2a2520] hover:text-[#a89e90] hover:border-[#3a3530]"
            }`}
          >
            {staff.name}
          </button>
        ))}
      </div>

      {/* Panel principal de calificación */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Score grande */}
        <div className="bg-[#131110] border border-[#2a2520] p-6 sm:p-8 flex flex-col items-center justify-center">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] mb-3">
            {selectedStaff ? selectedStaff.name : "Calificación General"}
          </p>
          {currentCount > 0 ? (
            <>
              <p className="font-display text-7xl sm:text-8xl font-light text-[#d97644]">
                {currentAvg.toFixed(1)}
              </p>
              <div className="mt-2">
                <StarDisplay rating={currentAvg} />
              </div>
              <p className="font-mono text-[10px] text-[#5c554c] mt-2">
                {currentCount} calificaciones
              </p>
            </>
          ) : (
            <p className="font-mono text-sm text-[#5c554c] italic text-center">
              Sin calificaciones aún
            </p>
          )}
        </div>

        {/* Distribución de estrellas */}
        <div className="bg-[#131110] border border-[#2a2520] p-6 sm:col-span-2 flex flex-col justify-center gap-2">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] mb-2">
            Distribución
          </p>
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar
              key={stars}
              stars={stars}
              count={currentDistribution[stars - 1]}
              total={currentCount}
            />
          ))}
        </div>
      </div>

      {/* Lista de reseñas específicas del barbero seleccionado */}
      {selectedStaff && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c]">
              Calificaciones de {selectedStaff.name} ({reviewsList.length})
            </p>
          </div>

          {reviewsList.length === 0 ? (
            <div className="border border-[#2a2520] bg-[#131110] p-8 text-center">
              <p className="font-display italic text-[#5c554c]">
                Este profesional aún no tiene calificaciones registradas.
              </p>
            </div>
          ) : (
            <>
              <div className="border border-[#2a2520] bg-[#131110] divide-y divide-[#1c1917]">
                {visibleReviews.map((rev) => (
                  <div key={rev.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-base text-[#f3ece1] font-light">
                          {rev.customerName}
                        </p>
                        {rev.customerWhatsapp && (
                          <span className="font-mono text-[10px] text-[#5c554c]">
                            (+{rev.customerWhatsapp})
                          </span>
                        )}
                      </div>
                      {rev.comment && (
                        <p className="font-sans text-xs text-[#a89e90] bg-[#0a0807] border border-[#2a2520] p-2.5 rounded-sm italic max-w-xl">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <StarDisplay rating={rev.rating} />
                      <p className="font-mono text-[10px] text-[#5c554c] mt-0.5">
                        {new Date(rev.createdAt).toLocaleDateString("es-EC", {
                          timeZone: "America/Guayaquil",
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {visibleReviewsCount < reviewsList.length && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setVisibleReviewsCount((prev) => prev + 20)}
                    className="font-mono text-xs tracking-[0.2em] uppercase text-[#d97644] hover:text-[#f3ece1] border border-[#d97644]/40 hover:border-[#d97644] px-6 py-2 transition-colors"
                  >
                    Ver más (+20)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Lista de barberos (solo en vista general) */}
      {selectedView === "general" && staffStats.length > 0 && (
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#5c554c] mb-3">
            Por Profesional
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {staffStats
              .sort((a, b) => b.avgRating - a.avgRating)
              .map((staff) => (
                <StaffCard
                  key={staff.id}
                  staff={staff}
                  isSelected={false}
                  onClick={() => handleSelectTab(staff.id)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Nota de calificaciones sin asignar */}
      {unassignedCount > 0 && selectedView === "general" && (
        <div className="bg-[#131110] border border-[#2a2520] p-4">
          <p className="font-mono text-[10px] text-[#5c554c]">
            ℹ️ Hay {unassignedCount} calificaciones sin profesional asignado (registradas antes de activar la selección de equipo). Estas se incluyen en el promedio general.
          </p>
        </div>
      )}

      {/* Sin staff registrado */}
      {staffStats.length === 0 && (
        <div className="border border-[#2a2520] bg-[#131110] p-10 text-center">
          <p className="font-display italic text-lg text-[#5c554c] mb-2">
            No hay barberos registrados
          </p>
          <p className="font-mono text-[10px] text-[#5c554c] tracking-widest">
            Ve a{" "}
            <a href="/panel/whatsapp" className="text-[#d97644] hover:underline">
              Configuración
            </a>{" "}
            para agregar a tu equipo de trabajo.
          </p>
        </div>
      )}
    </div>
  );
}
