import { createLazyFileRoute, Link, Outlet, useMatch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import dayjs from "dayjs";
import Modal from "../../components/common/Modal";

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

function CopyUrlRow({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className="flex gap-1.5">
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="flex-1 min-w-0 px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-[10px] font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
      />
      <button
        onClick={copy}
        className="shrink-0 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all active:scale-95"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function JsonImportSection({
  label,
  placeholder,
  value,
  onChange,
  onImport,
  isPending,
  error,
  resultText,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onImport: () => void;
  isPending: boolean;
  error: string;
  resultText: string | null;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        placeholder={placeholder}
        className="w-full px-2.5 py-2 bg-[#150f24] border border-white/10 rounded-lg text-[10px] font-mono text-white/90 placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all resize-y"
      />
      <button
        onClick={onImport}
        disabled={isPending || !value.trim()}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 rounded-lg text-[11px] font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:transform-none"
      >
        {isPending ? "Importing..." : `Import ${label}`}
      </button>
      {error && (
        <div className="p-2.5 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{error}</div>
      )}
      {resultText && (
        <div className="p-2.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{resultText}</div>
      )}
    </div>
  );
}

function FixtureDataModal({ fixture, onClose }: { fixture: any; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [incidentsText, setIncidentsText] = useState("");
  const [lineupsText, setLineupsText] = useState("");
  const [incidentsError, setIncidentsError] = useState("");
  const [lineupsError, setLineupsError] = useState("");
  const [incidentsResult, setIncidentsResult] = useState<string | null>(null);
  const [lineupsResult, setLineupsResult] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FIXTURES] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FIXTURE_STATS] });
  };

  const incidentsMutation = useMutation({
    mutationFn: (payload: any) =>
      apiClient.post(API_ENDPOINTS.ADMIN.IMPORT_FIXTURE_INCIDENTS(fixture.fixtureId), payload),
    onSuccess: (res) => {
      setIncidentsResult(`Saved ${res?.data?.data?.saved ?? 0} incidents`);
      setIncidentsError("");
      invalidate();
    },
    onError: (err: any) => {
      setIncidentsResult(null);
      setIncidentsError(err.response?.data?.error || "Failed to import incidents. Check that the JSON is valid.");
    },
  });

  const lineupsMutation = useMutation({
    mutationFn: (payload: any) =>
      apiClient.post(API_ENDPOINTS.ADMIN.IMPORT_FIXTURE_LINEUPS(fixture.fixtureId), payload),
    onSuccess: (res) => {
      setLineupsResult(`Saved ${res?.data?.data?.saved ?? 0} lineup players`);
      setLineupsError("");
      invalidate();
    },
    onError: (err: any) => {
      setLineupsResult(null);
      setLineupsError(err.response?.data?.error || "Failed to import lineups. Check that the JSON is valid.");
    },
  });

  const handleImportIncidents = () => {
    setIncidentsError("");
    setIncidentsResult(null);
    let parsed: any;
    try {
      parsed = JSON.parse(incidentsText);
    } catch (e: any) {
      setIncidentsError(`Invalid JSON: ${e.message}`);
      return;
    }
    incidentsMutation.mutate(parsed);
  };

  const handleImportLineups = () => {
    setLineupsError("");
    setLineupsResult(null);
    let parsed: any;
    try {
      parsed = JSON.parse(lineupsText);
    } catch (e: any) {
      setLineupsError(`Invalid JSON: ${e.message}`);
      return;
    }
    lineupsMutation.mutate(parsed);
  };

  if (!fixture) return null;

  const fixtureId = fixture.fixtureId;
  const incidentsUrl = `https://www.sofascore.com/api/v1/event/${fixtureId}/incidents`;
  const lineupsUrl = `https://www.sofascore.com/api/v1/event/${fixtureId}/lineups`;
  const homeName = fixture.homeTeamName ?? `Team #${fixture.homeTeam?.id ?? ''}`;
  const awayName = fixture.awayTeamName ?? `Team #${fixture.awayTeam?.id ?? ''}`;

  return (
    <Modal isOpen={!!fixture} onClose={onClose} variant="center" maxWidthClass="max-w-2xl">
      <div className="p-5 space-y-4 relative overflow-hidden text-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-600 opacity-80" />

        <div className="flex justify-between items-center">
          <h2 className="text-base font-black tracking-tight truncate max-w-[240px]">
            {homeName} vs {awayName}
          </h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors text-xs font-bold">✕</button>
        </div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 -mt-3">Match #{fixtureId}</p>

        <div className="space-y-2">
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">Incidents URL</label>
            <CopyUrlRow url={incidentsUrl} />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">Lineups URL</label>
            <CopyUrlRow url={lineupsUrl} />
          </div>
          <p className="text-[10px] text-white/40 font-medium leading-snug">
            Open each URL in a browser, then paste the returned JSON below and import.
          </p>
        </div>

        <div className="border-t border-white/10 pt-3 space-y-4">
          <JsonImportSection
            label="Incidents JSON"
            placeholder='Paste the JSON from the incidents URL (the { "incidents": [...] } payload)...'
            value={incidentsText}
            onChange={setIncidentsText}
            onImport={handleImportIncidents}
            isPending={incidentsMutation.isPending}
            error={incidentsError}
            resultText={incidentsResult}
          />
          <JsonImportSection
            label="Lineups JSON"
            placeholder='Paste the JSON from the lineups URL (the { "home": { "players": [...] }, "away": { "players": [...] } } payload)...'
            value={lineupsText}
            onChange={setLineupsText}
            onImport={handleImportLineups}
            isPending={lineupsMutation.isPending}
            error={lineupsError}
            resultText={lineupsResult}
          />
        </div>
      </div>
    </Modal>
  );
}

