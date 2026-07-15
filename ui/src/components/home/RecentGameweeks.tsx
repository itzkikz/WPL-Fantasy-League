import { GameweekHistory } from "../../features/home/types";

interface RecentGameweeksProps {
  gameweeks: GameweekHistory[];
  onViewAll?: () => void;
}

const RecentGameweeks = ({ gameweeks, onViewAll }: RecentGameweeksProps) => {
  const maxPoints = Math.max(...gameweeks.map((gw) => gw.points));

  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Your Recent Gameweeks</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-primary font-medium"
        >
          View All
        </button>
      </div>

      <div className="flex items-end justify-between gap-2 h-24">
        {gameweeks.map((gw) => {
          const heightPercent = (gw.points / maxPoints) * 100;
          const isHighest = gw.points === maxPoints;

          return (
            <div key={gw.gameweek} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col items-center justify-end h-20">
                <span className="text-[10px] font-medium text-text-primary mb-1">
                  {gw.points}
                </span>
                <div
                  className={`w-full max-w-[40px] rounded-t-lg ${
                    isHighest ? "bg-primary" : "bg-border"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-text-secondary mt-2">GW {gw.gameweek}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentGameweeks;
