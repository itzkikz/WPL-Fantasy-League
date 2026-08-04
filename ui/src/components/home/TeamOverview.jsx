import React from "react";
import { ChevronRight, TrendingUp, Shield } from "lucide-react";

// Placeholder for the Fantasy Team Logo
function LogoPlaceholder() {
  return (
    <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center">
      {/* Outer soft glow */}
      <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
      {/* Glassmorphic shield wrapper */}
      <div className="relative w-12 h-12 sm:w-18 sm:h-18 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
        <Shield className="w-6 h-6 sm:w-9 sm:h-9 text-white fill-white/10" />
      </div>
    </div>
  );
}

/**
 * TeamOverview - purple hero banner showing team identity + headline stats.
 */
export default function TeamOverview({
  teamName = "Kiran FC",
  logo,
  managers = [],
  crestEmoji = <Shield className="w-5 h-5" />,
  overallRank = "12,345",
  rankChange = "2,341",
  totalPoints = "1,234",
  gameweekPoints = 56,
  onClick,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-overview bg-dots shadow-card flex flex-col justify-between">
      
      {/* Top Header Row with Logo Backdrop */}
      <div className="relative p-3.5 sm:p-5 pb-2 flex items-start justify-between min-h-[85px] sm:min-h-[100px]">
        {/* Left Info: Team Name & Managers */}
        <div className="relative z-10 flex-1 min-w-0 pr-24 sm:pr-36">
          <button
            onClick={onClick}
            className="flex items-center gap-1 text-[11px] sm:text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer mb-1"
          >
            <span>Team</span>
            <span className="font-bold text-text-primary">Overview</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-600/90 text-white flex items-center justify-center text-lg sm:text-xl shadow-lg shrink-0">
              {crestEmoji}
            </div>
            <h1
              onClick={onClick}
              className="text-text-primary text-lg sm:text-xl md:text-2xl font-black flex items-center gap-1 cursor-pointer hover:text-text-primary transition-colors truncate"
            >
              <span className="truncate">{teamName}</span>
              <ChevronRight className="w-4 h-4 text-text-primary/70 shrink-0" />
            </h1>
          </div>
          {managers.length > 0 && (
            <p className="text-text-secondary text-[10px] sm:text-[11px] font-medium leading-tight mt-1 ml-[44px] line-clamp-1">
              {managers.join(" · ")}
            </p>
          )}
        </div>

        {/* Right Side Pitch Visual with Large Logo */}
        <div className="absolute right-0 top-0 bottom-0 w-[32%] sm:w-[35%] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1D8D44] to-[#0B5F2B] [clip-path:polygon(25%_0,100%_0,100%_100%,0_100%)] flex items-center justify-center p-2">
            {logo ? (
              <img
                src={logo}
                alt={`${teamName} logo`}
                className="relative w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 max-h-[90%] object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-transform hover:scale-105"
              />
            ) : (
              <LogoPlaceholder />
            )}
          </div>
        </div>
      </div>

      {/* Full-width Stats Grid Row at Bottom */}
      <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-3 p-3 sm:p-4 bg-black/10 dark:bg-white/5 border-t border-border backdrop-blur-sm">
        <div className="min-w-0 text-center sm:text-left">
          <p className="text-text-secondary text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">
            Overall Rank
          </p>
          <p className="text-sm sm:text-base md:text-lg font-black text-text-primary truncate mt-0.5">
            {overallRank}
          </p>
          <span className="inline-flex items-center gap-0.5 text-success text-[9px] sm:text-[10px] font-bold mt-0.5 justify-center sm:justify-start truncate">
            <TrendingUp className="w-3 h-3 shrink-0" /> {rankChange}
          </span>
        </div>

        <div className="min-w-0 text-center sm:text-left border-l border-border pl-1.5 sm:pl-3">
          <p className="text-text-secondary text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">
            Total Points
          </p>
          <p className="text-sm sm:text-base md:text-lg font-black text-text-primary truncate mt-0.5">
            {totalPoints}
          </p>
        </div>

        <div className="min-w-0 text-center sm:text-left border-l border-border pl-1.5 sm:pl-3">
          <p className="text-text-secondary text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">
            GW Points
          </p>
          <p className="text-sm sm:text-base md:text-lg font-black text-success truncate mt-0.5">
            {gameweekPoints}
          </p>
        </div>
      </div>

    </div>
  );
}
