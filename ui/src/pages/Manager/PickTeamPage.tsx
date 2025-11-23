import { useEffect, useState } from "react";
import GWPitch from "../../components/GWPitch";
import Header from "../../components/Header";
import PlayerStatsCard from "../../components/player/PlayerStatsCard";
import { Player } from "../../features/players/types";
import {
  clearSwapHighlights,
  executeSwap,
  playerSwap,
  setCaptain,
  setViceCaptain,
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
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Roles } from "../../store/types";
import StatRow from "../../components/StatRow";
import Toast from "../../components/common/Toast";
import { useNavigate } from "@tanstack/react-router";
import { ViewTransitions } from "../../types/viewTransitions";

dayjs.extend(utc);
dayjs.extend(timezone);

const PickTeamPage = () => {
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const user = useUserStore((state) => state.user);

  const {
    data: managerDetails,
    isLoading,
    isSuccess,
    dataUpdatedAt,
  } = useManagerDetails();
  const { managerTeam, pickMyTeam } = managerDetails || {};
  const { starting, bench } = managerTeam || {
    starting: { goalkeeper: [], forwards: [], midfielders: [], defenders: [] },
    bench: [],
  };

  const d = dayjs.utc(managerDetails?.deadline).tz("Asia/Kolkata");
  const formatted = d.format("ddd D MMM, HH:mm"); // e.g., "Sat 1 Nov, 19:00"

  const [showOverlay, setShowOverlay] = useState(false);
  const [showSaveOverlay, setShowSaveOverlay] = useState(false);
  const [openToast, setOpenToast] = useState(false);
  const [toastMessage, setToastMessage] = useState({});

  const [editedStarting, setEditedStarting] =
    useState<TeamDetails["starting"]>(starting);
  const [editedBench, setEditedBench] = useState<TeamDetails["bench"]>(bench);
  const [roleError, setRoleError] = useState("");
  const [teamError, setTeamError] = useState("");

  const setIsSubstitution = useManageTeamStore((state) => state.setIsSubstitution);
  const isSubstitution = useManageTeamStore((state) => state.isSubstitution);
  const substitutions = useManageTeamStore((state) => state.substitutions);
  const setSubstitutions = useManageTeamStore((state) => state.setSubstitutions);
  const resetSubstitutions = useManageTeamStore((state) => state.resetSubstitutions);
  const roles = useManageTeamStore((state) => state.roles);
  const setRoles = useManageTeamStore((state) => state.setRoles);

  const mutation = useSubstitution();

  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess) {
      setEditedBench(bench);
      setEditedStarting(starting);
    }
  }, [dataUpdatedAt]);

  const handlePlayerOverlay = (eachPlayer: Player | null) => {
    eachPlayer && setPlayer(eachPlayer);
    setShowOverlay(!showOverlay);
    !showOverlay && setRoleError("");
  };

  const handleExecuteSwap = (eachPlayer: Player) => {
    const updatedTeam =
      player &&
      executeSwap(
        { starting: editedStarting, bench: editedBench },
        eachPlayer?.name,
        player?.name
      ); // Swap Biereth with Nico Williams
    updatedTeam?.bench && setEditedBench(updatedTeam.bench);
    updatedTeam?.starting && setEditedStarting(updatedTeam.starting);
    updatedTeam?.swappedIn &&
      updatedTeam?.swappedOut &&
      setSubstitutions({
        swapIn: updatedTeam?.swappedIn,
        swapOut: updatedTeam?.swappedOut,
      });
    setIsSubstitution(false);
    setPlayer({});
  };

  const handlePlayerSwap = (
    playerName: Player["name"],
    location: "starting" | "bench",
    isCaptain: Player["isCaptain"],
    isViceCaptain: Player["isViceCaptain"]
  ) => {
    if (isCaptain || isViceCaptain) {
      setRoleError("Change Captain/Vice before subsitution");
    } else {
      if (playerName) {
        handlePlayerOverlay(null);
        setIsSubstitution(true);
        const result = playerSwap(
          { bench: editedBench, starting: editedStarting },
          playerName,
          location
        ); // Mika Biereth
        result?.bench && setEditedBench(result.bench);
        result?.starting && setEditedStarting(result.starting);
      }
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
    setPlayer({});
  };

  const handleSaveOverlay = () => {
    const forwards = editedStarting.forwards.filter(
      (val) => val?.isCaptain || val?.isViceCaptain
    );
    const midfielders = editedStarting.midfielders.filter(
      (val) => val?.isCaptain || val?.isViceCaptain
    );
    const defenders = editedStarting.defenders.filter(
      (val) => val?.isCaptain || val?.isViceCaptain
    );
    const goalkeeper = editedStarting.goalkeeper.filter(
      (val) => val?.isCaptain || val?.isViceCaptain
    );

    const role = [...forwards, ...midfielders, ...defenders, ...goalkeeper];
    if (role?.length !== 2) {
      const missingRole = role[0]?.isCaptain ? "Vice Captain" : "Captain";
      setTeamError(
        `You need to select a ${missingRole} from Starting XI to submit your team`
      );
    } else {
      setTeamError("");
    }
    setShowSaveOverlay(true);
  };

  const handleSave = () => {
    mutation.mutate(
      { substitution: substitutions, roles },
      {
        onSuccess: (data) => {
          setOpenToast(true);
          setToastMessage({ message: data?.message, type: "SUCCESS" });
        },
        onError: (data) => {
          setOpenToast(true);
          setToastMessage({
            message: data?.data?.data?.message,
            type: "ERROR",
          });
        },
      }
    );
    setPlayer({});
    resetSubstitutions();
    setIsSubstitution(false);
    setTeamError("");
    setRoles({});
    setShowSaveOverlay(false);
  };

  const handleRoles = (updatedRole: Roles) => {
    let roleUpdate;
    if (updatedRole && updatedRole?.captain) {
      roleUpdate = setCaptain(
        { starting: editedStarting, bench: editedBench },
        updatedRole?.captain
      );
    }
    if (updatedRole && updatedRole?.vice) {
      roleUpdate = setViceCaptain(
        { starting: editedStarting, bench: editedBench },
        updatedRole?.vice
      );
    }
    const { starting, bench } = roleUpdate;
    setEditedStarting(starting);
    setEditedBench(bench);
    setRoles({ ...roles, ...updatedRole });
  };

  const handleGoBack = () => {
    navigate({
      to: "/manager",
      viewTransition: ViewTransitions.back,
    });
  };

  // Execute the swap
  //const updatedTeam = executeSwap(teamData, 10, 11); // Swap Biereth with Nico Williams

  return (
    <div className="flex flex-col lg:h-screen lg:overflow-hidden lg:pb-0">

      {user?.teamName && <Header teamName={user?.teamName} onBack={handleGoBack} />}
      {pickMyTeam ? (
        <div className="flex items-center justify-center px-4 pt-4 pb-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary">
          <h6 className="text-center text-base">
            Gameweek {managerDetails?.gw}
          </h6>
          <span aria-hidden="true">&nbsp;•&nbsp;</span>
          <h6 className="text-center text-base font-semibold">
            Deadline: {formatted}
          </h6>
        </div>
      ) : (
        <div className="flex items-center justify-center px-4 pt-4 pb-3 bg-light-surface dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary">
          <h6 className="text-center text-base font-semibold">Not Enabled</h6>
        </div>
      )}

      <div className="flex justify-center items-center">
        <div className="flex bg-light-surface dark:bg-dark-surface rounded-lg p-2 justify-center items-center text-center m-2">
          <span className="text-xs">
            To change your captain use the menu which appears when clicking on a
            player
          </span>
        </div>
        <Button
          disabled={
            substitutions?.length === 0 && Object.keys(roles)?.length === 0
          }
          onClick={handleSaveOverlay}
          width="w-1/2"
          label="Save"
        />
      </div>
      <GWPitch
        starting={editedStarting}
        bench={editedBench}
        onClick={!isSubstitution ? handlePlayerOverlay : handleExecuteSwap}
        pickMyTeam={true}
        reset={handleSubReset}
      />
      <Overlay
        isOpen={showOverlay}
        onClose={() => handlePlayerOverlay(null)}
        children={
          player && (
            <PlayerStatsCard
              showDetails={true}
              showStats={false}
              pickMyTeam={pickMyTeam}
              handleSub={(
                playerName: string,
                location: "starting" | "bench",
                isCaptain: boolean,
                isViceCaptain: boolean
              ) =>
                handlePlayerSwap(playerName, location, isCaptain, isViceCaptain)
              }
              changeRole={handleRoles}
              error={roleError}
            />
          )
        }
      />
      <Overlay
        isOpen={showSaveOverlay}
        onClose={() => setShowSaveOverlay(false)}
        children={
          <>
            <div className={`relative px-6 pt-6 pb-4`}>
              <div className="flex items-start gap-4 mt-8">
                {/* Player Details */}
                <div className="flex-1 pt-4">
                  <h2 className="text-2xl text-center font-bold mb-1">
                    Changes
                  </h2>
                </div>
                {/* <div className="flex-1 pt-4">
                <h2 className="text-right text-5xl font-bold mb-1">
                  hii
                  <span className="text-sm text-right">Pts</span>
                </h2>
                <h2 className="text-right text-3xl font-bold mb-2">
                 hii
                  <span className="text-sm text-right">
                    Pts/Match
                  </span>
                </h2>
                <h1 className="text-right text-xl">hii</h1>
              </div> */}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto items-center justify-center min-h-[200px]">
              {teamError && (
                <h1 className="text-light-accent text-center text-lg animate-pulse">
                  {teamError}
                </h1>
              )}
              {!teamError && (
                <>
                  {Object.keys(roles).length > 0 &&
                    (<div className="px-6 py-4">
                      <h3 className="text-lg font-bold mb-4">Roles</h3>
                      <div className="space-y-3">
                        {roles?.captain && (
                          <StatRow label="Captain" value={roles?.captain} />
                        )}
                        {roles?.vice && (
                          <StatRow label="Vice Captain" value={roles?.vice} />
                        )}
                      </div>
                    </div>)}
                  {substitutions && substitutions?.length > 0 && (
                    <div className="px-6 py-4">
                      <h3 className="text-lg font-bold mb-4">Subs</h3>
                      <div className="space-y-3">
                        {substitutions?.map((sub) => (
                          <>
                            <StatRow
                              label="Subbed In"
                              value={sub?.swapIn?.name}
                            />
                            <StatRow
                              label="Subbed Out"
                              value={sub?.swapOut?.name}
                            />
                          </>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
            {!teamError && (
              <div className="flex items-center justify-center py-4">
                <Button
                  type="Primary"
                  width="w-1/2"
                  label="Confirm"
                  onClick={handleSave}
                />
              </div>
            )}
          </>
        }
      />

      {openToast && toastMessage && toastMessage && (
        <Toast
          open={openToast}
          message={toastMessage}
          onClose={() => {
            setOpenToast(false);
            setToastMessage("");
          }}
        />
      )}
    </div>
  );
};

export default PickTeamPage;
