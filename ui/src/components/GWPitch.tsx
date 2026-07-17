import { Player } from "../features/players/types";
import { Formation } from "../features/standings/types";
import { useManageTeamStore } from "../store/useManageTeamStore";
import { usePlayerStore } from "../store/usePlayerStore";
import PitchPlayerCard from "./PitchPlayerCard";

interface GWPitchProps {
  starting: Formation;
  bench: Player[];
  onClick: (player: Player) => void;
  pickMyTeam?: boolean;
  reset?: () => void;
}

const getPlayerLeft = (key: string, index: number, total: number) => {
  if (total === 1) return "50%";
  
  if (key === "DEF") {
    if (total === 2) return index === 0 ? "33%" : "67%";
    if (total === 3) return index === 0 ? "20%" : index === 1 ? "50%" : "80%";
    if (total === 4) {
      const positions = ["15%", "38%", "62%", "85%"];
      return positions[index];
    }
    if (total === 5) return index === 0 ? "10%" : index === 1 ? "30%" : index === 2 ? "50%" : index === 3 ? "70%" : "90%";
  }

  if (key === "MID") {
    if (total === 2) return index === 0 ? "33%" : "67%";
    if (total === 3) return index === 0 ? "20%" : index === 1 ? "50%" : "80%";
    if (total === 4) {
      const positions = ["18%", "39%", "61%", "82%"];
      return positions[index];
    }
    if (total === 5) return index === 0 ? "10%" : index === 1 ? "30%" : index === 2 ? "50%" : index === 3 ? "70%" : "90%";
  }

  if (key === "FWD") {
    if (total === 2) return index === 0 ? "35%" : "65%";
    if (total === 3) return index === 0 ? "20%" : index === 1 ? "50%" : "80%";
  }

  // Fallbacks
  if (total === 2) return index === 0 ? "30%" : "70%";
  if (total === 3) return index === 0 ? "20%" : index === 1 ? "50%" : "80%";
  return "50%";
};

const getPositionStyle = (key: string, index: number, total: number) => {
  const topMap: Record<string, string> = {
    GK: "7%",
    DEF: "22%",
    MID: "45%",
    FWD: "72%",
  };
  const scaleMap: Record<string, number> = {
    GK: 0.75,
    DEF: 0.85,
    MID: 0.95,
    FWD: 1.1,
  };
  return {
    top: topMap[key] || "50%",
    left: getPlayerLeft(key, index, total),
    transform: `translateX(-50%) scale(${scaleMap[key] || 1.0})`,
  };
};

