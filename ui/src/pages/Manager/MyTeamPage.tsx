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
import SaveTeamModal from "./components/SaveTeamModal";

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
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [pendingCaptain, setPendingCaptain] = useState<Player | null>(null);
  const [pendingVice, setPendingVice] = useState<Player | null>(null);

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
      const swapResult = executeSwap(
        { starting: startingXI, bench },
        swapSourcePlayer.name,
        player.name
      );
      if (swapResult && !("error" in swapResult)) {
        setStartingXI(swapResult.starting);
        setBench(swapResult.bench);

        // Record the swap in Zustand store
        setSubstitutions({ swapIn: swapResult.swappedIn, swapOut: swapResult.swappedOut });

        showToast(`Substituted ${swapSourcePlayer.name} for ${player.name}`, "SUCCESS");
      } else {
        showToast(swapResult.error || "Invalid substitution", "ERROR");
      }

      setSubstituteMode(false);
      setSwapSourcePlayer(null);
      setIsSubstitution(false);
      return;
    }

    // Normal click: open player options overlay modal
    setSelectedPlayer(player);
    setActionOverlayOpen(true);
  };

  const handleMakeCaptain = (player: Player) => {
    const result = setCaptain({ starting: startingXI, bench }, player.id);
    if (result && !("error" in result)) {
      setStartingXI(result.starting);
      setBench(result.bench);
      setRoles({ ...roles, captain: player.id });
      showToast(`${player.name} set as Captain (C)`, "SUCCESS");
    } else {
      showToast("error" in result ? result.error : "Failed to set captain", "ERROR");
    }
    setActionOverlayOpen(false);
  };

  const handleMakeViceCaptain = (player: Player) => {
    const result = setViceCaptain({ starting: startingXI, bench }, player.id);
    if (result && !("error" in result)) {
      setStartingXI(result.starting);
      setBench(result.bench);
      setRoles({ ...roles, vice: player.id });
      showToast(`${player.name} set as Vice-Captain (VC)`, "SUCCESS");
    } else {
      showToast("error" in result ? result.error : "Failed to set vice-captain", "ERROR");
    }
    setActionOverlayOpen(false);
  };

  const handleSubstituteInitiate = (player: Player) => {
    setActionOverlayOpen(false);
    setSubstituteMode(true);
    setSwapSourcePlayer(player);
    setIsSubstitution(true);

    const isStarter = Object.values(startingXI).flat().some(p => p.id === player.id);
    const highlightResult = playerSwap(
      { starting: startingXI, bench },
      player?.name,
      isStarter ? "starting" : "bench"
    );

    setStartingXI(highlightResult.starting);
    setBench(highlightResult.bench);
    showToast(`Select a highlighted player to substitute with ${player.name}`, "SUCCESS");
  };

  const handleSaveTeam = () => {
    const allStarters = [...(startingXI.GK || []), ...(startingXI.DEF || []), ...(startingXI.MID || []), ...(startingXI.FWD || [])];
    const currentCaptain = allStarters.find(p => p.isCaptain) || null;
    const currentVice = allStarters.find(p => p.isViceCaptain) || null;

    setPendingCaptain(currentCaptain);
    setPendingVice(currentVice);
    setSaveConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    mutation.mutate(
      { substitution: substitutions, roles },
      {
        onSuccess: () => {
          showToast("Lineup saved successfully!", "SUCCESS");
          resetSubstitutions();
          setRoles({});
          setSaveConfirmOpen(false);
        },
        onError: (err: any) => {
          showToast(err?.message || "Failed to save lineup.", "ERROR");
          setSaveConfirmOpen(false);
        }
      }
    );
  };

  const handleClearTeam = () => {
    resetSubstitutions();
    setSubstituteMode(false);
    setSwapSourcePlayer(null);
    setIsSubstitution(false);
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

  const isDeadlinePassed = managerDetails?.deadline
    ? dayjs().isAfter(dayjs(managerDetails.deadline))
    : false;

  const isPickingAllowed = Boolean(managerDetails?.pickMyTeam && !isDeadlinePassed);

  const totalPointsFormatted = (managerDetails?.total ?? 0).toLocaleString();
  const hasUnsavedChanges = substitutions?.length > 0 || Object.keys(roles || {}).length > 0;
  const squadValue = managerDetails?.utlisation !== undefined
    ? managerDetails.utlisation
    : ((managerDetails?.total_budget ?? 100) - (managerDetails?.balance ?? 0));

  // Check if starting XI has both captain and vice-captain
  const allStarting = [...(startingXI.GK || []), ...(startingXI.DEF || []), ...(startingXI.MID || []), ...(startingXI.FWD || [])];
  const hasCaptain = allStarting.some(p => p.isCaptain);
  const hasViceCaptain = allStarting.some(p => p.isViceCaptain);
  const hasValidLeadership = hasCaptain && hasViceCaptain;

  return (
    <div className="flex flex-col w-full flex-1 h-full min-h-0 bg-background text-text-primary font-outfit select-none overflow-hidden pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-0">

      {/* MOBILE HEADER (Visible on mobile screens < lg) */}
      <div className="lg:hidden shrink-0">
        <MyTeamHeader
          selectedGW={selectedGW}
          deadlineFormatted={deadlineFormatted}
          squadValue={squadValue}
          total_budget={managerDetails?.total_budget}
          balance={managerDetails?.balance}
          totalGWScore={managerDetails?.totalGWScore}
          totalPointsFormatted={totalPointsFormatted}
          pickMyTeam={isPickingAllowed}
          logo={managerDetails?.logo}
          headerTab={headerTab}
          setHeaderTab={(tab) => {
            setHeaderTab(tab);
            navigate({ to: "/my-team", search: { tab }, replace: true });
          }}
        />
      </div>

      {/* MAIN CONTAINER: Responsive Split Layout for Webview / Desktop (lg+) */}
      <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 overflow-y-auto lg:overflow-hidden lg:gap-3 lg:p-3">

        {/* LEFT COLUMN PANEL (Webview Squad Details - Visible on lg+) */}
        <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 shrink-0 bg-surface border border-border/80 rounded-3xl p-5 shadow-card overflow-y-auto space-y-5">
          
          {/* Team Name & Manager Info Header */}
          <div className="space-y-3 pb-4 border-b border-border/60">
            <div className="flex items-center gap-3">
              {managerDetails?.logo ? (
                <div className="w-12 h-12 rounded-2xl bg-background/60 border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={managerDetails.logo} alt={`${managerDetails.team} logo`} className="w-11 h-11 object-contain" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xl shadow-inner shrink-0">
                  🛡️
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-black text-text-primary tracking-tight truncate">
                  {managerDetails?.team || "My Squad"}
                </h2>
                <p className="text-xs text-text-muted font-medium truncate">
                  Manager: <span className="text-purple-400 font-semibold">{Array.isArray(managerDetails?.managers) ? managerDetails.managers.join(", ") : managerDetails?.managers || "Team Manager"}</span>
                </p>
              </div>
            </div>

            {/* Gameweek Badge & Deadline */}
            <div className="bg-background/70 border border-border/60 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-text-muted block">Gameweek {selectedGW}</span>
                <span className="text-xs font-semibold text-secondary">{deadlineFormatted}</span>
              </div>
              {/* GW / History Toggle */}
              <div className="flex items-center gap-1 bg-surface border border-border/60 rounded-xl p-1 shrink-0">
                <button
                  onClick={() => { setHeaderTab("current"); navigate({ to: "/my-team", search: { tab: "current" }, replace: true }); }}
                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${headerTab === "current" ? "bg-secondary text-white shadow-sm" : "text-text-muted hover:text-text-primary"}`}
                >
                  GW {selectedGW}
                </button>
                <button
                  onClick={() => { setHeaderTab("history"); navigate({ to: "/my-team", search: { tab: "history" }, replace: true }); }}
                  className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${headerTab === "history" ? "bg-secondary text-white shadow-sm" : "text-text-muted hover:text-text-primary"}`}
                >
                  History
                </button>
              </div>
            </div>
          </div>

          {/* 4-Stat Grid Panel */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-background/50 border border-border/60 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Squad Value</span>
              <span className="text-base font-extrabold text-text-primary mt-0.5 block">£{squadValue.toFixed(1)}m</span>
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Bank Balance</span>
              <span className="text-base font-extrabold text-text-primary mt-0.5 block">£{(managerDetails?.balance ?? 0).toFixed(2)}m</span>
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">GW Score</span>
              <span className="text-base font-extrabold text-[var(--color-success-bright)] mt-0.5 block">{managerDetails?.totalGWScore ?? 0} pts</span>
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total Points</span>
              <span className="text-base font-extrabold text-text-primary mt-0.5 block">{totalPointsFormatted} pts</span>
            </div>
          </div>

          {/* Webview Actions & View Controls */}
          {headerTab === "current" && (
            <div className="space-y-4 pt-3 border-t border-border/60">
              {/* Pitch vs List Toggle */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Layout View</span>
                <div className="flex gap-1.5 bg-background/50 border border-border/60 rounded-xl p-1">
                  <button
                    onClick={() => { triggerHaptic(); setActiveTab("pitch"); }}
                    className={`px-3 py-1 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === "pitch" ? "bg-secondary text-white shadow-sm" : "text-text-muted hover:text-white"}`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Pitch
                  </button>
                  <button
                    onClick={() => { triggerHaptic(); setActiveTab("list"); }}
                    className={`px-3 py-1 text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${activeTab === "list" ? "bg-secondary text-white shadow-sm" : "text-text-muted hover:text-white"}`}
                  >
                    <List className="w-3.5 h-3.5" />
                    List
                  </button>
                </div>
              </div>

              {/* Lineup Clear & Save Actions */}
              {isPickingAllowed ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleClearTeam}
                      disabled={!hasUnsavedChanges}
                      className="flex-1 py-2.5 border border-primary/45 text-secondary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear
                    </button>
                    <button
                      onClick={handleSaveTeam}
                      disabled={!hasUnsavedChanges || mutation.isPending || !hasValidLeadership}
                      className="flex-1 py-2.5 bg-gradient-button disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-fab transition-all cursor-pointer border-t border-white/20"
                    >
                      <Save className="w-4 h-4" />
                      {mutation.isPending ? "Saving..." : "Save Lineup"}
                    </button>
                  </div>
                  {!hasValidLeadership && hasUnsavedChanges && (
                    <p className="text-[11px] text-rose-400 font-bold text-center">
                      ⚠️ Captain (C) & Vice-Captain (VC) required
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-background/60 border border-border/60 rounded-2xl text-center">
                  <p className="text-[11px] text-text-muted font-bold">
                    🔒 Squad changes locked {!managerDetails?.pickMyTeam ? "(Picking disabled)" : "(Deadline passed)"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN PANEL (Team View on Webview / Main View on Mobile) */}
        {/* Mobile: no height clamp so the full pitch scrolls with the page */}
        <div className="flex-1 flex flex-col min-h-0 lg:h-full lg:overflow-hidden">

          {/* Mobile Toolbar (Pitch/List toggle & Save/Clear - visible only on mobile < lg) */}
          {headerTab === "current" && (
            <div className="mx-4 mt-2 flex lg:hidden items-center justify-between border-b border-[var(--color-border-divider)] shrink-0 pb-1.5">
              <div className="flex gap-2">
                <button
                  onClick={() => { triggerHaptic(); setActiveTab("pitch"); }}
                  className={`pb-1 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer flex items-center gap-1.5 min-h-[36px] px-2.5 ${activeTab === "pitch" ? "text-secondary" : "text-text-muted hover:text-text-primary"}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Pitch
                  {activeTab === "pitch" && <div className="absolute bottom-[-7px] left-0 right-0 h-0.5 bg-secondary" />}
                </button>
                <button
                  onClick={() => { triggerHaptic(); setActiveTab("list"); }}
                  className={`pb-1 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer flex items-center gap-1.5 min-h-[36px] px-2.5 ${activeTab === "list" ? "text-secondary" : "text-text-muted hover:text-text-primary"}`}
                >
                  <List className="w-3.5 h-3.5" />
                  List
                  {activeTab === "list" && <div className="absolute bottom-[-7px] left-0 right-0 h-0.5 bg-secondary" />}
                </button>
              </div>

              {isPickingAllowed ? (
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
                    disabled={!hasUnsavedChanges || mutation.isPending || !hasValidLeadership}
                    className="px-2.5 py-1 bg-gradient-button disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-lg shadow-fab min-h-[28px] flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer border-t border-white/20 text-[10px] md:text-xs"
                  >
                    <Save className="w-3 h-3" />
                    {mutation.isPending ? "Saving..." : "Save"}
                  </button>
                  {!hasValidLeadership && hasUnsavedChanges && (
                    <span className="text-[10px] text-rose-400 font-bold ml-1">Requires C + VC</span>
                  )}
                </div>
              ) : (
                <div className="text-[10px] text-text-muted font-bold">
                  🔒 Squad locked
                </div>
              )}
            </div>
          )}

          {/* Interactive Pitch, List, or History View */}
          <div className="flex-1 flex flex-col min-h-0 lg:h-full lg:overflow-hidden mx-4 lg:mx-0 mt-2 lg:mt-0">
            {headerTab === "current" ? (
              activeTab === "pitch" ? (
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
              )
            ) : (
              /* Gameweek History View */
              <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex-1 min-h-0 flex flex-col animate-in fade-in duration-300 w-full max-w-3xl mx-auto">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-text-muted mb-3 px-1">Gameweek History</h2>
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
                      <tbody className="divide-y divide-border/20 font-semibold text-text-primary">
                        {[...homePageData.recentGameweeks].sort((a, b) => b.gameweek - a.gameweek).map((item) => (
                          <tr
                            key={item.gameweek}
                            className="hover:bg-elevated/50 transition-all cursor-pointer group"
                            onClick={() => navigate({ to: "/gameweek-breakdown", search: { gw: item.gameweek } })}
                          >
                            <td className="py-3 px-3 font-bold text-text-primary">Gameweek {item.gameweek}</td>
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
          </div>

        </div>

      </div>

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
        pickMyTeam={isPickingAllowed}
      />

      {/* Save Confirmation Modal */}
      <SaveTeamModal
        isOpen={saveConfirmOpen}
        onClose={() => setSaveConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        substitutions={substitutions}
        captain={pendingCaptain}
        viceCaptain={pendingVice}
        isSaving={mutation.isPending}
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
