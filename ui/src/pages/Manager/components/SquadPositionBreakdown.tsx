import React from "react";
import { PieChart } from "lucide-react";
import { Player } from "../../../features/players/types";

interface SquadPositionBreakdownProps {
  starting?: {
    GK?: Player[];
    DEF?: Player[];
    MID?: Player[];
    FWD?: Player[];
  };
}

export const SquadPositionBreakdown: React.FC<SquadPositionBreakdownProps> = ({ starting }) => {
  if (!starting) return null;

  const sumPoints = (players: Player[] = []) =>
    players.reduce((acc, p) => acc + (Number(p.point) || 0), 0);

  const gkPts = sumPoints(starting.GK);
  const defPts = sumPoints(starting.DEF);
  const midPts = sumPoints(starting.MID);
  const fwdPts = sumPoints(starting.FWD);

  const totalStartingPts = Math.max(gkPts + defPts + midPts + fwdPts, 1);

  const gkPct = Math.round((gkPts / totalStartingPts) * 100);
  const defPct = Math.round((defPts / totalStartingPts) * 100);
  const midPct = Math.round((midPts / totalStartingPts) * 100);
  const fwdPct = Math.round((fwdPts / totalStartingPts) * 100);

  const positions = [
    { label: "GK", pts: gkPts, pct: gkPct, color: "bg-amber-500", text: "text-amber-400" },
    { label: "DEF", pts: defPts, pct: defPct, color: "bg-blue-500", text: "text-blue-400" },
    { label: "MID", pts: midPts, pct: midPct, color: "bg-emerald-500", text: "text-emerald-400" },
    { label: "FWD", pts: fwdPts, pct: fwdPct, color: "bg-rose-500", text: "text-rose-400" },
  ];

  return (
    <div className="bg-background/60 border border-border/60 rounded-2xl p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <PieChart className="w-3.5 h-3.5 text-secondary" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Points Contribution
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-secondary">
          {totalStartingPts} pts
        </span>
      </div>

      {/* Multi-segment Segmented Bar */}
      <div className="h-2 w-full bg-surface rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-white/5">
        {positions.map((pos) =>
          pos.pct > 0 ? (
            <div
              key={pos.label}
              style={{ width: `${pos.pct}%` }}
              className={`h-full ${pos.color} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
            />
          ) : null
        )}
      </div>

      {/* Legend & Breakdown */}
      <div className="grid grid-cols-4 gap-1 pt-0.5">
        {positions.map((pos) => (
          <div key={pos.label} className="text-center bg-surface/40 rounded-lg py-1 px-0.5 border border-border/30">
            <div className="flex items-center justify-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${pos.color}`} />
              <span className="text-[9px] font-bold text-text-muted">{pos.label}</span>
            </div>
            <p className={`text-[11px] font-black font-mono mt-0.5 ${pos.text}`}>
              {pos.pts} <span className="text-[8px] text-text-muted font-normal">({pos.pct}%)</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
