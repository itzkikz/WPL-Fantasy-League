import { TopPlayer } from "../../features/home/types";

interface TopPlayersListProps {
  players: TopPlayer[];
  onViewAll?: () => void;
}

const TopPlayersList = ({ players, onViewAll }: TopPlayersListProps) => {
  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Top Players This Gameweek</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-primary font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.rank}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-[10px] font-medium text-text-secondary">
                {player.rank}
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">{player.name}</p>
                <p className="text-[10px] text-text-secondary">
                  {player.team} • {player.position}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-text-primary">{player.points} Points</p>
              <p className="text-[10px] text-text-secondary">Owned by {player.ownedBy}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopPlayersList;
