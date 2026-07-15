import { SeasonStats as SeasonStatsType } from "../../features/home/types";

interface SeasonStatsProps {
  data: SeasonStatsType;
  gameweeks?: { gameweek: number; points: number }[];
  onViewAll?: () => void;
}

const SeasonStats = ({ data, gameweeks = [], onViewAll }: SeasonStatsProps) => {
  const maxPoints = gameweeks.length > 0 ? Math.max(...gameweeks.map((gw) => gw.points)) : 100;

  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Stats This Season</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-primary font-medium"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-bg rounded-xl p-3">
          <p className="text-[10px] text-text-secondary mb-1">Avg. Points</p>
          <p className="text-lg font-bold text-text-primary">{data.avgPoints}</p>
        </div>
        <div className="bg-bg rounded-xl p-3">
          <p className="text-[10px] text-text-secondary mb-1">Total Points</p>
          <p className="text-lg font-bold text-primary">{data.totalPoints}</p>
        </div>
        <div className="bg-bg rounded-xl p-3">
          <p className="text-[10px] text-text-secondary mb-1">Highest Points</p>
          <p className="text-lg font-bold text-text-primary">{data.highestPoints}</p>
        </div>
        <div className="bg-bg rounded-xl p-3">
          <p className="text-[10px] text-text-secondary mb-1">Total Rank</p>
          <p className="text-lg font-bold text-text-primary">{data.totalRank.toLocaleString()}</p>
        </div>
      </div>

      {gameweeks.length > 0 && (
        <div className="h-32 flex items-end justify-between gap-1">
          {gameweeks.map((gw) => {
            const heightPercent = (gw.points / maxPoints) * 100;
            return (
              <div key={gw.gameweek} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary/20 rounded-t-lg"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[8px] text-text-secondary mt-1">GW {gw.gameweek}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SeasonStats;
