import React from "react";
import { Card, CardHeader } from "./Primitives";

/**
 * PointsBreakdown - donut chart (pure SVG, no chart lib) + legend.
 *
 * Props:
 *  - total: center label number
 *  - segments: [{ label, value, percent, color }]
 */
export default function PointsBreakdown({
  total = "1,234",
  segments = [
    { label: "Starting XI", value: 680, percent: 55, color: "var(--color-success)" },
    { label: "Subs", value: 120, percent: 10, color: "var(--color-info)" },
    { label: "Captains", value: 180, percent: 15, color: "var(--color-primary)" },
    { label: "Transfers", value: 254, percent: 20, color: "var(--color-warning)" },
  ],
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <Card padded={false} className="h-full p-2.5 sm:p-4">
      <CardHeader title="Points Breakdown" className="!mb-2" />
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative w-14 h-14 sm:w-[76px] sm:h-[76px] flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((seg) => {
              const dash = (seg.percent / 100) * circumference;
              const el = (
                <circle
                  key={seg.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offsetAcc}
                  strokeLinecap="butt"
                />
              );
              offsetAcc += dash;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-text-primary font-bold text-[10px] sm:text-sm">{total}</span>
            <span className="text-text-secondary text-[8px] sm:text-[10px]">Total</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 flex flex-col gap-1 sm:gap-1.5">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-[9px]">
              <span
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-text-secondary flex-1 truncate">{seg.label}</span>
              <span className="text-text-primary font-medium flex-shrink-0 ml-1">
                {seg.value} ({seg.percent}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}


