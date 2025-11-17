import React, { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Player, PlayerStats } from "../features/players/types";
import Delta from "./Delta";
import Info from "./icons/Info";
import { getTeamData, mapPosition } from "../libs/helpers/lineupFormatter";

interface Heading {
  label: string;
  class: string;
}

interface PlayersScrollableTableProps {
  headings?: Heading[];
  content?: PlayerStats[];
  onClick: (player: PlayerStats) => void;
  containerHeight?: string;
}

const DEFAULT_HEADINGS: Heading[] = [
  { label: "Players", class: "text-left w-3/5 px-4 py-3" },
  { label: "Points", class: "text-right w-2/5 px-4 py-3" },
];

const PlayersScrollableTable = ({
  headings = DEFAULT_HEADINGS,
  content = [],
  onClick,
  containerHeight = "600px",
}: PlayersScrollableTableProps) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: content.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 80, // Increased to account for padding + border
    overscan: 5, // Reduced for better performance
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
      <div
        ref={tableContainerRef}
        className="overflow-y-auto"
        style={{ height: `calc(100vh - 8rem)` }}
        // style={{ height: containerHeight }}
      >
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 shadow-sm bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
            <tr>
              {headings.map((heading, index) => (
                <th
                  key={index + heading?.label}
                  className={heading?.class + ` text-xs font-semibold`}
                >
                  {heading?.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Top spacer */}
            {virtualItems.length > 0 && (
              <tr>
                <td
                  colSpan={headings.length}
                  style={{
                    height: `${virtualItems[0]?.start ?? 0}px`,
                  }}
                />
              </tr>
            )}

            {/* Render only visible items */}
            {virtualItems.map((virtualItem) => {
              const record = content[virtualItem.index];
              return (
                <tr
                  key={`row-${virtualItem.index}`}
                  className="transition-colors cursor-pointer hover:bg-light-border dark:hover:bg-dark-border border-b border-light-border dark:border-dark-border"
                  onClick={() => onClick(record)}
                  data-index={virtualItem.index}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="px-2 py-2">
                        <Info width="5" height="5" />
                      </div>
                      <div>
                        <p className="text-[15px] leading-tight">
                          {record.player_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getTeamData(record.club).abbreviation} | {mapPosition(record.position)} |{" "}
                          {record?.team_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-base font-semibold">
                    {record.total_point}
                  </td>
                </tr>
              );
            })}

            {/* Bottom spacer */}
            {virtualItems.length > 0 && (
              <tr>
                <td
                  colSpan={headings.length}
                  style={{
                    height: `${Math.max(
                      0,
                      totalSize -
                        (virtualItems[virtualItems.length - 1]?.end ?? 0)
                    )}px`,
                  }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>
  );
};

export default PlayersScrollableTable;
