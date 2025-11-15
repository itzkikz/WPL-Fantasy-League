interface Heading {
  label: string;
  class: string;
}

interface ScrollableTableSkeletonProps {
  headings?: Heading[];
}

const DEFAULT_HEADINGS: Heading[] = [
  { label: "Rank", class: "text-left w-24 px-4 py-3" },
  { label: "Team & Manager", class: "text-left px-2 py-3" },
  { label: "GW", class: "text-center w-16 px-2 py-3" },
  { label: "Total", class: "text-right w-20 px-4 py-3" },
];

const ScrollableTableSkeleton = ({
  headings = DEFAULT_HEADINGS,
}: ScrollableTableSkeletonProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <table className="w-full">
          {/* Sticky table header */}
          <thead className="sticky top-0 z-10 bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
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

          {/* Skeleton tbody */}
          <tbody>
            {[...Array(16)].map((_, i) => (
              <tr key={i}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 bg-light-skeleton dark:bg-dark-skeleton rounded animate-pulse"></div>
                    <div className="h-4 w-4 bg-light-skeleton dark:bg-dark-skeleton rounded animate-pulse"></div>
                  </div>
                </td>
                <td className="px-2 py-3">
                  <div className="h-4 bg-light-skeleton dark:bg-dark-skeleton rounded w-30 mb-2 animate-pulse"></div>
                </td>
                <td className="px-2 py-3">
                  <div className="h-4 bg-light-skeleton dark:bg-dark-skeleton rounded w-auto mx-auto animate-pulse"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-5 bg-light-skeleton dark:bg-dark-skeleton rounded w-auto ml-auto animate-pulse"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScrollableTableSkeleton;
