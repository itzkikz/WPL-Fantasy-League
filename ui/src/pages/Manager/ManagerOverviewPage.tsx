import { useState } from "react";
import { useNavigate, useSearch, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert, ShieldUser, Swords, LayoutGrid, Calendar, ChevronLeft, ChevronRight, Award } from "lucide-react";
import { useManagerOverview, useStandings, useTeamDetails } from "../../features/standings/hooks";
import { useManagerDetails } from "../../features/manager/hooks";
import PitchPlayerCard from "../../components/PitchPlayerCard";
import PlayerStatsModal from "../Standings/components/PlayerStatsModal";
import { ManagerRankTrendChart } from "./components/ManagerRankTrendChart";
import { SquadPositionBreakdown } from "./components/SquadPositionBreakdown";
import { SquadValueStatsCard } from "./components/SquadValueStatsCard";
import { TeamTransfersCard } from "./components/TeamTransfersCard";
import { TeamComparisonModal } from "./components/TeamComparisonModal";
import { Player } from "../../features/players/types";
import { getPlayerDisplayPrice } from "../../libs/helpers/player";
import "../Manager/MyTeamPage.css";

const getRowJustify = (count: number) => {
  if (count <= 1) return "justify-center";
  return "justify-evenly";
};

const ManagerOverviewPage = () => {
  const navigate = useNavigate();
  const router = useRouter();
  const search = useSearch({ from: "/manager-overview" });
  const teamId = search.teamId;

  // State
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overall" | "gw">("overall");
  const [selectedGw, setSelectedGw] = useState<number>(0);

  // Queries for resolving logged-in user's team ID
  const { data: standings } = useStandings();
  const { data: managerDetails } = useManagerDetails();

  const myStanding = standings?.find(
    (s) => s.team?.trim().toLowerCase() === managerDetails?.team?.trim().toLowerCase()
  );
  const myTeamId = myStanding?.team_id || (managerDetails as any)?.team_id || (managerDetails as any)?.teamId || "";

  // When no teamId is supplied in the URL (e.g. navigating from Settings),
  // fall back to the logged-in user's own team
  const resolvedTeamId = teamId || myTeamId;

  // Target team for comparison:
  // If user is viewing their own team or myTeamId is missing, compare against #1 team (or #2 if user IS #1)
  const topStanding = standings?.[0];
  const secondStanding = standings?.[1];

  let compareAgainstTeamId = myTeamId;
  if (!myTeamId || resolvedTeamId === myTeamId) {
    compareAgainstTeamId = (topStanding?.team_id === resolvedTeamId)
      ? (secondStanding?.team_id || "")
      : (topStanding?.team_id || "");
  }

  // Query overview details for target team & comparison team
  const { data, isLoading, isError } = useManagerOverview(resolvedTeamId);
  const { data: compareOverviewData } = useManagerOverview(compareAgainstTeamId);
  // Per-gameweek squad data for the GW Breakdown tab (disabled until a GW is picked)
  const { data: gwDetails } = useTeamDetails(resolvedTeamId, selectedGw);

  const { teamName, logo, managers, rank, totalPoints, gwPoints, currentSquad, history, transfers } = data || {};

  // Always use overall current squad
  const activeStarting = currentSquad?.starting;
  const activeBench = currentSquad?.bench;

  // Season-wide Statistics Calculations
  const historyList = history || [];
  const gwCount = historyList.length;
  const avgGwScore = gwCount > 0 ? (historyList.reduce((acc: number, h: any) => acc + h.points, 0) / gwCount).toFixed(1) : "0.0";
  const highestGwObj = historyList.reduce(
    (max: any, h: any) => (h.points > max.points ? h : max),
    historyList[0] || { gameweek: 1, points: 0 }
  );

  // Map active starting/bench to ALWAYS display Season Total Points and strip Captain/Vice Captain flags
  const mapSquadForOverall = (squadObj?: { GK?: Player[]; DEF?: Player[]; MID?: Player[]; FWD?: Player[] }) => {
    if (!squadObj) return {};
    const res: any = {};
    for (const pos of ["GK", "DEF", "MID", "FWD"] as const) {
      res[pos] = (squadObj[pos] || []).map((p) => {
        const seasonPts = p.playerStats?.overall?.total_point !== undefined ? Number(p.playerStats.overall.total_point) : Number(p.point) || 0;
        const hasPlayedSeason = seasonPts > 0 || (p as any).app > 0;
        return {
          ...p,
          point: seasonPts,
          isCaptain: false,
          isViceCaptain: false,
          hasPlayed: hasPlayedSeason,
          minutesPlayed: hasPlayedSeason ? 90 : 0,
        };
      });
    }
    return res;
  };

  const displayStarting = mapSquadForOverall(activeStarting);
  const displayBench = (activeBench || []).map((p) => {
    const seasonPts = p.playerStats?.overall?.total_point !== undefined ? Number(p.playerStats.overall.total_point) : Number(p.point) || 0;
    const hasPlayedSeason = seasonPts > 0 || (p as any).app > 0;
    return {
      ...p,
      point: seasonPts,
      isCaptain: false,
      isViceCaptain: false,
      hasPlayed: hasPlayedSeason,
      minutesPlayed: hasPlayedSeason ? 90 : 0,
    };
  });

  // Formation calculation (e.g. 4-3-3)
  const formation = activeStarting
    ? `${activeStarting.DEF?.length || 0}-${activeStarting.MID?.length || 0}-${activeStarting.FWD?.length || 0}`
    : "4-4-2";

  const getPlayerPrice = (p: Player) => {
    return getPlayerDisplayPrice(p);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowOverlay(true);
  };

  const handleGoBack = () => {
    // Go back to where the user came from, falling back to standings
    if (router.history.canGoBack()) {
      router.history.back();
    } else {
      navigate({ to: "/standings" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70dvh] bg-background text-white select-none">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-bold text-secondary">Loading overview...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70dvh] bg-background text-rose-400 p-6 text-center select-none">
        <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />
        <p className="text-sm font-extrabold mb-3">Failed to load manager overview details.</p>
        <button
          onClick={handleGoBack}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-primary/30"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Generate color logo crest from team name
  const getOverviewCrest = (name: string) => {
    const letter = name ? name.trim().charAt(0).toUpperCase() : "M";
    const colors = [
      "from-indigo-600 to-indigo-950",
      "from-purple-600 to-purple-950",
      "from-violet-600 to-violet-950",
      "from-blue-600 to-blue-950",
      "from-fuchsia-600 to-fuchsia-950",
    ];
    const charSum = name ? name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) : 0;
    const bgGradient = colors[charSum % colors.length];
    return { letter, bgGradient };
  };

  const crest = getOverviewCrest(teamName || "");

  // Detailed managers list (split the comma-separated string into individual entries)
  const managersList = (managers || "").split(",").map((m) => m.trim()).filter(Boolean);

  // Gameweek list for the GW Breakdown tab
  const gwList = [...historyList].sort((a: any, b: any) => a.gameweek - b.gameweek);
  const latestGw = gwList.length > 0 ? gwList[gwList.length - 1].gameweek : 1;
  const activeGw = selectedGw || latestGw;
  const minGw = gwList.length > 0 ? gwList[0].gameweek : 1;
  const maxGw = gwList.length > 0 ? gwList[gwList.length - 1].gameweek : 1;

  const openGwTab = () => {
    setActiveTab("gw");
    if (!selectedGw && gwList.length > 0) {
      setSelectedGw(gwList[gwList.length - 1].gameweek);
    }
  };

  // Shared pitch renderer used by both tabs
  const renderPitch = (
    squad: { starting?: any; bench?: any[] },
    subtitle: string
  ) => (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between pl-1">
        <h3 className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5">
          <LayoutGrid className="w-3.5 h-3.5 text-secondary" />
          <span>{subtitle}</span>
        </h3>
      </div>

      <div className="relative w-full rounded-3xl overflow-hidden border border-border shadow-card bg-background min-h-[560px] flex flex-col">
        <div className="pitch-bg">
          <img src="/pitch.png" className="pitch-image-layer" alt="Tactical pitch layout" />
        </div>

        <div className={`absolute top-0 inset-x-0 ${squad.bench && squad.bench.length > 0 ? "bottom-[110px]" : "bottom-0"} z-10 pointer-events-none flex flex-col justify-evenly py-3 md:py-6 px-2 sm:px-4`}>
          {squad.starting && (["GK", "DEF", "MID", "FWD"] as const).map((pos) => {
            const players = squad.starting[pos] || [];
            return (
              <div key={pos} className={`flex w-full ${getRowJustify(players.length)} pointer-events-auto`}>
                {players.map((player: Player) => {
                  const enrichedPlayer = { ...player, price: getPlayerPrice(player) };
                  return (
                    <div key={player.id} className="rounded-xl p-0.5 transition-all hover:scale-105 duration-300">
                      <PitchPlayerCard player={enrichedPlayer} showPriceAndPoints={true} isSmall={false} onClick={() => handlePlayerClick(player)} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {squad.bench && squad.bench.length > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border flex justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
            {squad.bench.map((player: Player, idx: number) => {
              const label = player.position === "GK" ? "GK" : `${player.subNumber || idx + 1}. ${player.position}`;
              const enrichedPlayer = { ...player, price: getPlayerPrice(player) };
              return (
                <div key={player.id} className="flex flex-col items-center relative rounded-xl p-0.5 transition-all hover:scale-105 duration-300 shrink-0 min-w-[76px]">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 select-none">{label}</span>
                  <PitchPlayerCard player={enrichedPlayer} showPriceAndPoints={true} isSmall={false} onClick={() => handlePlayerClick(player)} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col w-full flex-1 h-full min-h-0 bg-background text-text-primary font-outfit select-none overflow-hidden pb-[env(safe-area-inset-bottom)] lg:pb-0">

      {/* MOBILE STICKY FULL-WIDTH HEADER (Visible on mobile < lg) */}
      <div className="lg:hidden shrink-0 border-b border-border bg-surface shadow-sm sticky top-0 z-30 w-full">
        <header className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 w-full">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-background hover:bg-white/5 border border-border text-text-primary active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>

          {logo ? (
            <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden bg-white/5 border border-white/10 shrink-0">
              <img src={logo} alt={`${teamName} logo`} className="w-8 h-8 object-contain" />
            </div>
          ) : (
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${crest.bgGradient} flex items-center justify-center text-xs font-black text-white shadow-md border border-white/10 shrink-0`}>
              {crest.letter}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-text-primary truncate">
                {teamName}
              </h1>
              <span className="text-[8px] font-black text-secondary bg-secondary/15 border border-secondary/30 px-1.5 py-0.2 rounded font-mono shrink-0">
                {formation}
              </span>
            </div>
            <p className="text-[10px] text-text-muted font-medium mt-0.5 truncate flex items-center gap-1">
              <ShieldUser className="w-3 h-3 shrink-0" />
              <span className="truncate">{managers}</span>
            </p>
          </div>

          {resolvedTeamId !== myTeamId && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-1 bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary rounded-lg px-2 py-1 text-[10px] font-bold transition-all active:scale-95 cursor-pointer shrink-0"
              title="Compare with My Team"
            >
              <Swords className="w-3 h-3" />
              <span>Compare</span>
            </button>
          )}
        </header>
      </div>

      {/* DESKTOP HEADER (Visible on lg+) */}
      <div className="hidden lg:flex shrink-0 items-center gap-3 px-6 pt-4 pb-0 max-w-5xl mx-auto w-full">
        <button
          onClick={handleGoBack}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-surface hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer shrink-0 shadow-sm"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-text-primary tracking-tight truncate">
            Manager Overview
          </h1>
          <p className="text-xs text-text-muted font-medium truncate">
            Season-wide performance command center
          </p>
        </div>
        {resolvedTeamId !== myTeamId && (
          <button
            onClick={() => setShowCompareModal(true)}
            className="flex items-center gap-1.5 bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary rounded-xl px-3 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title="Compare with My Team"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>
        )}
      </div>

      {/* SCROLLABLE CONTENT BODY */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-3 sm:px-4 py-3 lg:py-4">
        <div className="max-w-5xl mx-auto w-full space-y-4">

          {/* HERO / PROFILE CARD: large logo + team name + detailed managers */}
          <div className="bg-surface border border-border rounded-3xl p-4 sm:p-6 shadow-card flex flex-row items-center gap-4 sm:gap-6">
            {logo ? (
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-core blur-md opacity-40" />
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-core p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center border border-white/20">
                    <img src={logo} alt={`${teamName} logo`} className="w-[88%] h-[88%] object-contain" />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${crest.bgGradient} flex items-center justify-center text-4xl sm:text-5xl font-black text-white shadow-lg border border-white/10`}>
                {crest.letter}
              </div>
            )}

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
                  {teamName}
                </h1>
                <span className="text-[10px] font-black text-secondary bg-secondary/15 border border-secondary/30 px-2 py-0.5 rounded-md font-mono shrink-0">
                  {formation}
                </span>
              </div>

              <p className="text-[10px] sm:text-[11px] font-bold text-text-muted uppercase tracking-widest mt-2 mb-2">
                Managers
              </p>

              <div className="flex flex-col items-start gap-2">
                {(managersList.length > 0 ? managersList : [managers || "Unknown"]).map((m, idx) => (
                  <div key={`${m}-${idx}`} className="flex items-center gap-2 text-sm font-medium text-text-secondary min-w-0">
                    <span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                      <ShieldUser className="w-3.5 h-3.5" />
                    </span>
                    <span className="truncate">{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TABS: Overall | GW Breakdown */}
          <div className="flex items-center border-b border-border gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab("overall")}
              className={`pb-2.5 pt-1 px-3 sm:px-5 text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all relative cursor-pointer flex items-center gap-2 min-h-[42px] ${activeTab === "overall" ? "text-secondary" : "text-text-muted hover:text-text-primary"}`}
            >
              <LayoutGrid className="w-4 h-4" />
              Overall
              {activeTab === "overall" && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-secondary rounded-t-full" />
              )}
            </button>
            <button
              onClick={openGwTab}
              className={`pb-2.5 pt-1 px-3 sm:px-5 text-xs sm:text-sm font-extrabold tracking-wide uppercase transition-all relative cursor-pointer flex items-center gap-2 min-h-[42px] ${activeTab === "gw" ? "text-secondary" : "text-text-muted hover:text-text-primary"}`}
            >
              <Award className="w-4 h-4" />
              GW Breakdown
              {activeTab === "gw" && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-secondary rounded-t-full" />
              )}
            </button>
          </div>

          {/* ============ OVERALL TAB ============ */}
          {activeTab === "overall" ? (
            <>
              {/* Overall Season Performance Hero Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto w-full">
                <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Overall Rank</span>
                  <span className="text-base font-black text-text-primary mt-0.5 font-mono">#{rank}</span>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Season Total</span>
                  <span className="text-base font-black text-secondary mt-0.5 font-mono">{totalPoints} pts</span>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Season Average</span>
                  <span className="text-xs font-black text-indigo-400 mt-0.5 font-mono">{avgGwScore} pts/GW</span>
                </div>
                <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Best GW Score</span>
                  <span className="text-xs font-black text-emerald-400 mt-0.5 font-mono">
                    {highestGwObj.points} pts <span className="text-[9px] text-text-muted font-normal">(GW{highestGwObj.gameweek})</span>
                  </span>
                </div>
              </div>

              {/* Overall Season Squad Pitch */}
              <div className="max-w-2xl mx-auto w-full">
                {renderPitch({ starting: displayStarting, bench: displayBench }, "Overall Season Squad (Season Total Pts)")}
              </div>

              {/* Squad Position Contribution Breakdown */}
              <div className="max-w-2xl mx-auto w-full">
                <SquadPositionBreakdown starting={activeStarting} isOverallMode={true} />
              </div>

              {/* Performance Trend Chart */}
              <div className="max-w-2xl mx-auto w-full">
                <ManagerRankTrendChart history={history || []} currentGwPoints={gwPoints} totalPoints={totalPoints} />
              </div>

              {/* Transfers */}
              <div className="max-w-2xl mx-auto w-full">
                <TeamTransfersCard transfers={transfers} />
              </div>

              {/* Player Values & Squad Valuation Card */}
              <div className="max-w-2xl mx-auto w-full mb-6">
                <SquadValueStatsCard starting={activeStarting} bench={activeBench} />
              </div>
            </>
          ) : (
            /* ============ GW BREAKDOWN TAB ============ */
            <div className="space-y-4">
              {gwList.length === 0 ? (
                <div className="bg-surface border border-border rounded-2xl p-6 shadow-card text-center">
                  <Calendar className="w-8 h-8 text-text-muted mx-auto mb-2" />
                  <p className="text-sm font-bold text-text-primary">No gameweek history available</p>
                  <p className="text-xs text-text-muted mt-1">Once gameweeks are played, their breakdowns will appear here.</p>
                </div>
              ) : (
                <>
                  {/* Gameweek Selector */}
                  <div className="flex flex-col gap-2 w-full max-w-2xl mx-auto">
                    <div className="flex items-center justify-between pl-1">
                      <h3 className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-secondary" />
                        <span>Select Gameweek</span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-0.5">
                      <button
                        onClick={() => setSelectedGw(Math.max(minGw, activeGw - 1))}
                        disabled={activeGw <= minGw}
                        className="w-8 h-8 rounded-lg bg-background hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                        aria-label="Previous gameweek"
                      >
                        <ChevronLeft className="w-4 h-4 text-text-muted" />
                      </button>

                      {gwList.map((h: any) => {
                        const isActive = activeGw === h.gameweek;
                        return (
                          <button
                            key={h.gameweek}
                            onClick={() => setSelectedGw(h.gameweek)}
                            className={`flex flex-col items-center justify-center min-w-[80px] rounded-xl py-2.5 px-3 border transition-all cursor-pointer shrink-0 ${
                              isActive
                                ? "bg-secondary border-secondary shadow-sm"
                                : "bg-surface hover:bg-elevated border-border/40 hover:border-secondary/50"
                            }`}
                          >
                            <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-white/80" : "text-text-muted"}`}>
                              GW {h.gameweek}
                            </span>
                            <span className={`text-xs font-black mt-0.5 font-mono ${isActive ? "text-white" : "text-secondary"}`}>
                              {h.points} pts
                            </span>
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setSelectedGw(Math.min(maxGw, activeGw + 1))}
                        disabled={activeGw >= maxGw}
                        className="w-8 h-8 rounded-lg bg-background hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                        aria-label="Next gameweek"
                      >
                        <ChevronRight className="w-4 h-4 text-text-muted" />
                      </button>
                    </div>
                  </div>

                  {/* GW Stats Summary */}
                  <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto w-full">
                    <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">GW {activeGw} Score</span>
                      <span className="text-base font-black text-[var(--color-success-bright)] mt-0.5 font-mono">
                        {gwDetails?.totalGWScore ?? 0} pts
                      </span>
                    </div>
                    <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">GW Average</span>
                      <span className="text-base font-black text-text-primary mt-0.5 font-mono">{gwDetails?.avg ?? 0} pts</span>
                    </div>
                    <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">GW Highest</span>
                      <span className="text-base font-black text-text-primary mt-0.5 font-mono">{gwDetails?.highest ?? 0} pts</span>
                    </div>
                  </div>

                  {/* GW Squad Pitch */}
                  <div className="max-w-2xl mx-auto w-full">
                    {renderPitch(
                      { starting: gwDetails?.starting, bench: gwDetails?.bench },
                      `Gameweek ${activeGw} Squad`
                    )}
                  </div>

                  {/* Link to full breakdown */}
                  <div className="flex justify-center w-full max-w-2xl mx-auto">
                    <button
                      onClick={() => navigate({ to: "/gameweek-breakdown", search: { gw: activeGw, teamId: resolvedTeamId } })}
                      className="flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary dark:text-purple-300 rounded-full px-5 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      View Full GW {activeGw} Breakdown
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Player stats overlay detail modal (Season-only statistics for Manager Overview) */}
      {selectedPlayer && (
        <PlayerStatsModal
          isOpen={showOverlay}
          onClose={() => {
            setShowOverlay(false);
            setSelectedPlayer(null);
          }}
          player={{
            ...selectedPlayer,
            fantasy_team_name: selectedPlayer.fantasy_team_name || (selectedPlayer as any).team_name || teamName,
          }}
          playerStats={{
            ...(selectedPlayer?.playerStats || {}),
            fantasy_team_name: selectedPlayer?.playerStats?.fantasy_team_name || selectedPlayer?.fantasy_team_name || (selectedPlayer as any)?.team_name || teamName,
          } as any}
          showGameweekStats={false}
        />
      )}

      {/* Team Comparison Head-to-Head Modal */}
      <TeamComparisonModal
        open={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        targetTeam={{
          teamName,
          managers,
          rank,
          totalPoints,
          gwPoints,
          starting: activeStarting,
        }}
        myTeam={{
          teamName: compareOverviewData?.teamName,
          managers: compareOverviewData?.managers,
          rank: compareOverviewData?.rank,
          totalPoints: compareOverviewData?.totalPoints,
          gwPoints: compareOverviewData?.gwPoints,
          starting: compareOverviewData?.currentSquad?.starting,
        }}
      />
    </div>
  );
};

export default ManagerOverviewPage;
