interface PitchPlayerCardSkeletonProps {
  isSmall?: boolean;
  pickMyteam?: boolean;
}

const PitchPlayerCardSkeleton = ({
  isSmall = true,
  pickMyteam = false,
}: PitchPlayerCardSkeletonProps) => {
  return (
    <div
      className={`relative ${
        isSmall ? "w-16" : "w-16 md:w-20 lg:w-24"
      } bg-light-bg text-light-text-primary`}
    >
      {/* Badge placeholders - top left (Captain/Vice Captain) */}
      <div className="absolute top-0.5 left-1 z-20 w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>

      {/* Badge placeholders - top right (Power Player) */}
      {!pickMyteam && (
        <div className="absolute top-0.5 right-0.5 z-20 w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      )}

      {/* Jersey skeleton */}
      <div
        className={`relative ${isSmall ? "h-5" : "h-5"} flex items-center justify-center`}
      >
        <div
          className={`${
            isSmall ? "w-16 h-5" : "w-16 h-5"
          } flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse`}
        >
          <div className="w-8 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Player name skeleton */}
      <div className="px-1 py-1 text-center shadow-sm">
        <div
          className={`${
            isSmall ? "h-3" : "h-3"
          } bg-gray-200 dark:bg-gray-700 rounded mx-auto w-12 animate-pulse`}
        ></div>
      </div>

      {/* Points/Last name skeleton */}
      <div className="px-1 py-1 text-center">
        <div
          className={`${
            isSmall ? "h-3" : "h-3"
          } bg-gray-200 dark:bg-gray-700 rounded mx-auto ${
            pickMyteam ? "w-10" : "w-6"
          } animate-pulse`}
        ></div>
      </div>
    </div>
  );
};

export default PitchPlayerCardSkeleton;
