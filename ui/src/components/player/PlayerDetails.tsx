import React from "react";
import { PlayerStats } from "../../features/players/types";

export default function PlayerDetails({playerStats}:{playerStats: PlayerStats}) {
  return (
    <div className="flex px-6 mb-6 border-b border-[#ebe5eb] dark:border-[#541e5d]">
      <div className="rounded-xl p-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.games?.appearances ?? 0}</p>
          <p className="text-xs  mt-1">Apps</p>
          {/* <p className="text-xs ">49 of 246</p> */}
        </div>
        {playerStats?.position === "G" ? (<><div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.goals?.saves ?? 0}</p>
          <p className="text-xs  mt-1">Saves</p>
          {/* <p className="text-xs ">5 of 246</p> */}
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.penalty?.saved ?? 0}</p>
          <p className="text-xs  mt-1">Penalty Saves</p>
          {/* <p className="text-xs ">20 of 246</p> */}
        </div></>) : (<><div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.goals?.total ?? 0}</p>
          <p className="text-xs  mt-1">Goals</p>
          {/* <p className="text-xs ">5 of 246</p> */}
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold ">{playerStats?.overall?.goals?.assists ?? 0}</p>
          <p className="text-xs  mt-1">Assists</p>
          {/* <p className="text-xs ">20 of 246</p> */}
        </div></>)}
        
        <div className="text-center">
          <p className="text-2xl font-bold ">{Number(playerStats?.overall?.games?.cleansheet) || 0}</p>
          <p className="text-xs  mt-1">Clean Sheets</p>
          {/* <p className="text-xs ">2 of 246</p> */}
        </div>
        <p className="text-center text-xs  mt-2 hidden">
          Ranking for Defenders
        </p>
      </div>
    </div>
  );
}
