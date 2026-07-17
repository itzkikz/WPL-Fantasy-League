import { createLazyFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import dayjs from "dayjs";

export const Route = createLazyFileRoute("/admin/fixtures")({
  component: AdminFixtures,
});

function statusDisplay(fixture: any) {
  if (fixture.status?.type === "finished") {
    return { label: "FT", class: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" };
  }
  if (fixture.status?.type === "inprogress") {
    return { label: "LIVE", class: "bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse" };
  }
  return { label: "NS", class: "bg-white/5 text-white/50 border border-white/10" };
}

function getWeekRange() {
  const now = dayjs();
  const monday = now.startOf("week").add(1, "day");
  const sunday = monday.add(6, "day");
  return {
    start: monday.format("YYYY-MM-DD"),
    end: sunday.format("YYYY-MM-DD"),
  };
}

function AdminFixtures() {
  const match = useMatch({ from: "/admin/fixtures/$fixtureId", shouldThrow: false });

  const weekRange = getWeekRange();
  const [dateStart, setDateStart] = useState(weekRange.start);
  const [dateEnd, setDateEnd] = useState(weekRange.end);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FIXTURES],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.FIXTURES);
      return response.data;
    },
  });

  const queryClient = useQueryClient();
  const detailsMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiClient.post(API_ENDPOINTS.ADMIN.FETCH_MATCH_DETAILS(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FIXTURES] });
      alert("Match details saved successfully!");
    },
    onError: () => {
      alert("Failed to fetch match details. Check logs.");
    }
  });

  if (match) {
    return <Outlet />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-full mt-4">
        Failed to load fixtures. Please try again.
      </div>
    );
  }

  const allFixtures = data?.data || [];

  const startTs = dayjs(dateStart).startOf("day").unix();
  const endTs = dayjs(dateEnd).endOf("day").unix();
  const dateFiltered = showAll ? allFixtures : allFixtures.filter((f: any) => f.startTimestamp >= startTs && f.startTimestamp <= endTs);

  const filteredFixtures = dateFiltered.filter((f: any) => {
    const homeTeam = (f.homeTeamName || `Team #${f.homeTeam?.id || ''}`).toLowerCase();
    const awayTeam = (f.awayTeamName || `Team #${f.awayTeam?.id || ''}`).toLowerCase();
    const query = searchQuery.toLowerCase();
    return homeTeam.includes(query) || awayTeam.includes(query);
  });

  const groupedFixtures = filteredFixtures.reduce((acc: Record<string, any[]>, fixture: any) => {
    const dateKey = dayjs.unix(fixture.startTimestamp).format("YYYY-MM-DD");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(fixture);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedFixtures).sort();

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      {/* Dense Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            Fixtures Dashboard
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {filteredFixtures.length} Match{filteredFixtures.length !== 1 ? "es" : ""}
            </span>
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Manage fixtures and link stats to gameweeks
          </p>
        </div>

        {/* Compact Toggle */}
        <button
          onClick={() => setShowAll(!showAll)}
          className={`text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border transition-all whitespace-nowrap self-start sm:self-auto ${
            showAll
              ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
              : "bg-white/5 text-white/60 hover:text-white border-white/10"
          }`}
        >
          {showAll ? "Showing All Dates" : "Filter by Week"}
        </button>
      </div>

      {/* High Density Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 bg-[#1b142d]/80 border border-white/10 rounded-xl p-2.5 shadow-sm">
        {/* Search */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-all font-medium"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/40">From</span>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => { setDateStart(e.target.value); setShowAll(false); }}
              disabled={showAll}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none w-28 disabled:opacity-40"
            />
          </div>
          <span className="text-white/20 text-xs hidden sm:inline">→</span>
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/40">To</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => { setDateEnd(e.target.value); setShowAll(false); }}
              disabled={showAll}
              className="bg-transparent text-white text-xs font-semibold focus:outline-none w-28 disabled:opacity-40"
            />
          </div>
        </div>
      </div>

      {/* Fixtures Data Density Grid */}
      <div className="space-y-4">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-1.5">
            {/* Minimal Date Header */}
            <div className="flex items-center gap-2 py-0.5">
              <div className="w-1 h-3 bg-indigo-500 rounded-full"></div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                {dayjs(date).format("dddd, MMMM D, YYYY")}
              </h2>
              <div className="flex-1 h-[1px] bg-white/5"></div>
            </div>

            {/* Dense Rows list */}
            <div className="grid gap-1">
              {groupedFixtures[date].map((f: any) => {
                const status = statusDisplay(f);
                const homeScore = f.homeScore?.current ?? null;
                const awayScore = f.awayScore?.current ?? null;
                const isFinished = f.status?.type === "finished";

                return (
                  <div
                    key={f.fixtureId}
                    className="bg-[#150f24]/50 hover:bg-[#1b142d]/80 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200"
                  >
                    {/* Time & status badge */}
                    <div className="flex items-center gap-3 sm:min-w-[130px]">
                      <span className="text-xs font-black tracking-tight text-white/90">
                        {dayjs.unix(f.startTimestamp).format("HH:mm")}
                      </span>
                      <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${status.class}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Match matchup */}
                    <div className="flex-1 flex items-center justify-center gap-2">
                      <span className="flex-1 text-right text-xs font-bold text-white/80 truncate">
                        {f.homeTeamName ?? `Team #${f.homeTeam?.id}`}
                      </span>

                      <div className="px-2.5 py-0.5 bg-black/40 rounded border border-white/10 min-w-[60px] text-center font-black text-xs tracking-widest text-indigo-300 shadow-inner">
                        {homeScore !== null && awayScore !== null ? (
                          `${homeScore} - ${awayScore}`
                        ) : (
                          <span className="text-[10px] font-extrabold text-white/30">VS</span>
                        )}
                      </div>

                      <span className="flex-1 text-left text-xs font-bold text-white/80 truncate">
                        {f.awayTeamName ?? `Team #${f.awayTeam?.id}`}
                      </span>
                    </div>

                    {/* Actions container */}
                    <div className="flex items-center justify-end gap-1.5 sm:min-w-[210px] border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                      <Link
                        to="/admin/fixtures/$fixtureId"
                        params={{ fixtureId: String(f.fixtureId) }}
                        className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/10 transition-all"
                      >
                        Stats
                      </Link>

                      <button
                        onClick={(e) => { e.stopPropagation(); detailsMutation.mutate(f.fixtureId); }}
                        disabled={!isFinished || f.addedtofantasy || !f.hasDetails || !f.hasGameweek || (detailsMutation.isPending && detailsMutation.variables === f.fixtureId)}
                        className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded transition-all whitespace-nowrap shadow-sm ${
                          f.addedtofantasy
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed'
                            : !f.hasGameweek
                            ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed opacity-60'
                            : !f.hasDetails
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 disabled:opacity-50'
                        }`}
                        title={!f.hasGameweek ? "Assign this fixture to a gameweek first" : !f.hasDetails ? "Fetch match details first" : ""}
                      >
                        {detailsMutation.isPending && detailsMutation.variables === f.fixtureId
                          ? 'Loading...'
                          : f.addedtofantasy
                            ? 'Added to Fantasy'
                            : !f.hasGameweek
                            ? 'No Gameweek'
                            : !f.hasDetails
                            ? 'No Details'
                            : 'Add to Fantasy'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredFixtures.length === 0 && (
          <div className="text-center py-8 bg-[#150f24]/30 rounded-xl border border-white/5">
            <p className="text-white/40 text-xs">No fixtures found matching current criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
