import React from "react";
import { Card, CardHeader } from "./Primitives";

/**
 * TeamFormation - displays the starting lineup formation (e.g. 4-4-2)
 * with a beautiful mini-pitch visual representation.
 */
export default function TeamFormation({
  formation = "4-4-2",
  squad = {
    goalkeepers: 1,
    defenders: 4,
    midfielders: 4,
    forwards: 2,
  },
}) {
  // Parse formation parts or count starting lines
  const lines = formation.split("-").map(Number); // e.g. [4, 4, 2] or [1, 4, 4, 2]
  
  let def = squad.defenders;
  let mid = squad.midfielders;
  let fwd = squad.forwards;

  if (lines.length === 4) {
    // If it has 4 elements (1-4-4-2), drop the GK and keep DEF-MID-FWD
    def = lines[1];
    mid = lines[2];
    fwd = lines[3];
  } else if (lines.length === 3) {
    def = lines[0];
    mid = lines[1];
    fwd = lines[2];
  }

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader title="Team Formation" subtitle="Starting XI Layout" />
      
      <div className="flex flex-row gap-4 justify-between items-center my-1 w-full">
        {/* Left side: Large Formation display */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <div>
            <p className="text-text-secondary text-[9px] uppercase font-semibold tracking-wider">Current Formation</p>
            <p className="inline-block text-text-primary font-black text-3xl tracking-tight bg-gradient-to-r from-primary via-indigo-400 to-success bg-clip-text text-transparent py-0.5 leading-normal">
              {formation}
            </p>
          </div>
          <div className="w-fit px-2 py-0.5 rounded bg-[#302151] border border-white/5 text-[9px] text-success font-bold">
            Active
          </div>
        </div>

        {/* Right side: Mini-pitch graphic */}
        <div className="relative h-24 w-48 sm:w-80 sm:h-32 bg-[#1b1035] border border-white/5 rounded-lg overflow-hidden flex flex-col justify-between p-2 flex-shrink-0">
          {/* Pitch lines */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-white/[0.03]" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-12 sm:h-12 border border-white/[0.03] rounded-full" />
          
          {/* Forwards Line */}
          <div className="flex justify-center gap-2 sm:gap-4 z-10">
            {[...Array(fwd)].map((_, i) => (
              <span key={i} className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-warning shadow-[0_0_6px_var(--color-warning)]" />
            ))}
          </div>

          {/* Midfielders Line */}
          <div className="flex justify-center gap-2 sm:gap-4 z-10">
            {[...Array(mid)].map((_, i) => (
              <span key={i} className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-primary shadow-[0_0_6px_var(--color-primary)]" />
            ))}
          </div>

          {/* Defenders Line */}
          <div className="flex justify-center gap-2 sm:gap-4 z-10">
            {[...Array(def)].map((_, i) => (
              <span key={i} className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-info shadow-[0_0_6px_var(--color-info)]" />
            ))}
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center z-10">
            <span className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-success shadow-[0_0_6px_var(--color-success)]" />
          </div>
        </div>
      </div>
    </Card>
  );
}
