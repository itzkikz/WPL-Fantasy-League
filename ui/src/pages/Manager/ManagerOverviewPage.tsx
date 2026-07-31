import { useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, ShieldAlert, Users } from "lucide-react";
import { useManagerOverview } from "../../features/standings/hooks";
import PitchPlayerCard from "../../components/PitchPlayerCard";
import PlayerStatsModal from "../Standings/components/PlayerStatsModal";
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

  // Query overview details
  const { data, isLoading, isError } = useManagerOverview(teamId);

  const { teamName, managers, rank, totalPoints, gwPoints, currentSquad, history } = data || {};
  const { starting, bench } = currentSquad || {};

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
    <div className="flex flex-col w-full flex-1 h-full min-h-0 bg-background text-white font-outfit select-none overflow-hidden pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-0">

      {/* MOBILE CONTAINER (Visible on mobile < lg) */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 py-3 gap-5 lg:hidden">
        {/* Manager Header Profile Panel */}
        <div className="bg-surface border border-border rounded-2xl p-3 md:p-4 shadow-card flex flex-row items-center max-w-2xl mx-auto w-full gap-3 md:gap-4 shrink-0 text-left">
          <button
            onClick={() => navigate({ to: "/standings" })}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-background hover:bg-white/5 border border-border text-white active:scale-95 transition-all cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-text-muted" />
          </button>
          <div className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${crest.bgGradient} flex items-center justify-center text-xl md:text-2xl font-black text-white shadow-lg border border-white/10 shrink-0`}>
            {crest.letter}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm md:text-base font-black tracking-tight text-white truncate">{teamName}</h2>
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-text-muted mt-0.5 font-semibold">
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Managed By : {managers}</span>
            </div>
          </div>
        </div>

        {/* Statistics Metric Card Grid */}
        <div className="grid grid-cols-3 gap-2 max-w-2xl mx-auto w-full shrink-0">
          <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col items-center justify-center text-center">
            <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Overall Rank</span>
            <span className="text-sm md:text-lg font-black text-white mt-1 font-mono">
              #{rank}
            </span>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col items-center justify-center text-center border-l border-border/50">
            <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Total Points</span>
            <span className="text-sm md:text-lg font-black text-white mt-1 font-mono">
              {totalPoints} pts
            </span>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-4 shadow-card flex flex-col items-center justify-center text-center border-l border-border/50">
            <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Points</span>
            <span className="text-sm md:text-lg font-black text-[var(--color-success-bright)] mt-1 font-mono">
              {gwPoints} pts
            </span>
          </div>
        </div>

        {/* Pitch View */}
        <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full shrink-0">
          <h3 className="text-xs font-black uppercase text-text-muted tracking-wider pl-1.5">
            Current Squad
          </h3>
          <div className="relative w-full rounded-3xl overflow-hidden border border-border shadow-card bg-background min-h-[560px] flex flex-col">
            <div className="pitch-bg">
              <img src="/pitch.png" className="pitch-image-layer" alt="Tactical pitch layout" />
            </div>

            <div className={`absolute top-0 inset-x-0 ${bench && bench.length > 0 ? "bottom-[110px]" : "bottom-0"} z-10 pointer-events-none flex flex-col justify-evenly py-3 md:py-6 px-2 sm:px-4`}>
              {starting && (["GK", "DEF", "MID", "FWD"] as const).map((pos) => {
                const players = starting[pos] || [];
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

            {bench && bench.length > 0 && (
              <div className="absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border flex justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
                {bench.map((player, idx) => {
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

        {/* Gameweek History */}
        <div className="flex flex-col gap-2.5 max-w-2xl mx-auto w-full shrink-0 mb-6">
          <h3 className="text-xs font-black uppercase text-text-muted tracking-wider pl-1.5">
            Gameweek History
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-0.5">
            {history ? [...history].sort((a, b) => b.gameweek - a.gameweek).map((h: any) => (
              <button
                key={h.gameweek}
                onClick={() => navigate({ to: "/gameweek-breakdown", search: { gw: h.gameweek, teamId } })}
                className="flex flex-col items-center justify-center min-w-[90px] bg-surface hover:bg-white/5 border border-border/40 hover:border-secondary rounded-2xl py-3.5 px-4 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-[10px] text-text-muted font-black uppercase tracking-wider">GW {h.gameweek}</span>
                <span className="text-sm font-black text-secondary mt-1 font-mono">{h.points} pts</span>
              </button>
            )) : null}
          </div>
        </div>
      </div>

      {/* WEBVIEW SPLIT CONTAINER (Visible on lg+) */}
      <div className="hidden lg:flex flex-1 flex-row h-full min-h-0 overflow-hidden gap-3 p-3">
        
        {/* LEFT SIDE PANEL (Manager Profile & Stats) */}
        <div className="w-80 xl:w-96 shrink-0 bg-surface border border-border/80 rounded-3xl p-5 shadow-card overflow-y-auto space-y-5">
          {/* Header Info */}
          <div className="flex items-center gap-3.5 pb-4 border-b border-border/60">
            <button
              onClick={() => navigate({ to: "/standings" })}
              className="flex items-center justify-center w-10 h-10 rounded-2xl bg-background hover:bg-white/10 border border-border text-white active:scale-95 transition-all cursor-pointer shrink-0 shadow-inner"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-text-muted" />
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black text-white tracking-tight truncate">
                Manager Overview
              </h2>
              <p className="text-xs text-text-muted font-medium truncate">
                Team details & squad lineup
              </p>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-background/60 border border-border/60 rounded-2xl p-4 flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${crest.bgGradient} flex items-center justify-center text-2xl font-black text-white shadow-lg border border-white/10 shrink-0`}>
              {crest.letter}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-white truncate">{teamName}</h3>
              <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5 font-semibold">
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{managers}</span>
              </div>
            </div>
          </div>

          {/* 3-Stat Metric Grid */}
          <div className="grid grid-cols-3 gap-2 bg-background/50 border border-border/60 rounded-2xl p-3.5 text-center">
            <div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Rank</span>
              <span className="text-base font-extrabold text-white font-mono mt-0.5 block">#{rank}</span>
            </div>
            <div className="border-l border-border/50">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Total</span>
              <span className="text-base font-extrabold text-white font-mono mt-0.5 block">{totalPoints}</span>
            </div>
            <div className="border-l border-border/50">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">GW Score</span>
              <span className="text-base font-extrabold text-[var(--color-success-bright)] font-mono mt-0.5 block">{gwPoints}</span>
            </div>
          </div>

          {/* Gameweek History Section */}
          <div className="space-y-3 pt-2 border-t border-border/60">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Gameweek History</span>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
              {history ? [...history].sort((a, b) => b.gameweek - a.gameweek).map((h: any) => (
                <button
                  key={h.gameweek}
                  onClick={() => navigate({ to: "/gameweek-breakdown", search: { gw: h.gameweek, teamId } })}
                  className="flex items-center justify-between bg-background/50 hover:bg-white/5 border border-border/60 hover:border-secondary rounded-xl p-2.5 transition-all cursor-pointer text-left"
                >
                  <span className="text-xs font-extrabold text-white">GW {h.gameweek}</span>
                  <span className="text-xs font-black text-secondary font-mono">{h.points} pts</span>
                </button>
              )) : null}
            </div>
          </div>
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
                {starting && (["GK", "DEF", "MID", "FWD"] as const).map((pos) => {
                  const players = starting[pos] || [];
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
              {bench && bench.length > 0 && (
                <div className="flex lg:hidden absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
                  {bench.map((player, idx) => {
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
            {bench && bench.length > 0 && (
              <div className="hidden lg:flex lg:flex-col lg:w-28 shrink-0 bg-surface border border-border rounded-3xl p-3 shadow-card justify-around items-center">
                <span className="text-[10px] font-black text-text-muted uppercase tracking-wider text-center border-b border-border/60 pb-2 w-full">
                  Substitutes
                </span>
                {bench.map((player, idx) => {
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
    </div>
  );
};

export default ManagerOverviewPage;
