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
      className={`relative px-6 pt-6 pb-4 rounded-t-3xl`}
      style={{ backgroundColor: player?.teamColor || "#000000", color: player?.teamTextColor || "#ffffff" }}
    >
      <div className="flex items-start gap-4 mt-8">
        {/* Player Details */}
        <div className="flex-1 pt-4">
          {/* Player Image - adjusted layout */}
          <div className="mb-2">
            <img
              src={`https://bqyqpmeugdydxbcteohm.supabase.co/storage/v1/object/public/images/players/${player?.id}.png`}
              alt={player?.name}
              className="w-20 h-20 object-cover rounded-full border-2 border-white/20 bg-white drop-shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/player-placeholder.png';
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <p className="text-sm font-medium mb-1">{player.position.length === 1 ? mapPosition(player.position) : player?.position}</p>
          <h2 className="text-2xl font-bold mb-1">
            {player?.name?.split(" ")[0] || playerStats?.player_name.split(" ")[0]}
          </h2>
          <h2 className="text-3xl font-bold mb-2">
            {player?.name?.split(" ").slice(1).join(" ") || playerStats?.player_name.split(" ").slice(1).join(" ")}
          </h2>
          <p className="text-sm">{player.fullTeamName || player.team || playerStats?.club}</p>
        </div>

        <div className="flex-1 pt-4">
          <h2 className="text-right text-5xl font-bold mb-1">
            {playerStats?.total_point}
            <span className="text-sm text-right">Pts</span>
          </h2>
          <h2 className="text-right text-3xl font-bold mb-2">
            {(playerStats?.total_point / playerStats?.app || 0).toFixed(2)}
            <span className="text-sm text-right">
              {"  "}
              Pts/Match
            </span>
          </h2>
          <h1 className="text-right text-xl">£{playerStats?.price}m</h1>
          <h1 className="text-right text-base">£{playerStats?.release_value}m(Selling Price)</h1>
        </div>
      </div>
    </div>
  );
}
