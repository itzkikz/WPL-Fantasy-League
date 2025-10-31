import { getRouteApi } from "@tanstack/react-router";
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
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import GWNavigationSkeleton from "../../components/skeletons/GWNavigationSkeleton";
import Overlay from "../../components/common/Overlay";
import { Player } from "../../features/players/types";

const TeamDetailsPage = () => {
  const route = getRouteApi("/standings/$teamName");

  const { teamName } = route.useParams();
  const [gameWeek, setGameWeek] = useState(0);
  const [activeTab, setActiveTab] = useState("pitch");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  const { data: teamDetails, isLoading } = useTeamDetails(teamName, gameWeek);

  const { gw, currentGw, avg, highest, totalGWScore, starting, bench } =
    teamDetails || {};

  const handlePlayerOverlay = (player: Player | null) => {
    setSelectedPlayer(player);
    setShowOverlay(!showOverlay);
  };

  return (
    <>
      <Header teamName={teamName} />
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
        <GWStatsCards avg={avg} highest={highest} totalGWScore={totalGWScore} />
      )}
      <GWTabSwitcher activeTab={activeTab} setActiveTab={setActiveTab} />
      {activeTab === "pitch" &&
        (isLoading ? (
          <GWPitchSkeleton />
        ) : (
          <GWPitch
            starting={starting}
            bench={bench}
            onClick={setSelectedPlayer}
          />
        ))}
      {activeTab === "list" && (
        <GWPlayerList
          starting={starting}
          bench={bench}
          onClick={setSelectedPlayer}
        />
      )}

      <Overlay
        isOpen={showOverlay}
        onClose={() => handlePlayerOverlay(null)}
        children={
          selectedPlayer && (
            <PlayerStatsOverlay
              player={selectedPlayer}
              onBack={() => handlePlayerOverlay}
              showDetails={true}
              showStats={false}
              pickMyTeam={true}
            />
          )
        }
      />
    </>
  );
};

export default TeamDetailsPage;
