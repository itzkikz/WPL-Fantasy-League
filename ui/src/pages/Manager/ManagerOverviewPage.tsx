import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert, Users, Swords, Coins, LayoutGrid, Calendar } from "lucide-react";
import { useManagerOverview, useTeamDetails, useStandings } from "../../features/standings/hooks";
import { useManagerDetails } from "../../features/manager/hooks";
import PitchPlayerCard from "../../components/PitchPlayerCard";
import PlayerStatsModal from "../Standings/components/PlayerStatsModal";
import { ManagerRankTrendChart } from "./components/ManagerRankTrendChart";
import { SquadPositionBreakdown } from "./components/SquadPositionBreakdown";
import { SquadValueStatsCard } from "./components/SquadValueStatsCard";
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
  const search = useSearch({ from: "/manager-overview" });
  const teamId = search.teamId;

  // State
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedGw, setSelectedGw] = useState<number | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Queries for resolving logged-in user's team ID
  const { data: standings } = useStandings();
  const { data: managerDetails } = useManagerDetails();

  const myStanding = standings?.find((s) => s.team === managerDetails?.team);
  const myTeamId = myStanding?.team_id || "";

  // If user is viewing their own team, allow comparing against #1 team as fallback comparison target
  const topStanding = standings?.[0];
  const compareAgainstTeamId = (teamId && teamId === myTeamId) ? (topStanding?.team_id || "") : myTeamId;

  // Query overview details for target team & comparison team
  const { data, isLoading, isError } = useManagerOverview(teamId);
  const { data: compareOverviewData } = useManagerOverview(compareAgainstTeamId);

  // Query specific historical GW if selected
  const { data: historicalDetails } = useTeamDetails(teamId, selectedGw || 0);

  const { teamName, logo, managers, rank, totalPoints, gwPoints, currentSquad, history } = data || {};

  // Active squad to display (historical selected GW or current squad)
  const activeStarting = historicalDetails?.data?.starting || currentSquad?.starting;
  const activeBench = historicalDetails?.data?.bench || currentSquad?.bench;
  const activeGwScore = historicalDetails?.data?.totalGWScore ?? gwPoints;

  // Formation calculation (e.g. 4-3-3)
  const formation = activeStarting
    ? `${activeStarting.DEF?.length || 0}-${activeStarting.MID?.length || 0}-${activeStarting.FWD?.length || 0}`
    : "4-4-2";

  // Calculate Total Squad Value
  const getSquadValue = () => {
    if (!activeStarting) return "0.0";
    const startingList = [
      ...(activeStarting.GK || []),
      ...(activeStarting.DEF || []),
      ...(activeStarting.MID || []),
      ...(activeStarting.FWD || []),
    ];
    const benchList = activeBench || [];
    const totalVal = [...startingList, ...benchList].reduce((acc, p) => {
      const priceVal = p.auctionPrice ? p.auctionPrice : parseFloat(getPlayerDisplayPrice(p).replace("£", "").replace("m", "")) || 0;
      return acc + priceVal;
    }, 0);
    return totalVal > 0 ? `£${totalVal.toFixed(1)}m` : "N/A";
  };

  const getPlayerPrice = (p: Player) => {
    return getPlayerDisplayPrice(p);
  };

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
    setShowOverlay(true);
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
          onClick={() => navigate({ to: "/standings" })}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-primary/30"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Generate large color logo crest from team name
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

  return (
    <div className="flex flex-col w-full flex-1 h-full min-h-0 bg-background text-text-primary font-outfit select-none overflow-hidden pb-[env(safe-area-inset-bottom)] lg:pb-0">

      {/* MOBILE STICKY FULL-WIDTH HEADER (Visible on mobile < lg) */}
      <div className="lg:hidden shrink-0 border-b border-border bg-surface shadow-sm sticky top-0 z-30 w-full">
        <header className="flex items-center gap-2.5 px-3 sm:px-4 py-2.5 w-full">
          <button
            onClick={() => navigate({ to: "/standings" })}
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
              <Users className="w-3 h-3 shrink-0" />
              <span className="truncate">{managers}</span>
            </p>
          </div>

          <button
            onClick={() => setShowCompareModal(true)}
            className="flex items-center gap-1 bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary rounded-lg px-2 py-1 text-[10px] font-bold transition-all active:scale-95 cursor-pointer shrink-0"
            title="Compare with My Team"
          >
            <Swords className="w-3 h-3" />
            <span>Compare</span>
          </button>
        </header>
      </div>

      {/* MOBILE SCROLLABLE CONTENT BODY (Visible on mobile < lg) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-3 sm:px-4 py-3 gap-4 lg:hidden">
        {/* Statistics Metric Card Grid */}
        <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto w-full shrink-0">
          <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Overall Rank</span>
            <span className="text-sm font-black text-text-primary mt-0.5 font-mono">
              #{rank}
            </span>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center border-l border-border/50">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">Total Points</span>
            <span className="text-sm font-black text-text-primary mt-0.5 font-mono">
              {totalPoints} pts
            </span>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-3 shadow-card flex flex-col items-center justify-center text-center border-l border-border/50">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider">GW Score</span>
            <span className="text-sm font-black text-emerald-400 mt-0.5 font-mono">
              {activeGwScore} pts
            </span>
          </div>
        </div>

        {/* Tactical Pitch View */}
        <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full shrink-0">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-secondary" />
              <span>{selectedGw ? `GW ${selectedGw} Lineup` : "Current Squad"}</span>
            </h3>
            {selectedGw && (
              <button
                onClick={() => setSelectedGw(null)}
                className="text-[9px] font-bold text-secondary hover:underline cursor-pointer"
              >
                Reset to Current
              </button>
            )}
          </div>

          <div className="relative w-full rounded-3xl overflow-hidden border border-border shadow-card bg-background min-h-[560px] flex flex-col">
            <div className="pitch-bg">
              <img src="/pitch.png" className="pitch-image-layer" alt="Tactical pitch layout" />
            </div>

            <div className={`absolute top-0 inset-x-0 ${activeBench && activeBench.length > 0 ? "bottom-[110px]" : "bottom-0"} z-10 pointer-events-none flex flex-col justify-evenly py-3 md:py-6 px-2 sm:px-4`}>
              {activeStarting && (["GK", "DEF", "MID", "FWD"] as const).map((pos) => {
                const players = activeStarting[pos] || [];
                return (
                  <div key={pos} className={`flex w-full ${getRowJustify(players.length)} pointer-events-auto`}>
                    {players.map((player) => {
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

            {activeBench && activeBench.length > 0 && (
              <div className="absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border flex justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
                {activeBench.map((player, idx) => {
                  const label = player.position === "GK" ? "GK" : `${player.subNumber || idx + 1}. ${player.position}`;
                  const enrichedPlayer = { ...player, price: getPlayerPrice(player) };
                  return (
                    <div key={player.id} className="flex flex-col items-center relative rounded-xl p-0.5 transition-all hover:scale-105 duration-300 shrink-0 min-w-[64px]">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 select-none">{label}</span>
                      <PitchPlayerCard player={enrichedPlayer} showPriceAndPoints={true} isSmall={true} onClick={() => handlePlayerClick(player)} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Squad Position Contribution Breakdown */}
        <div className="max-w-2xl mx-auto w-full shrink-0">
          <SquadPositionBreakdown starting={activeStarting} />
        </div>

        {/* Performance Trend Chart */}
        <div className="max-w-2xl mx-auto w-full shrink-0">
          <ManagerRankTrendChart history={history || []} currentGwPoints={gwPoints} totalPoints={totalPoints} />
        </div>

        {/* Gameweek History Navigator */}
        <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full shrink-0">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-xs font-black uppercase text-text-muted tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-secondary" />
              <span>Gameweek History</span>
            </h3>
            <span className="text-[9px] font-bold text-text-muted">Tap GW to view pitch</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-0.5">
            {history ? [...history].sort((a, b) => b.gameweek - a.gameweek).map((h: any) => {
              const isSelected = selectedGw === h.gameweek;
              return (
                <button
                  key={h.gameweek}
                  onClick={() => setSelectedGw(isSelected ? null : h.gameweek)}
                  className={`flex flex-col items-center justify-center min-w-[80px] rounded-xl py-2.5 px-3 border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-secondary/20 border-secondary text-white shadow-md shadow-secondary/20 scale-105"
                      : "bg-surface hover:bg-white/5 border border-border/40 hover:border-secondary/50"
                  }`}
                >
                  <span className="text-[9px] text-text-muted font-black uppercase tracking-wider">GW {h.gameweek}</span>
                  <span className="text-xs font-black text-secondary mt-0.5 font-mono">{h.points} pts</span>
                </button>
              );
            }) : null}
          </div>
        </div>

        {/* Player Values & Squad Valuation Card */}
        <div className="max-w-2xl mx-auto w-full shrink-0 mb-6">
          <SquadValueStatsCard starting={activeStarting} bench={activeBench} />
        </div>
      </div>

      {/* WEBVIEW SPLIT CONTAINER (Visible on lg+) */}
      <div className="hidden lg:flex flex-1 flex-row h-full min-h-0 overflow-hidden gap-3 p-3">
        
        {/* LEFT SIDE PANEL (Manager Profile & Stats) */}
        <div className="w-80 xl:w-96 shrink-0 bg-surface border border-border/80 rounded-3xl p-4 shadow-card overflow-y-auto space-y-4">
          {/* Header Info */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate({ to: "/standings" })}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-background hover:bg-elevated border border-border text-text-primary active:scale-95 transition-all cursor-pointer shrink-0 shadow-inner"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4 text-text-muted" />
              </button>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-black text-text-primary tracking-tight truncate">
                  Manager Overview
                </h2>
                <p className="text-[11px] text-text-muted font-medium truncate">
                  Team details & squad lineup
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowCompareModal(true)}
              className="flex items-center gap-1 bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 text-secondary rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shrink-0"
              title="Compare with My Team"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>Compare</span>
            </button>
          </div>

          {/* Profile Card */}
          <div className="bg-background/60 border border-border/60 rounded-2xl p-3.5 flex items-center gap-3">
            {logo ? (
              <div className="w-13 h-13 rounded-full flex items-center justify-center overflow-hidden bg-white/5 border border-white/10 shrink-0">
                <img src={logo} alt={`${teamName} logo`} className="w-12 h-12 object-contain" />
              </div>
            ) : (
              <div className={`w-13 h-13 rounded-full bg-gradient-to-br ${crest.bgGradient} flex items-center justify-center text-xl font-black text-white shadow-lg border border-white/10 shrink-0`}>
                {crest.letter}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black text-text-primary truncate">{teamName}</h3>
                <span className="text-[9px] font-black text-secondary bg-secondary/15 border border-secondary/30 px-1.5 py-0.5 rounded-md font-mono shrink-0">
                  {formation}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-text-muted mt-0.5 font-semibold">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{managers}</span>
              </div>
            </div>
          </div>

          {/* 3-Stat Metric Grid */}
          <div className="grid grid-cols-3 gap-1.5 bg-background/50 border border-border/60 rounded-2xl p-3 text-center">
            <div>
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Rank</span>
              <span className="text-sm font-black text-text-primary font-mono mt-0.5 block">#{rank}</span>
            </div>
            <div className="border-l border-border/50">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">Total</span>
              <span className="text-sm font-black text-text-primary font-mono mt-0.5 block">{totalPoints}</span>
            </div>
            <div className="border-l border-border/50">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider block">GW Score</span>
              <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">{activeGwScore}</span>
            </div>
          </div>

          {/* Squad Position Contribution Breakdown */}
          <SquadPositionBreakdown starting={activeStarting} />

          {/* Performance Trend Chart */}
          <ManagerRankTrendChart history={history || []} currentGwPoints={gwPoints} totalPoints={totalPoints} />

          {/* Gameweek History Section */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Gameweek History</span>
              {selectedGw && (
                <button
                  onClick={() => setSelectedGw(null)}
                  className="text-[10px] font-bold text-secondary hover:underline cursor-pointer"
                >
                  Reset Pitch
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {history ? [...history].sort((a, b) => b.gameweek - a.gameweek).map((h: any) => {
                const isSelected = selectedGw === h.gameweek;
                return (
                  <button
                    key={h.gameweek}
                    onClick={() => setSelectedGw(isSelected ? null : h.gameweek)}
                    className={`flex items-center justify-between border rounded-xl p-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-secondary/20 border-secondary text-white shadow-sm"
                        : "bg-background/50 hover:bg-elevated border-border/60 hover:border-secondary"
                    }`}
                  >
                    <span className="text-xs font-extrabold text-text-primary">GW {h.gameweek}</span>
                    <span className="text-xs font-black text-secondary font-mono">{h.points} pts</span>
                  </button>
                );
              }) : null}
            </div>
          </div>

          {/* Player Values & Squad Valuation Card */}
          <SquadValueStatsCard starting={activeStarting} bench={activeBench} />
        </div>

        {/* RIGHT SIDE PANEL (Current Squad Pitch View) */}
        <div className="flex-1 flex flex-col min-h-0 h-full overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row gap-3 max-w-3xl mx-auto w-full h-full min-h-0 animate-in fade-in duration-300">
            {/* Pitch Card */}
            <div className="relative flex-1 rounded-3xl overflow-hidden border border-border shadow-card bg-background h-full flex flex-col">
              {/* Pitch image layer */}
              <div className="pitch-bg">
                <img src="/pitch.png" className="pitch-image-layer" alt="Tactical pitch layout" />
              </div>

              {/* Starting XI Players - Centered on Pitch */}
              <div className="absolute inset-0 bottom-[110px] lg:bottom-0 z-10 pointer-events-none flex flex-col justify-evenly py-3 md:py-6 px-2 sm:px-4">
                {activeStarting && (["GK", "DEF", "MID", "FWD"] as const).map((pos) => {
                  const players = activeStarting[pos] || [];
                  return (
                    <div key={pos} className={`flex w-full ${getRowJustify(players.length)} pointer-events-auto`}>
                      {players.map((player) => {
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
              {activeBench && activeBench.length > 0 && (
                <div className="flex lg:hidden absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
                  {activeBench.map((player, idx) => {
                    const label = player.position === "GK" ? "GK" : `${player.subNumber || idx + 1}. ${player.position}`;
                    const enrichedPlayer = { ...player, price: getPlayerPrice(player) };
                    return (
                      <div key={player.id} className="flex flex-col items-center relative rounded-xl p-0.5 transition-all hover:scale-105 duration-300 shrink-0 min-w-[64px]">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 select-none">{label}</span>
                        <PitchPlayerCard player={enrichedPlayer} showPriceAndPoints={true} isSmall={true} onClick={() => handlePlayerClick(player)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Dedicated Webview Bench Side Card (Visible ONLY on webview lg+) */}
            {activeBench && activeBench.length > 0 && (
              <div className="hidden lg:flex lg:flex-col lg:w-28 shrink-0 bg-surface border border-border rounded-3xl p-3 shadow-card justify-around items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider text-center border-b border-border/60 pb-2 w-full">
                  Substitutes
                </span>
                {activeBench.map((player, idx) => {
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

      </div>

      {/* Player stats overlay detail modal */}
      {selectedPlayer && (
        <PlayerStatsModal
          open={showOverlay}
          onOpenChange={setShowOverlay}
          player={selectedPlayer}
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
