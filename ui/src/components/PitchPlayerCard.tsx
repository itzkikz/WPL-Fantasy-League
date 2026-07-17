import { Player } from "../features/players/types";
import { getContrastText } from "../libs/helpers/color";
import { getPlayerDisplayPrice } from "../libs/helpers/player";

interface PitchPlayerCardProps {
  isSmall?: boolean;
  player: Player & { price?: string; showInfo?: boolean };
  onClick?: () => void;
  pickMyteam?: boolean;
  showPriceAndPoints?: boolean;
}

const PitchPlayerCard = ({
  isSmall = true,
  player,
  onClick,
  pickMyteam = false,
  showPriceAndPoints = false,
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
      className={`relative flex flex-col items-center ${isSmall ? "w-14 md:w-16" : "w-16 md:w-20 lg:w-24"} cursor-pointer transition-transform hover:scale-105 select-none`}
    >
      {/* Captain/Vice Captain Badge */}
      {(player?.isCaptain || player?.isViceCaptain) && (
        <div 
          className={`absolute top-[-3px] right-[-3px] z-20 flex items-center justify-center w-5 h-5 rounded-full border border-[#A855F7] text-[10px] font-bold text-white shadow-lg bg-[#1D1533]`}
        >
          {player?.isCaptain ? "C" : "V"}
        </div>
      )}
 
      {/* Star badge (if any) */}
      {player?.isPowerPlayer && (Number(player?.point) || 0) > 0 && (
        <div className="absolute bottom-[28px] right-[-3px] z-20 flex items-center justify-center w-5 h-5 rounded-full bg-[#8b5cf6] border border-white text-white shadow-lg animate-bounce duration-1000">
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}
 
      {/* Info Icon (only shown if player.showInfo is true or in custom view) */}
      {(player?.showInfo || showPriceAndPoints) && (
        <div className="absolute top-[-3px] left-[-3px] z-20 flex items-center justify-center w-4 h-4 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 text-[9px] font-bold text-white shadow-sm">
          i
        </div>
      )}
 
      {/* Jersey Image/Placeholder */}
      <div className="relative mb-1.5 z-10 drop-shadow-lg flex items-center justify-center">
        <div
          className="relative w-12 h-10 md:w-14 md:h-12 lg:w-14 lg:h-14"
        >
          {/* Base color layer */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backgroundColor: player?.teamColor || "#ccc",
              maskImage: "url('/jersey-3d.png')",
              WebkitMaskImage: "url('/jersey-3d.png')",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
 
          {/* Texture/Shading layer */}
          <img
            src="/jersey-3d.png"
            alt="Jersey"
            className="absolute inset-0 w-full h-full object-contain mix-blend-multiply"
          />
 
          {/* Highlight layer */}
          <img
            src="/jersey-3d.png"
            alt="Jersey Highlight"
            className="absolute inset-0 w-full h-full object-contain mix-blend-hard-light opacity-40"
          />
 
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-1.5 pointer-events-none z-20">
            <span
              className="text-[8px] md:text-[9px] font-bold drop-shadow-md leading-none mb-0.5 font-mono"
              style={{ color: getContrastText(player?.teamColor || "#ccc", player.teamTextColor || "#ffffff") }}
            >
              {player.shirtNumber ? player.shirtNumber : "00"}
            </span>
            <span
              className="text-[5px] md:text-[6px] font-bold drop-shadow-md uppercase tracking-tighter leading-none"
              style={{ color: getContrastText(player?.teamColor || "#ccc", player.teamTextColor || "#ffffff") }}
            >
              {player?.team}
            </span>
          </div>
        </div>
      </div>
 
      {/* Info Box Container */}
      {showPriceAndPoints ? (
        <div className="flex flex-col w-full bg-card rounded-md overflow-hidden shadow-md border border-border z-10">
          {/* Player Name */}
          <div className="px-1 py-0.5 text-center bg-surface border-b border-border">
            <p className="text-[9px] md:text-[10px] font-bold text-white truncate leading-tight">
              {playerLastName}
            </p>
          </div>
          {/* Split Row for Price and Points */}
          <div className="flex text-[9px] font-bold">
            <div className="flex-1 text-center py-0.5 bg-card text-text-secondary border-r border-border leading-tight">
              {player.price || getPlayerDisplayPrice(player)}
            </div>
            <div className="flex-1 text-center py-0.5 bg-[var(--color-success-bg)] text-[var(--color-success-bright)] leading-tight font-mono">
              {player?.point ?? 0}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full bg-card rounded-sm overflow-hidden border border-border shadow-sm z-10">
          {/* Player Name */}
          <div className="px-1 py-0.5 text-center border-b border-border">
            <p
              className={`${isSmall ? "text-[9px] md:text-[10px]" : "text-[10px] md:text-xs"
                } font-bold text-white truncate leading-tight`}
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
            className="px-1 py-0.5 text-center truncate bg-surface text-text-secondary"
          >
            <p className={`${isSmall ? "text-[8px] md:text-[9px]" : "text-xl md:text-[10px]"} font-semibold leading-tight`}>
              {pickMyteam ? playerFirstName !== playerLastName ? playerLastName : (<>&nbsp;</>) : (
                <>
                  {player?.point}
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PitchPlayerCard;
