import React from "react";
import { Card, CardHeader } from "./Primitives";

/**
 * GameweekProgress - countdown timer blocks + progress bar.
 *
 * Props:
 *  - gameweek, deadlineLabel
 *  - countdown: { days, hrs, mins, secs }
 *  - percent: 0-100 progress bar fill
 *  - badge: element/icon shown top-right (e.g. league logo)
 */
export default function GameweekProgress({
  gameweek = 15,
  deadlineLabel = "GW 15 Deadline",
  countdown = { days: "01", hrs: "04", mins: "32", secs: "15" },
  percent = 75,
  badge,
}) {
  const units = [
    { label: "DAYS", value: countdown.days },
    { label: "HRS", value: countdown.hrs },
    { label: "MINS", value: countdown.mins },
    { label: "SECS", value: countdown.secs },
  ];

  return (
    <Card padded={false} className="!h-fit p-1.5 sm:p-4">
      <CardHeader
        title={`Gameweek ${gameweek} Progress`}
        // subtitle={deadlineLabel}
        action={badge}
        className="!mb-2"
      />
      <div className="flex gap-0.5 sm:gap-1 mb-2.5">
        {units.map((u) => (
          <div
            key={u.label}
            className="flex-1 bg-[#302151] rounded-lg py-1 sm:py-1.5 text-center"
          >
            <p className="text-text-primary font-bold text-[10px] sm:text-xs leading-tight">
              {u.value}
            </p>
            <p className="text-text-secondary text-[8px] sm:text-[9px] tracking-wide">
              {u.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1.5 rounded-full bg-surface overflow-hidden">
          <div
            className="h-full rounded-full bg-[#0DD940]"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-[#0DD940] text-[9px] sm:text-[10px] font-semibold">
          {percent}%
        </span>
      </div>
    </Card>
  );
}

