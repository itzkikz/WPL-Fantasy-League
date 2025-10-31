import { Player } from "../features/players/types";
import { Formation } from "../features/standings/types";
import PitchBanner from "./PitchBanner";
import PitchPlayerCard from "./PitchPlayerCard";

interface GWPitchProps {
  starting: Formation;
  bench: Player[];
  onClick: (player: Player) => void;
}

const GWPitchCopy = ({ starting, bench, onClick }: GWPitchProps) => {
  return (
    <>
      <div
        className="relative flex flex-col gap-2  bg-top bg-no-repeat box-border py-6 max-w-[1400px] overflow-auto h-screen items-center justify-center"
        style={{
          backgroundImage: "url('/pitch.svg')",
        //   backgroundSize: "850px auto"
        }}
      >
                  <PitchBanner />

        {Object.keys(starting).map((key: string) => (
          <div key={key} className="flex justify-evenly gap-8">
            {starting[key].map((player: Player) => (
              <div className="flex flex-col">
                <div className="relative m-auto overflow-hidden">
                  <PitchPlayerCard
                    key={player.id}
                    player={player}
                    onClick={() => onClick(player)}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
         <div className="relative w-auto bottom-0 left-0 right-0 bg-gradient-to-b from-green-800/80 to-green-900/90 backdrop-blur-sm py-2 px-2 mt-8">
          <div className="flex justify-center gap-6 md:gap-8 mb-2">
            {bench?.map((player) => (
              <div
                key={`label-${player.id}`}
                className="w-15 text-center text-xs font-bold text-white"
              >
                {player.position}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 md:gap-8">
            {bench?.map((player) => (
              <PitchPlayerCard
                key={player.id}
                player={player}
                isSmall={true}
                onClick={() => onClick(player)}
              />
            ))}
          </div>
        </div>
      </div>
     
    </>
  );
};

export default GWPitchCopy;
