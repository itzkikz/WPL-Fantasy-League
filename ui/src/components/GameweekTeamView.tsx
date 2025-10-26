/* eslint-disable @typescript-eslint/no-explicit-any */
// app/components/GameweekTeamView.tsx
"use client";

import { fetchLineup, fetchPlayer } from "../lib/api";
import { useState, useEffect } from "react";
import { convertToFormation } from "../lib/lineupsFormatter";
import { useRouter } from "next/navigation";
import Loader from "./Loader";
import type {
  Player,
  Formation as ApiFormation,
} from "../lib/types";
import { PlayerCard } from "./PlayerCard";

type Fixture = {
  gameweek: string;
  teamLogo: string;
  opponent: string;
  venue: "H" | "A";
  points: number;
  isCurrent?: boolean;
};

// Sample fixtures data
const sampleFixtures: Fixture[] = [
  { gameweek: "GW6", teamLogo: "LIV", opponent: "LIV", venue: "H", points: 7 },
  { gameweek: "GW7", teamLogo: "EVE", opponent: "EVE", venue: "A", points: 3 },
  { gameweek: "GW8", teamLogo: "BOU", opponent: "BOU", venue: "H", points: 4 },
  {
    gameweek: "GW9",
    teamLogo: "ARS",
    opponent: "ARS",
    venue: "A",
    points: 4,
    isCurrent: true,
  },
  { gameweek: "GW10", teamLogo: "BRE", opponent: "BRE", venue: "H", points: 3 },
  { gameweek: "GW11", teamLogo: "BHA", opponent: "BHA", venue: "H", points: 3 },
];

