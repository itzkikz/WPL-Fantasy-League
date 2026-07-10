import { Standings } from "../features/standings/types";
import Delta from "./Delta";

interface Heading {
  label: string;
  class: string;
}

interface ScrollableTableProps {
  headings?: Heading[];
  content?: Standings[];
  onClick: (team: Standings) => void;
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
  onClick,
}: ScrollableTableProps) => {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide select-none h-full bg-white dark:bg-transparent">
      <table className="w-full text-sm text-left">
        {/* Sticky table header */}
        <thead className="sticky top-0 z-10 bg-gray-50/90 dark:bg-[#1a1a1a]/90 backdrop-blur-md border-b border-gray-100 dark:border-white/10">
          <tr>
            {headings.map((heading, index) => (
              <th
                key={index + heading?.label}
                className={heading?.class + ` text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400`}
              >
                {heading?.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Scrollable tbody */}
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {content?.map((r, i) => (
            <tr
              key={i}
              className="transition-colors duration-200 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-white/5 group"
              onClick={() => onClick(r)}
              style={{ viewTransitionName: `team-row-${r.team_id}` }}
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-700 dark:text-gray-300 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {i + 1}
                  </span>
                  <div className="opacity-80">
                    <Delta d={r.pos_change} />
                  </div>
                </div>
              </td>
              <td className="px-2 py-4">
                <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
                  {r.team}
                </p>
                {/* <p className="text-xs text-gray-500 mt-0.5">{"Manager"}</p> */}
              </td>
              <td className="px-2 py-4 text-center font-semibold text-gray-600 dark:text-gray-300">
                {r.current_gw}
              </td>
              <td className="px-4 py-4 text-right text-base font-black text-indigo-600 dark:text-indigo-400">
                {r.total}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    // </div>
  );
};

export default ScrollableTable;
