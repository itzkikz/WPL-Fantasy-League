import { useEffect, useState } from "react";
import { useNavigate, useSearch, useRouter } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert, ShieldUser, Swords, LayoutGrid, Calendar, ChevronLeft, ChevronRight, Award, Trophy, ArrowUpRight, ArrowDownRight, Clock, Crown, Wallet } from "lucide-react";
import { useManagerOverview, useStandings, useTeamDetails } from "../../features/standings/hooks";
import { useManagerDetails } from "../../features/manager/hooks";
import PitchPlayerCard from "../../components/PitchPlayerCard";
import PlayerStatsModal from "../Standings/components/PlayerStatsModal";
import { ManagerRankTrendChart } from "./components/ManagerRankTrendChart";
import { SquadPositionBreakdown } from "./components/SquadPositionBreakdown";
import { SquadValueStatsCard } from "./components/SquadValueStatsCard";
import { TeamTransfersCard } from "./components/TeamTransfersCard";
import UpcomingFixturesCard from "./components/UpcomingFixturesCard";
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
  const [now, setNow] = useState(() => Date.now());

  // Live tick for the deadline countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

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

  const { teamName, logo, managers, rank, totalPoints, gwPoints, currentSquad, history, transfers, finance } = data || {};

  // Finance (all values in £M)
  const financeBudget = Number(finance?.totalBudget ?? 0);
  const financeSpent = Number(finance?.utilisation ?? 0);
  const financeBalance = Number(finance?.balance ?? 0);
  const financeBonus = Number(finance?.bonus ?? 0);
  const financeFine = Number(finance?.fine ?? 0);
  const financeHasExtras = financeBonus !== 0 || financeFine !== 0;
  const financeUtilPct = financeBudget > 0 ? Math.min(100, Math.round((financeSpent / financeBudget) * 100)) : 0;
  const fmtM = (v: number) => `£${v.toFixed(1)}m`;

  // Always use overall current squad
  const activeStarting = currentSquad?.starting;
  const activeBench = currentSquad?.bench;

  // Quick wins: rank movement, league percentile, deadline countdown, captain/VC
  const targetStanding = standings?.find((s: any) => s.team_id === resolvedTeamId);
  const rankChange = Number(targetStanding?.pos_change) || 0;
  const teamsCount = standings?.length || 0;
  const topPct = teamsCount > 0 && rank > 0 ? Math.round((rank / teamsCount) * 100) : 0;

  const deadlineTime = managerDetails?.deadline ? new Date(managerDetails.deadline).getTime() : null;
  const deadlineDiff = deadlineTime ? deadlineTime - now : null;
  const deadlineCountdown = deadlineDiff !== null && deadlineDiff > 0
    ? (() => {
        const totalMin = Math.floor(deadlineDiff / 60000);
        const d = Math.floor(totalMin / 1440);
        const h = Math.floor((totalMin % 1440) / 60);
        const m = totalMin % 60;
        return d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m` : `${m}m`;
      })()
    : null;

  const allSquadPlayers = [
    ...(activeStarting?.GK || []),
    ...(activeStarting?.DEF || []),
    ...(activeStarting?.MID || []),
    ...(activeStarting?.FWD || []),
    ...(activeBench || []),
  ];
  const captain = allSquadPlayers.find((p: any) => p.isCaptain === true || p.role === "CAPTAIN");
  const viceCaptain = allSquadPlayers.find((p: any) => p.isViceCaptain === true || p.role === "VICE CAPTAIN");

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

      <div className="flex flex-col lg:flex-row gap-3 w-full">
        {/* Pitch Card */}
        <div className="relative flex-1 rounded-3xl overflow-hidden border border-border shadow-card bg-background min-h-[560px] flex flex-col">
          <div className="pitch-bg">
            <img src="/pitch.png" className="pitch-image-layer" alt="Tactical pitch layout" />
          </div>

          <div className={`absolute top-0 inset-x-0 ${squad.bench && squad.bench.length > 0 ? "bottom-[122px] lg:bottom-0" : "bottom-0"} z-10 pointer-events-none flex flex-col justify-evenly py-3 md:py-6 px-2 sm:px-4`}>
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

          {/* Mobile Bench Strip (Visible ONLY on mobile < lg) */}
          {squad.bench && squad.bench.length > 0 && (
            <div className="absolute lg:hidden bottom-0 inset-x-0 h-[122px] bg-surface/95 backdrop-blur-md border-t border-border flex justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
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

        {/* Dedicated Webview Bench Side Card (Visible ONLY on webview lg+) */}
        {squad.bench && squad.bench.length > 0 && (
          <div className="hidden lg:flex lg:flex-col lg:w-28 shrink-0 bg-surface border border-border rounded-3xl p-3 shadow-card justify-around items-center">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider text-center border-b border-border/60 pb-2 w-full">
              Substitutes
            </span>
            {squad.bench.map((player: Player, idx: number) => {
              const label = player.position === "GK" ? "GK" : `${player.subNumber || idx + 1}. ${player.position}`;
              const enrichedPlayer = { ...player, price: getPlayerPrice(player) };
              return (
                <div key={player.id} className="flex flex-col items-center relative rounded-xl p-0.5 transition-all hover:scale-105 duration-300">
                  <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 select-none">{label}</span>
                  <PitchPlayerCard player={enrichedPlayer} showPriceAndPoints={true} isSmall={true} onClick={() => handlePlayerClick(player)} />
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
            <p className="text-[10px] text-text-muted font-bold mt-0.5 truncate flex items-center gap-1">
              <Trophy className="w-3 h-3 shrink-0 text-amber-400" />
              <span className="truncate">Rank #{rank}</span>
              {rankChange !== 0 && (
                <span className={`flex items-center gap-0.5 font-black ${rankChange > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {rankChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(rankChange)}
                </span>
              )}
              <span className="text-text-muted/60">·</span>
              <span>{totalPoints} pts</span>
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

      {/* MAIN CONTAINER: Webview Responsive Split Layout (lg+) */}
      <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 overflow-y-auto lg:overflow-hidden lg:gap-3 lg:p-3">

        {/* LEFT COLUMN PANEL (Webview Overview Details & Navigation - Visible on lg+) */}
        <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 shrink-0 bg-surface border border-border/80 rounded-3xl p-5 shadow-card overflow-y-auto space-y-5">

          {/* Header Info with Back Button */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
            <button
              onClick={handleGoBack}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-background hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer shrink-0 shadow-inner"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-muted" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-text-primary tracking-tight truncate">
                Manager Overview
              </h2>
              <p className="text-xs text-text-muted font-medium truncate">
                {teamName}
              </p>
            </div>
            {resolvedTeamId !== myTeamId && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="flex items-center justify-center w-10 h-10 rounded-2xl bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary active:scale-95 transition-all cursor-pointer shrink-0"
                title="Compare with My Team"
                aria-label="Compare with My Team"
              >
                <Swords className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Team Profile */}
          <div className="flex items-center gap-3 pb-4 border-b border-border/60">
            {logo ? (
              <div className="w-14 h-14 rounded-2xl bg-background/60 border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
                <img src={logo} alt={`${teamName} logo`} className="w-12 h-12 object-contain" />
              </div>
            ) : (
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${crest.bgGradient} flex items-center justify-center text-lg font-black text-white shadow-md border border-white/10 shrink-0`}>
                {crest.letter}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-base font-black text-text-primary tracking-tight truncate">{teamName}</h3>
                <span className="text-[9px] font-black text-secondary bg-secondary/15 border border-secondary/30 px-1.5 py-0.5 rounded font-mono shrink-0">
                  {formation}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-text-muted truncate mt-0.5">
                Managers: {(managersList.length > 0 ? managersList : [managers || "Unknown"]).join(", ")}
              </p>
              {deadlineTime !== null && (
                <p className="text-[10px] font-bold text-text-muted mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-secondary shrink-0" />
                  {deadlineCountdown ? (
                    <span className="truncate">
                      GW {managerDetails?.gw ?? ""} deadline{" "}
                      <span className="text-text-primary font-black font-mono">{deadlineCountdown}</span>
                    </span>
                  ) : (
                    <span className="truncate">GW {managerDetails?.gw ?? ""} deadline passed</span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* 4-Stat Metric Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-background/50 border border-border/60 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Overall Rank</span>
              <span className="text-base font-extrabold text-text-primary mt-0.5 block font-mono">#{rank}</span>
              <span className="flex items-center justify-center gap-1 text-[9px] font-bold mt-1">
                {rankChange !== 0 && (
                  <span className={`flex items-center gap-0.5 ${rankChange > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {rankChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(rankChange)}
                  </span>
                )}
                {topPct > 0 && <span className="text-text-muted">Top {topPct}%</span>}
              </span>
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Season Total</span>
              <span className="text-base font-extrabold text-secondary mt-0.5 block font-mono">{totalPoints} pts</span>
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Season Average</span>
              <span className="text-sm font-extrabold text-indigo-400 mt-0.5 block font-mono">{avgGwScore} pts/GW</span>
            </div>
            <div className="bg-background/50 border border-border/60 rounded-2xl p-3 text-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Best GW Score</span>
              <span className="text-sm font-extrabold text-emerald-400 mt-0.5 block font-mono">
                {highestGwObj.points} pts <span className="text-[9px] text-text-muted font-normal">(GW{highestGwObj.gameweek})</span>
              </span>
            </div>
          </div>

          {/* Captain & Vice Captain */}
          {(captain || viceCaptain) && (
            <div className="space-y-2.5 pt-3 border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Captain & Vice Captain</span>
              </div>
              {[captain, viceCaptain].filter(Boolean).map((p: any) => (
                <div
                  key={p.player_id ?? p.id}
                  className="flex items-center justify-between gap-2 bg-background/60 border border-border/40 rounded-xl px-2.5 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        p.isCaptain || p.role === "CAPTAIN"
                          ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                          : "bg-secondary/20 text-secondary border border-secondary/40"
                      }`}
                    >
                      {p.isCaptain || p.role === "CAPTAIN" ? "C" : "V"}
                    </span>
                    <span className="text-xs font-extrabold text-text-primary truncate">{p.name}</span>
                    <span className="text-[9px] font-black text-text-muted bg-background border border-border/40 px-1.5 py-0.5 rounded font-mono shrink-0">
                      {p.position}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-black font-mono text-emerald-400 leading-tight">
                      {(p as any).gwPoint ?? 0} <span className="text-[8px] text-text-muted font-bold">GW</span>
                    </p>
                    <p className="text-[9px] font-mono text-text-muted leading-tight">{(p as any).point ?? 0} season</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Budget & Finance */}
          {finance && (
            <div className="pt-3 border-t border-border/60">
              <div className="bg-background/50 border border-border/60 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-secondary" />
                    <span>Budget & Finance</span>
                  </h3>
                  <span className="text-[9px] font-black text-text-muted font-mono">
                    {financeUtilPct}% used
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-background/60 border border-border/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Budget</span>
                    <span className="text-sm font-black text-text-primary mt-0.5 font-mono">{fmtM(financeBudget)}</span>
                  </div>
                  <div className="bg-background/60 border border-border/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Spent</span>
                    <span className="text-sm font-black text-rose-400 mt-0.5 font-mono">{fmtM(financeSpent)}</span>
                  </div>
                  <div className="bg-background/60 border border-border/40 rounded-xl p-2.5 flex flex-col items-center text-center">
                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">In Bank</span>
                    <span className="text-sm font-black text-emerald-400 mt-0.5 font-mono">{fmtM(financeBalance)}</span>
                  </div>
                </div>

                {/* Utilisation bar */}
                <div className="mt-3 h-2 rounded-full bg-background border border-border/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${financeUtilPct > 90 ? "bg-rose-500" : financeUtilPct > 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                    style={{ width: `${Math.max(2, financeUtilPct)}%` }}
                  />
                </div>

                {financeHasExtras && (
                  <p className="text-[9px] font-bold text-indigo-400 mt-2 font-mono text-center">
                    Bonus +{fmtM(financeBonus)} / Fine -{fmtM(financeFine)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Compare with My Team */}
          {resolvedTeamId !== myTeamId && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="w-full flex items-center justify-center gap-1.5 bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary rounded-xl px-3 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Swords className="w-3.5 h-3.5" />
              Compare with My Team
            </button>
          )}
        </div>

        {/* RIGHT COLUMN PANEL (The Overview View on Webview / Main View on Mobile) */}
        <div className="flex-1 flex flex-col min-h-0 lg:h-full lg:overflow-y-auto">

          {/* MOBILE HERO / PROFILE CARD (Visible on mobile < lg) */}
          <div className="lg:hidden w-full max-w-3xl mx-auto px-3 sm:px-4 pt-3">
            <div className="bg-surface border border-border rounded-3xl p-4 sm:p-6 shadow-card flex flex-row items-center gap-3 sm:gap-6">
            {logo ? (
              <div className="relative shrink-0">
                <div className="absolute inset-0 rounded-full bg-gradient-core blur-md opacity-40" />
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-core p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-card overflow-hidden flex items-center justify-center border border-white/20">
                    <img src={logo} alt={`${teamName} logo`} className="w-[88%] h-[88%] object-contain" />
                  </div>
                </div>
              </div>
            ) : (
              <div className={`shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br ${crest.bgGradient} flex items-center justify-center text-3xl sm:text-5xl font-black text-white shadow-lg border border-white/10`}>
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
                    <span className="break-words">{m}</span>
                  </div>
                ))}
              </div>

              {deadlineTime !== null && (
                <div className="mt-3 pt-3 border-t border-border/60 w-full flex items-center gap-1.5 text-[10px] font-bold text-text-muted">
                  <Clock className="w-3.5 h-3.5 text-secondary shrink-0" />
                  {deadlineCountdown ? (
                    <span className="truncate">
                      GW {managerDetails?.gw ?? ""} deadline in{" "}
                      <span className="text-text-primary font-black font-mono">{deadlineCountdown}</span>
                    </span>
                  ) : (
                    <span className="truncate">GW {managerDetails?.gw ?? ""} deadline passed</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

          {/* TABS: Overall | GW Breakdown (sticky on mobile + desktop so they stay reachable while scrolling) */}
          <div className="sticky top-0 z-40 px-3 sm:px-4 lg:px-0 flex items-center border-b border-border gap-1 sm:gap-2 bg-surface/95 backdrop-blur-xl shadow-sm">
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
            <div className="w-full max-w-3xl mx-auto space-y-4 px-3 sm:px-4 lg:px-0 pt-4 pb-4 lg:pb-8">
              {/* Mobile-only sections (Visible on mobile < lg) */}
              <div className="lg:hidden space-y-4">
              {/* Overall Season Performance Hero Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Overall Rank</span>
                  <span className="text-base font-black text-text-primary mt-0.5 font-mono">#{rank}</span>
                  <span className="flex items-center gap-1 text-[9px] font-bold mt-1">
                    {rankChange !== 0 && (
                      <span className={`flex items-center gap-0.5 ${rankChange > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {rankChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(rankChange)}
                      </span>
                    )}
                    {topPct > 0 && <span className="text-text-muted">Top {topPct}%</span>}
                  </span>
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

              {/* Current Captain & Vice Captain */}
              {(captain || viceCaptain) && (
                <div className="w-full">
                  <div className="bg-surface border border-border rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-text-primary uppercase tracking-wider">Captain & Vice Captain</span>
                    </div>
                    {[captain, viceCaptain].filter(Boolean).map((p: any) => (
                      <div
                        key={p.player_id ?? p.id}
                        className="flex items-center justify-between gap-2 bg-background/60 border border-border/40 rounded-xl px-2.5 py-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              p.isCaptain || p.role === "CAPTAIN"
                                ? "bg-amber-400/20 text-amber-400 border border-amber-400/40"
                                : "bg-secondary/20 text-secondary border border-secondary/40"
                            }`}
                          >
                            {p.isCaptain || p.role === "CAPTAIN" ? "C" : "V"}
                          </span>
                          <span className="text-xs font-extrabold text-text-primary truncate">{p.name}</span>
                          <span className="text-[9px] font-black text-text-muted bg-background border border-border/40 px-1.5 py-0.5 rounded font-mono shrink-0">
                            {p.position}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[11px] font-black font-mono text-emerald-400 leading-tight">
                            {(p as any).gwPoint ?? 0} <span className="text-[8px] text-text-muted font-bold">GW</span>
                          </p>
                          <p className="text-[9px] font-mono text-text-muted leading-tight">{(p as any).point ?? 0} season</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Budget & Finance */}
              {finance && (
                <div className="w-full">
                  <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-secondary" />
                        <span>Budget & Finance</span>
                      </h3>
                      <span className="text-[9px] font-black text-text-muted font-mono">
                        {financeUtilPct}% used
                      </span>
                    </div>

                    <div className={`grid grid-cols-3 ${financeHasExtras ? "sm:grid-cols-4" : "sm:grid-cols-3"} gap-2`}>
                      <div className="bg-background/60 border border-border/40 rounded-xl p-3 flex flex-col items-center text-center">
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Budget</span>
                        <span className="text-sm font-black text-text-primary mt-0.5 font-mono">{fmtM(financeBudget)}</span>
                      </div>
                      <div className="bg-background/60 border border-border/40 rounded-xl p-3 flex flex-col items-center text-center">
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Spent</span>
                        <span className="text-sm font-black text-rose-400 mt-0.5 font-mono">{fmtM(financeSpent)}</span>
                      </div>
                      <div className="bg-background/60 border border-border/40 rounded-xl p-3 flex flex-col items-center text-center">
                        <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">In Bank</span>
                        <span className="text-sm font-black text-emerald-400 mt-0.5 font-mono">{fmtM(financeBalance)}</span>
                      </div>
                      {financeHasExtras && (
                        <div className="bg-background/60 border border-border/40 rounded-xl p-3 flex flex-col items-center text-center">
                          <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider">Bonus / Fine</span>
                          <span className="text-sm font-black text-indigo-400 mt-0.5 font-mono">
                            +{fmtM(financeBonus)} / -{fmtM(financeFine)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Utilisation bar */}
                    <div className="mt-3 h-2 rounded-full bg-background border border-border/50 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${financeUtilPct > 90 ? "bg-rose-500" : financeUtilPct > 70 ? "bg-amber-400" : "bg-emerald-500"}`}
                        style={{ width: `${Math.max(2, financeUtilPct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              </div>

              {/* Overall Season Squad Pitch */}
              <div className="w-full">
                {renderPitch({ starting: displayStarting, bench: displayBench }, "Overall Season Squad (Season Total Pts)")}
              </div>

              {/* Squad Position Contribution Breakdown */}
              <div className="w-full">
                <SquadPositionBreakdown starting={activeStarting} isOverallMode={true} />
              </div>

              {/* Performance Trend Chart */}
              <div className="w-full">
                <ManagerRankTrendChart history={history || []} currentGwPoints={gwPoints} totalPoints={totalPoints} />
              </div>

              {/* Upcoming fixtures for the starting XI */}
              <UpcomingFixturesCard players={[...(activeStarting?.GK || []), ...(activeStarting?.DEF || []), ...(activeStarting?.MID || []), ...(activeStarting?.FWD || [])]} />

              {/* Transfers */}
              <div className="w-full">
                <TeamTransfersCard transfers={transfers} />
              </div>

              {/* Player Values & Squad Valuation Card */}
              <div className="w-full">
                <SquadValueStatsCard starting={activeStarting} bench={activeBench} />
              </div>
            </div>
          ) : (
            /* ============ GW BREAKDOWN TAB ============ */
            <div className="w-full max-w-3xl mx-auto space-y-4 px-3 sm:px-4 lg:px-0 pt-4 pb-4 lg:pb-8">
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
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-0.5 snap-x snap-mandatory">
                      <button
                        onClick={() => setSelectedGw(Math.max(minGw, activeGw - 1))}
                        disabled={activeGw <= minGw}
                        className="w-10 h-10 rounded-lg bg-background hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                        aria-label="Previous gameweek"
                      >
                        <ChevronLeft className="w-5 h-5 text-text-muted" />
                      </button>

                      {gwList.map((h: any) => {
                        const isActive = activeGw === h.gameweek;
                        return (
                          <button
                            key={h.gameweek}
                            onClick={() => setSelectedGw(h.gameweek)}
                            className={`flex flex-col items-center justify-center min-w-[88px] rounded-xl py-2.5 px-3 border transition-all cursor-pointer shrink-0 snap-start ${
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
                        className="w-10 h-10 rounded-lg bg-background hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                        aria-label="Next gameweek"
                      >
                        <ChevronRight className="w-5 h-5 text-text-muted" />
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
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Average</span>
                      <span className="text-base font-black text-text-primary mt-0.5 font-mono">{gwDetails?.avg ?? 0} pts</span>
                    </div>
                    <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
                      <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Highest</span>
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

      {/* Player stats overlay detail modal.
          Overall tab: season-only statistics (season totals for the whole campaign).
          GW Breakdown tab: also show Gameweek Performance for the selected gameweek
          (the GW squad's playerStats carry current_week for that gameweek). */}
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
          showGameweekStats={activeTab === "gw"}
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
