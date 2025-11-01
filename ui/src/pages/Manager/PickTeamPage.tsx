import { useEffect, useState } from "react";
import GWPitch from "../../components/GWPitch";
import Header from "../../components/Header";
import PlayerStatsCard from "../../components/player/PlayerStatsCard";
import { Player } from "../../features/players/types";
import {
  clearSwapHighlights,
  executeSwap,
  playerSwap,
} from "../../libs/helpers/pickMyTeam";
import { useUserStore } from "../../store/useUserStore";
import Button from "../../components/common/Button";
import Overlay from "../../components/common/Overlay";
import { Formation, TeamDetails } from "../../features/standings/types";
import { useManageTeamStore } from "../../store/useManageTeamStore";
import { usePlayerStore } from "../../store/usePlayerStore";
import {
  useManagerDetails,
  useSubstitution,
} from "../../features/manager/hooks";
import { useTeamDetails } from "../../features/standings/hooks";

const PickTeamPage = () => {
  const { player, setPlayer } = usePlayerStore();
  const { user } = useUserStore();

  const { data: teamDetails, isLoading, isSuccess } = useManagerDetails();
  const { starting, bench } = teamDetails || {
    starting: { goalkeeper: [], forwards: [], midfielders: [], defenders: [] },
    bench: [],
  };

  console.log(starting);

  const [showOverlay, setShowOverlay] = useState(false);
  const [editedStarting, setEditedStarting] =
    useState<TeamDetails["starting"]>(starting);
  const [editedBench, setEditedBench] = useState<TeamDetails["bench"]>(bench);
  const {
    setIsSubstitution,
    isSubstitution,
    substitutions,
    setSubstitutions,
    resetSubstitutions,
  } = useManageTeamStore();

  const mutation = useSubstitution((data) => {
    console.log(data);
  });

  useEffect(() => {
    console.log(isSuccess);
    if (isSuccess) {
      setEditedBench(bench);
      setEditedStarting(starting);
    }
  }, [isSuccess]);

  const handlePlayerOverlay = (eachPlayer: Player | null) => {
    eachPlayer && setPlayer(eachPlayer);
    setShowOverlay(!showOverlay);
  };

  const handleExecuteSwap = (eachPlayer: Player) => {
    const updatedTeam =
      player &&
      executeSwap(
        { starting: editedStarting, bench: editedBench },
        eachPlayer?.name,
        player?.name
      ); // Swap Biereth with Nico Williams
    console.log(updatedTeam);
    updatedTeam?.bench && setEditedBench(updatedTeam.bench);
    updatedTeam?.starting && setEditedStarting(updatedTeam.starting);
    updatedTeam?.swappedIn &&
      updatedTeam?.swappedOut &&
      setSubstitutions({
        swapIn: updatedTeam?.swappedIn,
        swapOut: updatedTeam?.swappedOut,
      });
    setIsSubstitution(false);
    setPlayer(null);
  };

  const handlePlayerSwap = (
    playerName: Player["name"],
    location: "starting" | "bench"
  ) => {
    if (playerName) {
      setIsSubstitution(true);
      const result = playerSwap(
        { bench: editedBench, starting: editedStarting },
        playerName,
        location
      ); // Mika Biereth
      result?.bench && setEditedBench(result.bench);
      result?.starting && setEditedStarting(result.starting);
    }
  };

  const handleSubReset = () => {
    setIsSubstitution(false);
    const result = clearSwapHighlights({
      bench: editedBench,
      starting: editedStarting,
    }); // Mika Biereth
    result?.bench && setEditedBench(result.bench);
    result?.starting && setEditedStarting(result.starting);
    setPlayer(null);
  };

  const handleSave = () => {
    setPlayer(null);
    resetSubstitutions();
    setIsSubstitution(false);
    mutation.mutate(substitutions);
  };

  // Execute the swap
  //const updatedTeam = executeSwap(teamData, 10, 11); // Swap Biereth with Nico Williams

  return (
    <>
      {user?.teamName && <Header teamName={user?.teamName} />}
      <div className="flex items-center justify-center bg-white px-4 pt-4 pb-3 border-b border-gray-100 text-[#33003b]">
        <h6 className="text-center text-base text-[#33003b]">Gameweek 10</h6>
        <span aria-hidden="true">&nbsp;•&nbsp;</span>
        <h6 className="text-center text-base font-semibold text-[#33003b]">
          Deadline: Sat 1 Nov, 19:00
        </h6>
      </div>
      <div className="flex text-white justify-center items-center">
        <div className="flex bg-[#2a1134] rounded-lg p-2 text-white justify-center items-center text-center m-2">
          <span className="text-xs">
            To change your captain use the menu which appears when clicking on a
            player
          </span>
        </div>
        <Button
          disabled={substitutions?.length === 0}
          onClick={handleSave}
          width="w-1/2"
          label="Save"
        />
      </div>

      <GWPitch
        starting={editedStarting}
        bench={editedBench}
        onClick={
          !isSubstitution
            ? handlePlayerOverlay
            : substitutions?.length > 0
              ? handleExecuteSwap
              : () => {}
        }
        pickMyTeam={true}
        reset={handleSubReset}
      />

      <Overlay
        isOpen={showOverlay}
        onClose={() => handlePlayerOverlay(null)}
        children={
          player && (
            <PlayerStatsCard
              onBack={() => handlePlayerOverlay(null)}
              showDetails={true}
              showStats={false}
              pickMyTeam={true}
              handleSub={(playerName: string, location: "starting" | "bench") =>
                handlePlayerSwap(playerName, location)
              }
            />
          )
        }
      />
    </>
  );
};

export default PickTeamPage;
