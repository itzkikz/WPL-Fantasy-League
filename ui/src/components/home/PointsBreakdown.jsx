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
  total = "0",
  segments = [],
}) {
  const active = segments.filter((s) => s.value > 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <Card padded={false} className="h-full p-2.5 sm:p-4">
      <CardHeader title="Points Breakdown" className="!mb-2" />
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative w-14 h-14 sm:w-[76px] sm:h-[76px] flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {active.length > 0 ? (
              active.map((seg) => {
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
              })
            ) : (
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="var(--color-surface, #333)"
                strokeWidth="14"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-text-primary font-bold text-[10px] sm:text-sm">{total}</span>
            <span className="text-text-secondary text-[8px] sm:text-[10px]">Total</span>
          </div>
        </div>

        <div className="min-w-0 flex-1 flex flex-col gap-0.5 sm:gap-1">
          {active.map((seg) => (
            <div key={seg.label} className="flex items-center gap-1 sm:gap-1.5 text-[7px] sm:text-[8px]">
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
