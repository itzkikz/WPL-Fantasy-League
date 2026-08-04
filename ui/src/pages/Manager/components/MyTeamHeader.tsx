import React from "react";

interface MyTeamHeaderProps {
  selectedGW: number;
  deadlineFormatted: string;
  total_budget?: number;
  balance?: number;
  totalGWScore?: number;
  totalPointsFormatted: string;
  pickMyTeam?: boolean;
  headerTab: "current" | "history";
  setHeaderTab: (tab: "current" | "history") => void;
  logo?: string;
}

const MyTeamHeader = ({
  selectedGW,
  deadlineFormatted,
  total_budget = 100,
  balance = 0,
  totalGWScore = 0,
  totalPointsFormatted,
  pickMyTeam = false,
  headerTab,
  setHeaderTab,
  logo,
}: MyTeamHeaderProps) => {
  return (
    <div className="mx-4 mt-3 bg-gradient-card border border-border rounded-2xl p-4 shadow-card relative overflow-hidden shrink-0">
      {/* Animated Gradient Backlight */}
      <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
 
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          {logo && (
            <div className="w-10 h-10 rounded-xl bg-background/60 border border-border/80 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <img src={logo} alt="Team logo" className="w-9 h-9 object-contain" />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg md:text-xl font-black tracking-tight text-text-primary">
              My Team
            </h1>
          </div>
        </div>

        {/* Gameweek Badge Toggle Chips */}
        <div className="flex items-center gap-1.5 bg-background/50 border border-border/80 rounded-xl p-1 shadow-inner shrink-0 select-none">
          <button
            onClick={() => setHeaderTab("current")}
            className={`px-2.5 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer ${
              headerTab === "current"
                ? "bg-secondary text-white font-extrabold shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            GW {selectedGW}
          </button>
          <button
            onClick={() => setHeaderTab("history")}
            className={`px-2.5 py-1.5 text-[10px] md:text-xs font-bold rounded-lg transition-all cursor-pointer ${
              headerTab === "history"
                ? "bg-secondary text-white font-extrabold shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* High-Visibility Deadline Banner */}
      {pickMyTeam && (
        <div className="mt-2.5 bg-background/60 border border-border/70 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 text-xs">
          <span className="text-[10px] sm:text-xs uppercase tracking-wider font-extrabold text-text-muted shrink-0 flex items-center gap-1">
            <span>⏰</span> GW{selectedGW} Deadline:
          </span>
          <span className="font-extrabold text-secondary text-xs sm:text-sm truncate">
            {deadlineFormatted}
          </span>
        </div>
      )}

      {/* 4-Column Stats Row (Mobile + Desktop) */}
      <div className="mt-3.5 border-t border-border/50 pt-3">
        <div className="grid grid-cols-4 gap-2">
          {/* Team Value */}
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Team Value</span>
            <span className="text-sm md:text-base lg:text-lg font-extrabold text-text-primary mt-0.5">
              £{total_budget || "100.0"}m
            </span>
          </div>

          {/* Bank */}
          <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
            <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Bank</span>
            <span className="text-sm md:text-base lg:text-lg font-extrabold text-text-primary mt-0.5">
              £{(balance ?? 0).toFixed(2)}m
            </span>
          </div>

          {/* GW Score */}
          <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
            <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">GW Score</span>
            <span className="text-sm md:text-base lg:text-lg font-extrabold text-[var(--color-success-bright)] mt-0.5">
              {totalGWScore ?? 0}
            </span>
          </div>

          {/* Total Points */}
          <div className="flex flex-col items-center justify-center text-center border-l border-border/50">
            <span className="text-[10px] md:text-xs font-bold text-text-muted uppercase tracking-wider">Total</span>
            <span className="text-sm md:text-base lg:text-lg font-extrabold text-text-primary mt-0.5">
              {totalPointsFormatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTeamHeader;
