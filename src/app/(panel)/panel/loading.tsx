export default function LoadingPanel() {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto animate-pulse space-y-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2a2520] pb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-[#2a2520] rounded-md" />
          <div className="h-4 w-40 bg-[#1c1917] rounded-md" />
        </div>
        <div className="h-10 w-44 bg-[#2a2520] rounded-md" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[#131110] border border-[#2a2520] rounded-xl p-5 space-y-3"
          >
            <div className="h-4 w-28 bg-[#2a2520] rounded" />
            <div className="h-9 w-20 bg-[#3a332c] rounded" />
            <div className="h-3 w-36 bg-[#1c1917] rounded" />
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-[#131110] border border-[#2a2520] rounded-xl p-6 space-y-4">
        <div className="h-6 w-48 bg-[#2a2520] rounded" />
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-full bg-[#1c1917] border border-[#2a2520]/50 rounded-lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
