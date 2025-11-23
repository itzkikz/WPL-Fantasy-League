import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ViewTransitions } from "../../types/viewTransitions";
import { useTeamDetails } from "../../features/standings/hooks";
import { useState } from "react";
import Header from "../../components/Header";
import GWNavigation from "../../components/GWNavigation";
import GWStatsCards from "../../components/GWStatsCards";
import GWTabSwitcher from "../../components/GWTabSwitcher";
import GWPitch from "../../components/GWPitch";
import GWPlayerList from "../../components/GWPlayerList";
import GWPitchSkeleton from "../../components/skeletons/GWPitchSkeleton";
import GWStatsCardsSkeleton from "../../components/skeletons/GWStatsCardsSkeleton";
import PlayerStatsCard from "../../components/player/PlayerStatsCard";
import GWNavigationSkeleton from "../../components/skeletons/GWNavigationSkeleton";
import Overlay from "../../components/common/Overlay";
import { Player } from "../../features/players/types";
import { usePlayerStore } from "../../store/usePlayerStore";

const TeamDetailsPage = () => {
  const route = getRouteApi("/standings/$teamName");

  const navigate = useNavigate();

  const { teamName } = route.useParams();
  const [gameWeek, setGameWeek] = useState(0);
  const [activeTab, setActiveTab] = useState("pitch");
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const [showOverlay, setShowOverlay] = useState(false);

  const { data: teamDetails, isLoading } = useTeamDetails(teamName, gameWeek);

  const { gw, currentGw, avg, highest, totalGWScore, starting, bench } =
    teamDetails || {};

  const handlePlayerOverlay = (eachPlayer: Player | null) => {
    eachPlayer && setPlayer(eachPlayer);
    setShowOverlay(!showOverlay);
  };

  const handleGoBack = () => {
    navigate({
      to: "/standings",
      viewTransition: ViewTransitions.back,
    });
  };

  return (
    <>
      <div className="flex flex-col lg:h-screen lg:overflow-hidden lg:pb-0">
        <Header teamName={teamName} onBack={handleGoBack} />
        {isLoading ? (
          <GWNavigationSkeleton />
        ) : (
          <GWNavigation
            gameWeek={gw}
            currentGW={currentGw}
            setGameweek={setGameWeek}
          />
        )}

        {isLoading ? (
          <GWStatsCardsSkeleton />
        ) : (
          <GWStatsCards
            avg={avg}
            highest={highest}
            totalGWScore={totalGWScore}
          />
        )}
        <GWTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "pitch" &&
          (isLoading ? (
            <GWPitchSkeleton />
          ) : (
            <GWPitch
              starting={starting}
              bench={bench}
              onClick={handlePlayerOverlay}
            />
          ))}
        {activeTab === "list" && (
          <GWPlayerList
            starting={starting}
            bench={bench}
            onClick={handlePlayerOverlay}
          />
        )}

        <Overlay
          isOpen={showOverlay}
          onClose={() => handlePlayerOverlay(null)}
          children={
            player && (
              <PlayerStatsCard
                onBack={() => handlePlayerOverlay}
                showDetails={false}
                showStats={true}
                pickMyTeam={false}
              />
            )
          }
        />
      </div>
    </>
  );
};

export default TeamDetailsPage;
