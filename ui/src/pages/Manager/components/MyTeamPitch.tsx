import PitchPlayerCard from "../../../components/PitchPlayerCard";
import { Player } from "../../../features/players/types";
import { Formation } from "../../../features/standings/types";
import { X } from "lucide-react";

interface MyTeamPitchProps {
  startingXI: Formation;
  bench: Player[];
  substituteMode: boolean;
  swapSourcePlayer: Player | null;
  onCancelSubstitute: () => void;
  handlePlayerClick: (player: Player) => void;
  getPlayerCardClass: (player: Player) => string;
  getPlayerPrice: (player: Player) => string;
}

const getRowJustify = (count: number) => {
  if (count <= 1) return "justify-center";
  return "justify-evenly";
};

const MyTeamPitch = ({
  startingXI,
  bench,
  substituteMode,
  swapSourcePlayer,
  onCancelSubstitute,
  handlePlayerClick,
  getPlayerCardClass,
  getPlayerPrice,
}: MyTeamPitchProps) => {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-3 max-w-3xl mx-auto w-full lg:h-full min-h-0">
      {/* 1. Main Pitch Card (Centered Starting XI) */}
      {/* Mobile: min-height keeps the full pitch + bench visible so the page scrolls instead of clipping */}
      <div className="relative flex-1 rounded-3xl overflow-hidden border border-border bg-background flex flex-col min-h-[560px] sm:min-h-[600px] lg:min-h-0 lg:h-full">
        {/* Pitch image layer */}
        <div className="pitch-bg">
          <img
            src="/pitch.png"
            className="pitch-image-layer"
            alt="Tactical pitch layout"
          />
        </div>

        {/* Cancel Sub Button - top right of pitch */}
        {substituteMode && swapSourcePlayer && (
          <button
            onClick={onCancelSubstitute}
            className="absolute top-3 right-3 z-30 flex items-center gap-1.5 min-h-[40px] px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold cursor-pointer active:scale-95 transition-all shadow-lg text-[11px] md:text-xs"
            aria-label="Cancel substitution"
          >
            <X className="w-4 h-4" />
            Cancel Sub
          </button>
        )}

        {/* Starting XI Overlay - Centered on Pitch Image */}
        <div className="absolute inset-0 bottom-[110px] lg:bottom-0 z-10 pointer-events-none flex flex-col justify-evenly py-3 md:py-6 px-2 sm:px-4 md:px-6">
          {Object.entries(startingXI).map(([pos, linePlayers]) => {
            const players = linePlayers || [];
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
                      className={`rounded-xl p-0.5 transition-all ${getPlayerCardClass(player)}`}
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
        <div className="flex lg:hidden absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border justify-around items-center px-3 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
          {bench.map((player, idx) => {
            const label = player.position === "GK" ? "GK" : `${player.subNumber || idx}. ${player.position}`;
            const enrichedPlayer = {
              ...player,
              price: getPlayerPrice(player),
            };

            return (
              <div
                key={player.id}
                className={`flex flex-col items-center relative rounded-xl p-0.5 transition-all shrink-0 min-w-[76px] ${getPlayerCardClass(player)}`}
              >
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 select-none">
                  {label}
                </span>
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
      </div>

      {/* 2. Dedicated Webview Bench Side Card (Visible ONLY on desktop lg+) */}
      {bench && bench.length > 0 && (
        <div className="hidden lg:flex lg:flex-col lg:w-32 shrink-0 bg-surface border border-border rounded-3xl p-3 shadow-card justify-around items-center">
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
                className={`flex flex-col items-center relative rounded-xl p-0.5 transition-all ${getPlayerCardClass(player)}`}
              >
                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1 select-none">
                  {label}
                </span>
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
      )}
    </div>
  );
};

export default MyTeamPitch;
