import { UpcomingMatch as UpcomingMatchType } from "../../features/home/types";

interface UpcomingMatchProps {
  data: UpcomingMatchType;
}

const UpcomingMatch = ({ data }: UpcomingMatchProps) => {
  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Upcoming Match</h3>
        <span className="text-xs text-text-secondary">GW {data.gameweek}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-2">
            <span className="text-xs font-bold text-text-primary">{data.homeTeamShort}</span>
          </div>
          <p className="text-xs text-text-secondary text-center">{data.homeTeam}</p>
        </div>

        <div className="flex flex-col items-center px-4">
          <p className="text-lg font-bold text-text-primary">VS</p>
          <p className="text-[10px] text-text-secondary mt-1">{data.kickoffTime}</p>
        </div>

        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-border flex items-center justify-center mb-2">
            <span className="text-xs font-bold text-text-primary">{data.awayTeamShort}</span>
          </div>
          <p className="text-xs text-text-secondary text-center">{data.awayTeam}</p>
        </div>
      </div>
    </div>
  );
};

export default UpcomingMatch;
