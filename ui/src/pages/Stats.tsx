import React, { useState, useMemo } from "react";
import { usePlayers, usePlayerFilters } from "../features/players/hooks";
import { usePlayerStore } from "../store/usePlayerStore";
import { Player, PlayerStats } from "../features/players/types";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Crown,
  Star,
  ChevronDown,
  SlidersHorizontal
} from "lucide-react";
import PlayerStatsModal from "./Standings/components/PlayerStatsModal";
import Overlay from "../components/common/Overlay";
import { getContrastText } from "../libs/helpers/color";

const routeApi = getRouteApi("/stats/");

export default function Stats() {
  const navigate = useNavigate({ from: "/stats/" });
  const search = routeApi.useSearch();
  const { clubs: selectedClubs, leagues: selectedLeagues, positions: selectedPositions, freeAgents: freeAgentSelected } = search;

  // Pass search params to usePlayers hook for server-side filtering
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = usePlayers({
    clubs: selectedClubs,
    leagues: selectedLeagues,
    positions: selectedPositions,
    freeAgents: freeAgentSelected
  });

  const players = useMemo(() => data?.pages.flatMap(p => p.data) || [], [data]);
  const player = usePlayerStore((state) => state.player);
  const setPlayer = usePlayerStore((state) => state.setPlayer);

  const [showOverlay, setShowOverlay] = useState(false);
  const [showFilterOverlay, setShowFilterOverlay] = useState(false);
  const [clubSearch, setClubSearch] = useState("");

  // Fetch filters from API
  const { data: filterData } = usePlayerFilters();
  const clubs = filterData?.clubs || [];
  const leagues = filterData?.leagues || [];

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
      setShowOverlay(true);
    } else {
      setShowOverlay(false);
    }
  };

  const updateSearch = (updates: Partial<typeof search>) => {
    navigate({
      search: (prev: any) => ({ ...prev, ...updates }),
      replace: true,
    });
  };

  const toggleSelect = (list: string[], key: "clubs" | "leagues", value: string) => {
    const newList = list.includes(value)
      ? list.filter((x) => x !== value)
      : [...list, value];

    updateSearch({ [key]: newList });
  };

  const handleReset = () => {
    updateSearch({
      clubs: [],
      leagues: [],
      freeAgents: false
    });
  };

  const handlePositionTabChange = (pos: string) => {
    const positions = pos ? [pos] : [];
    updateSearch({ positions });
  };

  const activePosition = selectedPositions?.[0] || "";

  // The first player is the top performer in this category
  const topPerformer = players[0];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-48px-80px)] lg:h-[calc(100vh-48px)] bg-background text-white overflow-hidden font-outfit select-none">

      {/* 1. Header Toolbar */}
      <div className="pt-5 pb-3 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight leading-tight">
              Best Performers
            </h1>
            {/* <button className="flex items-center gap-1 mt-0.5 text-text-muted hover:text-white transition-colors cursor-pointer text-[10px] md:text-xs font-bold">
              <span>This Season</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button> */}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilterOverlay(true)}
            className="relative w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer text-white"
          >
            <SlidersHorizontal className="w-5 h-5" />
            {(selectedClubs.length > 0 || selectedLeagues.length > 0 || freeAgentSelected) && (
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Position Tabs Row */}
      <div className="mx-4 mt-1 border-b border-[var(--color-border-divider)] flex gap-2 overflow-x-auto scrollbar-hide shrink-0 pb-1.5">
        {[
          { label: "All Players", val: "" },
          { label: "Forwards", val: "F" },
          { label: "Midfielders", val: "M" },
          { label: "Defenders", val: "D" },
          { label: "Goalkeepers", val: "G" }
        ].map((tab) => {
          const isActive = activePosition === tab.val;
          return (
            <button
              key={tab.label}
              onClick={() => handlePositionTabChange(tab.val)}
              className={`pb-1 text-xs font-black uppercase tracking-wider transition-all relative whitespace-nowrap cursor-pointer px-2
                ${isActive ? "text-secondary" : "text-text-muted/60 hover:text-white"}`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-secondary to-transparent" />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Featured Card Banner */}
      {!isLoading && topPerformer && (
        <div
          className="mx-4 mt-3 bg-gradient-card border border-border rounded-2xl p-4 shadow-card relative overflow-hidden shrink-0 flex items-center justify-between min-h-[96px]"
          style={{ isolation: 'isolate' }}
        >
          {/* Backlight halo logo */}
          {topPerformer.team_logo && (
            <img
              src={topPerformer.team_logo}
              alt=""
              className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 object-contain opacity-[0.08] pointer-events-none select-none"
            />
          )}

          <div className="flex items-center gap-3.5 z-10">
            {/* Crown Icon */}
            <div className="w-11 h-11 rounded-full bg-[#ffb700]/10 border border-[#ffb700]/20 flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-[#ffb700] fill-[#ffb700]/20 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted">
                {activePosition === "F" ? "Top Scorer" : activePosition === "M" ? "Top Midfielder" : activePosition === "D" ? "Top Defender" : activePosition === "G" ? "Top Goalkeeper" : "Top Performer"}
              </p>
              <h2 className="text-base font-black text-white mt-0.5 tracking-tight">
                {topPerformer.player_name}
              </h2>
              <p className="text-[11px] font-black text-secondary font-mono mt-0.5">
                {(topPerformer.overall?.total_point || 0).toLocaleString()} Pts
              </p>
            </div>
          </div>

          {/* Featured Player Circular Badge */}
          {topPerformer.photo && (
            <div className="shrink-0 flex items-center justify-center pr-1.5 z-10">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-violet-500/55 shadow-[0_0_15px_rgba(139,92,246,0.35)] overflow-hidden bg-white">
                <img
                  src={topPerformer.photo}
                  alt=""
                  className="w-full h-full object-cover select-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Table Headers */}
      <div className="mx-4 mt-3 flex items-center justify-between text-[10px] font-black text-[#a594c9]/50 uppercase tracking-widest px-3 shrink-0">
        <div className="w-10 text-left">Rank</div>
        <div className="flex-1 text-left pl-3.5">Player</div>
        <div className="w-18 text-right pr-2">Total</div>
        <div className="w-14 text-right pr-4">Avg</div>
      </div>

      {/* 5. Scrollable Player List */}
      <div
        onScroll={handleScroll}
        className="flex-1 mx-4 mt-2 mb-3 overflow-y-auto max-h-[calc(100vh-350px)] lg:max-h-[calc(100vh-270px)] scrollbar-hide space-y-2.5"
      >
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`h-16 bg-white/5 border border-white/5 rounded-2xl skeleton-pulse stagger-${Math.min(i + 1, 5)}`}
            />
          ))
        ) : players.length > 0 ? (
          <>
            {players.map((r, i) => {
              const isFirst = i === 0;
              const isSecond = i === 1;
              const isThird = i === 2;
              const points = r.overall?.total_point || 0;

              // GW Average point calculation
              const apps = r.overall?.appearances || 1;
              const gwAvg = (points / apps).toFixed(1);

              return (
                <div
                  key={r.player_id}
                  onClick={() => handlePlayerOverlay(r)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/[0.03] hover:bg-white/10 cursor-pointer transition-all duration-200"
                >
                  {/* Rank Column */}
                  <div className="w-10 flex flex-col items-center justify-center shrink-0">
                    <span className="text-base font-black text-white">{i + 1}</span>
                    {isFirst && <span className="w-1.5 h-1.5 rounded-full bg-[#ffb700] mt-0.5" />}
                    {isSecond && <span className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />}
                    {isThird && <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-0.5" />}
                  </div>

                  {/* Player Image with color border */}
                  <div className="relative shrink-0 pl-1.5">
                    <div
                      className="w-11 h-11 rounded-full overflow-hidden border-2 flex items-center justify-center bg-white"
                      style={{ borderColor: r.team_color || "#ccc" }}
                    >
                      {r.photo ? (
                        <img src={r.photo} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-xs font-bold text-[#a594c9] uppercase font-mono">
                          {r.player_name.substring(0, 2)}
                        </span>
                      )}
                    </div>
                    {isFirst && (
                      <div className="absolute -top-1 right-[-3px] w-4.5 h-4.5 rounded-full bg-amber-500 border border-background flex items-center justify-center z-10 shadow-md">
                        <Star className="w-2.5 h-2.5 text-black fill-black" />
                      </div>
                    )}
                  </div>

                  {/* Name, Club and Position */}
                  <div className="flex-1 pl-4 min-w-0">
                    <p className="text-[13px] font-bold text-white leading-tight">
                      {r.player_name}
                    </p>
                    <div className="text-[10px] text-[#a594c9]/70 font-semibold mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                      <span className="w-2 h-2 rounded-full border border-white/10 shrink-0" style={{ backgroundColor: r.team_color || "#ccc" }} />
                      <span className="leading-none shrink-0">{r.team_short_name || "UNK"}</span>
                      <span className="text-[#a594c9]/30 text-[8px] leading-none shrink-0">•</span>
                      <span className="uppercase text-[9px] tracking-wider text-violet-400 font-bold leading-none shrink-0">{r.position}</span>
                      {r.fantasy_team_name && (
                        <>
                          <span className="text-[#a594c9]/30 text-[8px] leading-none shrink-0">•</span>
                          <span className={`text-[9px] tracking-wide font-bold leading-none ${r.fantasy_team_name === "Free Agent" ? "text-gray-500" : "text-amber-400/80"}`}>{r.fantasy_team_name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Points Column */}
                  <div className="w-18 text-right shrink-0 flex flex-col justify-center pr-2">
                    <span className="text-[13px] font-black text-violet-400 font-mono">{points.toLocaleString()}</span>
                  </div>

                  {/* GW Avg & Chevron */}
                  <div className="w-14 flex items-center justify-end gap-1 shrink-0">
                    <span className="text-[13px] font-black text-white font-mono text-right">{gwAvg}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#a594c9]/30" />
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-[#c8c8c8]/40 text-center">
            <p className="text-sm font-medium">No Players Found</p>
            <p className="text-xs mt-1">Try resetting the filter search options.</p>
          </div>
        )}

        {/* Loading Indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center items-center py-4 shrink-0">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping mr-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-[#a594c9]/50 font-mono">Loading more...</p>
          </div>
        )}

        {/* Last updated footer label */}
        {!isLoading && players.length > 0 && (
          <div className="flex items-center justify-center pt-2 pb-6 text-[10px] text-[#a594c9]/30 tracking-wider">
            <span>© Last updated: 5 mins ago</span>
          </div>
        )}
      </div>

      {/* Custom Player Details Modal */}
      <PlayerStatsModal
        isOpen={showOverlay}
        onClose={() => handlePlayerOverlay(null)}
        player={player}
      />

      {/* 6. Filter Overlay Drawer */}
      <Overlay isOpen={showFilterOverlay} onClose={() => setShowFilterOverlay(false)}>
        <div className="px-6 py-6 bg-[#1a0f2e] border-t border-violet-500/20 rounded-t-3xl max-w-md mx-auto w-full max-h-[85vh] flex flex-col font-outfit text-white">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-violet-400" />
              <span>Filter Players</span>
            </h2>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer active:scale-95 transition-transform"
            >
              Reset All
            </button>
          </div>

          <div className="overflow-y-auto flex-1 space-y-6 pr-1 scrollbar-hide">
            {/* Leagues section */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#a594c9]/50 mb-2.5">Leagues</h3>
              <div className="grid grid-cols-2 gap-2">
                {leagues.map((lg) => {
                  const isChecked = selectedLeagues.includes(lg);
                  return (
                    <button
                      key={lg}
                      onClick={() => toggleSelect(selectedLeagues, "leagues", lg)}
                      className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-left truncate transition-all cursor-pointer
                        ${isChecked
                          ? "bg-violet-500/20 border-violet-500 text-violet-200"
                          : "bg-white/5 border-white/5 text-[#a594c9]/70 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      {lg}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clubs section */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-[#a594c9]/50 mb-2 flex items-center justify-between">
                <span>Clubs</span>
                {selectedClubs.length > 0 && (
                  <span className="text-[#a594c9]/70 text-[9px] lowercase font-bold">{selectedClubs.length} selected</span>
                )}
              </h3>

              {/* Search Bar */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search clubs..."
                  value={clubSearch}
                  onChange={(e) => setClubSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
                />
                {clubSearch && (
                  <button
                    onClick={() => setClubSearch("")}
                    className="absolute right-3 top-2.5 text-xs text-[#a594c9]/60 hover:text-white cursor-pointer font-bold"
                  >
                    clear
                  </button>
                )}
              </div>

              {/* Selected Clubs Tags */}
              {selectedClubs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3 max-h-[72px] overflow-y-auto pr-1 scrollbar-hide">
                  {selectedClubs.map((cl) => (
                    <span
                      key={cl}
                      onClick={() => toggleSelect(selectedClubs, "clubs", cl)}
                      className="inline-flex items-center gap-1 py-1 px-2 rounded-lg bg-violet-500/20 border border-violet-500/50 text-[10px] font-black text-violet-200 cursor-pointer hover:bg-rose-500/20 hover:border-rose-500 hover:text-rose-200 transition-colors"
                    >
                      <span>{cl}</span>
                      <span className="font-sans font-medium text-[9px] opacity-60">×</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Scrollable Clubs Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-hide">
                {clubs
                  .filter((cl) => cl.toLowerCase().includes(clubSearch.toLowerCase()))
                  .map((cl) => {
                    const isChecked = selectedClubs.includes(cl);
                    return (
                      <button
                        key={cl}
                        onClick={() => toggleSelect(selectedClubs, "clubs", cl)}
                        className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-left truncate transition-all cursor-pointer
                          ${isChecked
                            ? "bg-violet-500/20 border-violet-500 text-violet-200"
                            : "bg-white/5 border-white/5 text-[#a594c9]/70 hover:bg-white/10 hover:text-white"
                          }`}
                      >
                        {cl}
                      </button>
                    );
                  })}
                {clubs.filter((cl) => cl.toLowerCase().includes(clubSearch.toLowerCase())).length === 0 && (
                  <p className="col-span-2 text-center text-[10px] text-[#a594c9]/40 py-4 font-medium">No matching clubs found</p>
                )}
              </div>
            </div>

            {/* Free Agent switch */}
            <div className="flex items-center justify-between py-2 border-t border-violet-500/10">
              <div>
                <h4 className="text-xs font-black text-white">Free Agents Only</h4>
                <p className="text-[10px] text-[#a594c9]/50 font-medium">Show players without active teams</p>
              </div>
              <button
                onClick={() => updateSearch({ freeAgents: !freeAgentSelected })}
                className={`w-11 h-6 rounded-full p-1 transition-colors cursor-pointer duration-200 focus:outline-none flex items-center
                  ${freeAgentSelected ? "bg-violet-500" : "bg-white/10"}`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200
                    ${freeAgentSelected ? "translate-x-5" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowFilterOverlay(false)}
            className="mt-6 w-full py-3.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(139,92,246,0.25)] cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </Overlay>
    </div>
  );
}
