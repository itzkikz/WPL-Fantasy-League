import { Player } from "../features/players/types";
import { Formation } from "../features/standings/types";
import { useManageTeamStore } from "../store/useManageTeamStore";
import { usePlayerStore } from "../store/usePlayerStore";
import PitchBanner from "./PitchBanner";
import PitchPlayerCard from "./PitchPlayerCard";

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
  reset
}: GWPitchProps) => {
  const { isSubstitution } = useManageTeamStore();
  const { player } = usePlayerStore();
  const glowBorderClass =
    "ring-2 ring-white shadow-[0_0_8px_3px_rgba(255,255,255,0.45)] hover:shadow-[0_0_12px_5px_rgba(30,0,33,0.60)] transition-shadow";
  const glowBorderGreenClass =
    "ring-2 ring-[#00ff4e] shadow-[0_0_8px_3px_rgba(255,255,255,0.45)] hover:shadow-[0_0_12px_5px_rgba(30,0,33,0.60)] transition-shadow";
  const glowBorderRedClass =
    "ring-2 ring-[#e2001a] shadow-[0_0_8px_3px_rgba(255,255,255,0.45)] hover:shadow-[0_0_12px_5px_rgba(30,0,33,0.60)] transition-shadow";

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
      <div
        className="relative flex flex-col gap-5 bg-top bg-no-repeat box-border py-6 max-w-[1400px] overflow-auto h-screen items-center justify-center"
        style={{
          backgroundImage: "url('/pitch.svg')",
          //   backgroundSize: "850px auto"
        }}
      >
        <PitchBanner />
        {isSubstitution && (
          <div onClick={reset} className="absolute top-1/6 left-1/16 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
              />
            </svg>
          </div>
        )}

        {Object.keys(starting).map((key: string) => (
          <div key={key} className="flex justify-evenly gap-3 select-none">
            {starting[key].map((eachPlayer: Player) => (
              <div key={eachPlayer.id} className={`flex flex-col`}>
                <div
                  className={`rounded-md relative m-auto overflow-hidden cursor-pointer ${getCardClass(eachPlayer?.isAvlSub || false, eachPlayer?.name)}`}
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
        <div className="select-none relative w-auto rounded-2xl bottom-0 left-0 right-0 bg-gradient-to-b from-green-800/80 to-green-900/90 backdrop-blur-sm py-4 px-4 mt-auto">
          <div className="flex justify-center gap-6 md:gap-8 mb-2">
            {bench?.map((eachPlayer) => (
              <div
                key={`label-${eachPlayer.id}`}
                className="w-15 text-center text-xs font-bold text-white"
              >
                {eachPlayer.position}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 md:gap-8">
            {bench?.map((eachPlayer) => (
              <div
                key={eachPlayer.id}
                className={`rounded-md relative m-auto overflow-hidden ${getCardClass(eachPlayer?.isAvlSub || false, eachPlayer.name)}`}
              >
                <PitchPlayerCard
                  player={eachPlayer}
                  isSmall={true}
                  onClick={() => onClick(eachPlayer)}
                  pickMyteam={pickMyTeam}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GWPitch;
