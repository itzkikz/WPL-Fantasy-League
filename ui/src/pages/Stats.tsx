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
      const s = eachPlayer.overall || {} as any;
      const mappedPlayer = {
        ...eachPlayer,
        id: eachPlayer.player_id,
        name: eachPlayer.player_name,
        team: eachPlayer.team_short_name || eachPlayer.team_name?.substring(0, 3).toUpperCase(),
        teamColor: eachPlayer.team_color,
        teamTextColor: eachPlayer.team_text_color,
        point: s.total_point || 0,
        position: eachPlayer.position,
        fullTeamName: eachPlayer.team_name,
        clean_sheet: s.cleanSheet || 0,
        goal: s.goals || 0,
        assist: s.goalAssist || 0,
        yellow_card: s.yellowCards || 0,
        red_card: s.redCards || 0,
        save: s.saves || 0,
        penalty_save: s.penaltySaved || 0,
        penalty_miss: s.penaltyMissed || 0,
        app: s.appearances || 0,
        gw: 0,
        photo: eachPlayer.photo,
        overall: eachPlayer.overall,
        current_week: eachPlayer.current_week,
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
    <div className="flex flex-col h-full bg-light-bg dark:bg-dark-bg animate-in fade-in duration-500">

      {/* Header Area */}
      <div className="pt-6 pb-2 px-4 lg:px-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Player Stats
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Explore and filter player performance data.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="px-4 lg:px-8 pb-4 pt-2 sticky top-0 z-10 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
          <Button
            label="All Leagues"
            size="text-sm"
            type={selectedLeagues.length > 0 ? "Danger" : "Primary"}
            onClick={() => setShowLeagueOverlay(true)}
          />
          <Button
            label="All Clubs"
            size="text-sm"
            type={selectedClubs.length > 0 ? "Danger" : "Primary"}
            onClick={() => setShowClubOverlay(true)}
          />
          <Button
            label="More"
            size="text-sm"
            type={(selectedPositions.length > 0 || freeAgentSelected) ? "Danger" : "Primary"}
            icon={<AngleDown width="3" height="3" />}
            onClick={() => setShowMoreOverlay(true)}
          />
          <div className="ml-auto pl-2 border-l border-gray-200 dark:border-white/10">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Players Table Container */}
      <div className="flex-1 px-2 lg:px-8 pb-4 overflow-hidden">
        <div className="h-full rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
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
        </div>
      </div>

      {/* Player Detail Overlay */}
      <Overlay isOpen={showOverlay} onClose={() => setShowOverlay(false)}>
        {player && (
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="flex-none">
              <PlayerInfo player={player as Player} playerStats={player as any} />
            </div>
            <div className="flex-1 flex flex-col overflow-hidden mt-4 pb-4 sm:pb-6">
              <PlayerOverall noGW={true} playerStats={player as any} />
            </div>
          </div>
        )}
      </Overlay>

      {/* Clubs Overlay */}
      <Overlay isOpen={showClubOverlay} onClose={() => setShowClubOverlay(false)}>
        <div className="px-6 py-8 bg-white dark:bg-[#1a1a1a] rounded-t-3xl max-w-md mx-auto w-full max-h-[80vh] flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Filter by Club</h2>
          <div className="overflow-y-auto flex-1 space-y-2 pr-2">
            {clubs.map((club) => (
              <div
                key={club}
                onClick={() => toggleSelect(selectedClubs, "clubs", club)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <span className="text-gray-800 dark:text-gray-200 font-medium">{club}</span>
                <Checkbox
                  label=""
                  type="checkbox"
                  checked={selectedClubs.includes(club)}
                  onChange={() => toggleSelect(selectedClubs, "clubs", club)}
                />
              </div>
            ))}
          </div>
          <button onClick={() => setShowClubOverlay(false)} className="mt-6 w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold active:scale-95 transition-transform">
            Done
          </button>
        </div>
      </Overlay>

      {/* Leagues Overlay */}
      <Overlay isOpen={showLeagueOverlay} onClose={() => setShowLeagueOverlay(false)}>
        <div className="px-6 py-8 bg-white dark:bg-[#1a1a1a] rounded-t-3xl max-w-md mx-auto w-full max-h-[80vh] flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Filter by League</h2>
          <div className="overflow-y-auto flex-1 space-y-2 pr-2">
            {leagues.map((league) => (
              <div
                key={league}
                onClick={() => toggleSelect(selectedLeagues, "leagues", league)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <span className="text-gray-800 dark:text-gray-200 font-medium">{league}</span>
                <Checkbox
                  label=""
                  type="checkbox"
                  checked={selectedLeagues.includes(league)}
                  onChange={() => toggleSelect(selectedLeagues, "leagues", league)}
                />
              </div>
            ))}
          </div>
          <button onClick={() => setShowLeagueOverlay(false)} className="mt-6 w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold active:scale-95 transition-transform">
            Done
          </button>
        </div>
      </Overlay>

      {/* More Filters Overlay */}
      <Overlay isOpen={showMoreOverlay} onClose={() => setShowMoreOverlay(false)}>
        <div className="px-6 py-8 bg-white dark:bg-[#1a1a1a] rounded-t-3xl max-w-md mx-auto w-full max-h-[80vh] flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">More Filters</h2>
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">

            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Position</h3>
              <div className="space-y-2">
                {["G", "D", "M", "F"].map((pos) => {
                  const label = pos === "G" ? "Goalkeeper (GK)" : pos === "D" ? "Defender (DEF)" : pos === "M" ? "Midfielder (MID)" : "Forward (FWD)";
                  return (
                    <div
                      key={pos}
                      onClick={() => toggleSelect(selectedPositions, "positions", pos)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                    >
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{label}</span>
                      <Checkbox
                        label=""
                        type="checkbox"
                        checked={selectedPositions.includes(pos)}
                        onChange={() => toggleSelect(selectedPositions, "positions", pos)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-white/10 pt-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Status</h3>
              <div
                onClick={() => updateSearch({ freeAgents: !freeAgentSelected })}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10"
              >
                <span className="text-gray-800 dark:text-gray-200 font-medium">Free Agents Only</span>
                <Checkbox
                  label=""
                  type="checkbox"
                  checked={freeAgentSelected}
                  onChange={() => updateSearch({ freeAgents: !freeAgentSelected })}
                />
              </div>
            </div>

          </div>
          <button onClick={() => setShowMoreOverlay(false)} className="mt-6 w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold active:scale-95 transition-transform">
            Done
          </button>
        </div>
      </Overlay>
    </div>
  );
}