function PlayerDetailOverlay({
  player,
  onClose,
}: {
  player: Player;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"stats" | "ostats" | "matches" | "history">(
    "stats"
  );
  const [playerStats, setPlayerStats] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      // setLoading(true);
      const response = await fetchPlayer(player.name);
      console.log("Fetched player data:", response);
      setPlayerStats(response.data);
    }
    fetchData();
  }, [player]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end animate-fade-in">
      <div className="w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header with Player Info */}
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
          </div>
        </div>

        {/* Stats Grid */}
        <div className="px-6 mb-6 hidden">
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

        {/* Form & Fixtures Section */}
        <div className="px-6 mb-4 hidden">
          <div className="flex gap-8">
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-3">Form</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {sampleFixtures.map((fixture, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center min-w-[60px]"
                  >
                    <p className="text-xs text-gray-600 mb-1">
                      {fixture.opponent} ({fixture.venue})
                    </p>
                    <div
                      className={`w-full py-1 px-2 rounded text-center text-sm font-bold ${
                        fixture.isCurrent
                          ? "bg-pink-500 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {fixture.points}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Fixtures
              </h3>
              {/* Similar structure for upcoming fixtures */}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-none border-b border-gray-200 px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("matches")}
              className={`hidden py-3 text-sm font-semibold relative ${
                activeTab === "matches" ? "text-gray-900" : "text-gray-400"
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
              GW Stats
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
                activeTab === "history" ? "text-gray-900" : "text-gray-400"
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
                {/* <StatRow label="Own Goals" value={playerStats?.yellow_card} /> */}
                {/* <StatRow
                  label="Defensive Contributions"
                  value="63"
                  per90="7.88"
                /> */}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">
                FPL Stats
              </h3>

              <div className="space-y-3">
                <StatRow
                  label="Total Points"
                  value={player?.point}
                />
                {/* <StatRow label="Form" value="3.5" /> */}
                {/* <StatRow
                  label="Pts / Match"
                  value={(playerStats?.total_point / playerStats?.app).toFixed(
                    2
                  )}
                /> */}
                {/* <StatRow label="Total Bonus Points" value="3" />
                <StatRow
                  label="ICT Influence (Defender)"
                  value="13"
                  suffix="of 246"
                />
                <StatRow
                  label="ICT Creativity (Defender)"
                  value="23"
                  suffix="of 246"
                />
                <StatRow
                  label="ICT Threat (Defender)"
                  value="8"
                  suffix="of 246"
                />
                <StatRow
                  label="ICT Index (Defender)"
                  value="9"
                  suffix="of 246"
                />
                <StatRow
                  label="ICT Index (Overall)"
                  value="48"
                  suffix="of 745"
                />
                <StatRow label="Teams Selected by" value="32.0%" /> */}
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
                <StatRow label="Red Cards" value={playerStats?.red_card} />
                {/* <StatRow label="Own Goals" value={playerStats?.yellow_card} /> */}
                {/* <StatRow
                  label="Defensive Contributions"
                  value="63"
                  per90="7.88"
                /> */}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4 mt-6">
                FPL Stats
              </h3>

              <div className="space-y-3">
                <StatRow
                  label="Total Points"
                  value={playerStats?.total_point}
                />
                {/* <StatRow label="Form" value="3.5" /> */}
                <StatRow
                  label="Pts / Match"
                  value={(playerStats?.total_point / playerStats?.app).toFixed(
                    2
                  )}
                />
                {/* <StatRow label="Total Bonus Points" value="3" />
                <StatRow
                  label="ICT Influence (Defender)"
                  value="13"
                  suffix="of 246"
                />
                <StatRow
                  label="ICT Creativity (Defender)"
                  value="23"
                  suffix="of 246"
                />
                <StatRow
                  label="ICT Threat (Defender)"
                  value="8"
                  suffix="of 246"
                />
                <StatRow
                  label="ICT Index (Defender)"
                  value="9"
                  suffix="of 246"
                />
                <StatRow
                  label="ICT Index (Overall)"
                  value="48"
                  suffix="of 745"
                />
                <StatRow label="Teams Selected by" value="32.0%" /> */}
              </div>
            </div>
          )}

          {activeTab === "matches" && (
            <div className="px-6 py-4">
              <p className="text-gray-500 text-center py-8">Matches content</p>
            </div>
          )}

          {activeTab === "history" && (
            <div className="px-6 py-4">
              <p className="text-gray-500 text-center py-8">History content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  per90,
  suffix,
}: {
  label: string;
  value: string | number;
  per90?: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <p className="text-gray-700 text-sm">{label}</p>
      <div className="flex items-center gap-3">
        {per90 && (
          <>
            <p className="text-gray-900 text-sm font-semibold">{value}</p>
            <p className="text-gray-500 text-xs">Per 90</p>
            <p className="text-gray-900 text-sm font-semibold">{per90}</p>
          </>
        )}
        {suffix && (
          <>
            <p className="text-gray-900 text-sm font-semibold">{value}</p>
            <p className="text-gray-500 text-xs">{suffix}</p>
          </>
        )}
        {!per90 && !suffix && (
          <p className="text-gray-900 text-sm font-semibold">{value}</p>
        )}
      </div>
    </div>
  );
}

