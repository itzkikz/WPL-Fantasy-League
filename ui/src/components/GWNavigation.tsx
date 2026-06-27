import AngleLeft from "./icons/AngleLeft";
import AngleRight from "./icons/AngleRight";

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
    <div className="flex-none pt-4 pb-2">
      <div className="flex items-center justify-between max-w-xs mx-auto px-4">
        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
            gameWeek === 1 
              ? "opacity-30 cursor-not-allowed bg-gray-100 dark:bg-white/5" 
              : "bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 cursor-pointer"
          }`}
          disabled={gameWeek === 1}
          onClick={() => setGameweek(gameWeek - 1)}
        >
          <AngleLeft height="5" width="5" />
        </button>
        
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-0.5">Gameweek</p>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white leading-none">
            {gameWeek === 0 ? "-" : gameWeek}
          </h2>
        </div>

        <button
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${
            gameWeek - currentGW === 0 
              ? "opacity-30 cursor-not-allowed bg-gray-100 dark:bg-white/5" 
              : "bg-white dark:bg-white/10 hover:bg-gray-100 dark:hover:bg-white/20 shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 cursor-pointer"
          }`}
          disabled={gameWeek - currentGW === 0}
          onClick={() => setGameweek(gameWeek + 1)}
        >
          <AngleRight height="5" width="5" />
        </button>
      </div>
    </div>
  );
};

export default GWNavigation;
