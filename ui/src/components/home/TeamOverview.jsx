import React from "react";
import { ChevronRight, TrendingUp, Shield } from "lucide-react";

// Placeholder for the Fantasy Team Logo
function LogoPlaceholder() {
  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
      {/* Outer soft glow */}
      <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
      {/* Glassmorphic shield wrapper */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
        <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white/10" />
      </div>
    </div>
  );
}

/**
 * TeamOverview - purple hero banner showing team identity + headline stats.
 */
export default function TeamOverview({
  teamName = "Kiran FC",
  crestEmoji = <Shield className="w-5 h-5" />,
  overallRank = "12,345",
  rankChange = "2,341",
  totalPoints = "1,234",
  gameweekPoints = 56,
  onClick,
}) {
  return (
    <div className="relative overflow-hidden rounded-[10px] bg-gradient-overview bg-dots shadow-card min-h-[115px]">
      {/* right side visual containing the pitch color and the logo placeholder */}
      <div className="absolute right-0 top-0 h-full w-[48%] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1D8D44] to-[#0B5F2B] [clip-path:polygon(42%_0,100%_0,100%_100%,0_100%)] flex items-center justify-center pl-6">
          <LogoPlaceholder />
        </div>
      </div>

      <div className="relative z-10 p-3.5 pr-[45%]">
        <button onClick={onClick} className="flex min-h-7 items-center gap-1 text-[12px] text-text-secondary/65 hover:text-white active:text-white transition-colors">
          <span>Team</span><span className="font-semibold text-white">Overview</span>
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-rose-600/90 flex items-center justify-center text-lg shadow-lg">
            {crestEmoji}
          </div>
          <h1 className="text-text-primary text-[21px] font-bold flex items-center gap-1 whitespace-nowrap cursor-pointer hover:text-white transition-colors" onClick={onClick}>
            {teamName} <ChevronRight className="w-4 h-4 text-text-primary/70" />
          </h1>
        </div>

        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5">
          <div className="flex-1 min-w-0">
            <p className="text-text-secondary/60 text-[10px] leading-tight mb-0.5 truncate">Overall Rank</p>
            <p className="text-[18px] leading-tight font-bold text-white truncate">{overallRank}</p>
            <span className="flex items-center gap-0.5 text-success text-[10px] font-semibold mt-0.5 truncate">
              <TrendingUp className="w-3.5 h-3.5" /> {rankChange}
            </span>
          </div>

          <div className="w-px h-8 bg-white/10 shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="text-text-secondary/60 text-[10px] leading-tight mb-0.5 truncate">Total Points</p>
            <p className="text-[18px] leading-tight font-bold text-white truncate">{totalPoints}</p>
          </div>

          <div className="w-px h-8 bg-white/10 shrink-0" />

          <div className="flex-1 min-w-0">
            <p className="text-text-secondary/60 text-[10px] leading-tight mb-0.5 truncate">Gameweek Points</p>
            <p className="text-[18px] leading-tight font-bold text-success truncate">{gameweekPoints}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
