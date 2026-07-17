import React from "react";
import { ChevronRight, Trophy } from "lucide-react";
import { Card, CardHeader } from "./Primitives";

export default function LeagueStandings({
  title = "League Standings",
  subtitle = "Overall Leaderboard",
  standings = [],
  myTeam = "",
  onViewFull,
  limit = 3,
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />

      <div className="space-y-1.5">
        {standings.slice(0, limit).map((item, i) => {
          const posChange = item.rankChange || 0;
          const isFirst = item.rank === 1;
          const isMe = myTeam && item.team === myTeam;

          return (
            <div
              key={item.team || i}
              className={`
                rounded-xl transition-all duration-200 active:scale-[0.97]
                ${isFirst
                  ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                  : isMe
                    ? 'bg-[#211433]/70 border border-primary/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
                    : 'bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06]'
                }
              `}
            >
              {/* Row 1: Rank + Name */}
              <div className="flex items-center gap-2 p-2 min-w-0">
                {/* Rank */}
                <div className="w-7 flex flex-col items-center justify-center flex-shrink-0">
                  {isFirst ? (
                    <Trophy className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span className={`text-xs font-black ${isMe ? 'text-primary' : 'text-white'}`}>{item.rank}</span>
                  )}
                  {posChange !== 0 ? (
                    <span className={`text-[7px] font-bold flex items-center gap-0.5 ${posChange > 0 ? 'text-success' : 'text-danger'}`}>
                      {posChange > 0 ? '▲' : '▼'}{Math.abs(posChange)}
                    </span>
                  ) : (
                    <span className="text-[8px] text-[#c8c8c8]/20">-</span>
                  )}
                </div>

                {/* Name - desktop shows stats inline, mobile just name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-xs font-bold leading-snug truncate ${isMe ? 'text-primary' : 'text-white'}`}>
                      {item.team}
                    </span>
                    {isMe && <span className="text-[7px] font-black text-primary/70 bg-primary/10 px-1 py-px rounded uppercase tracking-wider flex-shrink-0">You</span>}
                  </div>
                  {item.manager && (
                    <p className="text-[9px] text-[#c8c8c8]/40 truncate mt-px">{item.manager}</p>
                  )}
                </div>

                {/* Desktop: GW + Total inline */}
                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                  <div className={`text-center font-black text-xs w-8 ${isMe ? 'text-primary' : 'text-success'}`}>
                    {item.gameweekPoints}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-black ${isMe ? 'text-primary' : 'text-white'}`}>{item.totalPoints}</span>
                    <ChevronRight className="w-3 h-3 text-[#c8c8c8]/20" />
                  </div>
                </div>
              </div>

              {/* Row 2 (mobile only): GW + Total */}
              <div className="flex sm:hidden items-center justify-between px-2 pb-2 pt-0 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-[#c8c8c8]/40 uppercase">GW</span>
                  <span className={`text-xs font-black ${isMe ? 'text-primary' : 'text-success'}`}>{item.gameweekPoints}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-[#c8c8c8]/40 uppercase">Total</span>
                  <span className={`text-xs font-black ${isMe ? 'text-primary' : 'text-white'}`}>{item.totalPoints}</span>
                  <ChevronRight className="w-3 h-3 text-[#c8c8c8]/20" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {onViewFull && (
        <button
          onClick={onViewFull}
          className="mt-3 w-full py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[10px] font-bold text-[#c8c8c8]/60 uppercase tracking-wider hover:bg-white/[0.08] hover:text-white transition-all active:scale-[0.98] cursor-pointer"
        >
          View Full Standings
        </button>
      )}
    </Card>
  );
}
