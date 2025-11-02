import React from "react";
import { Player, PlayerStats } from "../../features/players/types";

export default function PlayerInfo({
  player,
  playerStats,
}: {
  player: Player;
  playerStats: PlayerStats;
}) {
  return (
    <div
      className={`relative px-6 pt-6 pb-4 rounded-t-3xl text-white`}
      style={{ backgroundColor: player?.teamColor }}
    >
      <div className="flex items-start gap-4 mt-8">
        {/* Player Details */}
        <div className="flex-1 pt-4">
          <p className="text-sm font-medium mb-1">{player.position}</p>
          <h2 className="text-2xl font-bold mb-1">
            {player.name.split(" ")[0]}
          </h2>
          <h2 className="text-3xl font-bold mb-2">
            {player.name.split(" ").slice(1).join(" ")}
          </h2>
          <p className="text-sm">{player.fullTeamName || player.team}</p>
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
        </div>
      </div>
    </div>
  );
}
