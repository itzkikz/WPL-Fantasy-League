import PitchPlayerCardSkeleton from "./PitchPlayerCardSkeleton";

interface GWPitchSkeletonProps {
  pickMyTeam?: boolean;
}

const GWPitchSkeleton = ({ pickMyTeam = false }: GWPitchSkeletonProps) => {
  // Default formation: 4-3-3 (can be adjusted based on your needs)
  const formationLayout = [
    { key: "goalkeeper", count: 1 },
    { key: "forwards", count: 3 },
    { key: "midfielders", count: 3 },
    { key: "defenders", count: 4 },
  ];

  return (
    <div
      className="relative flex flex-col gap-5 bg-top bg-no-repeat box-border py-6 max-w-[1400px] overflow-auto h-screen items-center justify-center"
      style={{
        backgroundImage: "url('/pitch.svg')",
      }}
    >
      {/* Banner Skeleton */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/30 rounded-sm animate-pulse"></div>
          <div className="h-3 bg-white/40 rounded w-24 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/30 rounded-sm animate-pulse"></div>
          <div className="h-3 bg-white/40 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Formation Skeleton */}
      {formationLayout.map((line) => (
        <div key={line.key} className="flex justify-evenly gap-3 select-none">
          {[...Array(line.count)].map((_, i) => (
            <div key={`${line.key}-${i}`} className="flex flex-col">
              <div className="rounded-md relative m-auto overflow-hidden">
                <PitchPlayerCardSkeleton />
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* Bench Section Skeleton */}
      <div className="select-none relative w-auto rounded-2xl bottom-0 left-0 right-0 bg-gradient-to-b from-light-secondary to-light-secondary backdrop-blur-sm py-4 px-4 mt-auto">
        <div className="flex justify-center gap-6 md:gap-8 mb-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={`label-${i}`}
              className="w-15 text-center"
            >
              <div className="h-3 bg-white/30 rounded w-8 mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 md:gap-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={`bench-${i}`}
              className="rounded-md relative m-auto overflow-hidden"
            >
              <PitchPlayerCardSkeleton isSmall={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GWPitchSkeleton;
