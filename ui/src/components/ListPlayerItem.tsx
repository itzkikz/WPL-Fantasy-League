import Info from "./icons/info";
import { Player } from "../features/players/types";

interface ListPlayerItemProps {
  isSmall?: boolean;
  player: Player;
  onClick: () => void;
}

const ListPlayerItem = ({ isSmall, player, onClick }: ListPlayerItemProps) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center py-3 px-4 border-b border-[#ebe5eb] dark:border-[#541e5d] dark:hover:bg-[#541e5d]"
    >
      {/* Info Icon */}
      <div className="mr-3">
        <Info width="5" height="5" />
      </div>

      {/* Jersey Icon */}
      <div
        className="w-10 h-10 rounded flex items-center justify-center mr-3"
        style={{ backgroundColor: player.teamColor }}
      >
        <span className="text-xs text-white font-bold">{player.team}</span>
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm truncate">
            {player?.name ? player.name.trim().split(/\s+/).slice(-1)[0] : ""}
          </h3>
          {player.isCaptain && (
            <span className="px-1.5 py-0.5 bg-gray-900 text-xs font-bold rounded">
              C
            </span>
          )}
          {player.isViceCaptain && (
            <span className="px-1.5 py-0.5 bg-gray-700 text-xs font-bold rounded">
              V
            </span>
          )}
        </div>
        <p className="text-xs">
          {player.fullTeamName} | {player.position}
        </p>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 ml-4">
        <div className="text-center min-w-10">
          <p className="text-sm font-semibold">{player.point || "3.5"}</p>
        </div>
        {/* <div className="text-center min-w-[50px]">
          <p className="text-sm font-semibold text-gray-900">{"£0m"}</p>
        </div> */}
      </div>
    </div>
  );
};

export default ListPlayerItem;
