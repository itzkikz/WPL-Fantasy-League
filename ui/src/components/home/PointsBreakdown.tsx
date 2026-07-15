import { PointsBreakdown as PointsBreakdownType } from "../../features/home/types";

interface PointsBreakdownProps {
  data: PointsBreakdownType;
}

const PointsBreakdown = ({ data }: PointsBreakdownProps) => {
  const breakdown = [
    { label: "Goals", value: data.goals, icon: "⚽" },
    { label: "Assists", value: data.assists, icon: "🅰️" },
    { label: "Clean Sheet", value: data.cleanSheet, icon: "🧤" },
    { label: "Bonus", value: data.bonus, icon: "⭐" },
    { label: "Minutes Played", value: data.minutesPlayed, icon: "⏱️" },
  ];

  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Points Breakdown (GW 12)</h3>
        <button className="text-xs text-primary font-medium">View More</button>
      </div>

      <div className="space-y-3">
        {breakdown.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between pb-3 border-b border-border last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{item.icon}</span>
              <span className="text-sm text-text-primary">{item.label}</span>
            </div>
            <span className="text-sm font-bold text-text-primary">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">Total Points</span>
          <span className="text-xl font-black text-primary">{data.totalPoints}</span>
        </div>
      </div>
    </div>
  );
};

export default PointsBreakdown;
