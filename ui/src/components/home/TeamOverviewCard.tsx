import { TeamOverview } from "../../features/home/types";
import AngleRight from "../icons/AngleRight";
import Delta from "../Delta";

interface TeamOverviewCardProps {
  data: TeamOverview;
  onClick?: () => void;
}

const TeamOverviewCard = ({ data, onClick }: TeamOverviewCardProps) => {
  return (
    <div
      className="bg-dark-surface rounded-2xl p-4 shadow-lg cursor-pointer active-scale"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-text-secondary">Your Team</p>
          <div className="flex items-center gap-2 mt-1">
            <h2 className="text-xl font-bold text-text-primary">{data.teamName}</h2>
            <AngleRight />
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-secondary">GW Points</p>
          <p className="text-2xl font-black text-primary">{data.gwPoints}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-text-secondary">Points</p>
          <p className="text-lg font-bold text-text-primary">{data.totalPoints.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-1">
          <div>
            <p className="text-xs text-text-secondary">Rank</p>
            <p className="text-lg font-bold text-text-primary">{data.rank.toLocaleString()}</p>
          </div>
          <Delta d={data.rankChange} />
        </div>
        <div>
          <p className="text-xs text-text-secondary">Transfers</p>
          <p className="text-lg font-bold text-text-primary">{data.transfers} Free</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        <p className="text-xs text-text-secondary">
          Top <span className="text-primary font-semibold">{Math.round((1 - data.rank / 100000) * 100)}%</span>
        </p>
      </div>
    </div>
  );
};

export default TeamOverviewCard;
