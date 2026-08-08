import React from "react";
import { ChevronRight, TrendingUp, Shield, Trophy, Star, Zap, Users } from "lucide-react";

// Placeholder for the Fantasy Team Logo
function LogoPlaceholder() {
  return (
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
      {/* Outer soft glow */}
      <div className="absolute inset-0 rounded-full bg-white/20 blur-md" />
      {/* Glassmorphic shield wrapper */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
        <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white/10" />
      </div>
    </div>
  );
}

/**
 * TeamOverview - hero banner showing team identity + headline stats.
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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-overview bg-dots shadow-card">
      {/* Decorative gradient glows */}
      <div className="absolute -top-20 -left-16 w-56 h-56 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-10 -top-8 w-48 h-48 rounded-full bg-[#1D8D44]/15 blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="relative p-4 sm:p-6 pb-3 flex items-start justify-between gap-3 min-h-[135px] sm:min-h-[155px]">
        {/* Left Info: Team Name & Managers */}
        <div className="relative z-10 flex-1 min-w-0 pt-0.5">
          <button
            onClick={onClick}
            className="group flex items-center gap-1 text-[11px] sm:text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer mb-1.5"
          >
            <span>Team</span>
            <span className="font-bold text-text-primary">Overview</span>
            <ChevronRight className="w-3.5 h-3.5 text-text-secondary group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-rose-500 to-rose-700 text-white flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-rose-900/30 shrink-0 ring-1 ring-white/20">
              {crestEmoji}
            </div>
            <h1
              onClick={onClick}
              className="text-text-primary text-xl sm:text-2xl md:text-[26px] font-black tracking-tight flex items-center cursor-pointer hover:opacity-90 transition-opacity truncate"
            >
              <span className="truncate">{teamName}</span>
            </h1>
          </div>

          {managers.length > 0 && (
            <p className="text-text-secondary text-[10px] sm:text-[11px] font-medium leading-tight mt-1.5 ml-[46px] sm:ml-[54px] line-clamp-1 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-text-tertiary shrink-0" />
              <span className="truncate">{managers.join(" · ")}</span>
            </p>
          )}
        </div>

        {/* Right Side: Logo on a circular pitch badge */}
        <div className="relative shrink-0 w-28 h-28 sm:w-36 sm:h-36 -mr-1 sm:-mr-2">
          {/* Pitch backdrop */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#23A24E] to-[#0B5F2B] shadow-lg shadow-black/20" />
          <div className="absolute inset-1.5 rounded-full border border-white/15" />
          {/* Center circle accent */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/30" />
          </div>

          {logo ? (
            <img
              src={logo}
              alt={`${teamName} logo`}
              className="relative z-10 w-full h-full p-3 sm:p-4 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.45)] transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <LogoPlaceholder />
            </div>
          )}
        </div>
      </div>

      {/* Stats Strip */}
      <div className="relative z-10 grid grid-cols-3 border-t border-border bg-black/5 dark:bg-white/5 backdrop-blur-sm">
        {/* Overall Rank */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-5 py-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/15 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-text-secondary text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">
              Overall Rank
            </p>
            <div className="flex items-baseline gap-1.5 mt-0.5 min-w-0">
              <p className="text-sm sm:text-base md:text-lg font-black text-text-primary truncate">
                {overallRank}
              </p>
              <span className="inline-flex items-center gap-0.5 text-success text-[9px] sm:text-[10px] font-bold shrink-0">
                <TrendingUp className="w-3 h-3" /> {rankChange}
              </span>
            </div>
          </div>
        </div>

        {/* Total Points */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-5 py-3 border-l border-border min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-text-secondary text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">
              Total Points
            </p>
            <p className="text-sm sm:text-base md:text-lg font-black text-text-primary truncate mt-0.5">
              {totalPoints}
            </p>
          </div>
        </div>

        {/* GW Points */}
        <div className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-5 py-3 border-l border-border min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-text-secondary text-[9px] sm:text-[10px] uppercase font-bold tracking-wider truncate">
              GW Points
            </p>
            <p className="text-sm sm:text-base md:text-lg font-black text-success truncate mt-0.5">
              {gameweekPoints}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
