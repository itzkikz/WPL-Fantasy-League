import { Player } from "../features/players/types";
import { Formation } from "../features/standings/types";
import PitchBanner from "./PitchBanner";
import PitchPlayerCard from "./PitchPlayerCard";

interface GWPitchProps {
  starting: Formation;
  bench: Player[];
  onClick: (player: Player) => void;
}

const GWPitch = ({ starting, bench, onClick }: GWPitchProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className="min-h-full relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/pitch.svg')",
        }}
      >
        {/* Fantasy Pitch Banner */}
        <PitchBanner />

        {/* Players Formation */}
        <div className="relative pt-10 pb-16 px-2">
          {Object.keys(starting).map((key: string) => (
            <div
              key={key}
              className={`flex justify-center ${key === "forwards" ? "gap-8" : "gap-3"} mb-3`}
            >
              {starting[key].map((player: Player) => (
                <PitchPlayerCard
                  key={player.id}
                  player={player}
                  onClick={() => onClick(player)}
                />
              ))}
            </div>
          ))}
        </div>
        {/* Bench Section */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-b from-green-800/80 to-green-900/90 backdrop-blur-sm py-2 px-2">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center gap-8 mb-2">
              {bench?.map((player) => (
                <div
                  key={`label-${player.id}`}
                  className="w-15 text-center text-xs font-bold text-white"
                >
                  {player.position}
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-8">
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
      </div>
    </div>
  );
};

export default GWPitch;
