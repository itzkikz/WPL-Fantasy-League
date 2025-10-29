const GWStatsCardsSkeleton = () => {
  return (
    <div className="flex-none px-16">
      <div className="flex items-center justify-between max-w-md mx-auto gap-1">
        {/* Average skeleton */}
        <div className="text-center">
          <div className="h-7 w-12 bg-gray-200 rounded mx-auto mb-1 animate-pulse"></div>
          <p className="text-sm text-gray-600 mt-1">Average</p>
        </div>

        {/* Total Points skeleton - highlighted card */}
        <div className="relative">
          <div className="text-center bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl px-4 py-4 shadow-lg">
            <div className="h-8 w-16 bg-white/30 rounded mx-auto mb-1 animate-pulse"></div>
            <p className="text-sm text-white mt-1">Total Pts</p>
          </div>
        </div>

        {/* Highest skeleton */}
        <div className="text-center">
          <div className="h-7 w-12 bg-gray-200 rounded mx-auto mb-1 animate-pulse"></div>
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1 justify-center">
            Highest
          </p>
        </div>
      </div>
    </div>
  );
};

export default GWStatsCardsSkeleton;