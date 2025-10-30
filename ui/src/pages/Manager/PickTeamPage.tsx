import { useState } from "react";
import GWPitch from "../../components/GWPitch";
import Header from "../../components/Header";
import PlayerStatsOverlay from "../../components/PlayerStatsOverlay";
import { Player } from "../../features/players/types";
import { handlePlayerSwap } from "../../libs/helpers/pickMyTeam";
import { TeamDetails } from "../../features/standings/types";
import { useUserStore } from "../../store/useUserStore";
import Button from "../../components/common/Button";

const MOCK_DATA = {
  avg: "51.78",
  highest: 73,
  starting: {
    goalkeeper: [
      {
        id: 7,
        name: "Lucas Chevalier",
        team: "PSG",
        teamColor: "#004170",
        point: 6,
        position: "GK",
        fullTeamName: "Paris Saint-Germain",
        app: 1,
        clean_sheet: 1,
        goal: 0,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 2,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isPowerPlayer: false,
      },
    ],
    defenders: [
      {
        id: 5,
        name: "Jurriën Timber",
        team: "ARS",
        teamColor: "#EF0107",
        point: 6,
        position: "DEF",
        fullTeamName: "Arsenal",
        app: 1,
        clean_sheet: 1,
        goal: 0,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isPowerPlayer: false,
      },
      {
        id: 9,
        name: "Marquinhos",
        team: "PSG",
        teamColor: "#004170",
        point: 2,
        position: "DEF",
        fullTeamName: "Paris Saint-Germain",
        app: 1,
        clean_sheet: 0,
        goal: 0,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isPowerPlayer: false,
      },
      {
        id: 15,
        name: "Trevoh Chalobah",
        team: "CHE",
        teamColor: "#034694",
        point: 2,
        position: "DEF",
        fullTeamName: "Chelsea",
        app: 1,
        clean_sheet: 0,
        goal: 0,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isPowerPlayer: false,
      },
    ],
    midfielders: [
      {
        id: 6,
        name: "Karim Adeyemi",
        team: "BVB",
        teamColor: "#FDE100",
        point: 2,
        position: "MID",
        fullTeamName: "Borussia Dortmund",
        app: 1,
        clean_sheet: 1,
        goal: 0,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isPowerPlayer: false,
      },
      {
        id: 8,
        name: "Ludovic Blas",
        team: "REN",
        teamColor: "#E20E17",
        point: 2,
        position: "MID",
        fullTeamName: "Stade Rennais",
        app: 1,
        clean_sheet: 0,
        goal: 0,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isPowerPlayer: false,
      },
      {
        id: 12,
        name: "Rafael Leão",
        team: "MIL",
        teamColor: "#FB090B",
        point: 14,
        position: "MID",
        fullTeamName: "Milan",
        app: 1,
        clean_sheet: 0,
        goal: 1,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isCaptain: true,
        isPowerPlayer: true,
      },
      {
        id: 14,
        name: "Hakon Arnar Haraldsson",
        team: "LIL",
        teamColor: "#CC0000",
        point: 9,
        position: "MID",
        fullTeamName: "Lille",
        app: 1,
        clean_sheet: 0,
        goal: 1,
        assist: 1,
        yellow_card: 1,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isPowerPlayer: false,
      },
    ],
    forwards: [
      {
        id: 3,
        name: "Erling Haaland",
        team: "MCI",
        teamColor: "#6CABDD",
        point: 2,
        position: "FWD",
        fullTeamName: "Manchester City",
        app: 1,
        clean_sheet: 0,
        goal: 0,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isViceCaptain: true,
        isPowerPlayer: false,
      },
      {
        id: 4,
        name: "Jonathan Burkardt",
        team: "SGE",
        teamColor: "#E1000F",
        point: 10,
        position: "FWD",
        fullTeamName: "Eintracht Frankfurt",
        app: 1,
        clean_sheet: 1,
        goal: 2,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isPowerPlayer: false,
      },
      {
        id: 10,
        name: "Mika Biereth",
        team: "MON",
        teamColor: "#E2001A",
        point: 0,
        position: "FWD",
        fullTeamName: "AS Monaco",
        app: 0,
        clean_sheet: 0,
        goal: 0,
        assist: 0,
        yellow_card: 0,
        red_card: 0,
        save: 0,
        penalty_save: 0,
        penalty_miss: 0,
        gw: 9,
        isPowerPlayer: false,
      },
    ],
  },
  bench: [
    {
      id: 2,
      name: "Dean Henderson",
      team: "CRY",
      teamColor: "#1B458F",
      point: 2,
      position: "GK",
      fullTeamName: "Crystal Palace",
      app: 1,
      clean_sheet: 0,
      goal: 0,
      assist: 0,
      yellow_card: 0,
      red_card: 0,
      save: 2,
      penalty_save: 0,
      penalty_miss: 0,
      gw: 9,
      subNumber: 1,
      isPowerPlayer: false,
    },
    {
      id: 1,
      name: "Amir Rrahmani",
      team: "NAP",
      teamColor: "#0066CC",
      point: 0,
      position: "DEF",
      fullTeamName: "Napoli",
      app: 0,
      clean_sheet: 0,
      goal: 0,
      assist: 0,
      yellow_card: 0,
      red_card: 0,
      save: 0,
      penalty_save: 0,
      penalty_miss: 0,
      gw: 9,
      subNumber: 2,
      isPowerPlayer: false,
    },
    {
      id: 11,
      name: "Nico Williams",
      team: "ATH",
      teamColor: "#EE2523",
      point: 2,
      position: "MID",
      fullTeamName: "Athletic Club",
      app: 1,
      clean_sheet: 0,
      goal: 0,
      assist: 0,
      yellow_card: 0,
      red_card: 0,
      save: 0,
      penalty_save: 0,
      penalty_miss: 0,
      gw: 9,
      subNumber: 3,
      isPowerPlayer: false,
    },
    {
      id: 13,
      name: "Bremer",
      team: "JUV",
      teamColor: "#000000",
      point: 0,
      position: "DEF",
      fullTeamName: "Juventus",
      app: 0,
      clean_sheet: 0,
      goal: 0,
      assist: 0,
      yellow_card: 0,
      red_card: 0,
      save: 0,
      penalty_save: 0,
      penalty_miss: 0,
      gw: 9,
      subNumber: 4,
      isPowerPlayer: false,
    },
  ],
  gw: 9,
  currentGw: 9,
  totalGWScore: 55,
};

