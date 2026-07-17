import React, { useMemo } from "react";
import { Card, CardHeader, Avatar } from "./Primitives";

function normalizeForm(formHistory) {
  if (!formHistory || formHistory.length === 0) return [0.3, 0.45, 0.6, 0.8, 1];
  const max = Math.max(...formHistory, 1);
  return formHistory.map((pts) => pts / max);
}

function barColor(normalized) {
  if (normalized <= 0.33) return "var(--color-danger)";
  if (normalized <= 0.66) return "var(--color-warning)";
  return "var(--color-success)";
}

export default function PlayerSpotlight({
  photo,
  name = "E. Haaland",
  club = "Man City",
  position = "FWD",
  formHistory = [],
  points = 0,
  stats = {},
}) {
  const formBars = useMemo(() => normalizeForm(formHistory), [formHistory]);
  const isGK = position === "GK";

  const statRows = [
    { value: points, label: "Pts (GW)" },
    { value: stats.minutesPlayed, label: "Mins" },
    ...(!isGK ? [{ value: stats.goals, label: "Goals" }] : []),
    { value: stats.assists, label: "Assists" },
    ...(position === "GK" || position === "DEF" ? [{ value: stats.cleanSheet, label: "CS" }] : []),
    { value: stats.yellowCards, label: "YC", color: stats.yellowCards > 0 ? "text-amber-400" : undefined },
    { value: stats.redCards, label: "RC", color: stats.redCards > 0 ? "text-rose-400" : undefined },
    ...(isGK ? [
      { value: stats.penaltyMissed, label: "Pen Miss", color: stats.penaltyMissed > 0 ? "text-rose-400" : undefined },
      { value: stats.penaltySaved, label: "Pen Save", color: stats.penaltySaved > 0 ? "text-emerald-400" : undefined },
      { value: stats.saves, label: "Saves" },
    ] : [
      { value: stats.penaltyMissed, label: "Pen Miss", color: stats.penaltyMissed > 0 ? "text-rose-400" : undefined },
    ]),
    { value: stats.tackles, label: "Tackles" },
    { value: stats.clearances, label: "Clear" },
    { value: stats.blocks, label: "Blocks" },
    { value: stats.recovery, label: "Recovery" },
  ];

  return (
    <Card padded={false} className="h-full p-2.5 sm:p-4">
      <CardHeader title="Player Spotlight" className="!mb-3" />

      <div className="flex items-center gap-2.5 mb-3">
        <Avatar src={photo} alt={name} size={undefined} className="w-11 h-11 sm:w-14 sm:h-14 shrink-0" />
        <div className="min-w-0">
          <p className="text-text-primary font-semibold text-sm sm:text-base leading-tight line-clamp-2 sm:truncate">{name}</p>
          <p className="text-text-secondary text-[9px] sm:text-[10px] mt-0.5 truncate">
            {club} &nbsp;•&nbsp; {position}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-text-secondary text-[8px] sm:text-[9px] mb-1">Form (Last 5 GWs)</p>
        <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-7 sm:h-9">
          {formBars.map((h, i) => (
            <div key={i} className="h-full flex flex-col justify-end items-center">
              <span className="text-[7px] sm:text-[8px] font-mono text-text-secondary mb-0.5">{formHistory[i] ?? ""}</span>
              <div
                style={{
                  height: `${Math.max(h, 0.08) * 100}%`,
                  backgroundColor: barColor(h),
                }}
                className="w-2 sm:w-3 rounded-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-x-1 gap-y-2 border-t border-white/5 pt-2.5">
        {statRows.map((s, i) => (
          <MiniStat key={i} value={s.value ?? 0} label={s.label} color={s.color} />
        ))}
      </div>
    </Card>
  );
}

function MiniStat({ value, label, color }) {
  return (
    <div className="text-center">
      <p className={`font-bold text-[10px] sm:text-xs leading-none ${color || "text-text-primary"}`}>{value}</p>
      <p className="text-text-secondary text-[7px] sm:text-[8px] mt-0.5 whitespace-nowrap">{label}</p>
    </div>
  );
}
