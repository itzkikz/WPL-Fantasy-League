import { Standings } from "../features/standings/types";
import Delta from "./Delta";

interface Heading {
  label: string;
  class: string;
}

interface ScrollableTableProps {
  headings?: Heading[];
  content?: Standings[];
  onClick: (teamName: string) => void;
}

const DEFAULT_HEADINGS: Heading[] = [
  { label: "Rank", class: "text-left w-24 px-4 py-3" },
  { label: "Team & Manager", class: "text-left px-2 py-3" },
  { label: "GW", class: "text-center w-16 px-2 py-3" },
  { label: "Total", class: "text-right w-20 px-4 py-3" },
];

const ScrollableTable = ({
  headings = DEFAULT_HEADINGS,
  content,
  onClick
}: ScrollableTableProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <table className="w-full">
          {/* Sticky table header */}
          <thead className="sticky top-0 z-10 bg-white dark:bg-[#1e0021]">
            <tr>
              {headings.map((heading, index) => (
                <th
                  key={index + heading?.label}
                  className={
                    heading?.class + ` text-xs font-semibold`
                  }
                >
                  {heading?.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Scrollable tbody */}
          <tbody>
            {content?.map((r, i) => (
              <tr
                key={i}
                className="dark:hover:bg-[#541e5d] transition-colors cursor-pointer border-b border-[#ebe5eb] dark:border-[#541e5d]"
                onClick={() => onClick(r.team)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    <Delta d={r.pos_change} />
                  </div>
                </td>
                <td className="px-2 py-3">
                  <p className="text-[15px] font-semibold leading-tight">
                    {r.team}
                  </p>
                  <p className="text-xs text-gray-500">{"Manager"}</p>
                </td>
                <td className="px-2 py-3 text-center font-semibold">
                  {r.current_gw}
                </td>
                <td className="px-4 py-3 text-right text-base font-semibold">
                  {r.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScrollableTable;
