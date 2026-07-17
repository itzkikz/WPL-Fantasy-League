import React from "react";
import { Card, CardHeader, Avatar } from "./Primitives";

/**
 * PlayerSpotlight - featured player photo, form bars, and quick stats.
 *
 * Props:
 *  - photo, name, club, position
 *  - formBars: array of 0-1 heights (5 bars typical), color-graded low->high
 *  - points, goals, assists
 */
export default function PlayerSpotlight({
  photo,
  name = "E. Haaland",
  club = "Man City",
  position = "FWD",
  formBars = [0.3, 0.45, 0.6, 0.8, 1],
  points = "12.4",
  goals = 7,
  assists = 2,
}) {
  const barColors = ["var(--color-danger)", "var(--color-warning)", "var(--color-warning)", "var(--color-success)", "var(--color-success)"];

  return (
    <Card padded={false} className="h-full p-2.5 sm:p-4">
      <CardHeader title="Player Spotlight" className="!mb-2" />
      <div className="flex gap-2">
        <Avatar src={photo} alt={name} size={undefined} className="w-10 h-10 sm:w-13 sm:h-13" />
        <div className="flex-1 min-w-0">
          <p className="text-text-primary font-semibold text-xs sm:text-sm truncate">{name}</p>
          <p className="text-text-secondary text-[8px] sm:text-[9px] mb-1.5 sm:mb-2 truncate">
            {club} &nbsp;•&nbsp; {position}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-end gap-1.5 sm:gap-3">
            <div>
              <p className="text-text-secondary text-[8px] mb-0.5">Form</p>
              <div className="flex items-end gap-0.5 sm:gap-1 h-5 sm:h-6">
                {formBars.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      height: `${h * 100}%`,
                      backgroundColor: barColors[i % barColors.length],
                    }}
                    className="w-1 sm:w-1.5 rounded-sm"
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 sm:gap-2.5 mt-0.5 sm:mt-0">
              <MiniStat value={points} label={<>Pts<span className="hidden sm:inline"> (GW15)</span></>} />
              <MiniStat value={goals} label="Goals" />
              <MiniStat value={assists} label="Assists" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MiniStat({ value, label }) {
  return (
    <div className="text-center min-w-[30px] sm:min-w-[40px]">
      <p className="text-text-primary font-bold text-[10px] sm:text-xs leading-none">{value}</p>
      <p className="text-text-secondary text-[8px] mt-0.5 whitespace-nowrap">{label}</p>
    </div>
  );
}


