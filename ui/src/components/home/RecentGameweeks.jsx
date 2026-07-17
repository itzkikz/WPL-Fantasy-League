import React from "react";
import { Card, CardHeader } from "./Primitives";

/**
 * RecentGameweeks - simple bar chart of recent gameweek scores.
 * Last bar is highlighted (current gameweek) by default.
 *
 * Props:
 *  - data: [{ label, value }]
 *  - highlightLast: boolean
 */
export default function RecentGameweeks({
  data = [
    { label: "GW10", value: 72 },
    { label: "GW11", value: 48 },
    { label: "GW12", value: 61 },
    { label: "GW13", value: 76 },
  ],
  highlightLast = true,
}) {
  const displayData = data.slice(-4);
  const max = Math.max(...displayData.map((d) => d.value));

  return (
    <Card padded={false} className="h-full p-2.5 sm:p-4">
      <CardHeader title="Recent Gameweeks" className="!mb-2" />
      <div className="flex items-end justify-between gap-2 h-24 sm:h-28 px-1">
        {displayData.map((d, i) => {
          const isLast = highlightLast && i === displayData.length - 1;
          const heightPct = (d.value / max) * 100;
          return (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span
                className={`text-[10px] sm:text-xs font-semibold ${isLast ? "text-success" : "text-text-secondary"
                  }`}
              >
                {d.value}
              </span>
              <div
                style={{ height: `${heightPct}%` }}
                className={`w-full max-w-[22px] sm:max-w-[26px] rounded-t-md ${
                  isLast 
                    ? "bg-gradient-to-t from-success to-success-bright shadow-[0_0_8px_rgba(74,222,128,0.3)]" 
                    : "bg-gradient-to-t from-primary-dark to-primary"
                }`}
              />
              <span className="text-text-secondary text-[9px] sm:text-[10px]">{d.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}


