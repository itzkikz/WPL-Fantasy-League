import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Trophy } from "lucide-react";
import { Card, CardHeader } from "./Primitives";

export default function LeagueStandings({
  title = "League Standings",
  subtitle = "Overall Leaderboard",
  standings = [],
  myTeam = "",
  limit = 4,
}) {
  return (
    <Card padded={false} className="h-full p-2 sm:p-3.5">
      <CardHeader title={title} subtitle={subtitle} className="!mb-1.5" />

      <div className="space-y-1">
        {standings.slice(0, limit).map((item, i) => {
          const posChange = item.rankChange || 0;
          const isFirst = item.rank === 1;
          const isMe = myTeam && item.team === myTeam;

          return (
            <Link
              to="/manager-overview"
              search={{ teamId: item.team_id || "" }}
              key={item.team || i}
              className={`
                block rounded-xl transition-all duration-200 active:scale-[0.97] cursor-pointer
                ${isFirst
                  ? 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-sm'
                  : isMe
                    ? 'bg-primary/10 border border-primary/30 shadow-sm'
                    : 'bg-elevated/40 border border-border hover:bg-elevated'
                }
              `}
            >
              {/* Row: Rank + Name + Points */}
              <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 min-w-0">
                {/* Rank */}
                <div className="w-5 sm:w-6 flex flex-col items-center justify-center shrink-0">
                  {isFirst ? (
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <span className={`text-[11px] sm:text-xs font-black ${isMe ? 'text-primary' : 'text-text-primary'}`}>{item.rank}</span>
                  )}
                  {posChange !== 0 ? (
                    <span className={`text-[7px] font-bold flex items-center ${posChange > 0 ? 'text-success' : 'text-danger'}`}>
                      {posChange > 0 ? '▲' : '▼'}{Math.abs(posChange)}
                    </span>
                  ) : (
                    <span className="text-[8px] text-text-muted/40">-</span>
                  )}
                </div>

                {/* Team Name */}
                <div className="flex-1 min-w-0 pr-1">
                  <span className={`text-[11px] sm:text-xs font-bold leading-tight break-words block ${isMe ? 'text-primary' : 'text-text-primary'}`}>
                    {item.team}
                  </span>
                </div>

                {/* Total Points Only */}
                <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                  <span className={`text-[10px] sm:text-xs font-black font-mono whitespace-nowrap ${isMe ? 'text-primary' : 'text-text-primary'}`}>
                    {item.totalPoints} pts
                  </span>
                  <ChevronRight className="w-3 h-3 text-text-muted/40 shrink-0" />
                </div>
              </div>

            </Link>
          );
        })}
      </div>

      <div className="pt-1 mt-1 border-t border-white/[0.04]">
        <Link
          to="/standings"
          className="text-primary text-[11px] sm:text-xs font-medium hover:text-primary/80 transition-colors hover:underline active:opacity-70"
        >
          View All
        </Link>
      </div>
    </Card>
  );
}
