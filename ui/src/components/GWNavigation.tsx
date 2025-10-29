interface GWNavigationProps {
  gameWeek?: number;
  currentGW?: number;
  setGameweek: (gw: number) => void;
}

const GWNavigation = ({
  gameWeek = 0,
  setGameweek,
  currentGW = 0,
}: GWNavigationProps) => {
  return (
    <div className="flex-none py-1">
      <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
        <button
          className="cursor-pointer"
          disabled={gameWeek === 1}
          onClick={() => setGameweek(gameWeek - 1)}
        >
          <svg
            className={`w-5 h-5 ${gameWeek === 1 ? 'text-gray-400' : ''}`}
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
        <h2 className="text-base font-bold">
          Gameweek {gameWeek === 0 ? "" : gameWeek}
        </h2>

        <button
          className="cursor-pointer"
          disabled={gameWeek - currentGW === 0}
          onClick={() => setGameweek(gameWeek + 1)}
        >
          <svg
            className={`w-5 h-5 ${gameWeek - currentGW === 0 ? 'text-gray-400' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GWNavigation;
