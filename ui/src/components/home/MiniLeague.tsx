import { LeagueStanding } from "../../features/home/types";

interface MiniLeagueProps {
  standings: LeagueStanding[];
  leagueName?: string;
  leagueSize?: number;
  onViewAll?: () => void;
}

const MiniLeague = ({
  standings,
  leagueName = "Elite League",
  leagueSize = 20,
  onViewAll,
}: MiniLeagueProps) => {
  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Mini League</h3>
          <p className="text-xs text-text-secondary">{leagueName}</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs text-primary font-medium"
        >
          View All
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex -space-x-2">
          {standings.slice(0, 3).map((_, index) => (
            <div
              key={index}
              className="w-6 h-6 rounded-full bg-border border-2 border-surface flex items-center justify-center"
            >
              <span className="text-[8px] font-bold text-text-secondary">{index + 1}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-text-secondary">
          {standings.length}/{leagueSize}
        </span>
      </div>

      <div className="space-y-2">
        {standings.slice(0, 5).map((team) => (
          <div
            key={team.rank}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-[10px] font-medium text-text-secondary">
                {team.rank}
              </span>
              <span className="text-sm font-medium text-text-primary">{team.team}</span>
            </div>
            <span className="text-sm font-bold text-primary">{team.totalPoints}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniLeague;
