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
    isError,
    dataUpdatedAt,
  } = useManagerDetails();
  const { managerTeam, pickMyTeam } = managerDetails || {};
  const { starting, bench } = managerTeam || {
    starting: { GK: [], FWD: [], MID: [], DEF: [] },
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
      setRoleError("Change Captain/Vice before substitution");
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
    const FWD = editedStarting.FWD?.filter(
      (val) => val?.isCaptain || val?.isViceCaptain
    ) || [];
    const MID = editedStarting.MID?.filter(
      (val) => val?.isCaptain || val?.isViceCaptain
    ) || [];
    const DEF = editedStarting.DEF?.filter(
      (val) => val?.isCaptain || val?.isViceCaptain
    ) || [];
    const GK = editedStarting.GK?.filter(
      (val) => val?.isCaptain || val?.isViceCaptain
    ) || [];

    const role = [...FWD, ...MID, ...DEF, ...GK];
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
      to: "/my-team",
      viewTransition: ViewTransitions.back,
    });
  };

  // Execute the swap
  //const updatedTeam = executeSwap(teamData, 10, 11); // Swap Biereth with Nico Williams

  return (
    <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg animate-in fade-in duration-500 pb-20">

      {user?.teamName && (
        <div className="px-4 pt-4">
          <Header teamName={user?.teamName} onBack={handleGoBack} />
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-20 flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="flex flex-col items-center justify-center py-12 px-6 bg-white dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm animate-in fade-in zoom-in-95 duration-500 max-w-sm w-full">
            <span className="text-6xl mb-4 drop-shadow-md">🤷‍♂️</span>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight text-center">No Team Found</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center font-medium">
              You are currently not managing any Fantasy Team. Once an admin assigns you to a team, you can pick your squad here!
            </p>
            <button
              onClick={handleGoBack}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      {!isError && !isLoading && (
        <>
          {/* Gameweek Deadline Bar */}
          <div className="px-4 mt-4">
            {pickMyTeam ? (
              <div className="flex items-center justify-between px-5 py-3.5 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl border border-indigo-500/20 backdrop-blur-sm shadow-sm">
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Gameweek {managerDetails?.gw}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
                    Deadline: {formatted}
                  </span>
                </div>
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 dark:text-indigo-400 text-xl">⏳</span>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center px-5 py-3.5 bg-red-500/10 dark:bg-red-500/20 rounded-2xl border border-red-500/20 backdrop-blur-sm">
                <h6 className="text-center text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  Management Not Enabled
                </h6>
              </div>
            )}
          </div>

          {/* Info & Save Actions */}
          <div className="px-4 mt-4 flex items-center gap-3">
            <div className="flex-1 bg-white dark:bg-white/5 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-white/10 flex items-center">
              <p className="text-[11px] leading-tight text-gray-500 dark:text-gray-400 font-medium">
                Tap a player to change Captain or substitute.
              </p>
            </div>
            <button
              disabled={substitutions?.length === 0 && Object.keys(roles)?.length === 0}
              onClick={handleSaveOverlay}
              className={`flex-none px-6 py-3 rounded-2xl font-bold shadow-md transition-all duration-200 active:scale-95 flex items-center gap-2
            ${substitutions?.length === 0 && Object.keys(roles)?.length === 0
                  ? "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-transparent"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/25"
                }
          `}
            >
              Save
            </button>
          </div>

          {/* Scrollable Pitch Area */}
          <div className="mt-4 px-4 pb-12">
            <GWPitch
              starting={editedStarting}
              bench={editedBench}
              onClick={!isSubstitution ? handlePlayerOverlay : handleExecuteSwap}
              pickMyTeam={true}
              reset={handleSubReset}
            />
          </div>
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
                <div className="flex-none pt-6 pb-4 px-6 border-b border-gray-100 dark:border-white/10">
                  <h2 className="text-2xl text-center font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Confirm Changes
                  </h2>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Review your squad updates for Gameweek {managerDetails?.gw}.
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide min-h-[250px]">
                  {teamError && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-4 text-center animate-in slide-in-from-top-2">
                      <span className="text-red-600 dark:text-red-400 font-medium">
                        {teamError}
                      </span>
                    </div>
                  )}
                  {!teamError && (
                    <div className="space-y-6">
                      {Object.keys(roles).length > 0 &&
                        (() => {
                          const allPlayers = [...(editedStarting.GK || []), ...(editedStarting.DEF || []), ...(editedStarting.MID || []), ...(editedStarting.FWD || []), ...editedBench];
                          const getPlayerName = (id?: number) => allPlayers.find(p => p.id === id)?.webName || allPlayers.find(p => p.id === id)?.name || "Unknown";
                          return (
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Role Changes</h3>
                              <div className="space-y-1">
                                {roles?.captain && (
                                  <StatRow label="New Captain" value={getPlayerName(roles.captain)} border={roles?.vice ? true : false} />
                                )}
                                {roles?.vice && (
                                  <StatRow label="New Vice Captain" value={getPlayerName(roles.vice)} border={false} />
                                )}
                              </div>
                            </div>
                          );
                        })()}

                      {substitutions && substitutions?.length > 0 && (
                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
                          <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Substitutions ({substitutions.length})</h3>
                          <div className="space-y-4">
                            {substitutions?.map((sub, idx) => (
                              <div key={idx} className="flex flex-col gap-2 relative">
                                {idx > 0 && <div className="absolute -top-2 left-0 right-0 border-t border-gray-200 dark:border-white/10" />}
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-red-500 flex items-center gap-1">
                                    <span className="text-lg">↓</span> Out
                                  </span>
                                  <span className="font-bold text-gray-900 dark:text-white">{sub?.swapOut?.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-green-500 flex items-center gap-1">
                                    <span className="text-lg">↑</span> In
                                  </span>
                                  <span className="font-bold text-gray-900 dark:text-white">{sub?.swapIn?.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {Object.keys(roles).length === 0 && (!substitutions || substitutions.length === 0) && (
                        <div className="flex flex-col items-center justify-center py-10 opacity-60">
                          <span className="text-4xl mb-2">🤷‍♂️</span>
                          <p className="text-gray-500 dark:text-gray-400 font-medium">No changes made.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-none p-6 pt-2">
                  <button
                    disabled={!!teamError || (Object.keys(roles).length === 0 && (!substitutions || substitutions.length === 0))}
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-white/10 dark:disabled:to-white/10 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-2xl py-4 shadow-md transition-all duration-200 active:scale-95"
                  >
                    Confirm Updates
                  </button>
                </div>
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
        </>
      )}
    </div>
  );
};

export default PickTeamPage;
