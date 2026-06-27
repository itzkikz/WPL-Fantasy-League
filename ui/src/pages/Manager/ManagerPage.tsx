import { useNavigate } from "@tanstack/react-router";
import { ViewTransitions } from "../../types/viewTransitions";
import ManagerStatsCard from "../../components/ManagerStatsCard";
import ManagerPointsCards from "../../components/ManagerPointsCard";
import { useUserStore } from "../../store/useUserStore";
import { useManagerDetails } from "../../features/manager/hooks";

const ManagerPage = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const { data: managerDetails, isLoading, isSuccess, isError } = useManagerDetails();

  const handlePickTeamNavigation = () => {
    navigate({
      to: "/manager/pick-team",
      viewTransition: ViewTransitions.forward,
    });
  };

  const handleTeamPointsNavigation = () => {
    navigate({
      to: "/standings/" + user?.teamName,
    });
  };

  return (
    <div className="flex flex-col h-full bg-light-bg dark:bg-dark-bg animate-in fade-in duration-500 overflow-y-auto pb-20">
      <div className="pt-6 pb-4 px-4 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Manager Profile
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your squad and track your performance.
        </p>
      </div>

      <div className="flex flex-col px-4 lg:px-8 space-y-6 select-none">
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
        
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm mt-4 animate-in fade-in zoom-in-95 duration-500">
            <span className="text-6xl mb-4 drop-shadow-md">🤷‍♂️</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">No Team Found</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm font-medium">
              You are currently not managing any Fantasy Team. Once an admin assigns you to a team, it will appear here!
            </p>
          </div>
        )}

        {managerDetails && !isError && (
          <>
            <ManagerStatsCard
              navigateToPickTeam={handlePickTeamNavigation}
              navigateToTeamPoints={handleTeamPointsNavigation}
              managerDetails={managerDetails}
            />
            <div className="flex flex-col md:flex-row gap-6">
              <ManagerPointsCards managerDetails={managerDetails} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerPage;
