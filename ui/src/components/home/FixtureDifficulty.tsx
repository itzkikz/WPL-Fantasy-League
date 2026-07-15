import { FixtureDifficultyItem } from "../../features/home/types";

interface FixtureDifficultyProps {
  fixtures: FixtureDifficultyItem[];
  onViewAll?: () => void;
}

const FixtureDifficulty = ({ fixtures, onViewAll }: FixtureDifficultyProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500/20 text-green-500";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-500";
      case "Hard":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-border text-text-secondary";
    }
  };

  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Fixture Difficulty (Next 5)</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-primary font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-2">
        {fixtures.map((fixture) => (
          <div
            key={fixture.gameweek}
            className="flex items-center justify-between py-2 border-b border-border last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-secondary w-12">GW {fixture.gameweek}</span>
              <span className="text-sm text-text-primary">
                vs {fixture.opponent} ({fixture.home ? "H" : "A"})
              </span>
            </div>
            <span
              className={`px-2 py-1 rounded text-[10px] font-medium ${getDifficultyColor(
                fixture.difficulty
              )}`}
            >
              {fixture.difficulty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FixtureDifficulty;
