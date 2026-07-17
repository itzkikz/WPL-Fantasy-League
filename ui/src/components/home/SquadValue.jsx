import React from "react";
import { Coins } from "lucide-react";
import { Card, CardHeader } from "./Primitives";

/**
 * SquadValue - total squad value with a mini sparkline trend, plus
 * bank balance / team value sub-stats.
 */
export default function SquadValue({
  totalValue = "£102.5M",
  bank = "£1.2M",
  teamValue = "£101.3M",
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

  return (
    <Card className="h-full flex flex-col justify-between">
      <div>
        <CardHeader title="Squad Value" />
        <p className="text-text-primary font-bold text-xl mb-1">{totalValue}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-text-secondary text-xs">Total Value</span>
          <svg viewBox="0 0 100 40" className="w-20 h-8" preserveAspectRatio="none">
            <polyline
              points={points}
              fill="none"
              stroke="var(--color-success)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div>
          <p className="text-text-secondary text-xs">Bank</p>
          <p className="text-text-primary font-semibold text-xs">{bank}</p>
        </div>
        <div className="text-right">
          <p className="text-text-secondary text-xs">Team Value</p>
          <p className="text-text-primary font-semibold text-xs">{teamValue}</p>
        </div>
        <Coins className="w-6 h-6 text-warning" />
      </div>
    </Card>
  );
}

