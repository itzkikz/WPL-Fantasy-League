// app/components/GameweekTeamView.tsx
"use client";

import { fetchLineup } from "../lib/api";
import { use, useState, useEffect } from "react";
import { convertToFormation } from "../lib/lineupsFormatter";
import { useRouter } from "next/navigation";

type Player = {
  id: number;
  name: string;
  team: string;
  teamColor: string;
  points: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  position: "GKP" | "DEF" | "MID" | "FWD";
};

type Formation = {
  goalkeeper: Player[];
  defenders: Player[];
  midfielders: Player[];
  forwards: Player[];
};

function PlayerCard({
  player,
  size = "normal",
}: {
  player: Player;
  size?: "normal" | "small";
}) {
  const isSmall = size === "small";

  return (
    <div className={`relative ${isSmall ? "w-15" : "w-15"}`}>
      {/* Captain/Vice Captain Badge */}
      {(player?.isCaptain || player?.isViceCaptain) && (
        <div className="absolute -top-1 -left-1 z-20 flex items-center justify-center w-5 h-5 rounded-t bg-white border-2 border-gray-800 text-[10px] font-bold text-[#2a1134]">
          {player?.isCaptain ? "C" : "V"}
        </div>
      )}

      {/* Star badge (if any) */}
      <div className="absolute -top-1 -right-1 z-20 flex items-center justify-center w-5 h-5 rounded-t bg-gray-800 text-white">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>

      {/* Jersey */}
      <div
        className={`relative ${
          isSmall ? "h-10" : "h-10"
        } flex items-center justify-center`}
      >
        <div
          className={`${
            isSmall ? "w-15 h-10" : "w-15 h-10"
          } rounded-t-lg flex items-center justify-center`}
          style={{ backgroundColor: player?.teamColor }}
        >
          <span className="text-white font-bold text-xs">{player?.team}</span>
        </div>
      </div>

      {/* Player Name */}
      <div className="bg-white px-1 py-1 text-center shadow-sm">
        <p
          className={`${
            isSmall ? "text-[10px]" : "text-xs"
          } font-semibold text-gray-900 truncate`}
        >
          {player?.name ? player.name.trim().split(/\s+/).slice(-1)[0] : ""}
        </p>
      </div>

      {/* Points */}
      <div className="bg-[#2a1134] rounded-md px-2 py-1 text-center">
        <p
          className={`${isSmall ? "text-xs" : "text-sm"} font-bold text-white`}
        >
          {player?.points}
        </p>
      </div>
    </div>
  );
}

export default function GameweekTeamView({ teamName }: { teamName: string }) {
  const [activeTab, setActiveTab] = useState<"pitch" | "list">("pitch");
  const [gameweek, setGameweek] = useState(8);

  const router = useRouter();

  const [sampleTeam, setSampleTeam] = useState();

  const [bench, setBench] = useState();

  useEffect(() => {
    async function fetchData() {
      const response = await fetchLineup();
      const { sampleTeamData, benchData } = convertToFormation(response);
      setSampleTeam(sampleTeamData);
      setBench(benchData);
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex-none bg-white border-b">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={() => router.back()}>
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
          <h1 className="text-xl font-bold text-[#2a1134]">{teamName}</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Gameweek Navigation */}
      <div className="flex-none bg-white border-b py-1">
        <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
          <button onClick={() => setGameweek(gameweek - 1)}>
            <svg
              className="w-5 h-5 dark:text-black"
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
          <h2 className="text-lg font-bold text-gray-900">
            Gameweek {gameweek}
          </h2>

          <button onClick={() => setGameweek(gameweek + 1)}>
            <svg
              className="w-5 h-5 dark:text-black"
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
      <div className="flex-none bg-white px-12">
        <div className="flex items-center justify-between max-w-md mx-auto gap-4">
          <div className="text-center">
            <p className="text-base font-bold text-[#2a1134]">56</p>
            <p className="text-sm text-gray-600 mt-1">Average</p>
          </div>

          <div className="relative">
            <div className="text-center bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl px-8 py-4 shadow-lg">
              <p className="text-lg font-bold text-white">84</p>
              <p className="text-sm text-white mt-1">Total Pts</p>
            </div>
          </div>

          <button className="text-center group">
            <p className="text-base font-bold text-[#2a1134]">138</p>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              Highest
            </p>
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex-none px-4 py-4 bg-white">
        <div className="max-w-md mx-auto bg-gray-100 rounded-full p-1 flex">
          <button
            onClick={() => setActiveTab("pitch")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-colors ${
              activeTab === "pitch"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Pitch
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-colors ${
              activeTab === "list"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Football Pitch */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="min-h-full relative"
          style={{
            background: "linear-gradient(180deg, #00a350 0%, #00a350 100%)",
          }}
        >
          {/* Fantasy Header Bars */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center shadow-md">
                  <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                    <path d="M20 5L25 15H15L20 5Z" fill="#3D195B" />
                    <circle cx="20" cy="25" r="8" fill="#00FF87" />
                  </svg>
                </div>

                {/* Fantasy Text */}
                <span className="text-white text-sm font-bold">
                  WPL Fantasy Football
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center shadow-md">
                    <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                      <path d="M20 5L25 15H15L20 5Z" fill="#3D195B" />
                      <circle cx="20" cy="25" r="8" fill="#00FF87" />
                    </svg>
                  </div>

                  {/* Fantasy Text */}
                  <span className="text-white text-sm font-bold">
                    WPL Fantasy Football
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pitch Lines */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-8 left-0 right-0 h-px bg-white" />
            <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
          </div>

          {/* Players Formation */}
          <div className="relative pt-10 pb-16 px-2">
            {/* Goalkeeper */}
            <div className="flex justify-center mb-3">
              <PlayerCard player={sampleTeam?.goalkeeper[0]} />
            </div>

            {/* Defenders */}
            <div className="flex justify-center gap-3 mb-3">
              {sampleTeam?.defenders.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            {/* Midfielders */}
            <div className="flex justify-center gap-8 mb-3">
              {sampleTeam?.midfielders.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>

            {/* Forwards */}
            <div className="flex justify-center gap-8">
              {sampleTeam?.forwards.map((player) => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </div>

          {/* Bench Section */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-green-800/80 to-green-900/90 backdrop-blur-sm py-2 px-2">
            <div className="max-w-md mx-auto">
              <div className="grid grid-cols-4 gap-2 mb-2">
                <div className="text-center text-xs font-bold text-white">
                  GKP
                </div>
                <div className="text-center text-xs font-bold text-white">
                  DEF
                </div>
                <div className="text-center text-xs font-bold text-white">
                  MID
                </div>
                <div className="text-center text-xs font-bold text-white">
                  MID
                </div>
              </div>
              <div className="flex justify-center gap-8">
                {bench?.map((player) => (
                  <PlayerCard key={player.id} player={player} size="small" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
