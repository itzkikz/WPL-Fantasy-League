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
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-border shadow-card bg-background flex-1 min-h-[500px] flex flex-col">
      {/* Pitch image layer */}
      <div className="pitch-bg">
        <img
          src="/pitch.png"
          className="pitch-image-layer"
          alt="Tactical pitch layout"
        />
      </div>

      {/* Players Area - flex column with equal row spacing */}
      <div className="relative flex-1 flex flex-col justify-evenly z-10 pointer-events-none px-2 sm:px-4 md:px-8 py-3 md:py-6">
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

      {/* Bench Strip - auto-sized to content */}
      <div className="shrink-0 bg-surface/95 backdrop-blur-md border-t border-border z-20 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] overflow-x-auto scrollbar-hide">
        <div className="flex justify-evenly items-center px-3 md:px-4 py-2 gap-0 md:gap-0 min-w-max md:min-w-0">
          {bench.map((player, idx) => {
            const label = player.position === "GK" ? "GK" : `${player.subNumber || idx}. ${player.position}`;
            const enrichedPlayer = {
              ...player,
              price: getPlayerPrice(player),
            };

            return (
              <div
                key={player.id}
                className={`flex flex-col items-center relative rounded-xl p-0.5 transition-all shrink-0 min-w-[64px] ${getPlayerCardClass(player)}`}
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
    </div>
  );
};

export default MyTeamPitch;
