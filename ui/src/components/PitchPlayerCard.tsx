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
      className={`relative flex flex-col items-center ${isSmall ? "w-[14vw] min-w-[48px] max-w-[72px] sm:w-16 md:w-18" : "w-[16vw] min-w-[52px] max-w-[80px] sm:w-18 md:w-22 lg:w-26"} cursor-pointer transition-transform hover:scale-105 select-none`}
    >
      {/* Captain/Vice Captain Badge */}
      {(player?.isCaptain || player?.isViceCaptain) && (
        <div
          className={`absolute top-[-3px] right-[-3px] z-20 flex items-center justify-center w-5 h-5 rounded-full border border-[#A855F7] text-[10px] font-bold text-white shadow-lg bg-[#1D1533]`}
        >
          {player?.isCaptain ? "C" : "V"}
        </div>
      )}

      {/* Auto-Sub IN Badge */}
      {player?.subIn && (
        <div className="absolute bottom-[24px] left-[-4px] z-20 flex items-center justify-center w-5 h-5 rounded-full border border-emerald-400 text-[9px] font-black text-emerald-300 shadow-lg bg-emerald-900/90">
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </div>
      )}

      {/* Auto-Sub OUT Badge */}
      {player?.subOut && (
        <div className="absolute bottom-[24px] right-[-4px] z-20 flex items-center justify-center w-5 h-5 rounded-full border border-rose-400 text-[9px] font-black text-rose-300 shadow-lg bg-rose-900/90">
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
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

      {/* Player Face Photo / Fallback Silhouette */}
      <div className="relative mb-1 z-10 drop-shadow-lg flex items-center justify-center">
        <div
          className="relative w-[10vw] h-[10vw] min-w-[36px] max-w-[64px] sm:w-12 sm:h-12 md:w-15 md:h-15 rounded-full border-2 overflow-hidden bg-[#1D1533] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105"
          style={{ borderColor: player?.teamColor || "#A855F7" }}
        >
          {player?.photo ? (
            <img
              src={player.photo}
              alt={player.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const fallbackContainer = (e.target as HTMLImageElement).nextSibling as HTMLElement;
                if (fallbackContainer) (fallbackContainer as HTMLElement).style.display = "flex";
              }}
            />
          ) : null}

          {/* Fallback Silhouette */}
          <div
            className="w-full h-full flex items-center justify-center bg-gradient-to-b from-indigo-950 to-indigo-900"
            style={{ display: player?.photo ? "none" : "flex" }}
          >
            <svg className="w-7 h-7 text-white/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          {/* Small Team Badge Overlay */}
          {/* <div className="absolute bottom-0 left-0 right-0 bg-black/75 py-0.5 text-center leading-none border-t border-white/5">
            <span className="text-[7px] md:text-[8px] font-black uppercase tracking-wider text-white/95">
              {player?.team || "UNK"}
            </span>
          </div> */}
        </div>
      </div>

      {/* Info Box Container */}
      {showPriceAndPoints ? (
        <div className="flex flex-col w-full bg-card rounded-md overflow-hidden shadow-md border border-border z-10">
          {/* Player Name */}
          <div className="px-1 py-0.5 text-center bg-surface border-b border-border">
            <p className="text-[9px] sm:text-[10px] md:text-[11px] font-bold text-white truncate leading-tight">
              {playerLastName}
            </p>
          </div>
          {/* Split Row for Price and Points */}
          <div className="flex text-[9px] sm:text-[10px] md:text-[11px] font-bold">
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
