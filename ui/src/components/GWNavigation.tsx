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
    <div className="flex-none py-1">
      <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
        <button
          className={`cursor-pointer${gameWeek === 1 ? "text-gray-200" : ""}`}
          disabled={gameWeek === 1}
          onClick={() => setGameweek(gameWeek - 1)}
        >
          <AngleLeft height="5" width="5" />
        </button>
        <h2 className="text-base font-bold">
          Gameweek {gameWeek === 0 ? "" : gameWeek}
        </h2>

        <button
          className={`cursor-pointer ${gameWeek - currentGW === 0 ? "text-gray-200" : ""}`}
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
