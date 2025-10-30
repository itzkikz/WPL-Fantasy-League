import { useNavigate } from "@tanstack/react-router";
import ManagerStatsCard from "../../components/ManagerStatsCard";
import ManagerPointsCards from "../../components/ManagerPointsCard";
import {useUserStore} from "../../store/useUserStore"

const ManagerPage = () => {
  const navigate = useNavigate();
  const {user} = useUserStore()

  

  const handlePickTeamNavigation = () => {
    navigate({
      to: "/manager/pick-team",
    });
  };

  const handleTeamPointsNavigation = () => {
    navigate({
      to: "/standings/"+user?.teamName,
    });
  };

  return (
    <div className="w-full h-full max-w-md rounded-3xl p-3 shadow-xl overflow-hidden">
      <ManagerStatsCard navigateToPickTeam={handlePickTeamNavigation} navigateToTeamPoints={handleTeamPointsNavigation} />
      <ManagerPointsCards />
    </div>
  );
};

export default ManagerPage;
