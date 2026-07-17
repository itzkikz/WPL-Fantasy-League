import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardHeader, LinkText } from "./Primitives";

/**
 * LeagueStandings - displays a list of teams, their ranks, gameweek points,
 * total points, and rank changes.
 */
export default function LeagueStandings({
  title = "League Standings",
  subtitle = "Overall Leaderboard",
  standings = [],
  onViewFull,
}) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-text-secondary font-medium">
              <th className="py-2 pr-2 text-center w-8">Pos</th>
              <th className="py-2 pr-2">Team</th>
              <th className="py-2 pr-2 text-center">GW</th>
              <th className="py-2 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.slice(0, 5).map((item) => {
              const rankChange = item.rankChange || 0;
              return (
                <tr
                  key={item.team}
                  className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="py-2 pr-2">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-semibold text-text-primary">{item.rank}</span>
                      {rankChange > 0 ? (
                        <TrendingUp className="w-3 h-3 text-success flex-shrink-0" />
                      ) : rankChange < 0 ? (
                        <TrendingDown className="w-3 h-3 text-danger flex-shrink-0" />
                      ) : (
                        <Minus className="w-2.5 h-2.5 text-text-secondary flex-shrink-0" />
                      )}
                    </div>
                  </td>
                  <td className="py-2 pr-2 font-medium text-text-primary truncate max-w-[80px] sm:max-w-[100px]">
                    {item.team}
                  </td>
                  <td className="py-2 pr-2 text-center text-text-secondary">
                    {item.gameweekPoints}
                  </td>
                  <td className="py-2 text-right font-bold text-text-primary">
                    {item.totalPoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {onViewFull && (
        <LinkText className="block mt-3">
          <button onClick={onViewFull} className="hover:underline active:opacity-70">
            View Full Standings
          </button>
        </LinkText>
      )}
    </Card>
  );
}
