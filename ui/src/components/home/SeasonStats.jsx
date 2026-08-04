import React from "react";
import { Target, Activity, ShieldCheck, Trophy, Goal, Shield } from "lucide-react";
import { Card, CardHeader } from "./Primitives";

/**
 * SeasonStats - Displays detailed seasonal statistics in a clean,
 * single-row horizontal stat banner across the dashboard.
 */
export default function SeasonStats({
  title = "Season Performance Breakdown",
  stats = [],
}) {
  const defaultStats = [
    { icon: Target, label: "Total Points", value: "0 pts", colorClass: "text-emerald-400", bgClass: "bg-emerald-500/10 border-emerald-500/20" },
    { icon: Activity, label: "Avg / GW", value: "0 pts", colorClass: "text-indigo-400", bgClass: "bg-indigo-500/10 border-indigo-500/20" },
    { icon: ShieldCheck, label: "Highest GW", value: "0 pts", colorClass: "text-amber-400", bgClass: "bg-amber-500/10 border-amber-500/20" },
    { icon: Trophy, label: "Overall Rank", value: "#1", colorClass: "text-purple-400", bgClass: "bg-purple-500/10 border-purple-500/20" },
    { icon: Goal, label: "Goals Scored", value: "0", colorClass: "text-rose-400", bgClass: "bg-rose-500/10 border-rose-500/20" },
    { icon: Shield, label: "Clean Sheets", value: "0", colorClass: "text-teal-400", bgClass: "bg-teal-500/10 border-teal-500/20" },
  ];

  const displayStats = stats && stats.length > 0 ? stats : defaultStats;

  return (
    <Card className="p-3 sm:p-4 bg-surface/90 border border-border/70 shadow-xl backdrop-blur-md rounded-2xl">
      <CardHeader title={title} subtitle="Comprehensive Campaign Metrics" className="!mb-3" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {displayStats.map(({ icon: Icon = Target, label, value, colorClass = "text-purple-400", bgClass = "bg-purple-500/10 border-purple-500/20" }) => (
          <div
            key={label}
            className="p-2.5 rounded-xl bg-background/50 border border-border/40 hover:border-purple-500/30 transition-all flex items-center gap-2.5 min-w-0"
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 ${bgClass} ${colorClass}`}>
              <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-text-muted text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">{label}</p>
              <p className="text-text-primary font-black text-xs sm:text-sm mt-0.5 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
