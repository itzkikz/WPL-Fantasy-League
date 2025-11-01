import React, { useState } from "react";
import StatRow from "../StatRow";
import { Player, PlayerStats } from "../../features/players/types";
import { usePlayerStore } from "../../store/usePlayerStore";

export default function PlayerOverall({
  playerStats,
}: {
  playerStats: PlayerStats;
}) {
  const [activeTab, setActiveTab] = useState<"stats" | "ostats">("stats");

  const { player } = usePlayerStore();

  return (
    <>
      <div className="flex-none border-b border-[#ebe5eb] dark:border-[#541e5d] px-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-3 text-sm font-semibold relative ${
              activeTab === "stats" ? "" : "text-[#ebe5eb] dark:text-[#541e5d]"
            }`}
          >
            GW {player?.gw} Stats
            {activeTab === "stats" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("ostats")}
            className={`py-3 text-sm font-semibold relative ${
              activeTab === "ostats" ? "" : "text-[#ebe5eb] dark:text-[#541e5d]"
            }`}
          >
            Overall Stats
            {activeTab === "ostats" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "stats" && (
          <div className="px-6 py-4">
            <h3 className="text-lg font-bold mb-4">Game Week Stats</h3>

            <div className="space-y-3">
              <StatRow label="Appearance" value={player?.app} />
              <StatRow label="Clean Sheets" value={player.clean_sheet} />
              <StatRow label="Goals" value={player?.goal} />
              <StatRow label="Assists" value={player?.assist} />
              <StatRow label="Yellow Cards" value={player?.yellow_card} />
              <StatRow label="Red Cards" value={player?.red_card} />
              <StatRow label="Penalty Miss" value={player?.penalty_miss} />
              <StatRow label="Penalty Save" value={player?.penalty_save} />
              <StatRow label="Saves" value={player?.save} />
            </div>
          </div>
        )}
        {activeTab === "ostats" && (
          <div className="px-6 py-4">
            <h3 className="text-lg font-bold mb-4">Season Stats</h3>
            <div className="space-y-3">
              <StatRow label="Starts" value={playerStats?.app} />
              <StatRow label="Clean Sheets" value={playerStats?.clean_sheet} />
              <StatRow label="Goals" value={playerStats?.goal} />
              <StatRow label="Assists" value={playerStats?.assist} />
              <StatRow label="Yellow Cards" value={playerStats?.yellow_card} />
              <StatRow label="Red Cards" value={playerStats?.red_card} />
              <StatRow label="Penalty Miss" value={playerStats?.penalty_miss} />
              <StatRow label="Penalty Save" value={playerStats?.penalty_save} />
              <StatRow label="Saves" value={playerStats?.save} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
