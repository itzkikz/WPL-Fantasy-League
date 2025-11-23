import { Player } from "../features/players/types";
import { Formation } from "../features/standings/types";
import { useManageTeamStore } from "../store/useManageTeamStore";
import { usePlayerStore } from "../store/usePlayerStore";
import PitchBanner from "./PitchBanner";
import PitchPlayerCard from "./PitchPlayerCard";
import Logo from "../assets/wplf1-dark.png";

interface GWPitchProps {
  starting: Formation;
  bench: Player[];
  onClick: (player: Player) => void;
  pickMyTeam?: boolean;
  reset?: () => void;
}

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
    "ring-2 ring-light-bg shadow-[0_0_8px_3px_rgba(255,255,255,0.45)] hover:shadow-[0_0_12px_5px_rgba(30,0,33,0.60)] transition-shadow";
  const glowBorderGreenClass =
    "ring-2 ring-dark-secondary shadow-[0_0_8px_3px_rgba(255,255,255,0.45)] hover:shadow-[0_0_12px_5px_rgba(30,0,33,0.60)] transition-shadow";
  const glowBorderRedClass =
    "ring-2 ring-dark-accent shadow-[0_0_8px_3px_rgba(255,255,255,0.45)] hover:shadow-[0_0_12px_5px_rgba(30,0,33,0.60)] transition-shadow";

  const getCardClass = (subAvl: boolean, playerName: Player["name"]) => {
    if (!subAvl && isSubstitution && playerName !== player?.name) {
      return `opacity-50`;
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
      <div className="flex flex-col lg:flex-row w-full max-w-6xl mx-auto gap-4 lg:gap-8 lg:h-full lg:overflow-hidden">
        {/* Pitch Container */}
        <div
          className="relative flex flex-col flex-1 gap-5 bg-top bg-no-repeat box-border py-6 w-full justify-start min-h-[80vh] lg:min-h-0 lg:h-full lg:bg-center lg:bg-contain lg:py-2"
          style={{
            backgroundImage: "url('/pitch.svg')",
          }}
        >
          <PitchBanner />
          <div className="hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-sm items-center  justify-center mr-2">
            <img
              src={Logo}
              alt="PLogo"
              className="w-80 h-80 opacity-20"
            />
          </div>
          {isSubstitution && (
            <div
              onClick={reset}
              className="absolute top-4 right-4 w-8 h-8 bg-light-bg rounded-full flex items-center justify-center shadow-md cursor-pointer z-10"
            >
              <svg
                className="w-6 h-6 text-dark-accent"
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

          <div className="flex flex-col justify-top w-full h-full gap-4 mt-8 mb-4 lg:mb-0 lg:mt-0 lg:justify-center">
            {Object.keys(starting).map((key: string) => (
              <div key={key} className="flex justify-evenly gap-1 md:gap-3 select-none w-full px-2">
                {starting[key].map((eachPlayer: Player) => (
                  <div key={eachPlayer.id} className={`flex flex-col items-center`}>
                    <div
                      className={`rounded-md relative cursor-pointer transition-all duration-300 ${getCardClass(eachPlayer?.isAvlSub || false, eachPlayer?.name)}`}
                    >
                      <PitchPlayerCard
                        key={eachPlayer.id}
                        player={eachPlayer}
                        pickMyteam={pickMyTeam}
                        onClick={() => {
                          onClick(eachPlayer);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Bench Container */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t-4 border-dark-accent shadow-[0_-4px_10px_rgba(0,0,0,0.5)] py-2 px-2 z-20 lg:static lg:bg-none lg:bg-transparent lg:border-none lg:shadow-none lg:w-64 lg:flex-none lg:p-0 lg:z-0">
          <div className="max-w-4xl mx-auto lg:mx-0 lg:h-full lg:flex lg:flex-col lg:justify-center">
            <h3 className="text-center text-white lg:text-gray-800 lg:dark:text-white font-bold text-sm md:text-base mb-2 tracking-wider uppercase lg:mb-4">Substitutes</h3>
            <div className="flex justify-center gap-2 md:gap-6 lg:flex-col lg:gap-4">
              {bench?.map((eachPlayer) => (
                <div key={eachPlayer.id} className="flex flex-col items-center lg:flex-row lg:gap-3 lg:bg-white lg:dark:bg-gray-800 lg:p-2 lg:rounded-md lg:shadow-sm lg:w-full">
                  <div className="text-[10px] md:text-xs font-bold text-gray-400 mb-1 lg:mb-0 lg:w-8 lg:text-center">
                    {eachPlayer.position}
                  </div>
                  <div
                    className={`rounded-sm relative cursor-pointer ${getCardClass(eachPlayer?.isAvlSub || false, eachPlayer.name)}`}
                  >
                    <PitchPlayerCard
                      player={eachPlayer}
                      isSmall={true}
                      onClick={() => onClick(eachPlayer)}
                      pickMyteam={pickMyTeam}
                    />
                  </div>
                  {/* Desktop only details */}
                  <div className="hidden lg:block flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{eachPlayer.name}</p>
                    <p className="text-xs text-gray-500">{eachPlayer.team}</p>
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
