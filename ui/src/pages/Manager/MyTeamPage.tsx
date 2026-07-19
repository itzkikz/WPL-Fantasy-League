import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Trash2, Save, LayoutGrid, List, X, ChevronRight } from "lucide-react";
import Toast from "../../components/common/Toast";
import { Player } from "../../features/players/types";
import { Formation } from "../../features/standings/types";
import { useManageTeamStore } from "../../store/useManageTeamStore";
import {
  useManagerDetails,
  useSubstitution
} from "../../features/manager/hooks";
import {
  playerSwap,
  executeSwap,
  clearSwapHighlights,
  setCaptain,
  setViceCaptain
} from "../../libs/helpers/pickMyTeam";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useHomePage } from "../../features/home/hooks";

// Page subcomponents
import MyTeamHeader from "./components/MyTeamHeader";
import MyTeamPitch from "./components/MyTeamPitch";
import { getPlayerDisplayPrice } from "../../libs/helpers/player";
import MyTeamListView from "./components/MyTeamListView";
import PlayerStatsModal from "../Standings/components/PlayerStatsModal";

// Local CSS styles
import "./MyTeamPage.css";

dayjs.extend(utc);
dayjs.extend(timezone);

const MyTeamPage = () => {
  // React query hooks
  const { data: managerDetails, isLoading, isSuccess, isError, dataUpdatedAt } = useManagerDetails();
  const { data: homePageData, isLoading: isHomeLoading } = useHomePage();
  const mutation = useSubstitution();
  const navigate = useNavigate();
  const search = useSearch({ from: "/my-team" });

  // Zustand store hooks
  const setIsSubstitution = useManageTeamStore((state) => state.setIsSubstitution);
  const substitutions = useManageTeamStore((state) => state.substitutions);
  const setSubstitutions = useManageTeamStore((state) => state.setSubstitutions);
  const resetSubstitutions = useManageTeamStore((state) => state.resetSubstitutions);
  const roles = useManageTeamStore((state) => state.roles);
  const setRoles = useManageTeamStore((state) => state.setRoles);

  // Local state for interactive screen updates
  const [selectedGW, setSelectedGW] = useState(15);
  const [headerTab, setHeaderTab] = useState<"current" | "history">(search.tab === "history" ? "history" : "current");
  const [activeTab, setActiveTab] = useState<"pitch" | "list">("pitch");

  useEffect(() => {
    if (search.tab) {
      setHeaderTab(search.tab);
    }
  }, [search.tab]);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: "SUCCESS" | "ERROR" }>({ message: "", type: "SUCCESS" });

  const [startingXI, setStartingXI] = useState<Formation>({ GK: [], DEF: [], MID: [], FWD: [] });
  const [bench, setBench] = useState<Player[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [actionOverlayOpen, setActionOverlayOpen] = useState(false);
  const [substituteMode, setSubstituteMode] = useState(false);
  const [swapSourcePlayer, setSwapSourcePlayer] = useState<Player | null>(null);

  // Synchronize state with query details
  useEffect(() => {
    if (isSuccess && managerDetails?.managerTeam) {
      setStartingXI(managerDetails.managerTeam.starting);
      setBench(managerDetails.managerTeam.bench);
      setSelectedGW(managerDetails.gw || 15);
    }
  }, [dataUpdatedAt, isSuccess]);

  const triggerHaptic = () => {
    try { navigator.vibrate(10); } catch {}
  };

  const showToast = (message: string, type: "SUCCESS" | "ERROR") => {
    setToastMessage({ message, type });
    setToastOpen(true);
  };

  const handlePlayerClick = (player: Player) => {
    const isStarter = Object.values(startingXI).flat().some(p => p.id === player.id);
    const location = isStarter ? "starting" : "bench";

    if (substituteMode && swapSourcePlayer) {
      // Execute the swap helper
      const result = executeSwap(
        { starting: startingXI, bench },
        swapSourcePlayer.name,
        player.name
      );

      if (result && !("error" in result)) {
        // Clear all highlights
        const clearResult = clearSwapHighlights({ starting: result.starting, bench: result.bench });
        setStartingXI(clearResult.starting);
        setBench(clearResult.bench);

        // Update the Zustand store substitutions
        setSubstitutions({
          swapIn: result.swappedIn,
          swapOut: result.swappedOut,
        });

        // Set store substitution mode false
        setIsSubstitution(false);
        setSubstituteMode(false);
        setSwapSourcePlayer(null);
        triggerHaptic();
        showToast(`Substituted: ${result.swappedIn.name} In, ${result.swappedOut.name} Out.`, "SUCCESS");
      } else {
        // Swap failed or cancelled
        setSubstituteMode(false);
        setSwapSourcePlayer(null);
        setIsSubstitution(false);

        // Reset highlights
        const clearResult = clearSwapHighlights({ starting: startingXI, bench });
        setStartingXI(clearResult.starting);
        setBench(clearResult.bench);

        const errorMsg = result && "error" in result ? result.error : "Substitution failed.";
        showToast(errorMsg, "ERROR");
      }
    } else {
      // Direct click: open stats overlay modal
      setSelectedPlayer(player);
      setActionOverlayOpen(true);
    }
  };

  const handleMakeCaptain = (player: Player) => {
    const result = setCaptain({ starting: startingXI, bench }, player.id);
    if (result && !("error" in result)) {
      setStartingXI(result.starting);
      setBench(result.bench);
      setRoles({ ...roles, captain: player.id });
      triggerHaptic();
      showToast(`${player.name} is now your Captain.`, "SUCCESS");
    } else {
      showToast("Failed to set Captain.", "ERROR");
    }
    setActionOverlayOpen(false);
    setSelectedPlayer(null);
  };

  const handleMakeViceCaptain = (player: Player) => {
    const result = setViceCaptain({ starting: startingXI, bench }, player.id);
    if (result && !("error" in result)) {
      setStartingXI(result.starting);
      setBench(result.bench);
      setRoles({ ...roles, vice: player.id });
      triggerHaptic();
      showToast(`${player.name} is now your Vice Captain.`, "SUCCESS");
    } else {
      showToast("Failed to set Vice Captain.", "ERROR");
    }
    setActionOverlayOpen(false);
    setSelectedPlayer(null);
  };

  const handleSubstituteInitiate = (player: Player) => {
    const isStarter = Object.values(startingXI).flat().some(p => p.id === player.id);
    const location = isStarter ? "starting" : "bench";

    // Call WPL helper to highlight targets
    const result = playerSwap(
      { starting: startingXI, bench },
      player.name,
      location
    );

    if (result && !("error" in result)) {
      setStartingXI(result.starting);
      setBench(result.bench);
      setSwapSourcePlayer(player);
      setSubstituteMode(true);
      setIsSubstitution(true);
      showToast(`Substitution mode: Select a player to swap with ${player.name}.`, "SUCCESS");
    } else {
      showToast("Cannot substitute this player.", "ERROR");
    }
    setActionOverlayOpen(false);
    setSelectedPlayer(null);
  };

  const handleSaveTeam = () => {
    // Validate captain/vice captain requirements
    const allStarting = [...(startingXI.GK || []), ...(startingXI.DEF || []), ...(startingXI.MID || []), ...(startingXI.FWD || [])];
    const captain = allStarting.find(p => p.isCaptain);
    const vice = allStarting.find(p => p.isViceCaptain);

    if (roles?.captain || roles?.vice) {
      if (!captain || !vice) {
        const missing = !captain ? "Captain" : "Vice Captain";
        showToast(`You need to select a ${missing} from Starting XI to save team.`, "ERROR");
        return;
      }
    }

    mutation.mutate(
      { substitution: substitutions, roles },
      {
        onSuccess: (data) => {
          showToast(data?.message || "Team squad saved successfully!", "SUCCESS");
          resetSubstitutions();
          setIsSubstitution(false);
          setRoles({});
        },
        onError: (err: any) => {
          const errMsg = err?.response?.data?.message || err?.data?.data?.message || "Failed to save team updates.";
          showToast(errMsg, "ERROR");
        },
      }
    );
  };

  const handleClearTeam = () => {
    resetSubstitutions();
    setRoles({});
    setIsSubstitution(false);
    setSubstituteMode(false);
    setSwapSourcePlayer(null);
    if (managerDetails?.managerTeam) {
      const clearResult = clearSwapHighlights({
        starting: managerDetails.managerTeam.starting,
        bench: managerDetails.managerTeam.bench
      });
      setStartingXI(clearResult.starting);
      setBench(clearResult.bench);
    }
    showToast("Changes reverted to saved team lineup.", "SUCCESS");
  };

  const handleCancelSubstitute = () => {
    setSubstituteMode(false);
    setSwapSourcePlayer(null);
    setIsSubstitution(false);
    const clearResult = clearSwapHighlights({ starting: startingXI, bench });
    setStartingXI(clearResult.starting);
    setBench(clearResult.bench);
    showToast("Substitution cancelled.", "ERROR");
  };

  const getPlayerCardClass = (player: Player) => {
    if (!substituteMode) return "hover:scale-105 transition-all duration-300";
    if (swapSourcePlayer?.id === player.id) {
      return "ring-2 ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105 transition-all duration-300";
    }
    if ((player as any).isAvlSub) {
      return "ring-2 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105 animate-pulse transition-all duration-300 cursor-pointer";
    }
    return "opacity-30 scale-95 grayscale transition-all duration-300 pointer-events-none";
  };

  const getPlayerPrice = (player: Player) => {
    return getPlayerDisplayPrice(player);
  };



  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background text-white select-none">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-bold text-secondary">Loading your squad details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background text-rose-400 p-6 text-center select-none">
        <svg className="w-10 h-10 text-rose-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm font-extrabold mb-3">Failed to load squad details.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-primary/30"
        >
          Retry
        </button>
      </div>
    );
  }


  const deadlineFormatted = managerDetails?.deadline
    ? dayjs(managerDetails.deadline).format("ddd, D MMM YYYY, h:mm A")
    : "No deadline";

  const totalPointsFormatted = (managerDetails?.total ?? 0).toLocaleString();
  const hasUnsavedChanges = substitutions?.length > 0 || Object.keys(roles || {}).length > 0;

  return (
    <div className="flex flex-col w-full flex-1 h-full min-h-0 bg-background text-white font-outfit select-none overflow-hidden">

      {/* 1. Header Card Panel */}
      <MyTeamHeader
        selectedGW={selectedGW}
        deadlineFormatted={deadlineFormatted}
        total_budget={managerDetails?.total_budget}
        balance={managerDetails?.balance}
        totalGWScore={managerDetails?.totalGWScore}
        totalPointsFormatted={totalPointsFormatted}
        pickMyTeam={managerDetails?.pickMyTeam}
        headerTab={headerTab}
        setHeaderTab={(tab) => {
          setHeaderTab(tab);
          navigate({ to: "/my-team", search: { tab }, replace: true });
        }}
      />



      {headerTab === "current" ? (
        <>
          {/* 2. Navigation Tabs & Actions Toolbar */}
          <div className="mx-4 mt-4 flex items-center justify-between border-b border-[var(--color-border-divider)] shrink-0 pb-1.5">
            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => { triggerHaptic(); setActiveTab("pitch"); }}
                className={`pb-1 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer flex items-center gap-1.5 min-h-[36px] px-2.5
                  ${activeTab === "pitch" ? "text-secondary" : "text-text-muted/60 hover:text-white"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Pitch
                {activeTab === "pitch" && (
                  <div className="absolute bottom-[-7px] left-0 right-0 h-0.5 bg-secondary" />
                )}
              </button>
              <button
                onClick={() => { triggerHaptic(); setActiveTab("list"); }}
                className={`pb-1 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer flex items-center gap-1.5 min-h-[36px] px-2.5
                  ${activeTab === "list" ? "text-secondary" : "text-text-muted/60 hover:text-white"}`}
              >
                <List className="w-3.5 h-3.5" />
                List
                {activeTab === "list" && (
                  <div className="absolute bottom-[-7px] left-0 right-0 h-0.5 bg-secondary" />
                )}
              </button>
            </div>

            {/* Action Buttons */}
            {managerDetails?.pickMyTeam && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClearTeam}
                  disabled={!hasUnsavedChanges}
                  className="px-2.5 py-1 border border-primary/45 text-secondary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed font-bold rounded-lg min-h-[28px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer text-[10px] md:text-xs"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
                <button
                  onClick={handleSaveTeam}
                  disabled={!hasUnsavedChanges || mutation.isPending}
                  className="px-2.5 py-1 bg-gradient-button disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-fab min-h-[28px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer border-t border-white/20 text-[10px] md:text-xs"
                >
                  <Save className="w-3 h-3" />
                  {mutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {/* 4. Pitch or List Content */}
          <div className="mx-4 mt-3 flex flex-1 flex-col min-h-0">
            {activeTab === "pitch" ? (
              <MyTeamPitch
                startingXI={startingXI}
                bench={bench}
                substituteMode={substituteMode}
                swapSourcePlayer={swapSourcePlayer}
                onCancelSubstitute={handleCancelSubstitute}
                handlePlayerClick={handlePlayerClick}
                getPlayerCardClass={getPlayerCardClass}
                getPlayerPrice={getPlayerPrice}
              />
            ) : (
              <MyTeamListView
                startingXI={startingXI}
                bench={bench}
                getPlayerPrice={getPlayerPrice}
                handlePlayerClick={handlePlayerClick}
              />
            )}
          </div>
        </>
      ) : (
        /* Gameweek History View */
        <div className="mx-4 mt-4 bg-surface border border-border rounded-2xl p-4 shadow-card flex-1 min-h-0 flex flex-col animate-in fade-in duration-300 w-full max-w-3xl mx-auto">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-muted/70 mb-3 px-1">Gameweek History</h2>
          {isHomeLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs text-text-muted">Loading history...</span>
            </div>
          ) : !homePageData?.recentGameweeks || homePageData.recentGameweeks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-xs text-text-muted">No history data available.</span>
            </div>
          ) : (
            <div className="overflow-y-auto overflow-x-auto flex-1 pr-1">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-text-muted uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-2.5 px-3">Gameweek</th>
                    <th className="py-2.5 px-3 text-center">Score</th>
                    <th className="py-2.5 px-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 font-semibold text-white">
                  {[...homePageData.recentGameweeks].sort((a, b) => b.gameweek - a.gameweek).map((item) => (
                    <tr
                      key={item.gameweek}
                      className="hover:bg-white/5 transition-all cursor-pointer group"
                      onClick={() => navigate({ to: "/gameweek-breakdown", search: { gw: item.gameweek } })}
                    >
                      <td className="py-3 px-3 font-bold">Gameweek {item.gameweek}</td>
                      <td className="py-3 px-3 text-center text-[var(--color-success-bright)] font-mono font-extrabold">
                        {item.points} pts
                      </td>
                      <td className="py-3 px-3 text-right pr-4">
                        <ChevronRight className="w-4 h-4 inline-block text-secondary" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {substituteMode && swapSourcePlayer && (
        <div className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-[var(--color-border-divider)] bg-background/90 backdrop-blur-md shadow-[0_-8px_20px_rgba(0,0,0,0.4)] transition-all animate-in slide-in-from-bottom duration-300">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-300 min-w-0 line-clamp-1">
              Tap a highlighted player to swap with <span className="underline font-extrabold">{swapSourcePlayer.name}</span>
            </span>
            <button
              onClick={handleCancelSubstitute}
              className="ml-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 cursor-pointer active:scale-95 transition-all"
              aria-label="Cancel substitution"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Player Selection Actions Overlay Modal */}
      <PlayerStatsModal
        isOpen={actionOverlayOpen}
        onClose={() => {
          setActionOverlayOpen(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
        playerStats={selectedPlayer?.playerStats}
        onMakeCaptain={handleMakeCaptain}
        onMakeViceCaptain={handleMakeViceCaptain}
        onSubstitute={handleSubstituteInitiate}
        pickMyTeam={managerDetails?.pickMyTeam}
      />

      {/* Toast Notification */}
      {toastOpen && (
        <Toast
          open={toastOpen}
          message={toastMessage}
          onClose={() => setToastOpen(false)}
        />
      )}
    </div>
  );
};

export default MyTeamPage;
