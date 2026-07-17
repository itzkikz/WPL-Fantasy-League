import React from "react";
import { Card, CardHeader, IconCircle } from "./Primitives";

/**
 * UpcomingFixture - two team crests with kickoff details in the middle.
 *
 * Props:
 *  - gameweek, date, time
 *  - homeTeam / awayTeam: { code, emoji, bg }
 */
export default function UpcomingFixture({
  gameweek = 15,
  date = "Sat, 20 Jul 2024",
  time = "8:30 PM",
  homeTeam = { code: "ARS", bg: "bg-rose-600" },
  awayTeam = { code: "CHE", bg: "bg-blue-600" },
}) {
  return (
    <Card padded={false} className="h-full p-2.5 sm:p-4">
      <CardHeader title="Upcoming Fixture" className="!mb-2" />
      <div className="flex items-center justify-between gap-1">
        <TeamBadge {...homeTeam} />

        <div className="text-center min-w-0 flex-1">
          <p className="text-text-secondary text-[8px] sm:text-xs mb-0.5">
            Gameweek {gameweek}
          </p>
          <p className="text-text-primary text-[8px] sm:text-xs font-medium mb-1 truncate">
            {date}
          </p>
          <span className="inline-block bg-surface text-text-primary text-[9px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-3 sm:py-1.5 rounded-md">
            {time}
          </span>
        </div>

        <TeamBadge {...awayTeam} />
      </div>
    </Card>
  );
}

function TeamBadge({ code, bg }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <IconCircle
        bg={bg}
        className="w-10 h-10 sm:w-14 sm:h-14"
        size={null}
      >
        <span className="text-sm sm:text-xl font-bold text-white">{code[0]}</span>
      </IconCircle>
      <span className="text-text-primary font-semibold text-[10px] sm:text-xs">{code}</span>
    </div>
  );
}
