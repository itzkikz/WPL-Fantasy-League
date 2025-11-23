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
import PlayerStatsCard from "../../components/player/PlayerStatsCard";
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
          <div className="flex items-center justify-center gap-4 px-4 py-3">
            <div className="h-10 w-20 bg-light-surface dark:bg-dark-surface rounded skeleton-pulse" />
            <div className="h-10 flex-1 bg-light-surface dark:bg-dark-surface rounded skeleton-pulse" />
            <div className="h-10 w-20 bg-light-surface dark:bg-dark-surface rounded skeleton-pulse" />
          </div>
        ) : (
          <GWNavigation
            gameWeek={gw}
            currentGW={currentGw}
            setGameweek={setGameWeek}
          />
        )}

        {isLoading ? (
          <div className="grid grid-cols-3 gap-3 px-4 py-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`skeleton-pulse stagger-${i}`}>
                <div className="h-16 bg-light-surface dark:bg-dark-surface rounded" />
              </div>
            ))}
          </div>
        ) : (
          <GWStatsCards
            avg={avg}
            highest={highest}
            totalGWScore={totalGWScore}
          />
        )}

        <GWTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "pitch" && (
          isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
              <div className="h-64 w-full max-w-2xl bg-light-surface dark:bg-dark-surface rounded-lg skeleton-pulse" />
              <div className="grid grid-cols-4 gap-2 w-full max-w-2xl">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`h-16 bg-light-surface dark:bg-dark-surface rounded skeleton-pulse stagger-${i}`} />
                ))}
              </div>
            </div>
          ) : (
            <GWPitch
              starting={starting}
              bench={bench}
              onClick={handlePlayerOverlay}
            />
          )
        )}
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