const GWPitch = ({
  starting,
  bench,
  onClick,
  pickMyTeam = false,
  reset,
}: GWPitchProps) => {
  const isSubstitution = useManageTeamStore((state) => state.isSubstitution);
  const player = usePlayerStore((state) => state.player);
  const glowBorderClass =
    "shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300";
  const glowBorderGreenClass =
    "ring-2 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] scale-105 transition-all duration-300 animate-pulse";
  const glowBorderRedClass =
    "ring-2 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-95 opacity-50 transition-all duration-300";

  const getCardClass = (subAvl: boolean, playerName: Player["name"]) => {
    if (!subAvl && isSubstitution && playerName !== player?.name) {
      return `opacity-40 scale-95 grayscale transition-all duration-300`;
    }
    if (subAvl && isSubstitution) {
      return glowBorderGreenClass;
    }
    if (!subAvl && isSubstitution && playerName === player?.name) {
      return glowBorderRedClass;
    }
    return glowBorderClass;
  };

  return (
    <>
      {/* Custom Styles Injection to support clean 3D perspective pitch parameters */}
      <style>{`
        .pitch-container {
          position: relative;
          width: 100%;
          height: 620px;
          overflow: hidden;
          background: #0d021a;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .pitch {
          position: absolute;
          inset: 0;
          perspective: 900px;
          pointer-events: none;
          overflow: hidden;
        }
        .pitch-image {
          position: absolute;
          width: 130%;
          left: -15%;
          top: 0;
          height: 100%;
          transform-origin: center top;
          transform: rotateX(58deg) scale(1.2);
          object-fit: cover;
          opacity: 0.85;
          clip-path: polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%);
        }
        .pitch::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.35),
            transparent 20%,
            transparent 80%,
            rgba(0, 0, 0, 0.45)
          );
          z-index: 2;
        }
        .player-absolute {
          position: absolute;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 10;
          filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.45));
        }
      `}</style>

      <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto gap-4 lg:gap-8">
        
        {/* Pitch Container */}
        <div className="pitch-container flex-1">
          
          {/* Pitch background image layer */}
          <div className="pitch">
            <img
              src="/pitch.png"
              className="pitch-image"
              alt="tactical field"
            />
          </div>

          {/* Cancel Substitution Button */}
          {isSubstitution && (
            <div
              onClick={reset}
              className="absolute top-4 right-4 w-10 h-10 bg-white/80 hover:bg-white dark:bg-black/50 dark:hover:bg-black/70 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg cursor-pointer z-20 transition-all duration-200 border border-gray-200 dark:border-white/10 active:scale-95"
              aria-label="Cancel Substitution"
            >
              <svg
                className="w-5 h-5 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
                />
              </svg>
            </div>
          )}

          {/* Players Overlay (Z-Indexed above pitch background with pointer events routed to cards) */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            {Object.keys(starting).map((key: string) => {
              const playersInLine = starting[key];
              return playersInLine.map((eachPlayer: Player, index: number) => {
                const style = getPositionStyle(key, index, playersInLine.length);
                return (
                  <div
                    key={eachPlayer.id}
                    style={style}
                    className="player-absolute pointer-events-auto"
                  >
                    <div
                      className={`bg-light-secondary rounded-md relative cursor-pointer transition-all duration-300 ${getCardClass(
                        eachPlayer?.isAvlSub || false,
                        eachPlayer?.name
                      )}`}
                    >
                      <PitchPlayerCard
                        player={eachPlayer}
                        pickMyteam={pickMyTeam}
                        onClick={() => onClick(eachPlayer)}
                      />
                    </div>
                  </div>
                );
              });
            })}
          </div>
        </div>

        {/* Bench Container (In-flow block element scrolling naturally with GWPitch) */}
        <div className="w-full lg:w-64 flex-none bg-white/5 border border-white/5 rounded-2xl p-4 shadow-xl mt-4 lg:mt-0">
          <div className="max-w-4xl mx-auto lg:mx-0">
            <h3 className="text-center font-extrabold text-[10px] md:text-xs mb-3 tracking-widest uppercase text-[#c8c8c8]/50 lg:mb-4">Substitutes</h3>
            <div className="grid grid-cols-4 lg:flex lg:flex-col lg:gap-3">
              {bench?.map((eachPlayer) => (
                <div key={eachPlayer.id} className="flex flex-col items-center lg:flex-row lg:gap-3 lg:bg-white/5 lg:p-2 lg:rounded-xl lg:w-full">
                  <div className="text-[10px] md:text-xs font-bold text-[#c8c8c8]/40 mb-1 lg:mb-0 lg:w-8 lg:text-center">
                    {eachPlayer.position}
                  </div>
                  <div
                    className={`bg-light-secondary rounded-sm relative cursor-pointer ${getCardClass(eachPlayer?.isAvlSub || false, eachPlayer.name)}`}
                  >
                    <PitchPlayerCard
                      player={eachPlayer}
                      isSmall={true}
                      onClick={() => onClick(eachPlayer)}
                      pickMyteam={pickMyTeam}
                    />
                  </div>
                  {/* Desktop only details */}
                  <div className="hidden lg:block flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{eachPlayer.name}</p>
                    <p className="text-[10px] text-[#c8c8c8]/50 truncate">{eachPlayer.team}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default GWPitch;
