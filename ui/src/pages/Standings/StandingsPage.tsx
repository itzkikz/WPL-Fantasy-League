import { useNavigate } from "@tanstack/react-router";
import { ViewTransitions } from "../../types/viewTransitions";
import { useStandings } from "../../features/standings/hooks";
import ScrollableTable from "../../components/ScrollableTable";

const StandingsPage = () => {
  const navigate = useNavigate();
  const { data: standings, isLoading, error } = useStandings();

  const handleTeamClick = (teamName: string) => {
    navigate({
      to: "/standings/$teamName",
      params: { teamName },
      viewTransition: ViewTransitions.forward,
    });
  };

  return (
    <>
      <div className="flex-none px-4 pt-4 pb-3">
        <p className="mt-2 text-xs text-center">
          Last updated: <b>{standings && standings[0]?.last_update_date}</b>
          (Local Time)
        </p>
      </div>
      {isLoading ? (
        <div className="flex-1 overflow-hidden px-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-12 bg-light-surface dark:bg-dark-surface rounded mb-2 skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
            />
          ))}
        </div>
      ) : (
        <ScrollableTable content={standings} onClick={handleTeamClick} />
      )}
    </>
  );
};

export default StandingsPage;
