import React from "react";
import { Player, PlayerStats } from "../../features/players/types";
import { mapPosition } from "../../libs/helpers/lineupFormatter"

export default function PlayerInfo({
  player,
  playerStats,
}: {
  player: Player;
  playerStats: PlayerStats;
}) {
  return (
    <div
      className="relative px-6 pt-12 pb-6 rounded-t-3xl overflow-hidden shadow-lg flex-none"
      style={{
        background: `linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)`,
        color: "var(--color-text-primary)"
      }}
    >
      {/* Decorative Background Element */}
      <div
        className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl -mr-20 -mt-20 pointer-events-none"
        style={{ backgroundColor: "var(--color-text-primary)" }}
      ></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">

        {/* Left Side: Photo, Name & Team */}
        <div className="flex-1 flex flex-row items-center md:items-end gap-4">

          {/* Player Photo (If available) */}
          {(player?.photo || playerStats?.photo) && (
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-lg flex-shrink-0 bg-white/10 backdrop-blur-md">
              <img
                src={`${(player?.photo || playerStats?.photo)?.replace('.jpg', '.png')}`}
                alt={player?.name || playerStats?.player_name}
                className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="flex-1">
            <div className="inline-block px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-xs font-bold uppercase tracking-wider mb-2 md:mb-3">
              {player?.position?.length === 1 ? mapPosition(player.position) : (player?.position || playerStats?.position)}
            </div>

            <div className="leading-tight mb-2">
              <h2 className="text-xl md:text-2xl font-medium opacity-90">
                {player?.name?.split(" ")[0] || playerStats?.player_name?.split(" ")[0]}
              </h2>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight line-clamp-1">
                {player?.name?.split(" ").slice(1).join(" ") || playerStats?.player_name?.split(" ").slice(1).join(" ")}
              </h2>
            </div>

            <p className="text-sm md:text-base opacity-80 font-medium">
              {player?.fullTeamName || player?.team || playerStats?.club}
            </p>
          </div>
        </div>

        {/* Right Side: Stats Summary */}
        <div className="flex-none flex flex-row md:flex-col gap-4 md:gap-1 md:text-right items-end md:items-end justify-between border-t border-black/10 md:border-t-0 pt-4 md:pt-0">

          <div className="flex flex-col items-start md:items-end">
            <div className="text-sm uppercase tracking-wider opacity-70 font-semibold mb-0.5">Total Pts</div>
            <h2 className="text-4xl font-black leading-none">
              {playerStats?.overall?.total_point}
            </h2>
          </div>

          <div className="flex flex-col items-end gap-1 mt-2">
            <div className="flex items-center gap-2 bg-black/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <span className="opacity-70 text-xs uppercase font-bold tracking-wider">Avg</span>
              <span className="font-bold text-sm">
                {((playerStats?.overall?.total_point || 0) / (playerStats?.overall?.appearances || 1)).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-black/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
              <span className="opacity-70 text-xs uppercase font-bold tracking-wider">Price</span>
              <span className="font-bold text-sm">£{playerStats?.price}m</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
