import React from "react";

export default function PlayerDetails() {
  return (
    <div className="flex px-6 mb-6 border-b border-[#ebe5eb] dark:border-[#541e5d]">
      <div className="rounded-xl p-4 grid grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold ">£4.9m</p>
          <p className="text-xs  mt-1">Price</p>
          <p className="text-xs ">49 of 246</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold ">6.2</p>
          <p className="text-xs  mt-1">Pts / Match</p>
          <p className="text-xs ">5 of 246</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold ">3.5</p>
          <p className="text-xs  mt-1">Form</p>
          <p className="text-xs ">20 of 246</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold ">32.0%</p>
          <p className="text-xs  mt-1">Selected</p>
          <p className="text-xs ">2 of 246</p>
        </div>
        <p className="text-center text-xs  mt-2 hidden">
          Ranking for Defenders
        </p>
      </div>
    </div>
  );
}
