import { useEffect, useState } from "react";
import { usePlayerDetails } from "../../features/players/hooks";
import StatRow from "../StatRow";
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
  const { data: playerStats, isLoading } = usePlayerDetails(player.name);

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
      {isLoading ? (
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-light-surface dark:bg-dark-surface skeleton-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-light-surface dark:bg-dark-surface rounded skeleton-pulse" />
              <div className="h-4 w-2/3 bg-light-surface dark:bg-dark-surface rounded skeleton-pulse" />
            </div>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-8 bg-light-surface dark:bg-dark-surface rounded skeleton-pulse stagger-${i}`} />
            ))}
          </div>
        </div>
      ) : (
        <>
          {playerStats && (
            <PlayerInfo player={player} playerStats={playerStats} />
          )}
          {/* Stats Grid */}
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
          {/* Captian & Vice Captian Selection */}
          {/* Tabs */}
          {showStats && playerStats && (
            <PlayerOverall playerStats={playerStats} />
          )}
        </>
      )}
    </>
  );
};

export default PlayerStatsCard;
