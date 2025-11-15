import { ManagerDetailsResponse } from "../features/manager/types";
import StatRow from "./StatRow";
interface ManagerPointsCardsProps {
  managerDetails: ManagerDetailsResponse
}

const ManagerPointsCards = ({managerDetails} : ManagerPointsCardsProps) => {
  return (
    <>
      {/* Points & Rankings Section */}
      <div className="p-6 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Points & Rankings</h2>
        </div>

        <div className="space-y-3 mb-4">
          <StatRow label="Overall points" value={managerDetails?.total} border={false} />
          <StatRow label="Overall points before this GW" value={managerDetails?.total_point_before_this_gw} border={false} />
          <StatRow label="Overall rank" value={managerDetails?.rank} border={false} />
          <StatRow label="Total players" value={managerDetails?.teamsCount} border={false} />
          <StatRow label="Gameweek points" value={managerDetails?.totalGWScore} border={false} />
        </div>
      </div>
      <div className="p-6 border-b border-light-border dark:border-dark-border">
         <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Finance</h2>
        </div>

        <div className="space-y-3">
          <StatRow label="Total Budget (Bonus and Fine included)" value={`£${managerDetails?.total_budget}m`} border={false} />
          <StatRow label="Utlisation" value={`£${managerDetails?.utlisation}m`} border={false} />
          <StatRow label="Balance" value={`£${(managerDetails?.balance).toFixed(2)}m`} border={false} />
        </div>
      </div>
    </>
  );
};

export default ManagerPointsCards;
