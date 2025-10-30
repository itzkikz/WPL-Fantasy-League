import { Player } from "../../features/players/types";

interface PlayerStatsOverlaySkeletonProps {
  onClose: () => void;
  showStats: boolean;
  showDetails: boolean;
  pickMyTeam: boolean;
  player: Player;
}

const PlayerStatsOverlaySkeleton = ({
  onClose,
  showStats,
  showDetails,
  pickMyTeam,
  player
}: PlayerStatsOverlaySkeletonProps) => {
  return (
    <>
      {/* Header with Player Info Skeleton */}
      <div className="relative px-6 pt-6 pb-4" style={{ backgroundColor: player?.teamColor }}>
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
        >
          <svg
            className="w-6 h-6"
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
          <div className="flex-1 pt-4 space-y-2">
            <div className="h-12 bg-white/40 rounded w-28 ml-auto animate-pulse"></div>
            <div className="h-8 bg-white/30 rounded w-32 ml-auto animate-pulse"></div>
            <div className="h-5 bg-white/30 rounded w-16 ml-auto animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton (conditional) */}
      {showDetails && (
        <div className="flex px-6 mb-6 border-b border-[#ebe5eb] dark:border-[#541e5d]">
          <div className="rounded-xl p-4 grid grid-cols-4 gap-4 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 mx-auto animate-pulse"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10 mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pick My Team Section Skeleton (conditional) */}
      {pickMyTeam && (
        <div>
          <div className="flex items-center justify-between py-5 px-12 mb-2 border-b border-[#ebe5eb] dark:border-[#541e5d]">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 px-12 mb-2 gap-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1 animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1 animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Tabs Skeleton (conditional) */}
      {showStats && (
        <div className="flex-none border-b border-[#ebe5eb] dark:border-[#541e5d] px-6">
          <div className="flex gap-8">
            <div className="py-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
            <div className="py-3">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-3 animate-pulse"></div>
              <div className="h-0.5 bg-purple-600 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Content Skeleton (conditional) */}
      {showStats && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4 animate-pulse"></div>

            <div className="space-y-3">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PlayerStatsOverlaySkeleton;
