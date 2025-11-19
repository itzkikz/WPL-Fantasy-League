import React, { useEffect, useState, useMemo } from "react";
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

  const [clubs, setClubs] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);

  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);

  const [showClubOverlay, setShowClubOverlay] = useState(false);
  const [showLeagueOverlay, setShowLeagueOverlay] = useState(false);
  const [showMoreOverlay, setShowMoreOverlay] = useState(false);

  const [freeAgentSelected, setFreeAgentSelected] = useState(false);

  const handlePlayerOverlay = (eachPlayer: Player | null) => {
    if (eachPlayer) setPlayer(eachPlayer);
    setShowOverlay((p) => !p);
  };

  const toggleSelect = (list: string[], setList: any, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((x) => x !== value));
    } else {
      setList([...list, value]);
    }
  };

  const handleReset = () => {
    setSelectedClubs([]);
    setSelectedLeagues([]);
    setSelectedPositions([]);
    setFreeAgentSelected(false);
  };

  // extract unique clubs/leagues when players load
  useEffect(() => {
    if (players?.length) {
      setClubs([...new Set(players.map((p) => p.club))]);
      setLeagues([...new Set(players.map((p) => p.league))]);
    }
  }, [players]);

  // FINAL FILTERED PLAYERS
  const filteredPlayers = useMemo(() => {
    if (!players) return [];

    return players.filter((p) => {
      if (selectedLeagues.length && !selectedLeagues.includes(p.league))
        return false;
      if (selectedClubs.length && !selectedClubs.includes(p.club)) return false;
      if (selectedPositions.length && !selectedPositions.includes(p.position))
        return false;
      if (freeAgentSelected && p.team_name !== "Free Agent") return false;
      return true;
    });
  }, [
    players,
    selectedLeagues,
    selectedClubs,
    selectedPositions,
    freeAgentSelected,
  ]);

  return (
    <div className="flex flex-col h-screen">
      {/* Top Filter Buttons */}
      <div className="m-2 flex gap-2">
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
          size="text-sm"
          icon={<AngleDown width="3" height="3" />}
          onClick={() => setShowMoreOverlay(true)}
        />
        <Button
          label="Reset"
          type="Danger"
          width="w-1/4"
          onClick={handleReset}
        />
      </div>

      {/* Players Table */}
      <PlayersScrollableTable
        content={filteredPlayers}
        onClick={handlePlayerOverlay}
      />

      {/* Player Detail Overlay */}
      <Overlay isOpen={showOverlay} onClose={() => setShowOverlay(false)}>
        {player && (
          <>
            <PlayerInfo player={player} playerStats={player} />
            <PlayerOverall noGW={true} playerStats={player} />
          </>
        )}
      </Overlay>

      {/* Clubs Overlay */}
      <Overlay
        isOpen={showClubOverlay}
        onClose={() => setShowClubOverlay(false)}
      >
        <div className="relative px-6 pt-6 pb-4">
          <h2 className="text-2xl font-bold mb-4 text-center">Clubs</h2>
          {clubs.map((club) => (
            <div
              key={club}
              className="flex items-center justify-between px-2 py-2"
            >
              <StatRow
                label={club}
                value=""
                textSize="text-base"
                border={false}
              />
              <Checkbox
                checked={selectedClubs.includes(club)}
                onChange={() =>
                  toggleSelect(selectedClubs, setSelectedClubs, club)
                }
              />
            </div>
          ))}
        </div>
      </Overlay>

      {/* Leagues Overlay */}
      <Overlay
        isOpen={showLeagueOverlay}
        onClose={() => setShowLeagueOverlay(false)}
      >
        <div className="relative px-6 pt-6 pb-4">
          <h2 className="text-2xl font-bold mb-4 text-center">Leagues</h2>
          {leagues.map((league) => (
            <div
              key={league}
              className="flex items-center justify-between px-2 py-2"
            >
              <StatRow
                label={league}
                value=""
                textSize="text-base"
                border={false}
              />
              <Checkbox
                checked={selectedLeagues.includes(league)}
                onChange={() =>
                  toggleSelect(selectedLeagues, setSelectedLeagues, league)
                }
              />
            </div>
          ))}
        </div>
      </Overlay>

      {/* More Filters Overlay */}
      <Overlay
        isOpen={showMoreOverlay}
        onClose={() => setShowMoreOverlay(false)}
      >
        <div className="relative px-6 pt-6 pb-4">
          <h2 className="text-2xl font-bold mb-4 text-center">More</h2>

          {["G", "D", "M", "F"].map((pos) => (
            <div
              key={pos}
              className="flex items-center justify-between px-2 py-2"
            >
              <StatRow
                label={
                  pos === "G"
                    ? "GK"
                    : pos === "D"
                      ? "DEF"
                      : pos === "M"
                        ? "MID"
                        : "FWD"
                }
                value=""
                border={false}
              />
              <Checkbox
                checked={selectedPositions.includes(pos)}
                onChange={() =>
                  toggleSelect(selectedPositions, setSelectedPositions, pos)
                }
              />
            </div>
          ))}

          <div className="flex items-center justify-between px-2 py-2 mt-6">
            <StatRow label="Free Agents" value="" border={false} />
            <Checkbox
              checked={freeAgentSelected}
              onChange={() => setFreeAgentSelected((p) => !p)}
            />
          </div>
        </div>
      </Overlay>
    </div>
  );
}
