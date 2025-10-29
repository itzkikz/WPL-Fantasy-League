const GWNavigationSkeleton = () => {
  return (
    <div className="flex-none py-1">
      <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
        {/* Left arrow skeleton */}
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
        
        {/* Gameweek text skeleton */}
        <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
        
        {/* Right arrow skeleton */}
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  );
};

export default GWNavigationSkeleton;
