import { PlayerSpotlightData } from "../../features/home/types";

interface PlayerSpotlightProps {
  data: PlayerSpotlightData;
}

const PlayerSpotlight = ({ data }: PlayerSpotlightProps) => {
  return (
    <div className="bg-dark-surface rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-primary">Player Spotlight</h3>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-full bg-border flex items-center justify-center">
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="w-8 h-8 rounded-full bg-border flex items-center justify-center">
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-border overflow-hidden">
          {data.player.photo ? (
            <img
              src={data.player.photo}
              alt={data.player.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-xl font-bold text-text-secondary">
                {data.player.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        <div>
          <h4 className="text-lg font-bold text-text-primary">{data.player.name}</h4>
          <p className="text-xs text-text-secondary">
            {data.player.fullTeamName} • {data.player.position}
          </p>
          <span className="inline-block mt-1 px-2 py-0.5 bg-accent/20 text-accent text-[10px] font-medium rounded-full">
            Star Player
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{data.gameweekPoints}</p>
          <p className="text-[10px] text-text-secondary">Points</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{data.gameweekRank}</p>
          <p className="text-[10px] text-text-secondary">GW Rank</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{data.selectedBy}%</p>
          <p className="text-[10px] text-text-secondary">Selected by</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">£{data.price}m</p>
          <p className="text-[10px] text-text-secondary">Price</p>
        </div>
      </div>

      <div className="flex items-center gap-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs text-text-primary">{data.stats.goals} Goals</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs text-text-primary">{data.stats.assists} Assist</span>
        </div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-xs text-text-primary">{data.stats.shots} Shots</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerSpotlight;
