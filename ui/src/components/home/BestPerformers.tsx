import { BestPerformer } from "../../features/home/types";

interface BestPerformersProps {
  performers: BestPerformer[];
  onViewAll?: () => void;
}

const BestPerformers = ({ performers, onViewAll }: BestPerformersProps) => {
  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Best Performers (Season)</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-primary font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {performers.map((player) => (
          <div
            key={player.rank}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-[10px] font-medium text-text-secondary">
                {player.rank}
              </span>
              <div className="w-10 h-10 rounded-full bg-border overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-sm font-bold text-text-secondary">
                    {player.name.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary">{player.name}</p>
                <p className="text-[10px] text-text-secondary">
                  {player.team} • {player.position}
                </p>
              </div>
            </div>
            <p className="text-sm font-bold text-accent">{player.points} pts</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BestPerformers;
