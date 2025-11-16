import { useEffect, useState } from "react";
import { usePlayerDetails } from "../../features/players/hooks";
import StatRow from "../StatRow";
import PlayerStatsOverlaySkeleton from "../skeletons/PlayerStatsOverlaySkeleton";
import { Player } from "../../features/players/types";
import Button from "../common/Button";
import Checkbox from "../common/Checkbox";
import PlayerDetails from "./PlayerDetails";
import PlayerInfo from "./PlayerInfo";
import PlayerOverall from "./PlayerOverall";
import { usePlayerStore } from "../../store/usePlayerStore";
import { Roles } from "../../store/types";

const StatsCard = ({
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
  const { player } = usePlayerStore();
  const { data: playerStats, isLoading } = usePlayerDetails(player.name);

  const initialRole: "captain" | "vice" | "" = player?.isCaptain
    ? "captain"
    : player?.isViceCaptain
      ? "vice"
      : "";
  const [role, setRole] = useState<"captain" | "vice" | "">(initialRole);

  const handleRole = (role: "captain" | "vice" | "") => {
    setRole(role);
    if (role) {
      const playerName = player?.name || "";
      const roles = { [role]: playerName };
      playerName && changeRole && changeRole(roles);
    }
  };

  return (
    <>
      {/* Header with Player Info */}
      {isLoading ? (
        <PlayerStatsOverlaySkeleton
          player={player}
          showStats={showStats}
          showDetails={showDetails}
          pickMyTeam={pickMyTeam}
        />
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
                          onChange={() => handleRole("captain")}
                          label="Captian"
                        />
                        <Checkbox
                          checked={role === "vice"}
                          onChange={() => handleRole("vice")}
                          label="Vice Captian"
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
                      handleSub(
                        player?.name,
                        player?.subNumber ? "bench" : "starting",
                        player?.isCaptain,
                        player?.isViceCaptain
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

export default StatsCard;
