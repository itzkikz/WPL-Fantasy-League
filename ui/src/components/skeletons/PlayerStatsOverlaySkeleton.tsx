const PlayerStatsOverlaySkeleton = ({ onClose }: { onClose: () => void }) => {
  return (
    <>
      {" "}
      <div className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 px-6 pt-6 pb-4">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="flex items-start gap-4 mt-8">
          {/* Player Details Skeleton */}
          <div className="flex-1 pt-4 space-y-3">
            <div className="h-3 bg-white/30 rounded w-20 animate-pulse"></div>
            <div className="h-6 bg-white/40 rounded w-24 animate-pulse"></div>
            <div className="h-8 bg-white/40 rounded w-32 animate-pulse"></div>
            <div className="h-3 bg-white/30 rounded w-28 animate-pulse"></div>
          </div>

          {/* Points Skeleton */}
          <div className="hidden flex-1 pt-4 space-y-2">
            <div className="h-12 bg-white/40 rounded w-20 ml-auto animate-pulse"></div>
            <div className="h-8 bg-white/30 rounded w-32 ml-auto animate-pulse"></div>
          </div>
        </div>
      </div>
      {/* Tabs Skeleton */}
      <div className="flex-none border-b border-gray-200 px-6">
        <div className="flex gap-8">
          <div className="py-3">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="py-3">
            <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
            <div className="mt-3 h-0.5 bg-purple-600 rounded"></div>
          </div>
        </div>
      </div>
      {/* Scrollable Content Skeleton */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>

          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-100"
              >
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlayerStatsOverlaySkeleton;
