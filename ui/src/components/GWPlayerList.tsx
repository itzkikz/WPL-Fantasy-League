import { Player } from "../features/players/types";
import { Formation } from "../features/standings/types";
import ListPlayerItem from "./ListPlayerItem";

interface GWPlayerListProps {
  starting: Formation;
  bench: Player[];
  onClick: (player: Player) => void;
}

const GWPlayerList = ({ starting, bench, onClick }: GWPlayerListProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
    <div>
      {/* Column Headers */}
      <div className="sticky top-0 bg-white dark:bg-[#1e0021] border-b border-[#ebe5eb] dark:border-[#541e5d] px-4 py-3 flex items-center">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase">
            Player
          </p>
        </div>
        <div className="flex items-center gap-6 ml-4">
          <div className="text-center min-w-[40px]">
            <p className="text-xs font-semibold uppercase">
              Points
            </p>
          </div>
          {/* <div className="text-center min-w-[50px]">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Price
            </p>
          </div> */}
        </div>
      </div>

      {/* Goalkeepers */}
      <div>
        <h3 className="text-lg font-bold px-4 py-3">
          Goalkeepers
        </h3>
        {starting?.goalkeeper.map((player) => (
          <ListPlayerItem
            onClick={() => onClick(player)}
            key={player.id}
            player={player}
          />
        ))}
      </div>

      {/* Defenders */}
      <div>
        <h3 className="text-lg font-bold px-4 py-3 ">
          Defenders
        </h3>
        {starting?.defenders.map((player) => (
          <ListPlayerItem
            onClick={() => onClick(player)}
            key={player.id}
            player={player}
          />
        ))}
      </div>

      {/* Midfielders */}
      <div>
        <h3 className="text-lg font-bold px-4 py-3 ">
          Midfielders
        </h3>
        {starting?.midfielders.map((player) => (
          <ListPlayerItem
            onClick={() => onClick(player)}
            key={player.id}
            player={player}
          />
        ))}
      </div>

      {/* Forwards */}
      {starting?.forwards && starting.forwards.length > 0 && (
        <div>
          <h3 className="text-lg font-bold px-4 py-3">
            Forwards
          </h3>
          {starting.forwards.map((player) => (
            <ListPlayerItem
              onClick={() => onClick(player)}
              key={player.id}
              player={player}
            />
          ))}
        </div>
      )}
      {bench && bench.length > 0 && (
        <div>
          <h3 className="text-lg font-bold px-4 py-3">
            Substitutes
          </h3>
          {bench.map((player) => (
            <ListPlayerItem
              onClick={() => onClick(player)}
              key={player.id}
              player={player}
            />
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default GWPlayerList;
