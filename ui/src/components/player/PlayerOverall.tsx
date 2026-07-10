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

  const passAccuracy = (data: any) => {
    if (!data || !data.totalPass || !data.accuratePass) return null;
    return `${Math.round((data.accuratePass / data.totalPass) * 100)}%`;
  };

  const duelTotal = (data: any) => {
    if (!data) return null;
    return (data.duelWon || 0) + (data.duelLost || 0);
  };

  const renderStats = (data: any) => {
    if (!data) return null;
    return (
      <div className="space-y-6 flex-1 overflow-y-auto pb-6 pr-2 scrollbar-hide">
        
        {/* Playing Time & Overview */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Overview</h4>
          <div className="space-y-1">
            <StatRow label="Appearances" value={data?.appearances ?? "-"} border={true} />
            <StatRow label="Minutes Played" value={data?.minutesPlayed} border={true} />
            <StatRow label="Rating" value={data?.rating != null ? data.rating.toFixed(1) : "-"} border={true} />
            <StatRow label="Touches" value={data?.touches} border={false} />
          </div>
        </div>

        {/* Attacking */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Attacking</h4>
          <div className="space-y-1">
            <StatRow label="Goals" value={data?.goals} border={true} />
            <StatRow label="Assists" value={data?.goalAssist} border={true} />
            <StatRow label="Shots (Total)" value={data?.totalShots} border={true} />
            <StatRow label="Shots (On Target)" value={data?.onTargetScoringAttempt} border={true} />
            <StatRow label="Expected Goals (xG)" value={data?.expectedGoals != null ? data.expectedGoals.toFixed(2) : "-"} border={true} />
            <StatRow label="Expected Assists (xA)" value={data?.expectedAssists != null ? data.expectedAssists.toFixed(2) : "-"} border={true} />
            <StatRow label="Dribbles (Attempts)" value={data?.totalContest} border={true} />
            <StatRow label="Dribbles (Success)" value={data?.wonContest} border={false} />
          </div>
        </div>

        {/* Passing */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Passing & Playmaking</h4>
          <div className="space-y-1">
            <StatRow label="Passes (Total)" value={data?.totalPass} border={true} />
            <StatRow label="Accurate Passes" value={data?.accuratePass} border={true} />
            <StatRow label="Pass Accuracy" value={passAccuracy(data)} border={true} />
            <StatRow label="Crosses" value={data?.totalCross} border={true} />
            <StatRow label="Long Balls" value={data?.totalLongBalls} border={true} />
            <StatRow label="Accurate Long Balls" value={data?.accurateLongBalls} border={false} />
          </div>
        </div>

        {/* Defending */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Defending</h4>
          <div className="space-y-1">
            <StatRow label="Clean Sheets" value={Number(data?.cleanSheet) || 0} border={true} />
            <StatRow label="Goals Conceded" value={data?.goalsConceded} border={true} />
            <StatRow label="Tackles" value={data?.totalTackle} border={true} />
            <StatRow label="Tackles Won" value={data?.wonTackle} border={true} />
            <StatRow label="Clearances" value={data?.totalClearance} border={true} />
            <StatRow label="Blocks" value={data?.outfielderBlock} border={true} />
            <StatRow label="Ball Recoveries" value={data?.ballRecovery} border={false} />
          </div>
        </div>

        {/* Duels & Discipline */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Duels & Discipline</h4>
          <div className="space-y-1">
            <StatRow label="Duels (Total)" value={duelTotal(data)} border={true} />
            <StatRow label="Duels (Won)" value={data?.duelWon} border={true} />
            <StatRow label="Aerial Duels (Won)" value={data?.aerialWon} border={true} />
            <StatRow label="Aerial Duels (Lost)" value={data?.aerialLost} border={true} />
            <StatRow label="Fouls (Drawn)" value={data?.wasFouled} border={true} />
            <StatRow label="Fouls (Committed)" value={data?.fouls} border={true} />
            <StatRow label="Offsides" value={data?.offsides} border={true} />
            <StatRow label="Yellow Cards" value={data?.yellowCards} border={true} />
            <StatRow label="Red Cards" value={data?.redCards} border={false} />
          </div>
        </div>

        {/* Goalkeeping & Penalties */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Goalkeeping & Penalties</h4>
          <div className="space-y-1">
            <StatRow label="Saves" value={data?.saves} border={true} />
            <StatRow label="Saves (Inside Box)" value={data?.savedShotsFromInsideTheBox} border={true} />
            <StatRow label="Punches" value={data?.punches} border={true} />
            <StatRow label="Good High Claims" value={data?.goodHighClaim} border={true} />
            <StatRow label="Goals Prevented" value={data?.goalsPrevented != null ? data.goalsPrevented.toFixed(2) : "-"} border={true} />
            <StatRow label="Penalty Won" value={data?.penaltyWon} border={true} />
            <StatRow label="Penalty Committed" value={data?.penaltyCommitted} border={true} />
            <StatRow label="Penalty Save" value={data?.penaltySaved} border={true} />
            <StatRow label="Penalty Miss" value={data?.penaltyMissed} border={false} />
          </div>
        </div>

        {/* Physical */}
        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Physical</h4>
          <div className="space-y-1">
            <StatRow label="Distance Covered (km)" value={data?.kilometersCovered != null ? data.kilometersCovered.toFixed(1) : "-"} border={true} />
            <StatRow label="Top Speed (km/h)" value={data?.topSpeed != null ? data.topSpeed.toFixed(1) : "-"} border={true} />
            <StatRow label="Sprints" value={data?.numberOfSprints} border={true} />
            <StatRow label="Possession Lost" value={data?.possessionLostCtrl} border={false} />
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
