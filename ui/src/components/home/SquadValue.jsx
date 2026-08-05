import React from "react";
import { Wallet, Shield, Gift, AlertTriangle } from "lucide-react";
import { Card, CardHeader } from "./Primitives";

/**
 * SquadValue - Comprehensive squad financial overview with sparkline trend,
 * budget utilization progress bar, and bonus/fine breakdown.
 */
export default function SquadValue({
  totalValue = "£100.0M",
  bank = "£100.0M",
  teamValue = "£0.0M",
  totalBudget = 100.0,
  utilisation = 0,
  bonus = 0,
  fine = 0,
  trend = [3, 5, 4, 7, 6, 9, 8, 10],
}) {
  const max = Math.max(...trend);
  const min = Math.min(...trend);
  const points = trend
    .map((v, i) => {
      const x = (i / (trend.length - 1)) * 100;
      const y = 100 - ((v - min) / (max - min || 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  const formatMoney = (val) => {
    if (val === null || val === undefined) return "£0.0M";
    if (typeof val === "number") return `£${val.toFixed(1)}M`;
    const str = String(val);
    if (str.startsWith("£")) return str;
    const num = parseFloat(str.replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) return `£${num.toFixed(1)}M`;
    return str;
  };

  const numericTeamVal = typeof teamValue === "number" ? teamValue : parseFloat(String(teamValue).replace(/[^0-9.]/g, "")) || utilisation || 0;
  const numericBankVal = typeof bank === "number" ? bank : parseFloat(String(bank).replace(/[^0-9.]/g, "")) || 0;
  const calcTotal = numericTeamVal + numericBankVal || totalBudget || 100;

  const teamValPercent = Math.min(100, Math.max(0, (numericTeamVal / calcTotal) * 100));
  const bankPercent = Math.min(100, Math.max(0, 100 - teamValPercent));

  const hasBonus = bonus && bonus > 0;
  const hasFine = fine && fine > 0;

  return (
    <Card padded={false} className="h-full flex flex-col justify-between p-2.5 sm:p-4">
      <div>
        <CardHeader title="Squad Value" subtitle="Financial Roster Overview" className="mb-2 sm:mb-3" />

        {/* Total Value & Sparkline */}
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold text-text-muted block truncate">
              Total Squad Value
            </span>
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2 mt-0.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary truncate">
                {formatMoney(totalValue)}
              </h2>
              {(hasBonus || hasFine) && (
                <div className="flex flex-wrap items-center gap-1">
                  {hasBonus && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold shrink-0">
                      <Gift className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> +£{bonus.toFixed(1)}M
                    </span>
                  )}
                  {hasFine && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[9px] sm:text-[10px] font-bold shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> -£{fine.toFixed(1)}M
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-16 sm:w-20 lg:w-24 h-8 sm:h-10 shrink-0">
            <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="squadValueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--color-success)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={`0,40 ${points} 100,40`}
                fill="url(#squadValueGradient)"
              />
              <polyline
                points={points}
                fill="none"
                stroke="var(--color-success)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>

        {/* Budget Allocation Progress Bar */}
        <div className="space-y-1 sm:space-y-1.5 mb-3 sm:mb-4">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-text-secondary">
            <span>Budget Allocation</span>
            <span className="text-text-primary font-bold">{teamValPercent.toFixed(0)}% Utilized</span>
          </div>
          <div className="h-1.5 sm:h-2 w-full bg-surface-hover/80 rounded-full overflow-hidden flex p-0.5 border border-border/40 shadow-inner">
            <div
              style={{ width: `${teamValPercent}%` }}
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
              title={`Team Value: ${teamValPercent.toFixed(1)}%`}
            />
            <div
              style={{ width: `${bankPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              title={`Bank: ${bankPercent.toFixed(1)}%`}
            />
          </div>
        </div>
      </div>

      {/* Financial Sub-Stats Grid */}
      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-auto pt-2.5 sm:pt-3 border-t border-border/50">
        <div className="p-2 sm:p-2.5 rounded-xl bg-background/50 border border-border/50 flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1">
            <p className="text-text-muted text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">In Bank</p>
            <p className="text-emerald-400 font-extrabold text-xs sm:text-sm mt-0.5 truncate">{formatMoney(bank)}</p>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>

        <div className="p-2 sm:p-2.5 rounded-xl bg-background/50 border border-border/50 flex items-center justify-between min-w-0">
          <div className="min-w-0 flex-1 pr-1">
            <p className="text-text-muted text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">Team Value</p>
            <p className="text-indigo-400 font-extrabold text-xs sm:text-sm mt-0.5 truncate">{formatMoney(teamValue)}</p>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </div>
    </Card>
  );
}

