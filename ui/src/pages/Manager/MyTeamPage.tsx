import { useState, useEffect } from "react";
import { Trash2, Save } from "lucide-react";
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
  const mutation = useSubstitution();

  // Zustand store hooks
  const setIsSubstitution = useManageTeamStore((state) => state.setIsSubstitution);
  const substitutions = useManageTeamStore((state) => state.substitutions);
  const setSubstitutions = useManageTeamStore((state) => state.setSubstitutions);
  const resetSubstitutions = useManageTeamStore((state) => state.resetSubstitutions);
  const roles = useManageTeamStore((state) => state.roles);
  const setRoles = useManageTeamStore((state) => state.setRoles);

  // Local state for interactive screen updates
  const [selectedGW, setSelectedGW] = useState(15);
  const [activeTab, setActiveTab] = useState<"pitch" | "list">("pitch");
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
      // Direct click: highlight valid swap targets or open menu
      if (managerDetails?.pickMyTeam) {
        setSelectedPlayer(player);
        setActionOverlayOpen(true);
      } else {
        showToast(`Player: ${player.name} (${player.position}) - Points: ${player.point}`, "SUCCESS");
      }
    }
  };

  const handleMakeCaptain = (player: Player) => {
    const result = setCaptain({ starting: startingXI, bench }, player.id);
    if (result && !("error" in result)) {
      setStartingXI(result.starting);
      setBench(result.bench);
      setRoles({ ...roles, captain: player.id });
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

  const getPlayerLeftOffset = (position: string, index: number, total: number) => {
    if (total === 1) return "50%";
    
    if (position === "DEF") {
      if (total === 2) return index === 0 ? "33%" : "67%";
      if (total === 3) return index === 0 ? "20%" : index === 1 ? "50%" : "80%";
      if (total === 4) {
        const positions = ["15%", "38%", "62%", "85%"];
        return positions[index];
      }
      if (total === 5) return index === 0 ? "10%" : index === 1 ? "30%" : index === 2 ? "50%" : index === 3 ? "70%" : "90%";
    }

    if (position === "MID") {
      if (total === 2) return index === 0 ? "33%" : "67%";
      if (total === 3) return index === 0 ? "20%" : index === 1 ? "50%" : "80%";
      if (total === 4) {
        const positions = ["18%", "39%", "61%", "82%"];
        return positions[index];
      }
      if (total === 5) return index === 0 ? "10%" : index === 1 ? "30%" : index === 2 ? "50%" : index === 3 ? "70%" : "90%";
    }

    if (position === "FWD") {
      if (total === 2) return index === 0 ? "35%" : "65%";
      if (total === 3) return index === 0 ? "20%" : index === 1 ? "50%" : "80%";
    }

    // Fallbacks
    if (total === 2) return index === 0 ? "30%" : "70%";
    if (total === 3) return index === 0 ? "20%" : index === 1 ? "50%" : "80%";
    return "50%";
  };

  const getPlayerTopOffset = (position: string) => {
    const topMap: Record<string, string> = {
      GK: "7%",
      DEF: "28%",
      MID: "52%",
      FWD: "76%",
    };
    return topMap[position] || "50%";
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
    <div className="flex flex-col flex-1 min-h-0 h-screen bg-background text-white font-outfit select-none pb-4 lg:pb-0">
      
      {/* 1. Header Card Panel */}
      <MyTeamHeader
        selectedGW={selectedGW}
        deadlineFormatted={deadlineFormatted}
        total_budget={managerDetails?.total_budget}
        balance={managerDetails?.balance}
        totalGWScore={managerDetails?.totalGWScore}
        totalPointsFormatted={totalPointsFormatted}
      />
 
      {/* 3. Navigation Tabs */}
      <div className="mx-4 mt-3.5 flex border-b border-[var(--color-border-divider)] shrink-0">
        <button
          onClick={() => setActiveTab("pitch")}
          className={`flex-1 pb-2 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative cursor-pointer
            ${activeTab === "pitch" ? "text-secondary" : "text-text-muted/60 hover:text-white"}`}
        >
          Pitch View
          {activeTab === "pitch" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex-1 pb-2 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative cursor-pointer
            ${activeTab === "list" ? "text-secondary" : "text-text-muted/60 hover:text-white"}`}
        >
          List View
          {activeTab === "list" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent" />
          )}
        </button>
      </div>
 
      {/* 4. Tab Views Container */}
      <div className="mx-4 mt-3 flex-1 scrollbar-hide pb-3 space-y-4">
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
            getPlayerLeftOffset={getPlayerLeftOffset}
            getPlayerTopOffset={getPlayerTopOffset}
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
 
      {/* 5. Clear & Save Action Buttons */}
      <div className="mx-auto mt-3.5 mb-3 flex items-center justify-center gap-3 max-w-md w-full px-4 shrink-0">
        <button
          onClick={handleClearTeam}
          disabled={!hasUnsavedChanges}
          className="flex-1 border border-primary/45 text-secondary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed font-bold rounded-xl py-2.5 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer text-xs md:text-sm"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Changes
        </button>
        <button
          onClick={handleSaveTeam}
          disabled={!hasUnsavedChanges || mutation.isPending}
          className="flex-1 bg-gradient-button disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-2.5 shadow-fab flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer border-t border-white/20 text-xs md:text-sm"
        >
          <Save className="w-3.5 h-3.5" />
          {mutation.isPending ? "Saving..." : "Save Team"}
        </button>
      </div>

      {/* Player Selection Actions Overlay Modal */}
      <PlayerStatsModal
        isOpen={actionOverlayOpen}
        onClose={() => {
          setActionOverlayOpen(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
        onMakeCaptain={handleMakeCaptain}
        onMakeViceCaptain={handleMakeViceCaptain}
        onSubstitute={handleSubstituteInitiate}
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
