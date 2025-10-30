import PitchBanner from "../PitchBanner";
import PitchPlayerCardSkeleton from "./PitchPlayerCardSkeleton";

const GWPitchSkeleton = () => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className="min-h-full relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/pitch.svg')",
        }}
      >
        {/* Fantasy Header Bars */}
        <PitchBanner />

        {/* Players Formation Skeleton */}
        <div className="relative pt-10 pb-16 px-2">
          {/* Goalkeeper - 1 player */}
          <div className="flex justify-center mb-3">
            <PitchPlayerCardSkeleton />
          </div>

          {/* Defenders - 4 players */}
          <div className="flex justify-center gap-3 mb-3">
            {[...Array(4)].map((_, i) => (
              <PitchPlayerCardSkeleton key={`def-${i}`} />
            ))}
          </div>

          {/* Midfielders - 3 players */}
          <div className="flex justify-center gap-3 mb-3">
            {[...Array(3)].map((_, i) => (
              <PitchPlayerCardSkeleton key={`mid-${i}`} />
            ))}
          </div>

          {/* Forwards - 3 players */}
          <div className="flex justify-center gap-8">
            {[...Array(3)].map((_, i) => (
              <PitchPlayerCardSkeleton key={`fwd-${i}`} />
            ))}
          </div>
        </div>

        {/* Bench Section Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-green-800/80 to-green-900/90 backdrop-blur-sm py-2 px-2">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center gap-8 mb-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={`label-${i}`}
                  className="w-15 text-center"
                >
                  <div className="h-3 bg-green-700/50 rounded w-8 mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8">
              {[...Array(4)].map((_, i) => (
                <PitchPlayerCardSkeleton key={`bench-${i}`} isSmall={true} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GWPitchSkeleton;
