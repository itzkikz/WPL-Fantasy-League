import React from "react";
import { Users, Clock, Star, Shield } from "lucide-react";
import { Card, CardHeader, IconCircle } from "./Primitives";

/**
 * LeagueStatistics - 4-across grid of icon + label + value stat blocks.
 * Shows in a single row on all devices (including mobile) with vertical dividers.
 */
export default function LeagueStatistics({
  title = "League Statistics",
  stats,
}) {
  const defaultStats = [
    {
      icon: Users,
      label: "Total Managers",
      value: "89,456",
      iconColor: "text-text-primary",
      circleClass: "border border-white/10 bg-white/5",
    },
    {
      icon: Clock,
      label: "GW Average",
      value: "48",
      iconColor: "text-indigo-400",
      circleClass: "border border-indigo-500/30 bg-indigo-500/5",
    },
    {
      icon: Star,
      label: "Highest Points",
      value: "86",
      iconColor: "text-pink-400",
      circleClass: "border border-pink-500/30 bg-pink-500/5",
    },
    {
      icon: Shield,
      label: "Total Teams",
      value: "2.4M",
      iconColor: "text-rose-400",
      circleClass: "border border-rose-500/30 bg-rose-500/5",
    },
  ];

  const displayStats = stats || defaultStats;

  return (
    <Card padded={false} className="!h-fit p-1.5 sm:p-4">
      <CardHeader title={title} className="!mb-2" />
      <div className="grid grid-cols-4 divide-x divide-white/[0.08] items-center">
        {displayStats.map(({ icon: Icon, label, value, iconColor, circleClass }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1.5 px-0.5 h-full">
            <IconCircle
              bg=""
              className={`${circleClass || "border border-white/10 bg-white/5"} w-7 h-7 sm:w-8 sm:h-8`}
              size={null}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconColor || "text-text-secondary"}`} />
            </IconCircle>
            <div className="flex flex-col items-center justify-between flex-1">
              <p className="text-text-secondary text-[8px] sm:text-[10px] leading-tight tracking-tight max-w-[72px]">
                {label}
              </p>
              <p className="text-text-primary font-bold text-[10px] sm:text-xs mt-0.5">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

