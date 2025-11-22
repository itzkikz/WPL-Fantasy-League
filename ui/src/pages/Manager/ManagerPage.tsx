import { useNavigate } from "@tanstack/react-router";
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
      viewTransition: {
        types: ["forward"], // different type name
      },
    });
  };

  const handleTeamPointsNavigation = () => {
    navigate({
      to: "/standings/" + user?.teamName,
    });
  };

  return (
    <div className="flex flex-col px-2 py-2 space-y-4 overflow-y-auto select-none h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)]">
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
