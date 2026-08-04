import React from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Trophy } from "lucide-react";
import { Card, CardHeader } from "./Primitives";

export default function LeagueStandings({
  title = "League Standings",
  subtitle = "Overall Leaderboard",
  standings = [],
  myTeam = "",
  limit = 3,
}) {
  return (
    <Card padded={false} className="h-full p-2.5 sm:p-4">
      <CardHeader title={title} subtitle={subtitle} className="!mb-2" />

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
              {/* Row 1: Rank + Name */}
              <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 min-w-0">
                {/* Rank */}
                <div className="w-7 flex flex-col items-center justify-center flex-shrink-0">
                  {isFirst ? (
                    <Trophy className="w-4 h-4 text-amber-400" />
                  ) : (
                    <span className={`text-xs font-black ${isMe ? 'text-primary' : 'text-text-primary'}`}>{item.rank}</span>
                  )}
                  {posChange !== 0 ? (
                    <span className={`text-[7px] font-bold flex items-center gap-0.5 ${posChange > 0 ? 'text-success' : 'text-danger'}`}>
                      {posChange > 0 ? '▲' : '▼'}{Math.abs(posChange)}
                    </span>
                  ) : (
                    <span className="text-[8px] text-text-muted/40">-</span>
                  )}
                </div>

                {/* Name - desktop shows stats inline, mobile just name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`text-xs font-bold leading-snug whitespace-normal break-words ${isMe ? 'text-primary' : 'text-text-primary'}`}>
                      {item.team}
                    </span>
                    {isMe && <span className="text-[7px] font-black text-primary/70 bg-primary/10 px-1 py-px rounded uppercase tracking-wider flex-shrink-0">You</span>}
                  </div>
                </div>

                {/* Desktop: GW + Total inline */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className={`text-center font-black text-xs w-8 ${isMe ? 'text-primary' : 'text-success'}`}>
                    {item.gameweekPoints}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-black ${isMe ? 'text-primary' : 'text-text-primary'}`}>{item.totalPoints}</span>
                    <ChevronRight className="w-3 h-3 text-text-muted/40" />
                  </div>
                </div>
              </div>

            </Link>
          );
        })}
      </div>

      <div className="pt-1.5 border-t border-white/[0.04]">
        <Link
          to="/standings"
          className="text-primary text-xs font-medium hover:text-primary/80 transition-colors hover:underline active:opacity-70"
        >
          View All
        </Link>
      </div>
    </Card>
  );
}
