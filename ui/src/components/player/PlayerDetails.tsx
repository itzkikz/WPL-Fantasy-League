import React from "react";
import { PlayerStats } from "../../features/players/types";

export default function PlayerDetails({playerStats}:{playerStats: PlayerStats}) {
  return (
    <div className="flex px-6 mb-6 border-b border-[#ebe5eb] dark:border-[#541e5d]">
      <div className="rounded-xl p-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.appearances ?? 0}</p>
          <p className="text-xs  mt-1">Apps</p>
        </div>
        {playerStats?.position === "G" ? (<><div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.saves ?? 0}</p>
          <p className="text-xs  mt-1">Saves</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.penaltySaved ?? 0}</p>
          <p className="text-xs  mt-1">Penalty Saves</p>
        </div></>) : (<><div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.goals ?? 0}</p>
          <p className="text-xs  mt-1">Goals</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.goalAssist ?? 0}</p>
          <p className="text-xs  mt-1">Assists</p>
        </div></>)}
        
        <div className="text-center">
          <p className="text-2xl font-bold ">{Number(playerStats?.overall?.cleanSheet) || 0}</p>
          <p className="text-xs  mt-1">Clean Sheets</p>
        </div>
        <p className="text-center text-xs  mt-2 hidden">
          Ranking for Defenders
        </p>
      </div>
    </div>
  );
}
