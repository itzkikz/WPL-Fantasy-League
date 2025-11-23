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
      className={`relative flex flex-col items-center ${isSmall ? "w-12 md:w-16" : "w-14 md:w-20 lg:w-24"} cursor-pointer transition-transform hover:scale-105`}
    >
      {/* Captain/Vice Captain Badge */}
      {(player?.isCaptain || player?.isViceCaptain) && (
        <div className="absolute top-[-4px] left-[-4px] z-20 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full bg-dark-bg border border-light-border text-[10px] md:text-xs font-bold text-white shadow-md">
          {player?.isCaptain ? "C" : "V"}
        </div>
      )}

      {/* Star badge (if any) */}
      {player?.isPowerPlayer && !pickMyteam && (
        <div className="absolute top-0 right-0 z-20 flex items-center justify-center w-4 h-4 md:w-5 md:h-5 rounded-full bg-dark-accent text-white drop-shadow-md">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}

      {/* Jersey Image/Placeholder */}
      <div className="relative mb-1 z-10 drop-shadow-lg">
        {/* Using the teamColor to simulate a jersey if no image is available, or could use an SVG jersey icon colored dynamically */}
        <svg
          viewBox="0 0 24 24"
          fill={player?.teamColor || "#ccc"}
          className={`w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 drop-shadow-sm`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M20.5 5.5l-4-2c-0.5-0.2-1-0.3-1.5-0.3H9c-0.5 0-1 0.1-1.5 0.3l-4 2C3.2 5.6 3 6 3.1 6.4l1 3c0.1 0.4 0.5 0.6 0.9 0.6h0.5v10c0 0.6 0.4 1 1 1h11c0.6 0 1-0.4 1-1V10h0.5c0.4 0 0.8-0.2 0.9-0.6l1-3C21 6 20.8 5.6 20.5 5.5z" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1.5 pointer-events-none">
          <span className="text-[5px] md:text-[6px] font-bold text-white/90 drop-shadow-md uppercase tracking-tighter leading-none">
            {player?.team}
          </span>
          {/* <span className="text-[7px] md:text-[8px] font-bold text-white drop-shadow-md leading-none mt-0.5">
            {player?.id ? player.id % 99 || 99 : ""}
          </span> */}
        </div>
      </div>
      {/* Info Box Container */}
      <div className="flex flex-col w-full bg-white dark:bg-gray-700 rounded-sm overflow-hidden shadow-sm z-10">
        {/* Player Name */}
        <div className="px-1 py-0.5 text-center bg-white dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
          <p
            className={`${isSmall ? "text-[9px] md:text-[10px]" : "text-[10px] md:text-xs"
              } font-bold text-gray-900 dark:text-white truncate leading-tight`}
          >
            {player?.name && pickMyteam && playerFirstName !== playerLastName ? (
              player.name.trim().split(/\s+/).slice(0)[0]
            ) : (
              playerLastName
            )}
          </p>
        </div>

        {/* Points / Team Info */}
        <div
          className={`px-1 py-0.5 text-center truncate bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300`}
        >
          <p className={`${isSmall ? "text-[8px] md:text-[9px]" : "text-[9px] md:text-[10px]"} font-medium leading-tight`}>
            {pickMyteam ? playerFirstName !== playerLastName ? playerLastName : (<>&nbsp;</>) : (
              <>
                {player?.point}
              </>
            )}
          </p>
        </div>
      </div>
    </div >
  );
};

export default PitchPlayerCard;
