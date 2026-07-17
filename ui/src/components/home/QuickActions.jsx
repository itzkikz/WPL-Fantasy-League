import React from "react";
import { Trophy, BarChart3, Gift } from "lucide-react";
import { Card } from "./Primitives";

/**
 * QuickActionTile - single tappable row-style card with icon + title + subtitle.
 * Reusable individually, or use QuickActionsRow to lay out a set of three (as in the design).
 */
export function QuickActionTile({ icon: Icon, title, subtitle, onClick }) {
  return (
    <Card
      as="button"
      onClick={onClick}
      className="flex items-center gap-3 text-left w-full hover:bg-surface/50 active:bg-surface/70 transition-colors cursor-pointer"
    >
      <Icon className="w-6 h-6 text-primary" />
      <div>
        <p className="text-text-primary font-semibold text-xs">{title}</p>
        <p className="text-text-secondary text-xs">{subtitle}</p>
      </div>
    </Card>
  );
}

/** QuickActionsRow - the 3-across grid of QuickActionTile as seen in the design */
export default function QuickActionsRow({
  items = [
    { icon: Trophy, title: "Mini League", subtitle: "View mini league" },
    { icon: BarChart3, title: "League Standings", subtitle: "View full table" },
    { icon: Gift, title: "Invite Friends", subtitle: "Earn rewards" },
  ],
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      {items.map((item) => (
        <QuickActionTile key={item.title} {...item} />
      ))}
    </div>
  );
}

