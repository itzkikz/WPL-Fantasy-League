import { Player } from "../libs/formatter/types";

interface ListPlayerItemProps {
  isSmall?: boolean;
  player: Player;
  onClick: () => void;
}

const ListPlayerItem = ({ isSmall, player, onClick }: ListPlayerItemProps) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center py-3 px-4 border-b border-gray-100 hover:bg-gray-50"
    >
      {/* Info Icon */}
      <button className="mr-3 text-gray-400">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Jersey Icon */}
      <div
        className="w-10 h-10 rounded flex items-center justify-center mr-3"
        style={{ backgroundColor: player.teamColor }}
      >
        <span className="text-white text-xs font-bold">{player.team}</span>
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {player?.name ? player.name.trim().split(/\s+/).slice(-1)[0] : ""}
          </h3>
          {player.isCaptain && (
            <span className="px-1.5 py-0.5 bg-gray-900 text-white text-xs font-bold rounded">
              C
            </span>
          )}
          {player.isViceCaptain && (
            <span className="px-1.5 py-0.5 bg-gray-700 text-white text-xs font-bold rounded">
              V
            </span>
          )}
        </div>
        <p className="text-gray-500 text-xs">
          {player.team} {player.position}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 ml-4">
        <div className="text-center min-w-[40px]">
          <p className="text-sm font-semibold text-gray-900">
            {player.point || "3.5"}
          </p>
        </div>
        <div className="text-center min-w-[50px]">
          <p className="text-sm font-semibold text-gray-900">{"£0m"}</p>
        </div>
      </div>
    </div>
  );
};

export default ListPlayerItem;
