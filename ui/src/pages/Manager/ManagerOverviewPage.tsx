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

  // Generate large color/emoji logo crest from team name
  const getOverviewCrest = (name: string) => {
    const letter = name ? name.trim().charAt(0).toUpperCase() : "M";
    const colors = [
      "from-indigo-600 to-indigo-950",
      "from-purple-600 to-purple-950",
      "from-violet-600 to-violet-950",
      "from-blue-600 to-blue-950",
      "from-fuchsia-600 to-fuchsia-950",
    ];
    // Hash based on name length or character sum
    const charSum = name ? name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) : 0;
    const bgGradient = colors[charSum % colors.length];
    return { letter, bgGradient };
  };

  const crest = getOverviewCrest(teamName || "");

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-background text-white font-outfit select-none pb-4">
      {/* Header Navigation Bar */}

      {/* Main content scroll container */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 py-3 gap-5">
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

        {/* Current Squad (Pitch View) Container */}
        <div className="flex flex-col gap-2 max-w-2xl mx-auto w-full shrink-0">
          <h3 className="text-xs font-black uppercase text-text-muted tracking-wider pl-1.5">
            Current Squad
          </h3>
          <div className="relative w-full rounded-3xl overflow-hidden border border-border shadow-card bg-background h-[460px] flex flex-col">
            {/* Pitch image layer */}
            <div className="pitch-bg">
              <img
                src="/pitch.png"
                className="pitch-image-layer"
                alt="Tactical pitch layout"
              />
            </div>

            {/* Players Overlay */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-evenly py-3 md:py-6 px-2 sm:px-4">
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
          </div>
        </div>

        {/* Gameweek History Slider Container */}
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
