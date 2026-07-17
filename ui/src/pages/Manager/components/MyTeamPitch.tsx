import PitchPlayerCard from "../../../components/PitchPlayerCard";
import { Player } from "../../../features/players/types";
import { Formation } from "../../../features/standings/types";

interface MyTeamPitchProps {
  startingXI: Formation;
  bench: Player[];
  substituteMode: boolean;
  swapSourcePlayer: Player | null;
  onCancelSubstitute: () => void;
  handlePlayerClick: (player: Player) => void;
  getPlayerCardClass: (player: Player) => string;
  getPlayerPrice: (player: Player) => string;
  getPlayerLeftOffset: (position: string, index: number, total: number) => string;
  getPlayerTopOffset: (position: string) => string;
}

const MyTeamPitch = ({
  startingXI,
  bench,
  substituteMode,
  swapSourcePlayer,
  onCancelSubstitute,
  handlePlayerClick,
  getPlayerCardClass,
  getPlayerPrice,
  getPlayerLeftOffset,
  getPlayerTopOffset,
}: MyTeamPitchProps) => {
  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-border shadow-card bg-background h-[530px] shrink-0 flex flex-col">
      {/* Pitch image layer */}
      <div className="pitch-bg">
        <img
          src="/pitch.png"
          className="pitch-image-layer"
          alt="Tactical pitch layout"
        />
      </div>
 
      {/* Substitution Mode Bar */}
      {substituteMode && swapSourcePlayer && (
        <div className="absolute top-3 inset-x-3 bg-amber-500/90 backdrop-blur-md border border-amber-600/30 rounded-xl px-4 py-2 flex items-center justify-between z-30 shadow-lg animate-in fade-in slide-in-from-top-2">
          <span className="text-[11px] font-bold text-white">
            Substituting <span className="underline font-extrabold">{swapSourcePlayer.name}</span>: Select swap target.
          </span>
          <button
            onClick={onCancelSubstitute}
            className="bg-black/30 hover:bg-black/50 text-white font-bold rounded-lg px-2.5 py-1 text-[9px] uppercase cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
 
      {/* Players Overlay */}
      <div className="absolute top-0 inset-x-0 bottom-[110px] z-10 pointer-events-none">
        {Object.entries(startingXI).map(([pos, linePlayers]) => {
          const players = linePlayers || [];
          return players.map((player, idx) => {
            const left = getPlayerLeftOffset(pos, idx, players.length);
            const top = getPlayerTopOffset(pos);
 
            // Enrich player with mock price for display
            const enrichedPlayer = {
              ...player,
              price: getPlayerPrice(player),
            };
 
            return (
              <div
                key={player.id}
                style={{ left, top }}
                className={`player-spot pointer-events-auto rounded-xl p-0.5 transition-all ${getPlayerCardClass(player)}`}
              >
                <PitchPlayerCard
                  player={enrichedPlayer}
                  showPriceAndPoints={true}
                  isSmall={false}
                  onClick={() => handlePlayerClick(player)}
                />
              </div>
            );
          });
        })}
      </div>
 
      {/* Bench Strip Container inside the Pitch Card */}
      <div className="absolute bottom-0 inset-x-0 h-[110px] bg-surface/95 backdrop-blur-md border-t border-border flex justify-around items-center px-4 z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
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
              {/* Position Tag on Top */}
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
  );
};

export default MyTeamPitch;
