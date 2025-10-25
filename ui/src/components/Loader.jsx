const Loader = () => {
    return(<div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
      <div className="text-center">
        {/* Spinning Football/Soccer Ball */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <svg 
            className="w-24 h-24 animate-spin text-white" 
            viewBox="0 0 100 100" 
            fill="none"
          >
            <circle 
              className="opacity-25" 
              cx="50" 
              cy="50" 
              r="45" 
              stroke="currentColor" 
              strokeWidth="8"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M50 5 A45 45 0 0 1 95 50"
            />
          </svg>
        </div>
        
        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Loading Your Team
        </h2>
        <p className="text-green-100">
          Preparing your fantasy lineup...
        </p>
      </div>
    </div>)
}

export default Loader;