function PlayerListItem({
  player,
  onClick,
}: {
  player: Player;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50"
    >
      {/* Info Icon */}
      <button className="mr-3 text-gray-400">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Jersey Icon */}
      <div
        className="w-10 h-10 rounded flex items-center justify-center mr-3"
        style={{ backgroundColor: player.teamColor }}
      >
        <span className="text-white text-xs font-bold">{player.team}</span>
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {player?.name ? player.name.trim().split(/\s+/).slice(-1)[0] : ""}
          </h3>
          {player.isCaptain && (
            <span className="px-1.5 py-0.5 bg-gray-900 text-white text-xs font-bold rounded">
              C
            </span>
          )}
          {player.isViceCaptain && (
            <span className="px-1.5 py-0.5 bg-gray-700 text-white text-xs font-bold rounded">
              V
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs">
          {player.team} {player.position}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 ml-4">
        <div className="text-center min-w-[40px]">
          <p className="text-sm font-semibold text-gray-900">
            {player.point || "3.5"}
          </p>
        </div>
        <div className="text-center min-w-[50px]">
          <p className="text-sm font-semibold text-gray-900">{"£0m"}</p>
        </div>
      </div>
    </div>
  );
}

export default function GameweekTeamView({ teamName }: { teamName: string }) {
  const [activeTab, setActiveTab] = useState<"pitch" | "list">("pitch");
  const [gameweek, setGameweek] = useState<number>(0);
  const [currentGW, setCurrentGW] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalGWScore, setTotalGWScore] = useState<number>(0);
  const [average, setAverage] = useState<number>(0);
  const [highest, setHighest] = useState<number>(0);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const router = useRouter();

  const [sampleTeam, setSampleTeam] = useState<ApiFormation | undefined>(
    undefined
  );

  const [bench, setBench] = useState<Player[]>([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const response = await fetchLineup(teamName, gameweek);
      const { sampleTeamData, benchData } = convertToFormation(
        response?.data || []
      );
      console.log("Fetched lineup data:", sampleTeamData, benchData);
      setSampleTeam(sampleTeamData);
      setBench(benchData);
      setLoading(false);
      setTotalGWScore(response?.totalGWScore || 0);
      setAverage(response?.avg || 0);
      setHighest(response?.highest || 0);
      setGameweek(parseInt(response?.gw));
      setCurrentGW(parseInt(response?.currentGw));
    }
    fetchData();
  }, [teamName, gameweek, currentGW]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {loading ? (
        <Loader />
      ) : (
        <>
          {/* Header */}
          <div className="flex-none bg-white">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <button
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                onClick={() => router.back()}
              >
                <svg
                  className="w-5 h-5 text-[#2a1134]"
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
              <h1 className="text-base font-bold text-[#2a1134]">{teamName}</h1>
              <div className="w-10" /> {/* Spacer */}
            </div>
          </div>

          {/* Gameweek Navigation */}
          <div className="flex-none bg-white py-1">
            <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
              <button
                disabled={gameweek === 1}
                onClick={() => setGameweek(gameweek - 1)}
              >
                <svg
                  className={`w-5 h-5 ${
                    gameweek === 1 ? `dark:text-grey` : `dark:text-black`
                  }`}
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
              <h2 className="text-base font-bold text-gray-900">
                Gameweek {gameweek}
              </h2>

              <button
                disabled={gameweek - currentGW === 0}
                onClick={() => setGameweek(gameweek + 1)}
              >
                <svg
                  className={`w-5 h-5 ${
                    gameweek - currentGW === 0
                      ? `dark:text-grey`
                      : `dark:text-black`
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex-none bg-white px-16">
            <div className="flex items-center justify-between max-w-md mx-auto gap-1">
              <div className="text-center">
                <p className="text-lg font-bold text-[#2a1134]">{average}</p>
                <p className="text-sm text-gray-600 mt-1">Average</p>
              </div>

              <div className="relative">
                <div className="text-center bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl px-4 py-4 shadow-lg">
                  <p className="text-2xl font-bold text-white">
                    {totalGWScore}
                  </p>
                  <p className="text-sm text-white mt-1">Total Pts</p>
                </div>
              </div>

              <button className="text-center group">
                <p className="text-lg font-bold text-[#2a1134]">{highest}</p>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                  Highest
                </p>
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex-none px-4 py-4 bg-white">
            <div className="max-w-md mx-auto bg-gray-100 rounded-sm p-1 flex">
              <button
                onClick={() => setActiveTab("pitch")}
                className={`flex-1 py-2 px-4 rounded-sm text-sm font-semibold transition-colors ${
                  activeTab === "pitch"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                Pitch
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`flex-1 py-2 px-4 rounded-sm text-sm font-semibold transition-colors ${
                  activeTab === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600"
                }`}
              >
                List
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Football Pitch */}
            {activeTab === "pitch" && (
              <div
                className="min-h-full relative bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: "url('/pitch.svg')",
                }}
              >
                {/* Fantasy Header Bars */}

                <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center shadow-md">
                        <svg
                          className="w-8 h-8"
                          viewBox="0 0 40 40"
                          fill="none"
                        >
                          <path d="M20 5L25 15H15L20 5Z" fill="#3D195B" />
                          <circle cx="20" cy="25" r="8" fill="#00FF87" />
                        </svg>
                      </div>

                      {/* Fantasy Text */}
                      <span className="text-white text-xs font-bold">
                        WPL Fantasy
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center shadow-md">
                          <svg
                            className="w-8 h-8"
                            viewBox="0 0 40 40"
                            fill="none"
                          >
                            <path d="M20 5L25 15H15L20 5Z" fill="#3D195B" />
                            <circle cx="20" cy="25" r="8" fill="#00FF87" />
                          </svg>
                        </div>

                        {/* Fantasy Text */}
                        <span className="text-white text-xs font-bold">
                          WPL Fantasy
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Players Formation */}
                <div className="relative pt-10 pb-16 px-2">
                  {/* Goalkeeper */}
                  <div className="flex justify-center mb-3">
                    {sampleTeam?.goalkeeper[0] && (
                      <PlayerCard
                        player={sampleTeam.goalkeeper[0]}
                        onClick={() =>
                          setSelectedPlayer(sampleTeam.goalkeeper[0])
                        }
                      />
                    )}
                  </div>

                  {/* Defenders */}
                  <div className="flex justify-center gap-3 mb-3">
                    {sampleTeam?.defenders.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    ))}
                  </div>

                  {/* Midfielders */}
                  <div className="flex justify-center gap-3 mb-3">
                    {sampleTeam?.midfielders.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    ))}
                  </div>

                  {/* Forwards */}
                  <div className="flex justify-center gap-8">
                    {sampleTeam?.forwards.map((player) => (
                      <PlayerCard
                        key={player.id}
                        player={player}
                        onClick={() => setSelectedPlayer(player)}
                      />
                    ))}
                  </div>
                </div>

                {/* Bench Section */}
                {/* Bench Section */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-green-800/80 to-green-900/90 backdrop-blur-sm py-2 px-2">
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-center gap-8 mb-2">
                      {bench?.map((player) => (
                        <div
                          key={`label-${player.id}`}
                          className="w-15 text-center text-xs font-bold text-white"
                        >
                          {player.position}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-center gap-8">
                      {bench?.map((player) => (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          size="small"
                          onClick={() => setSelectedPlayer(player)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "list" && (
              <div className="bg-white">
                {/* Column Headers */}
                <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-gray-600 uppercase">
                      Player
                    </p>
                  </div>
                  <div className="flex items-center gap-6 ml-4">
                    <div className="text-center min-w-[40px]">
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        Form
                      </p>
                    </div>
                    <div className="text-center min-w-[50px]">
                      <p className="text-xs font-semibold text-gray-600 uppercase">
                        Price
                      </p>
                    </div>
                  </div>
                </div>

                {/* Goalkeepers */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 px-4 py-3 bg-gray-50">
                    Goalkeepers
                  </h3>
                  {sampleTeam?.goalkeeper.map((player) => (
                    <PlayerListItem
                      onClick={() => setSelectedPlayer(player)}
                      key={player.id}
                      player={player}
                    />
                  ))}
                </div>

                {/* Defenders */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 px-4 py-3 bg-gray-50">
                    Defenders
                  </h3>
                  {sampleTeam?.defenders.map((player) => (
                    <PlayerListItem
                      onClick={() => setSelectedPlayer(player)}
                      key={player.id}
                      player={player}
                    />
                  ))}
                </div>

                {/* Midfielders */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 px-4 py-3 bg-gray-50">
                    Midfielders
                  </h3>
                  {sampleTeam?.midfielders.map((player) => (
                    <PlayerListItem
                      onClick={() => setSelectedPlayer(player)}
                      key={player.id}
                      player={player}
                    />
                  ))}
                </div>

                {/* Forwards */}
                {sampleTeam?.forwards && sampleTeam.forwards.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 px-4 py-3 bg-gray-50">
                      Forwards
                    </h3>
                    {sampleTeam.forwards.map((player) => (
                      <PlayerListItem
                        onClick={() => setSelectedPlayer(player)}
                        key={player.id}
                        player={player}
                      />
                    ))}
                  </div>
                )}
                {bench && bench.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 px-4 py-3 bg-gray-50">
                      Substitutes
                    </h3>
                    {bench.map((player) => (
                      <PlayerListItem
                        onClick={() => setSelectedPlayer(player)}
                        key={player.id}
                        player={player}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
      {selectedPlayer && (
        <PlayerDetailOverlay
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}
    </div>
  );
}
