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
      <div className="overflow-y-auto overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse text-xs md:text-sm">
          <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_rgba(45,27,84,0.4)]">
            <tr className="bg-card border-b border-border text-text-muted uppercase tracking-wider font-extrabold text-[10px]">
              <th className="py-3 px-4">Player</th>
              <th className="py-3 px-4 text-center">Price</th>
              <th className="py-3 px-4 text-center">Points</th>
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
                  <td className="py-3 px-4 font-bold text-white">
                    <div className="flex items-center gap-3">
                      {/* Player Image Thumbnail */}
                      <div
                        className="w-9 h-9 rounded-full border overflow-hidden bg-indigo-950 flex items-center justify-center shrink-0 shadow-sm"
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
                          {player.isCaptain && <span className="bg-amber-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono shrink-0">C</span>}
                          {player.isViceCaptain && <span className="bg-text-muted text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center font-mono shrink-0">V</span>}
                        </div>
                        <span className="text-[10px] font-semibold text-text-muted/70 uppercase tracking-wider">
                          {player.position} • {player.team}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">{getPlayerPrice(player)}</td>
                  <td className="py-3.5 px-4 text-center text-[var(--color-success-bright)] font-mono font-extrabold">{player.point}</td>
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
                  <td className="py-3 px-4 font-bold text-text-muted">
                    <div className="flex items-center gap-3">
                      {/* Player Image Thumbnail */}
                      <div
                        className="w-9 h-9 rounded-full border overflow-hidden bg-indigo-950 flex items-center justify-center shrink-0 shadow-sm opacity-70"
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
                        <span className="truncate">{player.name}</span>
                        <span className="text-[10px] font-semibold text-text-muted/50 uppercase tracking-wider">
                          {player.position} • {player.team}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-400">{getPlayerPrice(player)}</td>
                  <td className="py-3.5 px-4 text-center text-[var(--color-success-bright)]/85 font-mono font-extrabold">{player.point}</td>
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
