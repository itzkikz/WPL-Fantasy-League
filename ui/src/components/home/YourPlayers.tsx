import { YourPlayer } from "../../features/home/types";

interface YourPlayersProps {
  goalkeepers: YourPlayer[];
  defenders: YourPlayer[];
  midfielders: YourPlayer[];
  forwards: YourPlayer[];
  onViewAll?: () => void;
}

const YourPlayers = ({
  goalkeepers,
  defenders,
  midfielders,
  forwards,
  onViewAll,
}: YourPlayersProps) => {
  const sections = [
    { title: "Goalkeepers", players: goalkeepers },
    { title: "Defenders", players: defenders },
    { title: "Midfielders", players: midfielders },
    { title: "Forwards", players: forwards },
  ];

  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Your Players</h3>
        <button
          onClick={onViewAll}
          className="text-xs text-primary font-medium"
        >
          View All
        </button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title}>
            <h4 className="text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              {section.title}
            </h4>
            <div className="space-y-2">
              {section.players.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-border overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xs font-bold text-text-secondary">
                          {player.name.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">{player.name}</p>
                      <p className="text-[10px] text-text-secondary">{player.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-primary">{player.points} Pts</p>
                    <p className="text-[10px] text-text-secondary">£{player.price}m</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YourPlayers;
