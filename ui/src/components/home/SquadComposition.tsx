import { SquadComposition as SquadCompositionType } from "../../features/home/types";

interface SquadCompositionProps {
  data: SquadCompositionType;
  onViewMore?: () => void;
}

const SquadComposition = ({ data, onViewMore }: SquadCompositionProps) => {
  const positions = [
    { label: "Goalkeepers", count: data.goalkeepers, color: "bg-yellow-500" },
    { label: "Defenders", count: data.defenders, color: "bg-green-500" },
    { label: "Midfielders", count: data.midfielders, color: "bg-blue-500" },
    { label: "Forwards", count: data.forwards, color: "bg-red-500" },
  ];

  // Calculate pie chart segments
  const total = data.total;
  const segments = positions.map((pos) => ({
    ...pos,
    percentage: (pos.count / total) * 100,
  }));

  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Squad Composition</h3>
        <button
          onClick={onViewMore}
          className="text-xs text-primary font-medium"
        >
          View More
        </button>
      </div>

      <div className="flex items-center gap-6">
        {/* Simple pie chart visualization */}
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {segments.reduce<{ elements: JSX.Element[]; offset: number }>(
              (acc, segment, index) => {
                const circumference = 2 * Math.PI * 40;
                const dashArray = (segment.percentage / 100) * circumference;
                const dashOffset = acc.offset;

                acc.elements.push(
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={
                      index === 0
                        ? "#EAB308"
                        : index === 1
                        ? "#22C55E"
                        : index === 2
                        ? "#3B82F6"
                        : "#EF4444"
                    }
                    strokeWidth="20"
                    strokeDasharray={`${dashArray} ${circumference}`}
                    strokeDashoffset={-dashOffset}
                    className="transition-all duration-500"
                  />
                );

                acc.offset += dashArray;
                return acc;
              },
              { elements: [], offset: 0 }
            ).elements}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-black text-text-primary">{data.total}</p>
              <p className="text-[10px] text-text-secondary">Players</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {positions.map((pos, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${pos.color}`} />
                <span className="text-xs text-text-secondary">{pos.label}</span>
              </div>
              <span className="text-sm font-medium text-text-primary">{pos.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SquadComposition;
