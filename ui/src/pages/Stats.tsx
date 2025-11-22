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
import { getRouteApi, useNavigate } from "@tanstack/react-router";

const routeApi = getRouteApi("/stats/");

export default function Stats() {
  const navigate = useNavigate({ from: "/stats/" });
  const search = routeApi.useSearch();
  const { clubs: selectedClubs, leagues: selectedLeagues, positions: selectedPositions, freeAgents: freeAgentSelected } = search;

  const { data: players } = usePlayers();
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);

  const [showOverlay, setShowOverlay] = useState(false);

  const [clubs, setClubs] = useState<string[]>([]);
  const [leagues, setLeagues] = useState<string[]>([]);

  const [showClubOverlay, setShowClubOverlay] = useState(false);
  const [showLeagueOverlay, setShowLeagueOverlay] = useState(false);
  const [showMoreOverlay, setShowMoreOverlay] = useState(false);

  const handlePlayerOverlay = (eachPlayer: PlayerStats | null) => {
    if (eachPlayer) {
      // Map PlayerStats to Player
      const mappedPlayer: Player = {
        ...eachPlayer, // Spread original stats to ensure PlayerInfo has required data
        id: 0, // ID is missing in PlayerStats, using 0 or need to fetch detail
        name: eachPlayer.player_name,
        team: eachPlayer.team_name,
        teamColor: "", // Missing, will fallback to club color in PlayerInfo
        point: eachPlayer.total_point,
        position: eachPlayer.position,
        fullTeamName: eachPlayer.team_name,
        clean_sheet: eachPlayer.clean_sheet,
        goal: eachPlayer.goal,
        assist: eachPlayer.assist,
        yellow_card: eachPlayer.yellow_card,
        red_card: eachPlayer.red_card,
        save: eachPlayer.save,
        penalty_save: eachPlayer.penalty_save,
        penalty_miss: eachPlayer.penalty_miss,
        app: eachPlayer.app,
        gw: 0, // Missing
      } as unknown as Player;
      setPlayer(mappedPlayer);
    }
    setShowOverlay((p) => !p);
  };

  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      search: (prev: any) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const toggleSelect = (list: string[], key: "clubs" | "leagues" | "positions", value: string) => {
    const newList = list.includes(value)
      ? list.filter((x) => x !== value)
      : [...list, value];

    updateSearch({ [key]: newList });
  };

  const handleReset = () => {
    navigate({
      search: {
        clubs: [],
        leagues: [],
        positions: [],
        freeAgents: false,
      },
      replace: true,
    });
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
          type="Primary"
          onClick={() => setShowLeagueOverlay(true)}
        />
        <Button
          label="All Clubs"
          size="text-sm"
          type="Primary"
          onClick={() => setShowClubOverlay(true)}
        />
        <Button
          label="More"
          size="text-sm"
          type="Primary"
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
            <PlayerInfo player={player as Player} playerStats={player as any} />
            <PlayerOverall noGW={true} playerStats={player as any} />
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
                label=""
                type="checkbox"
                checked={selectedClubs.includes(club)}
                onChange={() =>
                  toggleSelect(selectedClubs, "clubs", club)
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
                label=""
                type="checkbox"
                checked={selectedLeagues.includes(league)}
                onChange={() =>
                  toggleSelect(selectedLeagues, "leagues", league)
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
                label=""
                type="checkbox"
                checked={selectedPositions.includes(pos)}
                onChange={() =>
                  toggleSelect(selectedPositions, "positions", pos)
                }
              />
            </div>
          ))}

          <div className="flex items-center justify-between px-2 py-2 mt-6">
            <StatRow label="Free Agents" value="" border={false} />
            <Checkbox
              label=""
              type="checkbox"
              checked={freeAgentSelected}
              onChange={() => updateSearch({ freeAgents: !freeAgentSelected })}
            />
          </div>
        </div>
      </Overlay>
    </div>
  );
}
