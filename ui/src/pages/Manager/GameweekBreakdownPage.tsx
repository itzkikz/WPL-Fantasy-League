import { useState } from "react";
import { useNavigate, useSearch, useRouter } from "@tanstack/react-router";
import { ArrowLeft, LayoutGrid, Award, ShieldAlert, List, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useManagerDetails } from "../../features/manager/hooks";
import { useTeamDetails, useStandings } from "../../features/standings/hooks";
import PitchPlayerCard from "../../components/PitchPlayerCard";
import PlayerStatsModal from "../Standings/components/PlayerStatsModal";
import { Player } from "../../features/players/types";
import { getPlayerDisplayPrice } from "../../libs/helpers/player";
import "../Manager/MyTeamPage.css";

const getRowJustify = (count: number) => {
  if (count <= 1) return "justify-center";
  return "justify-evenly";
};

const GameweekSwitcher = ({
  gw,
  maxGw,
  onChange,
}: {
  gw: number;
  maxGw: number;
  onChange: (gw: number) => void;
}) => {
  const gameweeks = Array.from({ length: Math.max(maxGw, gw, 1) }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onChange(Math.max(1, gw - 1))}
        disabled={gw <= 1}
        className="w-8 h-8 rounded-lg bg-background hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        aria-label="Previous gameweek"
      >
        <ChevronLeft className="w-4 h-4 text-text-muted" />
      </button>

      <div className="relative">
        <select
          value={gw}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Select gameweek"
          style={{ backgroundImage: "none" }}
          className="appearance-none bg-card border border-border rounded-lg text-xs font-black text-text-primary pl-3 py-1.5 font-mono cursor-pointer focus:outline-none focus:border-primary/50"
        >
          {gameweeks.map((n) => (
            <option key={n} value={n} className="bg-card text-text-primary">
              GW {n}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-text-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      <button
        onClick={() => onChange(Math.min(maxGw, gw + 1))}
        disabled={gw >= maxGw}
        className="w-8 h-8 rounded-lg bg-background hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
        aria-label="Next gameweek"
      >
        <ChevronRight className="w-4 h-4 text-text-muted" />
      </button>
    </div>
  );
};

const GameweekBreakdownPage = () => {
  const navigate = useNavigate();
  const router = useRouter();
  const search = useSearch({ from: "/gameweek-breakdown" });
  const gw = search.gw;

  const [activeTab, setActiveTab] = useState<"squad" | "points">("squad");
  const [squadView, setSquadView] = useState<"pitch" | "list">("pitch");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  // Queries
  const { data: standings, isLoading: isStandingsLoading } = useStandings();
  const { data: managerDetails, isLoading: isManagerLoading } = useManagerDetails();

  // Resolve manager's team_id by matching the team name from standings, or use search param teamId if specified
  const paramTeamId = search.teamId;
  const myStanding = standings?.find((s) => s.team === managerDetails?.team);
  const teamId = paramTeamId || myStanding?.team_id || "";

  const { data: teamDetails, isLoading: isDetailsLoading, isError } = useTeamDetails(teamId, gw);

  const maxGw = standings?.[0]?.gw || Math.max(gw, 1);

  const switchGameweek = (nextGw: number) => {
    navigate({ to: "/gameweek-breakdown", search: { gw: nextGw, teamId } });
  };

  const { avg, highest, totalGWScore, starting, bench } = teamDetails || {};

  const compileTeamTotals = () => {
    const totals = {
      minutes: { count: 0, points: 0, suffix: " mins" },
      goals: { count: 0, points: 0, suffix: "" },
      assists: { count: 0, points: 0, suffix: "" },
      cleanSheets: { count: 0, points: 0, suffix: "" },
      yellowCards: { count: 0, points: 0, suffix: "" },
      redCards: { count: 0, points: 0, suffix: "" },
      penaltyMissed: { count: 0, points: 0, suffix: "" },
      penaltySaved: { count: 0, points: 0, suffix: "" },
      saves: { count: 0, points: 0, suffix: "" },
      tackles: { count: 0, points: 0, suffix: "" },
      clearances: { count: 0, points: 0, suffix: "" },
      blocks: { count: 0, points: 0, suffix: "" },
      interceptions: { count: 0, points: 0, suffix: "" },
      recoveries: { count: 0, points: 0, suffix: "" },
      defensivePoints: { count: 0, points: 0, suffix: "" },
    };

    if (!starting) return totals;

    const starters = [
      ...(starting.GK || []),
      ...(starting.DEF || []),
      ...(starting.MID || []),
      ...(starting.FWD || []),
    ];

    const captainPlayer = starters.find((p) => p.isCaptain);
    const captainPlayed = !!(captainPlayer?.playerStats?.current_week?.minutesPlayed > 0);

    const findBreakdown = (breakdown: any[], label: string) =>
      breakdown.find((i) => i.label === label || i.label.startsWith(`${label} (`));

    starters.forEach((p: any) => {
      const cw = p.playerStats?.current_week;
      const breakdown = p.playerStats?.points_breakdown || [];
      if (!cw && breakdown.length === 0) return;

      let multiplier = 1;
      if (p.isCaptain && captainPlayed) {
        multiplier = 2;
      } else if (p.isViceCaptain && !captainPlayed) {
        multiplier = 2;
      }

      // Raw counts from merged current_week stats (sums are correct for display)
      const s = cw || {};
      totals.minutes.count += s.minutesPlayed || 0;
      totals.goals.count += s.goals || 0;
      totals.assists.count += s.goalAssist || 0;
      totals.cleanSheets.count += s.cleanSheet || 0;
      totals.yellowCards.count += s.yellowCards || 0;
      totals.redCards.count += s.redCards || 0;
      totals.penaltyMissed.count += s.penaltyMissed || 0;
      totals.penaltySaved.count += s.penaltySaved || 0;
      totals.saves.count += s.saves || 0;
      totals.tackles.count += s.totalTackle || 0;
      totals.clearances.count += s.totalClearance || 0;
      totals.blocks.count += s.outfielderBlock || 0;
      totals.interceptions.count += s.interceptionWon || 0;
      totals.recoveries.count += s.ballRecovery || 0;
      totals.defensivePoints.count += (s.totalTackle || 0) + (s.totalClearance || 0) + (s.outfielderBlock || 0) + (s.ballRecovery || 0) + (s.interceptionWon || 0);

      // Points come from the server per-match breakdown (per-match rules, summed)
      const ptsFor = (label: string): number => {
        const it = findBreakdown(breakdown, label);
        return it ? it.points * multiplier : 0;
      };

      const minIt = findBreakdown(breakdown, "Minutes Played");
      if (minIt) totals.minutes.points += minIt.points * multiplier;
      totals.goals.points += ptsFor("Goals");
      totals.assists.points += ptsFor("Assists");
      totals.cleanSheets.points += ptsFor("Clean Sheet");
      totals.yellowCards.points += ptsFor("Yellow Cards");
      totals.redCards.points += ptsFor("Red Card");
      totals.penaltyMissed.points += ptsFor("Penalty Missed");
      totals.penaltySaved.points += ptsFor("Penalty Saved");
      totals.saves.points += ptsFor("Saves");
      totals.defensivePoints.points += ptsFor("Defensive Actions");
    });

    return totals;
  };

  const getMultiMatchPlayers = () => {
    const all = [
      ...(starting ? (Object.values(starting).flat() as any[]) : []),
      ...(bench || []),
    ];
    return all
      .filter((p: any) => (p.playerStats?.current_week?.matches || []).length > 1)
      .map((p: any) => ({
        name: p.name,
        position: p.position,
        matches: p.playerStats.current_week.matches,
      }));
  };

  const formatKickoff = (kickoff?: number | null) => {
    if (!kickoff) return "";
    try {
      return new Date(kickoff * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  const getPlayerPrice = (p: Player) => {
    return getPlayerDisplayPrice(p);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowOverlay(true);
  };

  const handleGoBack = () => {
    // Go back to where the user came from, falling back to the previous page
    if (router.history.canGoBack()) {
      router.history.back();
    } else if (paramTeamId) {
      navigate({ to: "/manager-overview", search: { teamId: paramTeamId } });
    } else {
      navigate({ to: "/my-team", search: { tab: "history" } });
    }
  };

  const isLoading = isManagerLoading || isStandingsLoading || (!!teamId && isDetailsLoading);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70dvh] bg-background text-text-primary select-none">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-bold text-secondary">Loading breakdown...</p>
      </div>
    );
  }

  if (isError || (!isLoading && !teamId)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70dvh] bg-background text-rose-400 p-6 text-center select-none">
        <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />
        <p className="text-sm font-extrabold mb-3">Failed to load gameweek details.</p>
        <button
          onClick={handleGoBack}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-primary/30"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full flex-1 h-full min-h-0 bg-background text-text-primary font-outfit select-none overflow-hidden pb-[env(safe-area-inset-bottom)] lg:pb-0">

      {/* MOBILE HEADER (Visible on mobile < lg) */}
      <div className="lg:hidden shrink-0">
        <header className="flex items-center gap-4 px-4 py-3 bg-surface border-b border-[var(--color-border-divider)] sticky top-0 z-30">
          <button
            onClick={handleGoBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-background hover:bg-white/5 border border-border text-text-primary active:scale-95 transition-all cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black tracking-tight">
              Gameweek {gw} Breakdown
            </h1>
            <p className="text-[10px] text-text-muted font-medium mt-0.5">
              Viewing points and line-up for Gameweek {gw}
            </p>
          </div>
          <GameweekSwitcher gw={gw} maxGw={maxGw} onChange={switchGameweek} />
        </header>

        {/* Mobile Tabs Selector Bar */}
        <div className="mx-4 mt-3 flex items-center border-b border-[var(--color-border-divider)] pb-1.5">
          <div className="flex w-full">
            <button
              onClick={() => setActiveTab("squad")}
              className={`pb-1 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer flex-1 flex items-center justify-center gap-1.5 min-h-[36px]
                ${activeTab === "squad" ? "text-secondary font-black" : "text-text-muted hover:text-text-primary"}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Squad
              {activeTab === "squad" && (
                <div className="absolute bottom-[-7px] left-0 right-0 h-0.5 bg-secondary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("points")}
              className={`pb-1 text-xs font-extrabold tracking-wider uppercase transition-all relative cursor-pointer flex-1 flex items-center justify-center gap-1.5 min-h-[36px]
                ${activeTab === "points" ? "text-secondary font-black" : "text-text-muted hover:text-text-primary"}`}
            >
              <Award className="w-3.5 h-3.5" />
              Points
              {activeTab === "points" && (
                <div className="absolute bottom-[-7px] left-0 right-0 h-0.5 bg-secondary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER: Webview Responsive Split Layout (lg+) */}
      <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 overflow-y-auto lg:overflow-hidden lg:gap-3 lg:p-3">

        {/* LEFT COLUMN PANEL (Webview Gameweek Details & Navigation - Visible on lg+) */}
        <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 shrink-0 bg-surface border border-border/80 rounded-3xl p-5 shadow-card overflow-y-auto space-y-5">
          
          {/* Header Info with Back Button */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
            <button
              onClick={() => {
                if (paramTeamId) {
                  navigate({ to: "/manager-overview", search: { teamId: paramTeamId } });
                } else {
                  navigate({ to: "/my-team", search: { tab: "history" } });
                }
              }}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-background hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer shrink-0 shadow-inner"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-muted" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-text-primary tracking-tight truncate">
                Gameweek {gw} Breakdown
              </h2>
              <p className="text-xs text-text-muted font-medium truncate">
                {myStanding?.team || "Gameweek Lineup & Stats"}
              </p>
            </div>
            <GameweekSwitcher gw={gw} maxGw={maxGw} onChange={switchGameweek} />
          </div>

          {/* GW Stats Summary Card */}
          <div className="grid grid-cols-3 gap-2 bg-background/50 border border-border/60 rounded-2xl p-3.5 text-center">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">GW Score</span>
              <span className="text-base font-extrabold text-[var(--color-success-bright)] font-mono mt-0.5 block">{totalGWScore ?? 0}</span>
            </div>
            <div className="border-l border-border/50">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Average</span>
              <span className="text-base font-extrabold text-text-primary font-mono mt-0.5 block">{avg ?? 0}</span>
            </div>
            <div className="border-l border-border/50">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Highest</span>
              <span className="text-base font-extrabold text-text-primary font-mono mt-0.5 block">{highest ?? 0}</span>
            </div>
          </div>

          {/* Section Tab Selector */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Breakdown View</span>
            <div className="flex gap-2 bg-background/50 border border-border/60 rounded-2xl p-1.5">
              <button
                onClick={() => setActiveTab("squad")}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "squad" ? "bg-secondary text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Squad
              </button>
              <button
                onClick={() => setActiveTab("points")}
                className={`flex-1 py-2 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "points" ? "bg-secondary text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Award className="w-4 h-4" />
                Points
              </button>
            </div>
          </div>

          {/* Display Format Selector (Pitch vs List - visible when Squad tab active) */}
          {activeTab === "squad" && (
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Display Format</span>
              <div className="flex gap-2 bg-background/50 border border-border/60 rounded-2xl p-1.5">
                <button
                  onClick={() => setSquadView("pitch")}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    squadView === "pitch" ? "bg-secondary text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Pitch
                </button>
                <button
                  onClick={() => setSquadView("list")}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    squadView === "list" ? "bg-secondary text-white shadow-sm" : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  <List className="w-4 h-4" />
                  List
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN PANEL (The Team View / Points Table on Webview) */}
        {/* Mobile: no height clamp so the full pitch scrolls with the page */}
        <div className="flex-1 flex flex-col min-h-0 lg:h-full lg:overflow-y-auto">
          
          {/* Mobile Format Selector (Visible on mobile < lg when Squad active) */}
          {activeTab === "squad" && (
            <div className="flex lg:hidden justify-end mb-2 px-4 shrink-0">
              <div className="flex bg-card border border-border rounded-xl p-0.5 shadow-sm">
                <button
                  onClick={() => setSquadView("pitch")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    squadView === "pitch"
                      ? "bg-secondary text-white shadow-sm"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  Pitch
                </button>
                <button
                  onClick={() => setSquadView("list")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    squadView === "list"
                      ? "bg-secondary text-white shadow-sm"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  List
                </button>
              </div>
            </div>
          )}

          {/* Interactive Squad / Pitch / Points Table View */}
          <div className="flex-1 flex flex-col min-h-0 lg:overflow-hidden px-4 lg:px-0 py-1">
            {activeTab === "squad" ? (
              squadView === "pitch" ? (
                /* Pitch View Container */
                <div className="flex-1 flex flex-col lg:flex-row gap-3 max-w-3xl mx-auto w-full lg:h-full min-h-0 animate-in fade-in duration-300">
                  {/* Pitch Card */}
                  {/* Mobile: min-height keeps the full pitch + bench visible so the page scrolls instead of clipping */}
                  <div className="relative flex-1 rounded-3xl overflow-hidden border border-border shadow-card bg-background flex flex-col min-h-[560px] sm:min-h-[600px] lg:min-h-0 lg:h-full">
                    {/* Pitch image layer */}
                    <div className="pitch-bg">
                      <img
                        src="/pitch.png"
                        className="pitch-image-layer"
                        alt="Tactical pitch layout"
                      />
                    </div>

                    {/* Players Overlay - Centered on Pitch */}
                    <div className="absolute inset-0 bottom-[110px] lg:bottom-0 z-10 pointer-events-none flex flex-col justify-evenly py-3 md:py-6 px-2 sm:px-4">
                      {starting && (["GK", "DEF", "MID", "FWD"] as const).map((pos) => {
                        const players = starting[pos] || [];
                        return (
                          <div key={pos} className={`flex w-full ${getRowJustify(players.length)} pointer-events-auto`}>
                            {players.map((player) => {
                              const enrichedPlayer = {
                                ...player,
                                price: getPlayerPrice(player),
                              };
                              return (
                                <div
                                  key={player.id}
                                  className="rounded-xl p-0.5 transition-all hover:scale-105 duration-300"
                                >
                                  <PitchPlayerCard
                                    player={enrichedPlayer}
                                    showPriceAndPoints={true}
                                    isSmall={false}
                                    onClick={() => handlePlayerClick(player)}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                    {/* Mobile Bench Strip (Visible ONLY on mobile < lg) */}
                    <div className="flex lg:hidden absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
                      {(bench || []).map((player, idx) => {
                        const label = player.position === "GK" ? "GK" : `${player.subNumber || idx}. ${player.position}`;
                        const enrichedPlayer = {
                          ...player,
                          price: getPlayerPrice(player),
                        };

                        return (
                          <div
                            key={player.id}
                            className="flex flex-col items-center relative rounded-xl p-0.5 transition-all hover:scale-105 duration-300 shrink-0 min-w-[64px]"
                          >
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 select-none">
                              {label}
                            </span>
                            <PitchPlayerCard
                              player={enrichedPlayer}
                              showPriceAndPoints={true}
                              isSmall={true}
                              onClick={() => handlePlayerClick(player)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dedicated Webview Bench Side Card (Visible ONLY on webview lg+) */}
                  {(bench || []).length > 0 && (
                    <div className="hidden lg:flex lg:flex-col lg:w-28 shrink-0 bg-surface border border-border rounded-3xl p-3 shadow-card justify-around items-center">
                      <span className="text-[10px] font-black text-text-muted uppercase tracking-wider text-center border-b border-border/60 pb-2 w-full">
                        Substitutes
                      </span>
                      {bench.map((player, idx) => {
                        const label = player.position === "GK" ? "GK" : `${player.subNumber || idx}. ${player.position}`;
                        const enrichedPlayer = {
                          ...player,
                          price: getPlayerPrice(player),
                        };

                        return (
                          <div
                            key={player.id}
                            className="flex flex-col items-center relative rounded-xl p-0.5 transition-all hover:scale-105 duration-300"
                          >
                            <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 select-none">
                              {label}
                            </span>
                            <PitchPlayerCard
                              player={enrichedPlayer}
                              showPriceAndPoints={true}
                              isSmall={true}
                              onClick={() => handlePlayerClick(player)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* List View Table */
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card max-w-3xl mx-auto w-full flex flex-col animate-in fade-in duration-300">
                  <div className="overflow-y-auto overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_rgba(45,27,84,0.4)]">
                        <tr className="bg-card border-b border-border text-text-muted uppercase tracking-wider font-extrabold text-[10px]">
                          <th className="py-3 px-4">Player</th>
                          <th className="py-3 px-4 text-center">Price</th>
                          <th className="py-3 px-4 text-center">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30 font-medium text-text-primary">
                        {starting && Object.entries(starting).flatMap(([pos, players]) =>
                          (players || []).map((player) => (
                            <tr key={player.id} className="hover:bg-elevated/50 transition-colors cursor-pointer" onClick={() => handlePlayerClick(player)}>
                              <td className="py-2.5 px-4 font-bold text-text-primary">
                                <div className="flex items-center gap-3">
                                  {/* Player Image Thumbnail */}
                                  <div
                                    className="w-8 h-8 rounded-full border overflow-hidden bg-indigo-950 flex items-center justify-center shrink-0 shadow-sm"
                                    style={{ borderColor: player?.teamColor || "#A855F7" }}
                                  >
                                    {player?.photo ? (
                                      <img
                                        src={player.photo}
                                        alt=""
                                        className="w-full h-full object-cover object-top"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = "none";
                                          const fallbackContainer = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                                          if (fallbackContainer) (fallbackContainer as HTMLElement).style.display = "flex";
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      className="w-full h-full flex items-center justify-center bg-gradient-to-b from-indigo-950 to-indigo-900"
                                      style={{ display: player?.photo ? "none" : "flex" }}
                                    >
                                      <svg className="w-4.5 h-4.5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Name & Metadata */}
                                  <div className="flex flex-col justify-center gap-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="truncate">{player.name}</span>
                                      {player.isCaptain && <span className="bg-secondary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono shrink-0">C</span>}
                                      {player.isViceCaptain && <span className="bg-text-muted text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono shrink-0">V</span>}
                                      {player.subIn && <span className="bg-emerald-900/90 border border-emerald-400 text-emerald-300 text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0">IN</span>}
                                    </div>
                                    <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                                      {player.position} • {player.team}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center text-text-primary">{getPlayerPrice(player)}</td>
                              <td className="py-3.5 px-4 text-center text-[var(--color-success-bright)] font-mono font-extrabold">{player.point}</td>
                            </tr>
                          ))
                        )}
                        {(bench || []).map((player, idx) => {
                          const label = player.position === "GK" ? "GK" : `${player.subNumber || idx}. ${player.position}`;
                          return (
                            <tr key={player.id} className="hover:bg-white/5 transition-colors bg-black/10 cursor-pointer" onClick={() => handlePlayerClick(player)}>
                              <td className="py-2.5 px-4 font-bold text-text-muted">
                                <div className="flex items-center gap-3">
                                  {/* Player Image Thumbnail */}
                                  <div
                                    className="w-8 h-8 rounded-full border overflow-hidden bg-indigo-950 flex items-center justify-center shrink-0 shadow-sm opacity-70"
                                    style={{ borderColor: player?.teamColor || "#94a3b8" }}
                                  >
                                    {player?.photo ? (
                                      <img
                                        src={player.photo}
                                        alt=""
                                        className="w-full h-full object-cover object-top"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = "none";
                                          const fallbackContainer = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                                          if (fallbackContainer) (fallbackContainer as HTMLElement).style.display = "flex";
                                        }}
                                      />
                                    ) : null}
                                    <div
                                      className="w-full h-full flex items-center justify-center bg-gradient-to-b from-indigo-950 to-indigo-900"
                                      style={{ display: player?.photo ? "none" : "flex" }}
                                    >
                                      <svg className="w-4.5 h-4.5 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Name & Metadata */}
                                  <div className="flex flex-col justify-center gap-0.5 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="truncate">{player.name}</span>
                                      {player.subOut && <span className="bg-rose-900/90 border border-rose-400 text-rose-300 text-[8px] font-black px-1.5 py-0.5 rounded-full shrink-0">OUT</span>}
                                    </div>
                                    <span className="text-[10px] font-semibold text-text-muted/50 uppercase tracking-wider">
                                      {label} • {player.team}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-center text-text-muted/65">{getPlayerPrice(player)}</td>
                              <td className="py-3.5 px-4 text-center text-text-muted/65 font-mono font-extrabold">{player.point}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            ) : (
              /* Points View Content */
              <div className="flex-1 flex flex-col gap-4 max-w-3xl mx-auto w-full min-h-0 animate-in fade-in duration-300">
                {/* Match-by-Match Split (multi-match gameweeks) */}
                {/* {(() => {
                  const splits = getMultiMatchPlayers();
                  if (splits.length === 0) return null;
                  return (
                    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card">
                      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <span className="text-xs font-extrabold text-text-muted uppercase tracking-wider">
                          Match-by-Match ({splits.length} player{splits.length > 1 ? "s" : ""} with multiple matches)
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px]">
                          <thead className="bg-card text-text-muted uppercase tracking-wider font-extrabold text-[9px]">
                            <tr className="border-b border-border">
                              <th className="py-2.5 px-4">Player</th>
                              <th className="py-2.5 px-3 text-center">Match</th>
                              <th className="py-2.5 px-3 text-center">Opponent</th>
                              <th className="py-2.5 px-3 text-center">H/A</th>
                              <th className="py-2.5 px-3 text-center">Mins</th>
                              <th className="py-2.5 px-3 text-center">G</th>
                              <th className="py-2.5 px-3 text-center">A</th>
                              <th className="py-2.5 px-3 text-center">CS</th>
                              <th className="py-2.5 px-3 text-center">Svs</th>
                              <th className="py-2.5 px-3 text-center">Pts</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/30">
                            {splits.map((sp) =>
                              sp.matches.map((m: any, idx: number) => (
                                <tr key={`${sp.name}-${m.fixtureId}`} className="hover:bg-white/5">
                                  <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                                    {idx === 0 ? (
                                      <span>{sp.name} <span className="text-[9px] text-text-muted">({sp.position})</span></span>
                                    ) : null}
                                  </td>
                                  <td className="py-2.5 px-3 text-center text-text-muted">M{idx + 1}</td>
                                  <td className="py-2.5 px-3 text-center">
                                    {m.opponent || m.opponent_short_name || "—"}
                                  </td>
                                  <td className="py-2.5 px-3 text-center text-text-muted">
                                    {m.isHome === null || m.isHome === undefined ? "—" : m.isHome ? "H" : "A"}
                                  </td>
                                  <td className="py-2.5 px-3 text-center">{(m.stats?.minutesPlayed ?? 0) === 0 ? "DNP" : m.stats?.minutesPlayed}</td>
                                  <td className="py-2.5 px-3 text-center">{m.stats?.goals ?? 0}</td>
                                  <td className="py-2.5 px-3 text-center">{m.stats?.goalAssist ?? 0}</td>
                                  <td className="py-2.5 px-3 text-center">{m.stats?.cleanSheet ?? 0}</td>
                                  <td className="py-2.5 px-3 text-center">{m.stats?.saves ?? 0}</td>
                                  <td className="py-2.5 px-3 text-center font-mono font-extrabold text-[var(--color-success-bright)]">
                                    {(m.stats?.minutesPlayed ?? 0) === 0 ? "DNP" : (m.points ?? 0)}
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()} */}

                {/* Stats Summary Panel */}
                <div className="bg-surface border border-border rounded-2xl p-4 shadow-card grid grid-cols-3 gap-2">
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Score</span>
                    <span className="text-sm md:text-lg font-black text-[var(--color-success-bright)] mt-0.5 font-mono">
                      {totalGWScore ?? 0} pts
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
                    <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Average</span>
                    <span className="text-sm md:text-lg font-black text-text-primary mt-0.5 font-mono">
                      {avg ?? 0} pts
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
                    <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Highest</span>
                    <span className="text-sm md:text-lg font-black text-text-primary mt-0.5 font-mono">
                      {highest ?? 0} pts
                    </span>
                  </div>
                </div>

                {/* List View Table */}
                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card flex flex-col w-full flex-1 min-h-0">
                  <div className="overflow-y-auto overflow-x-auto flex-1 min-h-0">
                    <table className="w-full text-left border-collapse text-xs md:text-sm">
                      <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_rgba(45,27,84,0.4)]">
                        <tr className="bg-card border-b border-border text-text-muted uppercase tracking-wider font-extrabold text-[10px]">
                          <th className="py-3 px-4">Stat Type</th>
                          <th className="py-3 px-4 text-center">Compiled Count</th>
                          <th className="py-3 px-4 text-center">Points Formed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30 font-medium text-text-primary">
                        {(() => {
                          const totals = compileTeamTotals();
                          const rows = [
                            { label: "Minutes Played", ...totals.minutes },
                            { label: "Goals", ...totals.goals },
                            { label: "Assists", ...totals.assists },
                            { label: "Clean Sheet", ...totals.cleanSheets },
                            { label: "Yellow Card", ...totals.yellowCards },
                            { label: "Red Card", ...totals.redCards },
                            { label: "Penalty Miss", ...totals.penaltyMissed },
                            { label: "Penalty Save", ...totals.penaltySaved },
                            { label: "Saves", ...totals.saves },
                            { label: "Tackles", ...totals.tackles },
                            { label: "Clearances", ...totals.clearances },
                            { label: "Blocks", ...totals.blocks },
                            { label: "Interceptions", ...totals.interceptions },
                            { label: "Recovery", ...totals.recoveries },
                            { label: "Defensive Actions Points", ...totals.defensivePoints },
                          ];

                          return rows.map((row) => {
                            const isDefensiveActionRaw = ["Tackles", "Clearances", "Blocks", "Interceptions", "Recovery"].includes(row.label);
                            const pointsVal = (row as any).isPointsOnly
                              ? `${row.points > 0 ? "+" : ""}${row.points} pts`
                              : isDefensiveActionRaw
                                ? "—"
                                : `${row.points > 0 ? "+" : ""}${row.points} pts`;

                            const pointsColor = row.points > 0 
                              ? "text-[var(--color-success-bright)]" 
                              : row.points < 0 
                                ? "text-rose-400" 
                                : "text-text-muted/65";

                            return (
                              <tr key={row.label} className="hover:bg-elevated/50 transition-colors">
                                <td className="py-3.5 px-4 font-bold text-text-primary">
                                  {row.label}
                                </td>
                                <td className="py-3.5 px-4 text-center text-text-primary font-mono">
                                  {row.count}{(row as any).suffix}
                                </td>
                                <td className={`py-3.5 px-4 text-center font-mono font-extrabold ${pointsColor}`}>
                                  {pointsVal}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Player Selection Actions Overlay Modal */}
      <PlayerStatsModal
        isOpen={showOverlay}
        onClose={() => {
          setShowOverlay(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
        playerStats={selectedPlayer?.playerStats}
        pickMyTeam={false}
      />
    </div>
  );
};

export default GameweekBreakdownPage;