const PickTeamPage = () => {
  const { gw, currentGw, avg, highest, totalGWScore, starting, bench } = MOCK_DATA || {};

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const {user} = useUserStore();

  const result = handlePlayerSwap({starting, bench}, 'Jurriën Timber', 'starting'); // Mika Biereth
console.log('Available players to swap with:', result.availablePlayers);

// Execute the swap
//const updatedTeam = executeSwap(teamData, 10, 11); // Swap Biereth with Nico Williams

  return (
    <>
      <Header teamName={user?.teamName} />
      <div className="flex items-center justify-center bg-white px-4 pt-4 pb-3 border-b border-gray-100 text-[#33003b]">
        <h6 className="text-center text-base text-[#33003b]">Gameweek 10</h6>
        <span aria-hidden="true">&nbsp;•&nbsp;</span>
        <h6 className="text-center text-base font-semibold text-[#33003b]">
          Deadline: Sat 1 Nov, 19:00
        </h6>
      </div>
      <div className="flex bg-[#2a1134] rounded-lg p-2 text-white justify-center items-center text-center m-2">
        <span className="text-xs">
          To change your captain use the menu which appears when clicking on a
          player
        </span>
      </div>
      <GWPitch starting={starting} bench={bench} onClick={setSelectedPlayer} />
      <div className="flex justify-center items-center px-4 py-4">
        <Button disabled={true} width="w-1/2" label="Save Your Team" />
      </div>
      {selectedPlayer && (
        <PlayerStatsOverlay
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          showDetails={true}
          showStats={false}
          pickMyTeam={true}
        />
      )}
    </>
  );
};

export default PickTeamPage;
