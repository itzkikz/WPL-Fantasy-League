import { LeagueStanding } from "../../features/home/types";
import Delta from "../Delta";

interface MiniLeagueStandingsProps {
  standings: LeagueStanding[];
  onViewAll?: () => void;
}

const MiniLeagueStandings = ({ standings, onViewAll }: MiniLeagueStandingsProps) => {
  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">League Standings</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-primary font-medium"
        >
          View Full Table
        </button>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[10px] text-text-secondary font-medium pb-2 w-8">#</th>
              <th className="text-left text-[10px] text-text-secondary font-medium pb-2">Team</th>
              <th className="text-center text-[10px] text-text-secondary font-medium pb-2 w-12">GW</th>
              <th className="text-right text-[10px] text-text-secondary font-medium pb-2 w-16">Total</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team) => (
              <tr
                key={team.rank}
                className="border-b border-border last:border-0"
              >
                <td className="py-3">
                  <span className="text-xs font-medium text-text-secondary">{team.rank}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Delta d={team.rankChange} />
                    <span className="text-sm font-medium text-text-primary">{team.team}</span>
                  </div>
                </td>
                <td className="py-3 text-center">
                  <span className="text-sm font-medium text-text-primary">{team.gameweekPoints}</span>
                </td>
                <td className="py-3 text-right">
                  <span className="text-sm font-bold text-primary">{team.totalPoints}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MiniLeagueStandings;
