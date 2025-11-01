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

const PlayerStatsCard = ({
  onBack,
  showStats = false,
  showDetails = false,
  pickMyTeam = false,
  handleSub,
}: {
  onBack: () => void;
  showStats: boolean;
  showDetails: boolean;
  pickMyTeam: boolean;
  handleSub?: (
    playerName: Player["name"],
    location: "starting" | "bench"
  ) => void;
}) => {
  const { player } = usePlayerStore();
  const { data: playerStats, isLoading } = usePlayerDetails(player.name);
  const [isCaptain, setIsCaptian] = useState(player?.isCaptain ? true : false);
  const [isViceCaptain, setIsViceCaptian] = useState(
    player?.isViceCaptain ? true : false
  );

  return (
    <>
      {/* Header with Player Info */}
      {isLoading ? (
        <PlayerStatsOverlaySkeleton
          player={player}
          showStats={showStats}
          showDetails={showDetails}
          pickMyTeam={pickMyTeam}
          onClose={onBack}
        />
      ) : (
        <>
          {playerStats && (
            <PlayerInfo player={player} playerStats={playerStats} />
          )}
          {/* Stats Grid */}
          {showDetails && <PlayerDetails />}
          {pickMyTeam && (
            <div>
              <div className="flex items-center justify-between py-5 px-12 mb-2 border-b border-[#ebe5eb] dark:border-[#541e5d]">
                <Checkbox
                  onChange={() => setIsCaptian(!isCaptain)}
                  checked={isCaptain}
                  label="Captian"
                />
                <Checkbox
                  onChange={() => setIsViceCaptian(!isViceCaptain)}
                  checked={isViceCaptain}
                  label="Vice Captian"
                />
              </div>
              <div className="flex items-center justify-between py-2 px-12 mb-2">
                <Button label="Full Profile" type="Primary" />
                {handleSub && (
                  <Button
                    onClick={() => {
                      handleSub(
                        player?.name,
                        player?.subNumber ? "bench" : "starting"
                      );
                      onBack();
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
