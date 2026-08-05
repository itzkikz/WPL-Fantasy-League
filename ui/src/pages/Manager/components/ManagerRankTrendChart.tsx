import React from "react";
import { TrendingUp, Award, Target, Zap } from "lucide-react";

interface GwHistoryItem {
  gameweek: number;
  points: number;
}

interface ManagerRankTrendChartProps {
  history: GwHistoryItem[];
  currentGwPoints?: number;
  totalPoints?: number;
}

export const ManagerRankTrendChart: React.FC<ManagerRankTrendChartProps> = ({
  history = [],
}) => {
  if (!history || history.length === 0) return null;

  // Sort history by gameweek ascending
  const sortedHistory = [...history].sort((a, b) => a.gameweek - b.gameweek);
  const pointsList = sortedHistory.map((h) => h.points);
  
  const maxPts = Math.max(...pointsList, 1);
  const minPts = Math.min(...pointsList, 0);
  const avgPts = pointsList.length > 0 ? (pointsList.reduce((a, b) => a + b, 0) / pointsList.length).toFixed(1) : "0.0";
  
  const highestGwObj = sortedHistory.reduce((max, h) => (h.points > max.points ? h : max), sortedHistory[0] || { gameweek: 1, points: 0 });

  return (
    <div className="bg-background/60 border border-border/60 rounded-2xl p-3.5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-secondary" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Gameweek Performance
          </span>
        </div>
        <span className="text-[10px] font-bold text-text-muted bg-white/5 border border-white/10 px-2 py-0.5 rounded-full font-mono">
          {sortedHistory.length} GWs
        </span>
      </div>

      {/* Quick Stat Highlights */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface/60 border border-border/40 rounded-xl p-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">Best GW</span>
            <span className="text-xs font-black text-emerald-400 font-mono">
              {highestGwObj.points} pts <span className="text-[9px] text-text-muted font-normal">(GW{highestGwObj.gameweek})</span>
            </span>
          </div>
        </div>

        <div className="bg-surface/60 border border-border/40 rounded-xl p-2 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Target className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[8px] font-bold text-text-muted uppercase tracking-wider block">Average</span>
            <span className="text-xs font-black text-indigo-400 font-mono">
              {avgPts} pts/GW
            </span>
          </div>
        </div>
      </div>

      {/* Visual Bar Graph */}
      <div className="pt-2">
        <div className="flex items-end justify-between gap-1 h-20 w-full px-1">
          {sortedHistory.map((h) => {
            const heightPct = maxPts > 0 ? Math.max((h.points / maxPts) * 100, 8) : 8;
            const isHighest = h.gameweek === highestGwObj.gameweek;

            return (
              <div key={h.gameweek} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                {/* Tooltip on hover */}
                <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-surface text-[9px] font-bold px-1.5 py-0.5 rounded border border-border pointer-events-none whitespace-nowrap z-20 shadow-md">
                  GW{h.gameweek}: {h.points} pts
                </div>

                {/* Score text above bar */}
                <span className="text-[7px] font-mono font-bold text-text-secondary mb-0.5 leading-none">
                  {h.points}
                </span>

                {/* Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full max-w-[16px] rounded-t-sm transition-all duration-300 ${
                    isHighest
                      ? "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/30"
                      : "bg-gradient-to-t from-secondary/40 to-secondary/80 hover:from-secondary/60 hover:to-secondary"
                  }`}
                />

                {/* GW label below bar */}
                <span className="text-[7px] font-mono text-text-muted mt-1 leading-none">
                  G{h.gameweek}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
