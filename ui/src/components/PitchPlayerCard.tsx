import { Player } from "../libs/formatter/types";

interface PitchPlayerCardProps {
  isSmall?: boolean;
  player: Player;
  onClick: () => void;
}

const PitchPlayerCard = ({
  isSmall = false,
  player,
  onClick,
}: PitchPlayerCardProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative ${isSmall ? "w-15" : "w-15"} cursor-pointer`}
    >
      {/* Captain/Vice Captain Badge */}
      {(player?.isCaptain || player?.isViceCaptain) && (
        <div className="absolute -top-1 -left-1 z-20 flex items-center justify-center w-5 h-5 rounded-t bg-white border-2 border-gray-800 text-[10px] font-bold text-[#2a1134]">
          {player?.isCaptain ? "C" : "V"}
        </div>
      )}

      {/* Star badge (if any) */}
      {player?.isPowerPlayer && (
        <div className="absolute -top-1 -right-1 z-20 flex items-center justify-center w-5 h-5 rounded-t bg-gray-800 text-white">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}

      {/* Jersey */}
      <div
        className={`relative ${
          isSmall ? "h-5" : "h-5"
        } flex items-center justify-center`}
      >
        <div
          className={`${
            isSmall ? "w-15 h-5" : "w-15 h-5"
          } rounded-t-lg flex items-center justify-center`}
          style={{ backgroundColor: player?.teamColor }}
        >
          <span className="text-white font-bold text-xs">{player?.team}</span>
        </div>
      </div>

      {/* Player Name */}
      <div className="bg-white px-1 py-1 text-center shadow-sm">
        <p
          className={`${
            isSmall ? "text-[10px]" : "text-xs"
          } font-semibold text-gray-900 truncate`}
        >
          {player?.name ? player.name.trim().split(/\s+/).slice(-1)[0] : ""}
        </p>
      </div>

      {/* Points */}
      <div className="bg-[#2a1134] rounded-b px-1 py-1 text-center">
        <p
          className={`${isSmall ? "text-xs" : "text-xs"} font-bold text-white`}
        >
          {player?.point}
        </p>
      </div>
    </button>
  );
};

export default PitchPlayerCard;
