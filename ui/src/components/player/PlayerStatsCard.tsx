import { useEffect, useState } from "react";
import { Player } from "../../features/players/types";
import Button from "../common/Button";
import Checkbox from "../common/Checkbox";
import PlayerDetails from "./PlayerDetails";
import PlayerInfo from "./PlayerInfo";
import PlayerOverall from "./PlayerOverall";
import { usePlayerStore } from "../../store/usePlayerStore";
import { Roles } from "../../store/types";

const PlayerStatsCard = ({
  showStats = false,
  showDetails = false,
  pickMyTeam = false,
  handleSub,
  changeRole,
  error,
}: {
  showStats: boolean;
  showDetails: boolean;
  pickMyTeam: boolean;
  handleSub?: (
    playerName: Player["name"],
    location: "starting" | "bench",
    isCaptain: Player["isCaptain"],
    isViceCaptain: Player["isViceCaptain"]
  ) => void;
  changeRole?: (role: Roles) => void;
  error?: string;
}) => {
  const player = usePlayerStore((state) => state.player);
  const playerStats = (player as Player)?.playerStats;

  const initialRole: "captain" | "vice" | "" = (player as Player)?.isCaptain
    ? "captain"
    : (player as Player)?.isViceCaptain
      ? "vice"
      : "";
  const [role, setRole] = useState<"captain" | "vice" | "">(initialRole);

  // Sync state when the selected player changes
  useEffect(() => {
    setRole(
      (player as Player)?.isCaptain
        ? "captain"
        : (player as Player)?.isViceCaptain
          ? "vice"
          : ""
    );
  }, [player]);

  /* Role Management */
  const handleRoleChange = (newRole: "captain" | "vice") => {
    setRole(newRole);
    // Ensure player has an ID (is a full Player object)
    if ('id' in player && typeof player.id === 'number') {
      if (newRole === "captain") {
        changeRole?.({ captain: player.id });
      } else {
        changeRole?.({ vice: player.id });
      }
    }
  };

  return (
    <>
      {playerStats && (
        <PlayerInfo player={player} playerStats={playerStats} />
      )}
      {showDetails && <PlayerDetails playerStats={playerStats} />}
      {pickMyTeam && (
        <div>
          {!player?.subNumber && (
            <>
              {error && <h1 className="text-center text-base text-red-500">{error}</h1>}
              <div className="flex items-center justify-between py-5 px-12 mb-2 border-b border-[#ebe5eb] dark:border-[#541e5d]">
                {changeRole && (
                  <>
                    <Checkbox
                      checked={role === "captain"}
                      onChange={() => handleRoleChange("captain")}
                      label="Captain"
                    />
                    <Checkbox
                      checked={role === "vice"}
                      onChange={() => handleRoleChange("vice")}
                      label="Vice Captain"
                    />
                  </>
                )}
              </div>
            </>
          )}
          <div className="flex items-center justify-between py-2 px-12 mb-2">
            <Button label="Full Profile" width="w-1/2" type="Primary" />
            {handleSub && (
              <Button
                width="w-1/2"
                onClick={() => {
                  const p = player as Player;
                  handleSub(
                    p.name,
                    p.subNumber ? "bench" : "starting",
                    p.isCaptain,
                    p.isViceCaptain
                  );
                }}
                label="Substitute"
                type="Primary"
              />
            )}
          </div>
        </div>
      )}
      {showStats && playerStats && (
        <PlayerOverall playerStats={playerStats} />
      )}
    </>
  );
};

export default PlayerStatsCard;
