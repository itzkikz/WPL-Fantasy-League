import React from "react";
import { Target, Activity, ShieldCheck, Square } from "lucide-react";
import { Card, CardHeader, LinkText, IconCircle } from "./Primitives";

/**
 * SeasonStats - vertical list of labeled stats with icon + value.
 */
export default function SeasonStats({
  title = "Season Stats",
  stats = [
    { icon: Target, label: "Goals Scored", value: "1,245" },
    { icon: Activity, label: "Avg. Goals / Game", value: "3.12" },
    { icon: ShieldCheck, label: "Clean Sheets", value: "321" },
    { icon: Square, label: "Yellow Cards", value: "452" },
  ],
  onViewAll,
}) {
  return (
    <Card>
      <CardHeader title={title} />
      <ul className="flex flex-col gap-2.5 mb-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <li key={label} className="flex items-center gap-3">
            <IconCircle bg="bg-surface" size={32}>
              <Icon className="w-4 h-4 text-text-secondary" />
            </IconCircle>
            <div className="flex-1">
              <p className="text-text-secondary text-xs">{label}</p>
              <p className="text-text-primary font-semibold text-xs">{value}</p>
            </div>
          </li>
        ))}
      </ul>
      <LinkText>
        <button onClick={onViewAll} className="hover:underline active:opacity-70">
          View All
        </button>
      </LinkText>
    </Card>
  );
}

