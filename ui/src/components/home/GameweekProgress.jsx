import React, { useState, useEffect } from "react";
import { Card, CardHeader } from "./Primitives";

function calcCountdown(endDate) {
  const now = Date.now();
  const diff = Math.max(0, new Date(endDate).getTime() - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return {
    days: String(days).padStart(2, "0"),
    hrs: String(hrs).padStart(2, "0"),
    mins: String(mins).padStart(2, "0"),
    secs: String(secs).padStart(2, "0"),
  };
}

function calcPercent(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

/**
 * GameweekProgress - countdown timer blocks + progress bar.
 *
 * Props:
 *  - gameweek, deadlineLabel
 *  - startDate: ISO string for gameweek start
 *  - endDate: ISO string for gameweek end
 *  - badge: element/icon shown top-right (e.g. league logo)
 */
export default function GameweekProgress({
  gameweek = 15,
  deadlineLabel = "GW 15 Deadline",
  startDate = null,
  endDate = null,
  badge,
}) {
  const [countdown, setCountdown] = useState({ days: "00", hrs: "00", mins: "00", secs: "00" });
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (!endDate) return;

    const tick = () => {
      setCountdown(calcCountdown(endDate));
      setPercent(calcPercent(startDate, endDate));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startDate, endDate]);

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
            className="flex-1 bg-primary/20 border border-primary/10 rounded-lg py-1 sm:py-1.5 text-center"
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
            className="h-full rounded-full bg-success"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-success text-[9px] sm:text-[10px] font-semibold">
          {percent}%
        </span>
      </div>
    </Card>
  );
}
