import React, { useEffect, useState } from "react";
import PlayersScrollableTable from "../components/PlayersScrollableTable";
import { usePlayers } from "../features/players/hooks";
import Button from "../components/common/Button";
import Checkbox from "../components/common/Checkbox";
import Overlay from "../components/common/Overlay";
import { usePlayerStore } from "../store/usePlayerStore";
import { Player, PlayerStats } from "../features/players/types";
import PlayerInfo from "../components/player/PlayerInfo";
import PlayerOverall from "../components/player/PlayerOverall";
import AngleDown from "../components/icons/AngleDown";
import StatRow from "../components/StatRow";

export default function Stats() {
  const { data: players, isLoading, error } = usePlayers();
  const { player, setPlayer } = usePlayerStore();
  const [showOverlay, setShowOverlay] = useState(false);
  const [clubs, setClubs] = useState<String[]>([]);
  const [leagues, setLeagues] = useState<String[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<String[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<String[]>([]);
  const [showClubOverlay, setShowClubOverlay] = useState(false);
  const [showLeagueOverlay, setShowLeagueOverlay] = useState(false);
  const [showPlayers, setShowPlayers] = useState<PlayerStats[]>(players);
  const [showMoreOverlay, setShowMoreOverlay] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<String[]>([]);
  const [freeAgentSelected, setFreeAgentSelected] = useState(false);

  const handlePlayerOverlay = (eachPlayer: Player | null) => {
    eachPlayer && setPlayer(eachPlayer);
    setShowOverlay(!showOverlay);
  };

  const handleClubOverlay = (eachPlayer: Player | null) => {
    setShowClubOverlay(!showClubOverlay);
  };

  const handleLeagueOverlay = (eachPlayer: Player | null) => {
    setShowLeagueOverlay(!showLeagueOverlay);
  };

  const handleLeagueSelection = (league: string) => {
    const oldSelection = selectedLeagues;

    if (!oldSelection?.includes(league)) {
      setSelectedLeagues([...oldSelection, league]);
    } else {
      const newArray = oldSelection.filter((item) => item !== league);

      setSelectedLeagues(newArray);
    }
  };

  const handleClubSelection = (club: string) => {
    const oldSelection = selectedClubs;

    if (!oldSelection?.includes(club)) {
      setSelectedClubs([...oldSelection, club]);
    } else {
      const newArray = oldSelection.filter((item) => item !== club);
      setSelectedClubs(newArray);
    }
  };

  const handlePositionSelection = (position: string) => {
    const oldSelection = selectedPositions;

    if (!oldSelection?.includes(position)) {
      setSelectedPositions([...oldSelection, position]);
    } else {
      const newArray = oldSelection.filter((item) => item !== position);
      setSelectedPositions(newArray);
    }
  };

  const handleReset = () => {
    setShowPlayers(players);
    setSelectedClubs([]);
    setSelectedLeagues([]);
    setSelectedPositions([]);
    setFreeAgentSelected(false);
  };

  useEffect(() => {
    if (players && players?.length > 0) {
      setClubs([...new Set(players.map(({ club }) => club))]);
      setLeagues([...new Set(players.map(({ league }) => league))]);
      setShowPlayers(players);
    }
  }, [players]);

  useEffect(() => {
    if (selectedLeagues && selectedLeagues?.length > 0) {
      const filterPlayers = showPlayers?.filter((val) =>
        selectedLeagues.includes(val?.league)
      );
      setShowPlayers(filterPlayers);
    } else if (selectedClubs && selectedClubs?.length > 0) {
      const filterPlayers = showPlayers?.filter((val) =>
        selectedClubs.includes(val?.club)
      );
      setShowPlayers(filterPlayers);
    } else if (selectedPositions && selectedPositions?.length > 0) {
      const filterPlayers = showPlayers?.filter((val) =>
        selectedPositions.includes(val?.position)
      );
      setShowPlayers(filterPlayers);
    } else if (freeAgentSelected) {
      const filterPlayers = showPlayers?.filter(
        (val) => val?.team_name === "Free Agent"
      );
      setShowPlayers(filterPlayers);
    }
  }, [selectedLeagues, selectedClubs, selectedPositions, freeAgentSelected]);
  return (
    <div className="flex flex-col h-screen">
      <div className="m-2 flex">
        <Button
          label="All Leagues"
          size="text-sm"
          onClick={() => setShowLeagueOverlay(true)}
        />
        <Button
          label="All Clubs"
          size="text-sm"
          onClick={() => setShowClubOverlay(true)}
        />
        <Button
          label="More"
          onClick={() => setShowMoreOverlay(true)}
          icon={<AngleDown width="3" height="3" />}
          size="text-sm"
        />
        <Button
          onClick={() => handleReset()}
          label="Reset"
          type="Danger"
          width="w-1/4"
        />
      </div>
      <PlayersScrollableTable
        content={showPlayers}
        onClick={handlePlayerOverlay}
      />
      <Overlay
        isOpen={showOverlay}
        onClose={() => handlePlayerOverlay(null)}
        children={
          player && (
            <>
              <PlayerInfo player={player} playerStats={player} />
              <PlayerOverall noGW={true} playerStats={player} />
            </>
          )
        }
      />
      <Overlay
        isOpen={showClubOverlay}
        onClose={() => handleClubOverlay(null)}
        children={
          <>
            <div className={`relative px-6 pt-6 pb-4 rounded-t-3xl text-light-text-primary dark:text-white`}>
              <div className="flex items-start gap-4 mb-2">
                {/* Player Details */}
                <div className="flex-1 items-center justify-center">
                  <h2 className="text-2xl font-bold mb-1 text-center">
                    {"Clubs"}
                  </h2>
                </div>
              </div>
              {clubs &&
                clubs.map((val) => (
                  <div className="flex items-center justify-between px-2 py-2">
                    <StatRow
                      textSize="text-base"
                      label={val}
                      value={""}
                      border={false}
                    />
                    <Checkbox
                      type="checkbox"
                      checked={selectedClubs.includes(val)}
                      onChange={() => handleClubSelection(val)}
                    />
                  </div>
                ))}
            </div>
          </>
        }
      />
      <Overlay
        isOpen={showLeagueOverlay}
        onClose={() => handleLeagueOverlay(null)}
        children={
          <>
            <div className={`relative px-6 pt-6 pb-4 rounded-t-3xl text-light-text-primary dark:text-white`}>
              <div className="flex items-start gap-4 mb-2">
                {/* Player Details */}
                <div className="flex-1 items-center justify-center">
                  <h2 className="text-2xl font-bold mb-1 text-center">
                    {"Leagues"}
                  </h2>
                </div>
              </div>
              {leagues &&
                leagues.map((val) => (
                  <div className="flex items-center justify-between w-1/2 px-2 py-2">
                    <StatRow
                      textSize="text-base"
                      label={val}
                      value={""}
                      border={false}
                    />
                    <Checkbox
                      type="checkbox"
                      checked={selectedLeagues.includes(val)}
                      onChange={() => handleLeagueSelection(val)}
                    />
                  </div>
                ))}
            </div>
          </>
        }
      />
      <Overlay
        isOpen={showMoreOverlay}
        onClose={() => setShowMoreOverlay(false)}
        children={
          <>
            <div className={`relative px-6 pt-6 pb-4 rounded-t-3xl text-light-text-primary dark:text-white `}>
              <div className="flex items-start gap-4 mb-2">
                {/* Player Details */}
                <div className="flex-1 items-center justify-center">
                  <h2 className="text-2xl font-bold mb-1 text-center">
                    {"More"}
                  </h2>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 py-2">
                <StatRow
                  textSize="text-base"
                  label={"GK"}
                  value={""}
                  border={false}
                />
                <Checkbox
                  type="checkbox"
                  checked={selectedPositions.includes("G")}
                  onChange={() => handlePositionSelection("G")}
                />
              </div>
              <div className="flex items-center justify-between px-2 py-2">
                <StatRow
                  textSize="text-base"
                  label={"DEF"}
                  value={""}
                  border={false}
                />
                <Checkbox
                  type="checkbox"
                  checked={selectedPositions.includes("D")}
                  onChange={() => handlePositionSelection("D")}
                />
              </div>
              <div className="flex items-center justify-between px-2 py-2">
                <StatRow
                  textSize="text-base"
                  label={"MID"}
                  value={""}
                  border={false}
                />
                <Checkbox
                  type="checkbox"
                  checked={selectedPositions.includes("M")}
                  onChange={() => handlePositionSelection("M")}
                />
              </div>
              <div className="flex items-center justify-between px-2 py-2">
                <StatRow
                  textSize="text-base"
                  label={"FWD"}
                  value={""}
                  border={false}
                />
                <Checkbox
                  type="checkbox"
                  checked={selectedPositions.includes("F")}
                  onChange={() => handlePositionSelection("F")}
                />
              </div>
              <div className="flex items-center justify-between px-2 py-2 mt-6">
                <StatRow
                  textSize="text-base"
                  label={"Free Agents"}
                  value={""}
                  border={false}
                />
                <Checkbox
                  type="checkbox"
                  checked={freeAgentSelected}
                  onChange={() => setFreeAgentSelected(!freeAgentSelected)}
                />
              </div>
            </div>
          </>
        }
      />
    </div>
  );
}
