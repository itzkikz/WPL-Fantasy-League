import React, { useState } from "react";
import StatRow from "../StatRow";
import { PlayerStats } from "../../features/players/types";
import { usePlayerStore } from "../../store/usePlayerStore";

export default function PlayerOverall({
  playerStats,
  noGW = false
}: {
  playerStats: PlayerStats;
  noGW: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"stats" | "ostats">(noGW ? "ostats" : "stats");
  const player = usePlayerStore((state) => state.player);

  const renderStats = (data: any) => {
    if (!data) return null;
    return (
      <div className="space-y-6 flex-1 overflow-y-auto pb-6 pr-2 scrollbar-hide">
        
        {/* Playing Time & Overview */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Overview</h4>
          <div className="space-y-1">
            <StatRow label="Starts" value={data?.games?.appearances} border={true} />
            <StatRow label="Minutes Played" value={data?.games?.minutes} border={false} />
          </div>
        </div>

        {/* Attacking */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Attacking</h4>
          <div className="space-y-1">
            <StatRow label="Goals" value={data?.goals?.total} border={true} />
            <StatRow label="Assists" value={data?.goals?.assists} border={true} />
            <StatRow label="Shots (Total)" value={data?.shots?.total} border={true} />
            <StatRow label="Shots (On Target)" value={data?.shots?.on} border={true} />
            <StatRow label="Dribbles (Attempts)" value={data?.dribbles?.attempts} border={true} />
            <StatRow label="Dribbles (Success)" value={data?.dribbles?.success} border={false} />
          </div>
        </div>

        {/* Passing */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Passing & Playmaking</h4>
          <div className="space-y-1">
            <StatRow label="Passes (Total)" value={data?.passes?.total} border={true} />
            <StatRow label="Key Passes" value={data?.passes?.key} border={true} />
            <StatRow label="Pass Accuracy (%)" value={data?.passes?.accuracy} border={false} />
          </div>
        </div>

        {/* Defending */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Defending</h4>
          <div className="space-y-1">
            <StatRow label="Clean Sheets" value={Number(data?.games?.cleansheet) || 0} border={true} />
            <StatRow label="Goals Conceded" value={data?.goals?.conceded} border={true} />
            <StatRow label="Tackles" value={data?.tackles?.total} border={true} />
            <StatRow label="Blocks" value={data?.tackles?.blocks} border={true} />
            <StatRow label="Interceptions" value={data?.tackles?.interceptions} border={false} />
          </div>
        </div>

        {/* Duels & Discipline */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Duels & Discipline</h4>
          <div className="space-y-1">
            <StatRow label="Duels (Total)" value={data?.duels?.total} border={true} />
            <StatRow label="Duels (Won)" value={data?.duels?.won} border={true} />
            <StatRow label="Fouls (Drawn)" value={data?.fouls?.drawn} border={true} />
            <StatRow label="Fouls (Committed)" value={data?.fouls?.committed} border={true} />
            <StatRow label="Offsides" value={data?.offsides} border={true} />
            <StatRow label="Yellow Cards" value={data?.cards?.yellow} border={true} />
            <StatRow label="Red Cards" value={data?.cards?.red} border={false} />
          </div>
        </div>

        {/* Goalkeeping & Penalties */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Goalkeeping & Penalties</h4>
          <div className="space-y-1">
            <StatRow label="Saves" value={data?.goals?.saves} border={true} />
            <StatRow label="Penalty Won" value={data?.penalty?.won} border={true} />
            <StatRow label="Penalty Committed" value={data?.penalty?.commited} border={true} />
            <StatRow label="Penalty Save" value={data?.penalty?.saved} border={true} />
            <StatRow label="Penalty Miss" value={data?.penalty?.missed} border={false} />
          </div>
        </div>

      </div>
    );
  };

  return (
    <>
      {!noGW && (
        <div className="px-6 mt-4 mb-2">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "stats" 
                  ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              GW {player?.gw} Stats
            </button>
            <button
              onClick={() => setActiveTab("ostats")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                activeTab === "ostats" 
                  ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              Season Stats
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden px-6 pt-2">
        {activeTab === "stats" && renderStats(playerStats?.current_week)}
        {activeTab === "ostats" && renderStats(playerStats?.overall)}
      </div>
    </>
  );
}
