import { useNavigate } from "@tanstack/react-router";
import { ViewTransitions } from "../../types/viewTransitions";
import { useStandings } from "../../features/standings/hooks";
import ScrollableTable from "../../components/ScrollableTable";

const StandingsPage = () => {
  const navigate = useNavigate();
  const { data: standings, isLoading, error } = useStandings();

  const handleTeamClick = (team: any) => {
    navigate({
      to: "/standings/$teamId",
      params: { teamId: team.team_id },
      viewTransition: ViewTransitions.forward,
    });
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-light-bg dark:bg-dark-bg animate-in fade-in duration-500 overflow-hidden">
      {/* Header Area */}
      <div className="flex-none pt-6 pb-2 px-4 lg:px-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          League Standings
        </h1>
        <div className="flex items-center justify-between mt-1">
          <p className="text-gray-500 dark:text-gray-400">
            Current global rankings and points.
          </p>
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Updated: {standings && standings[0]?.last_update_date?.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden px-4 lg:px-8 pb-20 lg:pb-6 mt-4">
        {isLoading ? (
          <div className="h-full bg-white dark:bg-[#1a1a1a] rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className={`h-14 bg-gray-100 dark:bg-white/5 rounded-xl mb-3 skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
              />
            ))}
          </div>
        ) : (
          <div className="h-full bg-white dark:bg-white/5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden flex flex-col">
            <ScrollableTable content={standings} onClick={handleTeamClick} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StandingsPage;
