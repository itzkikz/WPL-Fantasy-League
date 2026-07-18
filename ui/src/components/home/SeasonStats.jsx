import React from "react";
import { Target, Activity, ShieldCheck, Square } from "lucide-react";
import { Card, CardHeader, IconCircle, LinkText } from "./Primitives";

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
    <Card padded={false} className="h-full p-1.5 sm:p-4">
      <CardHeader title={title} className="!mb-2" />
      <div className="grid grid-cols-4 divide-x divide-white/[0.08] h-24 sm:h-auto items-center">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center text-center gap-1.5 px-0.5 h-full">
            <IconCircle bg="bg-surface" className="w-7 h-7 sm:w-8 sm:h-8" size={null}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-text-secondary" />
            </IconCircle>
            <div className="flex flex-col items-center justify-between flex-1">
              <p className="text-text-secondary text-[8px] sm:text-[10px] leading-tight tracking-tight max-w-[72px]">{label}</p>
              <p className="text-text-primary font-bold text-[10px] sm:text-xs mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 border-t border-white/[0.04]">
        <LinkText>
          <button onClick={onViewAll} className="hover:underline active:opacity-70">View All</button>
        </LinkText>
      </div>
    </Card>
  );
}
