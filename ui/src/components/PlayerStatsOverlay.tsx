import { useEffect, useState } from "react";
import { usePlayerDetails } from "../features/players/hooks";
import StatRow from "./StatRow";
import PlayerStatsOverlaySkeleton from "./skeletons/PlayerStatsOverlaySkeleton";
import { Player } from "../features/players/types";

const PlayerStatsOverlay = ({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<
    "stats" | "ostats" | "matches" | "history"
  >("stats");

  const { data: playerStats, isLoading } = usePlayerDetails(player.name);

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/50 flex items-end animate-fade-in`}
      >
        <div
          className={`w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up`}
        >
          {/* Header with Player Info */}
          {isLoading ? (
            <PlayerStatsOverlaySkeleton onClose={onClose} />
          ) : (
            <>
              {" "}
              <div className="relative bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 px-6 pt-6 pb-4">
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <div className="flex items-start gap-4 mt-8">
                  {/* Player Details */}
                  <div className="flex-1 pt-4">
                    <p className="text-white/80 text-sm font-medium mb-1">
                      {player.position}
                    </p>
                    <h2 className="text-white text-2xl font-bold mb-1">
                      {player.name.split(" ")[0]}
                    </h2>
                    <h2 className="text-white text-3xl font-bold mb-2">
                      {player.name.split(" ").slice(1).join(" ")}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {player.fullTeamName || player.team}
                    </p>
                  </div>
                  <div className="flex-1 pt-4">
                    <h2 className="text-right text-white text-5xl font-bold mb-1">
                      {playerStats?.total_point}
                      <span className="text-sm text-right text-white">
                        {"  "}
                        Pts
                      </span>
                    </h2>
                    <h2 className="text-right text-white text-3xl font-bold mb-2">
                      {(
                        playerStats?.total_point / playerStats?.app || 0
                      ).toFixed(2)}
                      <span className="text-sm text-right text-white">
                        {"  "}
                        Pts/Match
                      </span>
                    </h2>
                    <h1 className="text-right text-white text-xl">£{playerStats?.price}m</h1>
                  </div>
                </div>
              </div>
              {/* Stats Grid */}
              <div className="hidden px-6 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">£4.9m</p>
                    <p className="text-xs text-gray-600 mt-1">Price</p>
                    <p className="text-xs text-gray-500">49 of 246</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">6.2</p>
                    <p className="text-xs text-gray-600 mt-1">Pts / Match</p>
                    <p className="text-xs text-gray-500">5 of 246</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">3.5</p>
                    <p className="text-xs text-gray-600 mt-1">Form</p>
                    <p className="text-xs text-gray-500">20 of 246</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">32.0%</p>
                    <p className="text-xs text-gray-600 mt-1">Selected</p>
                    <p className="text-xs text-gray-500">2 of 246</p>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-600 mt-2">
                  Ranking for Defenders
                </p>
              </div>
              {/* Tabs */}
              <div className="flex-none border-b border-gray-200 px-6">
                <div className="flex gap-8">
                  <button
                    onClick={() => setActiveTab("matches")}
                    className={`hidden py-3 text-sm font-semibold relative ${
                      activeTab === "matches"
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    Matches
                    {activeTab === "matches" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("stats")}
                    className={`py-3 text-sm font-semibold relative ${
                      activeTab === "stats" ? "text-gray-900" : "text-gray-400"
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
                      activeTab === "ostats" ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    Overall Stats
                    {activeTab === "ostats" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    className={`hidden py-3 text-sm font-semibold relative ${
                      activeTab === "history"
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    History
                    {activeTab === "history" && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                    )}
                  </button>
                </div>
              </div>
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                {activeTab === "stats" && (
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Game Week Stats
                    </h3>

                    <div className="space-y-3">
                      {/* <StatRow label="Starts" value={playerStats?.app} /> */}
                      {/* <StatRow label="Minutes Played" value="720" /> */}
                      <StatRow label="Appearance" value={player?.app} />
                      <StatRow
                        label="Clean Sheets"
                        value={player.clean_sheet}
                      />
                      {/* <StatRow label="Goals Conceded" value="8" per90="1.0" /> */}
                      {/* <StatRow
                  label="Expected Goals Against"
                  value="10.88"
                  per90="1.0"
                /> */}
                      <StatRow label="Goals" value={player?.goal} />
                      <StatRow label="Assists" value={player?.assist} />
                      {/* <StatRow label="Expected Goals" value="0.80" per90="0.1" />
                <StatRow label="Expected Assists" value="0.97" per90="0.12" />
                <StatRow
                  label="Expected Goals Involvements"
                  value="1.77"
                  per90="0.22"
                /> */}
                      <StatRow
                        label="Yellow Cards"
                        value={player?.yellow_card}
                      />
                      <StatRow label="Red Cards" value={player?.red_card} />
                      <StatRow
                        label="Penalty Miss"
                        value={player?.penalty_miss}
                      />
                      <StatRow
                        label="Penalty Save"
                        value={player?.penalty_save}
                      />
                      <StatRow label="Saves" value={player?.save} />
                      {/* <StatRow label="Own Goals" value={playerStats?.yellow_card} /> */}
                      {/* <StatRow
                  label="Defensive Contributions"
                  value="63"
                  per90="7.88"
                /> */}
                    </div>
                  </div>
                )}
                {activeTab === "ostats" && (
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Season Stats
                    </h3>

                    <div className="space-y-3">
                      <StatRow label="Starts" value={playerStats?.app} />
                      {/* <StatRow label="Minutes Played" value="720" /> */}
                      <StatRow
                        label="Clean Sheets"
                        value={playerStats?.clean_sheet}
                      />
                      {/* <StatRow label="Goals Conceded" value="8" per90="1.0" /> */}
                      {/* <StatRow
                  label="Expected Goals Against"
                  value="10.88"
                  per90="1.0"
                /> */}
                      <StatRow label="Goals" value={playerStats?.goal} />
                      <StatRow label="Assists" value={playerStats?.assist} />
                      {/* <StatRow label="Expected Goals" value="0.80" per90="0.1" />
                <StatRow label="Expected Assists" value="0.97" per90="0.12" />
                <StatRow
                  label="Expected Goals Involvements"
                  value="1.77"
                  per90="0.22"
                /> */}
                      <StatRow
                        label="Yellow Cards"
                        value={playerStats?.yellow_card}
                      />
                      <StatRow
                        label="Red Cards"
                        value={playerStats?.red_card}
                      />
                      <StatRow
                        label="Penalty Miss"
                        value={playerStats?.penalty_miss}
                      />
                      <StatRow
                        label="Penalty Save"
                        value={playerStats?.penalty_save}
                      />
                      <StatRow label="Saves" value={playerStats?.save} />
                      {/* <StatRow label="Own Goals" value={playerStats?.yellow_card} /> */}
                      {/* <StatRow
                  label="Defensive Contributions"
                  value="63"
                  per90="7.88"
                /> */}
                    </div>
                  </div>
                )}

                {activeTab === "matches" && (
                  <div className="px-6 py-4">
                    <p className="text-gray-500 text-center py-8">
                      Matches content
                    </p>
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="px-6 py-4">
                    <p className="text-gray-500 text-center py-8">
                      History content
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PlayerStatsOverlay;
