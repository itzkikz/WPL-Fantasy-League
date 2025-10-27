import { getRouteApi } from "@tanstack/react-router";
import { useTeamDetails } from "../features/standings/hooks";
import { useState } from "react";
import Header from "../components/Header";
import GWNavigation from "../components/GWNavigation";
import GWStatsCards from "../components/GWStatsCards";
import GWTabSwitcher from "../components/GWTabSwitcher";
import { convertToFormation } from "../libs/formatter/lineupFormatter";
import GWPitch from "../components/GWPitch";
import { Player } from "../libs/formatter/types";
import GWPlayerList from "../components/GWPlayerList";
import GWPitchSkeleton from "../components/skeletons/GWPitchSkeleton";
import GWStatsCardsSkeleton from "../components/skeletons/GWStatsCardsSkeleton";
import PlayerStatsOverlay from "../components/PlayerStatsOverlay";
import GWNavigationSkeleton from "../components/skeletons/GWNavigationSkeleton";

const TeamDetailsPage = () => {
  const route = getRouteApi("/standings/$teamName");

  const { teamName } = route.useParams();
  const [gameWeek, setGameWeek] = useState(0);
  const [activeTab, setActiveTab] = useState("pitch");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const { data: teamDetails, isLoading } = useTeamDetails(teamName, gameWeek);

  const { gw, currentGw, avg, highest, totalGWScore } = teamDetails || {};
  const { starting, bench } = convertToFormation(teamDetails?.playerData || []);

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

      {selectedPlayer && (
        <PlayerStatsOverlay
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </>
  );
};

export default TeamDetailsPage;
