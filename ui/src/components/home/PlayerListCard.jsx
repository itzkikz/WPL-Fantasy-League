import React from "react";
import { Card, CardHeader, Avatar, LinkText } from "./Primitives";

/**
 * PlayerListCard - reusable list of players (used for "Top Players"
 * and "Best Performers" panels, and anywhere else a player list is needed).
 *
 * Props:
 *  - title, subtitle
 *  - players: [{ name, meta, position, value, photo }]
 *  - onViewAll
 */
export default function PlayerListCard({
  title = "Top Players",
  subtitle = "This Gameweek",
  players = [],
  viewAllLabel = "View All",
  onViewAll,
}) {
  return (
    <Card padded={false} className="h-full p-2.5 sm:p-4">
      <CardHeader title={title} subtitle={subtitle} className="!mb-2" />
      <ul className="flex flex-col gap-2 sm:gap-2.5 mb-2 sm:mb-3">
        {players.map((p, i) => (
          <li key={p.name} className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <span className="w-4 text-text-secondary text-[10px] sm:text-xs font-semibold flex-shrink-0 text-center">
              {i + 1}
            </span>
            <Avatar src={p.photo} alt={p.name} size={null} className="w-7 h-7 sm:w-9 sm:h-9 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-xs sm:text-sm font-medium truncate">
                {p.name}
              </p>
              <p className="text-text-secondary text-[9px] sm:text-xs truncate">
                {p.meta}{p.position ? ` • ${p.position}` : ""}
              </p>
            </div>
            <span className="text-text-primary font-semibold text-[10px] sm:text-xs flex-shrink-0 ml-1">
              {p.value}
            </span>
          </li>
        ))}
      </ul>
      <LinkText href="#" className="block" >
        <button onClick={onViewAll} className="hover:underline active:opacity-70 text-[10px] sm:text-xs">
          {viewAllLabel}
        </button>
      </LinkText>
    </Card>
  );
}
