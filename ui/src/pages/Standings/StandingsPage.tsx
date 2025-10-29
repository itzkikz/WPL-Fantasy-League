import { useNavigate } from "@tanstack/react-router";
import { useStandings } from "../../features/standings/hooks";
import ScrollableTable from "../../components/ScrollableTable";
import ScrollableTableSkeleton from "../../components/skeletons/ScrollableTableSkeleton";

const StandingsPage = () => {
  const navigate = useNavigate();
  const { data: standings, isLoading, error } = useStandings();

  const handleTeamClick = (teamName: string) => {
    navigate({
      to: "/standings/$teamName",
      params: { teamName },
    });
  };

  return (
    <>
      <div className="flex-none px-4 pt-4 pb-3 border-b border-[#ebe5eb] dark:border-[#541e5d]">
        {/* <h2 className="text-center text-2xl font-semibold text-[#33003b]">
          Arsenal
        </h2> */}
        <p className="mt-2 text-xs text-center">
          Last updated: <b>{standings && standings[0]?.last_update_date}</b>
          (Local Time)
        </p>
      </div>
      {isLoading ? (
        <ScrollableTableSkeleton />
      ) : (
        <ScrollableTable content={standings} onClick={handleTeamClick} />
      )}
    </>
  );
};

export default StandingsPage;
