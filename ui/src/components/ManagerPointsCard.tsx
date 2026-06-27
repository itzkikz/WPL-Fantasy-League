import { ManagerDetailsResponse } from "../features/manager/types";
import StatRow from "./StatRow";
interface ManagerPointsCardsProps {
  managerDetails: ManagerDetailsResponse;
}

const ManagerPointsCards = ({ managerDetails }: ManagerPointsCardsProps) => {
  return (
    <>
      {/* Points & Rankings Section */}
      <div className="flex-1 bg-white dark:bg-white/5 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Points & Rankings</h2>
        </div>

        <div className="space-y-2 relative z-10">
          <StatRow
            label="Overall points"
            value={managerDetails?.total}
            border={true}
          />
          <StatRow
            label="Overall points before this GW"
            value={managerDetails?.total_point_before_this_gw}
            border={true}
          />
          <StatRow
            label="Overall rank"
            value={managerDetails?.rank}
            border={true}
          />
          <StatRow
            label="Total players"
            value={managerDetails?.teamsCount}
            border={true}
          />
          <StatRow
            label="Gameweek points"
            value={managerDetails?.totalGWScore}
            border={false}
          />
        </div>
      </div>

      {/* Finance Section */}
      <div className="flex-1 bg-white dark:bg-white/5 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/10 relative overflow-hidden group mt-6 md:mt-0">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 dark:bg-pink-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">Finance</h2>
        </div>

        <div className="space-y-2 relative z-10">
          <StatRow
            label="Total Budget (Bonus and Fine included)"
            value={`£${managerDetails?.total_budget}m`}
            border={true}
          />
          <StatRow
            label="Utilisation"
            value={`£${managerDetails?.utlisation}m`}
            border={true}
          />
          <StatRow
            label="Balance"
            value={`£${(managerDetails?.balance ?? 0).toFixed(2)}m`}
            border={false}
          />
        </div>
      </div>
    </>
  );
};

export default ManagerPointsCards;
