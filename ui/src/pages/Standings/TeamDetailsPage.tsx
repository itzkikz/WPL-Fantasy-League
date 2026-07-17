import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ViewTransitions } from "../../types/viewTransitions";
import { useTeamDetails } from "../../features/standings/hooks";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft, ChevronDown } from "lucide-react";
import PitchPlayerCard from "../../components/PitchPlayerCard";
import PlayerStatsModal from "./components/PlayerStatsModal";
import { Player } from "../../features/players/types";
import { usePlayerStore } from "../../store/usePlayerStore";
import { getPlayerDisplayPrice } from "../../libs/helpers/player";

// Local CSS styles
import "../Manager/MyTeamPage.css";

const TeamDetailsPage = () => {
  const route = getRouteApi("/standings/$teamId");
  const navigate = useNavigate();
  const { teamId } = route.useParams();

  const [gameWeek, setGameWeek] = useState(0);
  const [activeTab, setActiveTab] = useState<"pitch" | "list">("pitch");
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const { data: teamDetails, isLoading, isSuccess, isError } = useTeamDetails(teamId, gameWeek);

  const { gw, currentGw, avg, highest, totalGWScore, starting, bench, team_name } =
    teamDetails || {};

  // Set local gameweek once data loads for the first time
  useEffect(() => {
    if (isSuccess && teamDetails && gameWeek === 0) {
      setGameWeek(teamDetails.gw || 15);
    }
  }, [isSuccess, teamDetails]);

  const compileTeamTotals = () => {
    const totals = {
      minutes: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      yellowCards: 0,
      redCards: 0,
      penaltyMissed: 0,
      penaltySaved: 0,
      saves: 0,
      tackles: 0,
      clearances: 0,
      blocks: 0,
      recoveries: 0,
    };

    if (!starting) return totals;

    const starters = [
      ...(starting.GK || []),
      ...(starting.DEF || []),
      ...(starting.MID || []),
      ...(starting.FWD || []),
    ];

    starters.forEach((p: any) => {
      const s = p.stats;
      if (s) {
        totals.minutes += s.minutesPlayed || 0;
        totals.goals += s.goals || 0;
        totals.assists += s.goalAssist || 0;
        if (s.cleanSheet > 0 && (p.position === 'GK' || p.position === 'DEF' || p.position === 'MID')) {
          totals.cleanSheets += s.cleanSheet;
        }
        totals.yellowCards += s.yellowCards || 0;
        totals.redCards += s.redCards || 0;
        totals.penaltyMissed += s.penaltyMissed || 0;
        totals.penaltySaved += s.penaltySaved || 0;
        totals.saves += s.saves || 0;
        totals.tackles += s.totalTackle || 0;
        totals.clearances += s.totalClearance || 0;
        totals.blocks += s.outfielderBlock || 0;
        totals.recoveries += s.ballRecovery || 0;
      }
    });

    return totals;
  };

  const handlePlayerOverlay = (eachPlayer: Player | null) => {
    if (eachPlayer) {
      setPlayer(eachPlayer);
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  };

  const handleGoBack = () => {
    navigate({
      to: "/standings",
      viewTransition: ViewTransitions.back,
    });
  };

  const getPlayerPrice = (p: Player) => {
    return getPlayerDisplayPrice(p);
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
      <div className="flex flex-col items-center justify-center h-screen bg-background text-white select-none">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-bold text-secondary">Loading team details...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-rose-400 p-6 text-center select-none">
        <svg className="w-10 h-10 text-rose-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm font-extrabold mb-3">Failed to load team details.</p>
        <button
          onClick={handleGoBack}
          className="bg-primary hover:bg-primary-dark text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-lg shadow-primary/30"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 h-screen bg-background text-white font-outfit select-none pb-4 lg:pb-0">

      {/* 1. Header Panel */}
      <div className="mx-4 mt-3 bg-gradient-card border border-border rounded-2xl overflow-hidden p-4 shadow-card relative shrink-0">
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGoBack}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-text-muted hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base md:text-lg font-black tracking-tight text-white">
                {team_name || "Team Details"}
              </h1>
              <p className="text-[10px] md:text-xs text-text-muted font-medium mt-0.5">
                Viewing manager team line-up for Gameweek {gw}
              </p>
            </div>
          </div>

          {/* Gameweek Selector */}
          <div className="flex items-center bg-background border border-border rounded-xl px-2 py-1 shadow-inner">
            <button
              onClick={() => setGameWeek(prev => Math.max(1, prev - 1))}
              disabled={gw <= 1}
              className="p-1 hover:text-secondary active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-0.5 text-xs md:text-sm font-extrabold uppercase tracking-wide text-white min-w-[55px] text-center select-none font-mono">
              GW {gw}
            </span>
            <button
              onClick={() => setGameWeek(prev => Math.min(38, prev + 1))}
              disabled={gw >= 38}
              className="p-1 hover:text-secondary active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-3 gap-1 md:gap-4 mt-3.5 border-t border-border/50 pt-3">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Score</span>
            <span className="text-xs md:text-base lg:text-lg font-extrabold text-[var(--color-success-bright)] mt-0.5">
              {totalGWScore ?? 0}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
            <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Average</span>
            <span className="text-xs md:text-base lg:text-lg font-extrabold text-white mt-0.5">
              {avg ?? 0}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
            <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Highest</span>
            <span className="text-xs md:text-base lg:text-lg font-extrabold text-white mt-0.5">
              {highest ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
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

      {/* 3. Tab Views Container */}
      <div className="mx-4 mt-3 flex-1 scrollbar-hide pb-3 space-y-4">
        {activeTab === "pitch" ? (
          /* Pitch View Container */
          <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-border shadow-card bg-background h-[530px] shrink-0 flex flex-col">
            {/* Pitch image layer */}
            <div className="pitch-bg">
              <img
                src="/pitch.png"
                className="pitch-image-layer"
                alt="Tactical pitch layout"
              />
            </div>

            {/* Players Overlay */}
            <div className="absolute top-0 inset-x-0 bottom-[110px] z-10 pointer-events-none">
              {starting && Object.entries(starting).map(([pos, linePlayers]) => {
                const players = linePlayers || [];
                return players.map((player, idx) => {
                  const left = getPlayerLeftOffset(pos, idx, players.length);
                  const top = getPlayerTopOffset(pos);

                  const enrichedPlayer = {
                    ...player,
                    price: getPlayerPrice(player),
                  };

                  return (
                    <div
                      key={player.id}
                      style={{ left, top }}
                      className="player-spot pointer-events-auto rounded-xl p-0.5 transition-all hover:scale-105 duration-300"
                    >
                      <PitchPlayerCard
                        player={enrichedPlayer}
                        showPriceAndPoints={true}
                        isSmall={false}
                        onClick={() => handlePlayerOverlay(player)}
                      />
                    </div>
                  );
                });
              })}
            </div>

            {/* Bench Strip Container inside the Pitch Card */}
            <div className="absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border flex justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
              {(bench || []).map((player, idx) => {
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
                      onClick={() => handlePlayerOverlay(player)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* List View Table */
          <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card max-w-3xl mx-auto shrink-0 flex flex-col animate-in fade-in duration-300 w-full">
            <div className="overflow-y-auto overflow-x-auto flex-1 max-h-[400px]">
              <table className="w-full text-left border-collapse text-xs md:text-sm">
                <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_rgba(45,27,84,0.4)]">
                  <tr className="bg-card border-b border-border text-text-muted uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4 text-center">Price</th>
                    <th className="py-3 px-4 text-center">Points</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 font-medium text-white">
                  {starting && Object.entries(starting).flatMap(([pos, players]) =>
                    (players || []).map((player) => (
                      <tr key={player.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => handlePlayerOverlay(player)}>
                        <td className="py-3.5 px-4 font-bold text-white flex flex-col justify-center gap-0.5">
                          <div className="flex items-center gap-2">
                            <span>{player.name}</span>
                            {player.isCaptain && <span className="bg-secondary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono">C</span>}
                            {player.isViceCaptain && <span className="bg-text-muted text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono">V</span>}
                          </div>
                          <span className="text-[10px] font-semibold text-text-muted/70 uppercase tracking-wider">
                            {player.position} • {player.team}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-white">{getPlayerPrice(player)}</td>
                        <td className="py-3.5 px-4 text-center text-[var(--color-success-bright)] font-mono font-extrabold">{player.point}</td>
                        <td className="py-3.5 px-4 text-center"><span className="text-[10px] text-[var(--color-success-bright)] font-bold px-2 py-0.5 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-bright)]/20">Starting XI</span></td>
                      </tr>
                    ))
                  )}
                  {(bench || []).map((player, idx) => {
                    const label = player.position === "GK" ? "GK" : `${player.subNumber || idx}. ${player.position}`;
                    return (
                      <tr key={player.id} className="hover:bg-white/5 transition-colors bg-black/10 cursor-pointer" onClick={() => handlePlayerOverlay(player)}>
                        <td className="py-3.5 px-4 font-bold text-text-muted flex flex-col justify-center gap-0.5">
                          <span>{player.name}</span>
                          <span className="text-[10px] font-semibold text-text-muted/50 uppercase tracking-wider">
                            {player.position} • {player.team}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-text-muted">{getPlayerPrice(player)}</td>
                        <td className="py-3.5 px-4 text-center text-[var(--color-success-bright)]/85 font-mono font-extrabold">{player.point}</td>
                        <td className="py-3.5 px-4 text-center"><span className="text-[10px] text-text-muted font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10">Bench ({label})</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Team Stats Panel */}
        {starting && (() => {
          const totals = compileTeamTotals();
          const statItems = [
            { label: "Mins", value: totals.minutes, icon: "⏱️" },
            { label: "Goals", value: totals.goals, icon: "⚽" },
            { label: "Assists", value: totals.assists, icon: "🅰️" },
            { label: "CS", value: totals.cleanSheets, icon: "🛡️" },
            { label: "YC", value: totals.yellowCards, icon: "🟨" },
            { label: "RC", value: totals.redCards, icon: "🟥" },
            { label: "Pen Miss", value: totals.penaltyMissed, icon: "❌" },
            { label: "Pen Save", value: totals.penaltySaved, icon: "🧤" },
            { label: "Saves", value: totals.saves, icon: "🧤" },
            { label: "Tackles", value: totals.tackles, icon: "⚔️" },
            { label: "Clearances", value: totals.clearances, icon: "🗑️" },
            { label: "Blocks", value: totals.blocks, icon: "🛡️" },
            { label: "Recoveries", value: totals.recoveries, icon: "🔄" },
          ];

          return (
            <div className="bg-surface border border-border rounded-2xl p-4 max-w-2xl mx-auto w-full shadow-card shrink-0">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-muted mb-3 flex items-center gap-1.5 border-b border-white/5 pb-2">
                Team Stats Breakdown (Starting XI)
              </h3>

              {/* Mobile View: Compact 2 lines */}
              <div className="flex flex-col gap-2 md:hidden">
                <div className="flex items-center justify-between gap-1 text-[10px] bg-[#11091c]/30 rounded-xl p-2 border border-white/5">
                  <span className="flex items-center gap-0.5 shrink-0">⏱️ <strong className="text-white">{totals.minutes}m</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">⚽ <strong className="text-white">{totals.goals}G</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">🅰️ <strong className="text-white">{totals.assists}A</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">🛡️ <strong className="text-white">{totals.cleanSheets}CS</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">🧤 <strong className="text-white">{totals.saves}Sv</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">⚔️ <strong className="text-white">{totals.tackles}T</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">🔄 <strong className="text-white">{totals.recoveries}R</strong></span>
                </div>
                <div className="flex items-center justify-between gap-1 text-[10px] bg-[#11091c]/30 rounded-xl p-2 border border-white/5">
                  <span className="flex items-center gap-0.5 shrink-0">🟨 <strong className="text-white">{totals.yellowCards}YC</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">🟥 <strong className="text-white">{totals.redCards}RC</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">❌ <strong className="text-white">{totals.penaltyMissed}PM</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">🧤 <strong className="text-white">{totals.penaltySaved}PS</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">🗑️ <strong className="text-white">{totals.clearances}C</strong></span>
                  <span className="text-gray-700">|</span>
                  <span className="flex items-center gap-0.5 shrink-0">🛡️ <strong className="text-white">{totals.blocks}B</strong></span>
                </div>
              </div>

              {/* Desktop/Tablet View: Grid layout */}
              <div className="hidden md:grid grid-cols-5 lg:grid-cols-7 gap-2">
                {statItems.map((item, idx) => (
                  <div key={idx} className="bg-[#11091c]/50 border border-white/5 rounded-xl p-2.5 text-center flex flex-col justify-center">
                    <span className="text-sm mb-0.5">{item.icon}</span>
                    <span className="text-[8px] text-text-muted font-bold uppercase truncate">{item.label}</span>
                    <span className="text-xs font-black text-white mt-0.5">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <PlayerStatsModal
        isOpen={showOverlay}
        onClose={() => handlePlayerOverlay(null)}
        player={player}
      />
    </div>
  );
};

export default TeamDetailsPage;