function AdminFixtures() {
  const match = useMatch({ from: "/admin/fixtures/$fixtureId", shouldThrow: false });

  const weekRange = getWeekRange();
  const [dateStart, setDateStart] = useState(weekRange.start);
  const [dateEnd, setDateEnd] = useState(weekRange.end);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [gameweekFilter, setGameweekFilter] = useState<number | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FIXTURES],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.FIXTURES);
      return response.data;
    },
  });

  const { data: gameweeksData } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_GAMEWEEKS],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.GAMEWEEKS);
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

  const undoMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiClient.delete(API_ENDPOINTS.ADMIN.UNDO_FANTASY(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FIXTURES] });
      alert("Removed from fantasy successfully!");
    },
    onError: () => {
      alert("Failed to remove from fantasy. Check logs.");
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
  const gameweeks = [...(gameweeksData?.data || [])].sort((a: any, b: any) => a.number - b.number);

  const gwFiltered = gameweekFilter == null ? allFixtures : allFixtures.filter((f: any) => f.gameweekNumber === gameweekFilter);

  const startTs = dayjs(dateStart).startOf("day").unix();
  const endTs = dayjs(dateEnd).endOf("day").unix();
  const dateFiltered = showAll || gameweekFilter != null
    ? gwFiltered
    : gwFiltered.filter((f: any) => f.startTimestamp >= startTs && f.startTimestamp <= endTs);

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

        {/* Gameweek Filter */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-lg">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/40">GW</span>
          <select
            value={gameweekFilter ?? ""}
            onChange={(e) => setGameweekFilter(e.target.value === "" ? null : Number(e.target.value))}
            className="bg-transparent text-white text-xs font-semibold focus:outline-none max-w-[120px] cursor-pointer"
          >
            <option value="" className="bg-[#1b142d] text-white">All</option>
            {gameweeks.map((gw: any) => (
              <option key={gw.number} value={gw.number} className="bg-[#1b142d] text-white">
                GW {gw.number}{gw.isCurrent ? " • Current" : ""}{gw.isCompleted ? " • Done" : ""}
              </option>
            ))}
          </select>
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

            {/* Dense 2-up grid: two matches per row */}
            <div className="grid gap-1.5 sm:grid-cols-2">
              {groupedFixtures[date].map((f: any) => {
                const status = statusDisplay(f);
                const homeScore = f.homeScore?.current ?? null;
                const awayScore = f.awayScore?.current ?? null;
                const isFinished = f.status?.type === "finished";

                return (
                  <div
                    key={f.fixtureId}
                    className="bg-[#150f24]/50 hover:bg-[#1b142d]/80 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 flex flex-col gap-2 transition-all duration-200"
                  >
                    {/* Time & status badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-black tracking-tight text-white/90">
                          {dayjs.unix(f.startTimestamp).format("HH:mm")}
                        </span>
                        {f.gameweekNumber != null && (
                          <span
                            className={`text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded whitespace-nowrap ${
                              f.gameweekNumber === gameweekFilter
                                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                : 'bg-white/5 text-white/40 border border-white/10'
                            }`}
                          >
                            GW {f.gameweekNumber}
                          </span>
                        )}
                      </div>
                      <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded ${status.class}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Match matchup */}
                    <div className="flex items-center justify-center gap-2">
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
                    <div className="flex items-center justify-end gap-1.5 border-t border-white/5 pt-2">
                      <button
                        onClick={() => setSelectedFixture(f)}
                        className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/10 transition-all"
                      >
                        Data URLs
                      </button>

                      <Link
                        to="/admin/fixtures/$fixtureId"
                        params={{ fixtureId: String(f.fixtureId) }}
                        className="text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded bg-white/5 text-white/80 hover:bg-white/15 hover:text-white border border-white/10 transition-all"
                      >
                        Stats
                      </Link>

                      {f.addedtofantasy ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Remove this fixture from fantasy scoring? This will subtract its points.")) {
                              undoMutation.mutate(f.fixtureId);
                            }
                          }}
                          disabled={!f.canUndo || (undoMutation.isPending && undoMutation.variables === f.fixtureId)}
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded transition-all whitespace-nowrap shadow-sm ${
                            f.canUndo
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-not-allowed'
                          }`}
                          title={!f.canUndo ? "Only fixtures in the current, non-completed gameweek can be undone" : ""}
                        >
                          {undoMutation.isPending && undoMutation.variables === f.fixtureId
                            ? 'Loading...'
                            : f.canUndo
                            ? 'Undo Added to Fantasy'
                            : 'Added to Fantasy'}
                        </button>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); detailsMutation.mutate(f.fixtureId); }}
                          disabled={!isFinished || !f.hasDetails || !f.hasGameweek || (detailsMutation.isPending && detailsMutation.variables === f.fixtureId)}
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded transition-all whitespace-nowrap shadow-sm ${
                            !f.hasGameweek
                              ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed opacity-60'
                              : !f.hasDetails
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 disabled:opacity-50'
                          }`}
                          title={!f.hasGameweek ? "Assign this fixture to a gameweek first" : !f.hasDetails ? "Fetch match details first" : ""}
                        >
                          {detailsMutation.isPending && detailsMutation.variables === f.fixtureId
                            ? 'Loading...'
                            : !f.hasGameweek
                            ? 'No Gameweek'
                            : !f.hasDetails
                            ? 'No Details'
                            : 'Add to Fantasy'}
                        </button>
                      )}
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

      <FixtureDataModal
        fixture={selectedFixture}
        onClose={() => setSelectedFixture(null)}
      />
    </div>
  );
}
