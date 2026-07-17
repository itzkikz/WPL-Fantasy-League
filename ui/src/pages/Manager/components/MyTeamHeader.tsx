import React from "react";

interface MyTeamHeaderProps {
  selectedGW: number;
  deadlineFormatted: string;
  total_budget?: number;
  balance?: number;
  totalGWScore?: number;
  totalPointsFormatted: string;
}

const MyTeamHeader = ({
  selectedGW,
  deadlineFormatted,
  total_budget = 100,
  balance = 0,
  totalGWScore = 0,
  totalPointsFormatted,
}: MyTeamHeaderProps) => {
  return (
    <div className="mx-4 mt-3 bg-gradient-card border border-border rounded-2xl p-4 shadow-card relative overflow-hidden shrink-0">
      {/* Animated Gradient Backlight */}
      <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
 
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
              My Team
            </h1>
            <p className="text-[11px] md:text-xs text-text-muted font-medium mt-0.5">
              Gameweek {selectedGW} Deadline: <span className="text-secondary font-semibold">{deadlineFormatted}</span>
            </p>
          </div>
        </div>
 
        {/* Gameweek Badge */}
        <div className="flex items-center bg-background border border-border rounded-xl px-3.5 py-1.5 shadow-inner">
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-secondary select-none font-mono">
            GW {selectedGW}
          </span>
        </div>
      </div>
 
      {/* Stats Summary Panel */}
      <div className="grid grid-cols-5 gap-1 md:gap-4 mt-3.5 border-t border-border/50 pt-3">
        <div className="flex flex-col items-center justify-center text-center">
          <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Team Value</span>
          <span className="text-xs md:text-base lg:text-lg font-extrabold text-white mt-0.5">
            £{total_budget || "100.0"}m
          </span>
        </div>
 
        <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
          <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Bank</span>
          <span className="text-xs md:text-base lg:text-lg font-extrabold text-white mt-0.5">
            £{(balance ?? 0).toFixed(2)}m
          </span>
        </div>
 
        <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
          <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Transfers</span>
          <span className="text-xs md:text-base lg:text-lg font-extrabold text-emerald-400 mt-0.5">Free</span>
          <span className="text-[8px] md:text-[9px] font-bold text-gray-400 mt-0.5">Unlimited</span>
        </div>
 
        <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
          <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Score</span>
          <span className="text-xs md:text-base lg:text-lg font-extrabold text-[var(--color-success-bright)] mt-0.5">
            {totalGWScore ?? 0}
          </span>
        </div>
 
        <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
          <span className="text-[9px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Total</span>
          <span className="text-xs md:text-base lg:text-lg font-extrabold text-white mt-0.5">{totalPointsFormatted}</span>
        </div>
      </div>
    </div>
  );
};

export default MyTeamHeader;
