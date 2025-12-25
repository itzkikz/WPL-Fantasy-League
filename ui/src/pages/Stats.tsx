import React, { useEffect, useState, useMemo } from "react";
import PlayersScrollableTable from "../components/PlayersScrollableTable";
import { usePlayers, usePlayerFilters } from "../features/players/hooks";
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

  // Pass search params to usePlayers hook for server-side filtering
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = usePlayers({
    clubs: selectedClubs,
    leagues: selectedLeagues,
    positions: selectedPositions,
    freeAgents: freeAgentSelected
  });
  const players = useMemo(() => data?.pages.flatMap(p => p.data) || [], [data]);
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);

  const [showOverlay, setShowOverlay] = useState(false);

  // Fetch filters from API
  const { data: filterData } = usePlayerFilters();
  const clubs = filterData?.clubs || [];
  const leagues = filterData?.leagues || [];

  const [showClubOverlay, setShowClubOverlay] = useState(false);
  const [showLeagueOverlay, setShowLeagueOverlay] = useState(false);
  const [showMoreOverlay, setShowMoreOverlay] = useState(false);

  const handlePlayerOverlay = (eachPlayer: PlayerStats | null) => {
    if (eachPlayer) {
      // Map PlayerStats to Player
      const mappedPlayer: Player = {
        ...eachPlayer, // Spread original stats to ensure PlayerInfo has required data
        id: eachPlayer.player_id,
        name: eachPlayer.player_name,
        team: eachPlayer.team_short_name || eachPlayer.team_name.substring(0, 3).toUpperCase(),
        teamColor: eachPlayer.team_color,
        teamTextColor: eachPlayer.team_text_color,
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

  // FINAL FILTERED PLAYERS - No longer client-side filtering needed for main logic
  // But we might want to keep it if we want to filter loaded pages instantly?
  // No, server-side is better for consistency.
  const filteredPlayers = players;

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
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        isFetching={isFetchingNextPage}
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
