interface PitchPlayerCardSkeletonProps {
  isSmall?: boolean;
}

const PitchPlayerCardSkeleton = ({
  isSmall = false,
}: PitchPlayerCardSkeletonProps) => {
  return (
    <div className={`relative ${isSmall ? "w-15" : "w-15"}`}>
      {/* Badge placeholders */}
      <div className="absolute -top-1 -left-1 z-20 w-5 h-5 bg-gray-200 rounded-t animate-pulse"></div>
      
      {/* Jersey skeleton */}
      <div
        className={`relative ${
          isSmall ? "h-5" : "h-5"
        } flex items-center justify-center`}
      >
        <div
          className={`${
            isSmall ? "w-15 h-5" : "w-15 h-5"
          } rounded-t-lg flex items-center justify-center bg-gray-200 animate-pulse`}
        >
          <div className="w-8 h-3 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Player name skeleton */}
      <div className="bg-white px-1 py-1 text-center shadow-sm">
        <div
          className={`${
            isSmall ? "h-3" : "h-3"
          } bg-gray-200 rounded mx-auto w-12 animate-pulse`}
        ></div>
      </div>

      {/* Points skeleton */}
      <div className="bg-[#2a1134] rounded-b px-1 py-1 text-center">
        <div
          className={`${
            isSmall ? "h-3" : "h-3"
          } bg-gray-700 rounded mx-auto w-6 animate-pulse`}
        ></div>
      </div>
    </div>
  );
};

export default PitchPlayerCardSkeleton;
