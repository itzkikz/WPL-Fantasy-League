import { useNavigate } from "@tanstack/react-router";
import { ViewTransitions } from "../../types/viewTransitions";
import ManagerStatsCard from "../../components/ManagerStatsCard";
import ManagerPointsCards from "../../components/ManagerPointsCard";
import { useUserStore } from "../../store/useUserStore";
import { useManagerDetails } from "../../features/manager/hooks";

const ManagerPage = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);

  const { data: managerDetails, isLoading, isSuccess } = useManagerDetails();

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
    <div className="flex flex-col px-2 py-2 space-y-4 select-none lg:h-[calc(100vh-6rem)]">
      {managerDetails && (
        <>
          <ManagerStatsCard
            navigateToPickTeam={handlePickTeamNavigation}
            navigateToTeamPoints={handleTeamPointsNavigation}
            managerDetails={managerDetails}
          />
          <ManagerPointsCards managerDetails={managerDetails} />
        </>
      )}
    </div>
  );
};

export default ManagerPage;
