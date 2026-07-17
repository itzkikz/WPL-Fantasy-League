import { Player } from "../../../features/players/types";
import { Formation } from "../../../features/standings/types";

interface MyTeamListViewProps {
  startingXI: Formation;
  bench: Player[];
  getPlayerPrice: (player: Player) => string;
  handlePlayerClick?: (player: Player) => void;
}

const MyTeamListView = ({
  startingXI,
  bench,
  getPlayerPrice,
  handlePlayerClick,
}: MyTeamListViewProps) => {
  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card max-w-3xl mx-auto flex-1 min-h-0 flex flex-col animate-in fade-in duration-300 w-full">
      <div className="overflow-y-auto overflow-x-auto flex-1 max-h-[calc(100vh-380px)] lg:max-h-[calc(100vh-230px)]">
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
            {/* Starting XI Flattened */}
            {Object.entries(startingXI).flatMap(([pos, players]) =>
              (players || []).map((player) => (
                <tr
                  key={player.id}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => handlePlayerClick?.(player)}
                >
                  <td className="py-3.5 px-4 font-bold text-white flex flex-col justify-center gap-0.5">
                    <div className="flex items-center gap-2">
                      <span>{player.name}</span>
                      {player.isCaptain && <span className="bg-amber-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono">C</span>}
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
            {/* Bench Players */}
            {bench.map((player, idx) => {
              const label = player.position === "GK" ? "GK" : `${player.subNumber || idx}. ${player.position}`;
              return (
                <tr
                  key={player.id}
                  className="hover:bg-white/5 transition-colors bg-black/10 cursor-pointer"
                  onClick={() => handlePlayerClick?.(player)}
                >
                  <td className="py-3.5 px-4 font-bold text-text-muted flex flex-col justify-center gap-0.5">
                    <span>{player.name}</span>
                    <span className="text-[10px] font-semibold text-text-muted/50 uppercase tracking-wider">
                      {player.position} • {player.team}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-400">{getPlayerPrice(player)}</td>
                  <td className="py-3.5 px-4 text-center text-[var(--color-success-bright)]/85 font-mono font-extrabold">{player.point}</td>
                  <td className="py-3.5 px-4 text-center"><span className="text-[10px] text-gray-400 font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10">Bench ({label})</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MyTeamListView;
