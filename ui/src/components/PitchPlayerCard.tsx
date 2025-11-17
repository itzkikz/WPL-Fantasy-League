import { Player } from "../features/players/types";

interface PitchPlayerCardProps {
  isSmall?: boolean;
  player: Player;
  onClick: () => void;
  pickMyteam?: boolean;
}

const PitchPlayerCard = ({
  isSmall = true,
  player,
  onClick,
  pickMyteam = false,
}: PitchPlayerCardProps) => {

  
  const playerFirstName = player?.name
    ? player.name.trim().split(/\s+/).slice(0)[0]
    : "";
  const playerLastName = player?.name
    ? player.name.trim().split(/\s+/).slice(-1)[0]
    : "";
  return (
    <div
      onClick={onClick}
      className={`relative ${isSmall ? "w-16" : "w-16 md:w-20 lg:w-24"} cursor-pointer transition-transform hover:scale-105 bg-light-bg text-light-text-primary`}
    >
       {/* Background Logo with Opacity */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
        <img 
          src={player?.teamLogo} 
          alt="" 
          className="w-10 h-10 object-contain"
        />
      </div>
      {/* Captain/Vice Captain Badge */}
      {(player?.isCaptain || player?.isViceCaptain) && (
        <div className="absolute top-0.5 left-1 z-20 flex items-center justify-center w-4 h-4 rounded bg-light-bg border border-light-border dark:border-dark-border text-[10px] font-bold text-light-text-primary">
          {player?.isCaptain ? "C" : "V"}
        </div>
      )}

      {/* Star badge (if any) */}
      {player?.isPowerPlayer && !pickMyteam && (
        <div className="absolute top-0.5 right-0.5 z-20 flex items-center justify-center w-4 h-4 rounded text-light-bg">
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
            isSmall ? "w-16 h-5" : "w-16 h-5"
          } flex items-center justify-center`}
          style={{ backgroundColor: player?.teamColor }}
        >
          <span className="text-light-bg font-bold text-xs">{player?.team}</span>
        </div>
      </div>

      {/* Player Name */}
      <div className="px-1 py-1 text-center shadow-sm">
        <p
          className={`${
            isSmall ? "text-[10px]" : "text-xs"
          } font-semibold text-gray-900 truncate`}
        >
          {player?.name && pickMyteam && playerFirstName !== playerLastName ? (
            player.name.trim().split(/\s+/).slice(0)[0]
          ) :  (
            playerLastName
          )}
        </p>
      </div>

      {/* Points */}
      <div
        className={`px-1 py-1 text-center truncate bg-light-text-primary text-white`}
      >
        <p className={`${isSmall ? "text-[10px]" : "text-xs"} font-bold`}>
          {pickMyteam ? playerFirstName !== playerLastName ? playerLastName : (<>&nbsp;</>) : player?.point}
        </p>
      </div>
    </div>
  );
};

export default PitchPlayerCard;
