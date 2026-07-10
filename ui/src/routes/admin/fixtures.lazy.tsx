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
    return { label: "FT", class: "bg-green-500/10 text-green-500 border border-green-500/20" };
  }
  if (fixture.status?.type === "inprogress") {
    return { label: "LIVE", class: "bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse" };
  }
  return { label: "NS", class: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20" };
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
      <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg max-w-4xl mx-auto mt-8">
        Failed to load fixtures. Please try again.
      </div>
    );
  }

  const allFixtures = data?.data || [];

  const startTs = dayjs(dateStart).startOf("day").unix();
  const endTs = dayjs(dateEnd).endOf("day").unix();
  const fixtures = showAll ? allFixtures : allFixtures.filter((f: any) => f.startTimestamp >= startTs && f.startTimestamp <= endTs);

  const groupedFixtures = fixtures.reduce((acc: Record<string, any[]>, fixture: any) => {
    const dateKey = dayjs.unix(fixture.startTimestamp).format("YYYY-MM-DD");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(fixture);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedFixtures).sort();

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Admin Fixtures
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            Manage and view all upcoming and past fixtures
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4">
        <button
          onClick={() => setShowAll(!showAll)}
          className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all whitespace-nowrap ${
            showAll
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "bg-white/5 text-text-secondary hover:text-text-primary border border-white/10"
          }`}
        >
          {showAll ? "Showing All" : "Show All"}
        </button>

        <div className="flex-1 h-[1px] bg-white/10 hidden sm:block"></div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">From</label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => { setDateStart(e.target.value); setShowAll(false); }}
              disabled={showAll}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-interactive"
            />
          </div>
          <span className="text-text-secondary mt-5">→</span>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">To</label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => { setDateEnd(e.target.value); setShowAll(false); }}
              disabled={showAll}
              className="px-3 py-2 rounded-xl text-sm font-medium transition-interactive"
            />
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mt-4 sm:mt-5">
          {fixtures.length} fixture{fixtures.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-8">
        {sortedDates.map((date) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-[2px] bg-indigo-500 rounded-full"></div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">
                {dayjs(date).format("dddd, MMMM D, YYYY")}
              </h2>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>

            <div className="grid gap-4">
              {groupedFixtures[date].map((f: any) => {
                const status = statusDisplay(f);
                const homeScore = f.homeScore?.current ?? null;
                const awayScore = f.awayScore?.current ?? null;
                const isFinished = f.status?.type === "finished";

                return (
                  <div
                    key={f.fixtureId}
                    className="bg-white/5 backdrop-blur-md dark:bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all group flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative overflow-hidden"
                  >
                    <div className="flex flex-col items-center sm:items-start min-w-[100px]">
                      <span className="text-2xl font-black tracking-tighter text-text-primary">
                        {dayjs.unix(f.startTimestamp).format("HH:mm")}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mt-2 shadow-sm ${status.class}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center w-full gap-4">
                      <div className="flex-1 flex items-center justify-end gap-3">
                        <span className="font-medium text-text-primary text-right">
                          {f.homeTeamName ?? `Team #${f.homeTeam?.id}`}
                        </span>
                      </div>

                      <div className="px-5 py-2 bg-black/20 dark:bg-black/40 rounded-full border border-white/5 min-w-[90px] flex justify-center items-center font-black text-2xl tracking-widest text-text-primary shadow-inner">
                        {homeScore !== null && awayScore !== null ? (
                          `${homeScore} - ${awayScore}`
                        ) : (
                          <span className="text-xs font-bold text-text-secondary">VS</span>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-start gap-3">
                        <span className="font-medium text-text-primary">
                          {f.awayTeamName ?? `Team #${f.awayTeam?.id}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0 border-t border-white/10 sm:border-0 pt-4 sm:pt-0">
                      <Link
                        to="/admin/fixtures/$fixtureId"
                        params={{ fixtureId: String(f.fixtureId) }}
                        className="text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all whitespace-nowrap shadow-sm bg-white/10 text-text-primary hover:bg-white/20 border border-white/10 inline-block"
                      >
                        Match Stats
                      </Link>
                      <button
                        onClick={(e) => { e.stopPropagation(); detailsMutation.mutate(f.fixtureId); }}
                        disabled={!isFinished || f.addedtofantasy || !f.hasDetails || !f.hasGameweek || (detailsMutation.isPending && detailsMutation.variables === f.fixtureId)}
                        className={`text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all whitespace-nowrap shadow-sm ${
                          f.addedtofantasy
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-not-allowed'
                            : !f.hasGameweek
                            ? 'bg-black/10 dark:bg-white/5 text-text-secondary border border-white/5 cursor-not-allowed opacity-70'
                            : 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border border-indigo-500/20 disabled:opacity-50'
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

        {fixtures.length === 0 && (
          <div className="text-center py-12 bg-surface rounded-xl border border-border">
            <p className="text-text-secondary">No fixtures found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
