import { Formation, Player } from "../libs/formatter/types";
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
        {/* Fantasy Header Bars */}

        <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center shadow-md">
                <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                  <path d="M20 5L25 15H15L20 5Z" fill="#3D195B" />
                  <circle cx="20" cy="25" r="8" fill="#00FF87" />
                </svg>
              </div>

              {/* Fantasy Text */}
              <span className="text-white text-xs font-bold">WPL Fantasy</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center shadow-md">
                  <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                    <path d="M20 5L25 15H15L20 5Z" fill="#3D195B" />
                    <circle cx="20" cy="25" r="8" fill="#00FF87" />
                  </svg>
                </div>

                {/* Fantasy Text */}
                <span className="text-white text-xs font-bold">
                  WPL Fantasy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Players Formation */}
        <div className="relative pt-10 pb-16 px-2">
          {/* Goalkeeper */}
          <div className="flex justify-center mb-3">
            {starting?.goalkeeper[0] && (
              <PitchPlayerCard
                player={starting.goalkeeper[0]}
                onClick={() => onClick(starting.goalkeeper[0])}
              />
            )}
          </div>

          {/* Defenders */}
          <div className="flex justify-center gap-3 mb-3">
            {starting?.defenders.map((player) => (
              <PitchPlayerCard
                key={player.id}
                player={player}
                onClick={() => onClick(player)}
              />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-center gap-3 mb-3">
            {starting?.midfielders.map((player) => (
              <PitchPlayerCard
                key={player.id}
                player={player}
                onClick={() => onClick(player)}
              />
            ))}
          </div>

          {/* Forwards */}
          <div className="flex justify-center gap-8">
            {starting?.forwards.map((player) => (
              <PitchPlayerCard
                key={player.id}
                player={player}
                onClick={() => onClick(player)}
              />
            ))}
          </div>
        </div>

        {/* Bench Section */}
        {/* Bench Section */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-green-800/80 to-green-900/90 backdrop-blur-sm py-2 px-2">
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
