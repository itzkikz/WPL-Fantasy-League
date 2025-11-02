import { useNavigate } from "@tanstack/react-router";
import ManagerStatsCard from "../../components/ManagerStatsCard";
import ManagerPointsCards from "../../components/ManagerPointsCard";
import { useUserStore } from "../../store/useUserStore";
import { useManagerDetails } from "../../features/manager/hooks";

const ManagerPage = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const { data: managerDetails, isLoading, isSuccess } = useManagerDetails();  

  const handlePickTeamNavigation = () => {
    navigate({
      to: "/manager/pick-team",
    });
  };

  const handleTeamPointsNavigation = () => {
    navigate({
      to: "/standings/" + user?.teamName,
    });
  };

  return (
    <div className="w-full h-full p-3 overflow-hidden">
      {managerDetails && (<><ManagerStatsCard
        navigateToPickTeam={handlePickTeamNavigation}
        navigateToTeamPoints={handleTeamPointsNavigation}
        managerDetails={managerDetails}
      />
      <ManagerPointsCards managerDetails={managerDetails} /></>)}
      
    </div>
  );
};

export default ManagerPage;
