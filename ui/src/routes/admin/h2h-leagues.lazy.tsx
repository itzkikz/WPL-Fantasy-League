import { createLazyFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAdminH2HLeague, useAdminH2HLeagueFixtures } from "../../features/h2h/hooks";
import { h2hApi } from "../../features/h2h/api";
import { H2HLeague, H2HFixture } from "../../features/h2h/types";
import apiClient from "../../api/client";
import { Users, Plus, Trash2, Zap, Calendar, X, Check, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Modal from "../../components/common/Modal";

export const Route = createLazyFileRoute("/admin/h2h-leagues")({
  component: AdminH2HLeagues,
});

function AdminH2HLeagues() {
  const queryClient = useQueryClient();
  const { data: league, isLoading, refetch } = useAdminH2HLeague();
  const { data: fixturesData, isLoading: fixturesLoading } = useAdminH2HLeagueFixtures(league?._id ?? '');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    fantasyTeamIds: [] as string[],
    gameweekStart: '',
    gameweekEnd: '',
    season: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedGw, setSelectedGw] = useState<number | null>(null);
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);
  const [fixtureForm, setFixtureForm] = useState({ gameweek: '' });
  const [fixtureError, setFixtureError] = useState<string | null>(null);
  const [fixtureRows, setFixtureRows] = useState<{ homeTeam: string; awayTeam: string }[]>([{ homeTeam: '', awayTeam: '' }]);
  const [bulkResult, setBulkResult] = useState<{ created: number; errors: string[] } | null>(null);

  const { data: fantasyTeamsData, isLoading: fantasyTeamsLoading } = useQuery({
    queryKey: ['admin', 'fantasy-teams'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/fantasy-teams');
      return response.data.data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: (data: typeof editForm) => h2hApi.adminUpsertLeague(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-league'] });
      setIsEditing(false);
      setError(null);
    },
    onError: (error: any) => {
      setError(error?.response?.data?.error || 'Failed to save league');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => h2hApi.adminDeleteLeague(league!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-league'] });
    },
  });

  const deleteFixtureMutation = useMutation({
    mutationFn: (fixtureId: string) => h2hApi.adminDeleteFixture(league!._id, fixtureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-fixtures'] });
    },
    onError: (error: any) => {
      setError(error?.response?.data?.error || 'Failed to delete fixture');
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: (payload: { gameweek: number; matchups: { homeTeam: string; awayTeam: string }[] }) =>
      h2hApi.adminBulkCreateFixtures(league!._id, payload),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-fixtures'] });
      setBulkResult(result);
      setFixtureError(null);
    },
    onError: (error: any) => {
      setFixtureError(error?.response?.data?.error || 'Failed to add fixtures');
    },
  });

  const handleEditClick = () => {
    if (league) {
      setEditForm({
        name: league.name,
        fantasyTeamIds: league.fantasyTeams?.map((t: any) => t._id) || [],
        gameweekStart: String(league.gameweekStart || 1),
        gameweekEnd: String(league.gameweekEnd || 38),
        season: String(league.season || 1),
      });
      setIsEditing(true);
      setError(null);
    }
  };

  const handleSubmit = () => {
    if (!editForm.name.trim() || editForm.fantasyTeamIds.length < 2) return;
    setError(null);
    upsertMutation.mutate(editForm);
  };

  const scheduledTeamIdsForGw = (gw: number): Set<string> => {
    const set = new Set<string>();
    const list = fixturesData?.byGameweek?.[gw];
    if (Array.isArray(list)) {
      for (const f of list) {
        if (f.homeTeam?._id) set.add(f.homeTeam._id);
        if (f.awayTeam?._id) set.add(f.awayTeam._id);
      }
    }
    return set;
  };

  const availableTeamsForGw = (gw: number) =>
    (league?.fantasyTeams || []).filter((t: any) => !scheduledTeamIdsForGw(gw).has(t._id));

  const handleAddFixture = () => {
    if (!league) return;
    const gw = selectedGw ?? league.gameweekStart ?? 1;
    const available = availableTeamsForGw(gw);
    const teams = league.fantasyTeams || [];
    const first = available[0] || teams[0];
    const second = available[1] || teams.find((t: any) => t._id !== first?._id);
    setFixtureForm({ gameweek: String(gw) });
    setFixtureRows([{ homeTeam: first?._id || '', awayTeam: second?._id || '' }]);
    setBulkResult(null);
    setFixtureError(null);
    setIsFixtureModalOpen(true);
  };

  const handleAddRow = () => {
    const gw = Number(fixtureForm.gameweek) || league?.gameweekStart || 1;
    const used = scheduledTeamIdsForGw(gw);
    fixtureRows.forEach(r => { if (r.homeTeam) used.add(r.homeTeam); if (r.awayTeam) used.add(r.awayTeam); });
    const available = (league?.fantasyTeams || []).filter((t: any) => !used.has(t._id));
    setFixtureRows(rows => [...rows, { homeTeam: available[0]?._id || '', awayTeam: available[1]?._id || '' }]);
  };

  const handleRemoveRow = (index: number) => {
    setFixtureRows(rows => rows.filter((_, i) => i !== index));
  };

  const handleBulkAdd = () => {
    const validRows = fixtureRows.filter(r => r.homeTeam && r.awayTeam && r.homeTeam !== r.awayTeam);
    if (validRows.length === 0 || !fixtureForm.gameweek) return;
    setBulkResult(null);
    bulkCreateMutation.mutate({ gameweek: Number(fixtureForm.gameweek), matchups: validRows });
  };

  const handleDelete = async () => {
    if (!league) return;
    if (!window.confirm(`Delete "${league.name}" and all its fixtures?`)) return;
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 text-center text-white/40">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  const leagueGwStart = league?.gameweekStart ?? 1;
  const leagueGwEnd = league?.gameweekEnd ?? 38;
  const uniqueGameweeks = Array.from(
    { length: Math.max(leagueGwEnd - leagueGwStart + 1, 0) },
    (_, i) => leagueGwStart + i
  );
  const filteredFixtures = fixturesData?.fixtures?.filter(
    (f: H2HFixture) => selectedGw === null || f.gameweek === selectedGw
  ) || [];

  // Fixture count per gameweek (from the API's byGameweek grouping)
  const gwFixtureCounts: Record<number, number> = {};
  if (fixturesData?.byGameweek) {
    for (const [gw, list] of Object.entries(fixturesData.byGameweek)) {
      if (Array.isArray(list)) gwFixtureCounts[Number(gw)] = list.length;
    }
  }

  // Window of gameweeks centered on the active selection, so long seasons
  // (up to 38 GWs) stay compact instead of rendering one button per GW.
  const GW_WINDOW = 7;
  const gwCount = uniqueGameweeks.length;
  const windowSize = Math.min(GW_WINDOW, gwCount);
  const activeGw = selectedGw ?? leagueGwStart;
  const halfWindow = Math.floor(windowSize / 2);
  let gwWindowStart = activeGw - halfWindow;
  gwWindowStart = Math.min(Math.max(gwWindowStart, leagueGwStart), leagueGwEnd - windowSize + 1);
  gwWindowStart = Math.max(gwWindowStart, leagueGwStart);
  const windowedGameweeks = Array.from({ length: windowSize }, (_, i) => gwWindowStart + i);

  const goPrevGw = () => {
    setSelectedGw((prev) => {
      const cur = prev ?? leagueGwStart;
      return cur > leagueGwStart ? cur - 1 : cur;
    });
  };

  const goNextGw = () => {
    setSelectedGw((prev) => {
      const cur = prev ?? leagueGwStart;
      return cur < leagueGwEnd ? cur + 1 : cur;
    });
  };

  // Teams already scheduled in the gameweek currently picked in the add-fixtures modal
  const modalGw = Number(fixtureForm.gameweek) || league?.gameweekStart || 1;
  const scheduledTeamIds = scheduledTeamIdsForGw(modalGw);

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            <Zap className="w-5 h-5 text-indigo-400" />
            H2H Leagues Admin
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Single league per season · Round-robin fixtures
          </p>
        </div>
        {league && (
          <button 
            onClick={handleEditClick} 
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <Users className="w-3.5 h-3.5" /> Manage League
          </button>
        )}
      </div>

      {!league ? (
        <div className="text-center py-12 bg-[#150f24]/30 rounded-xl border border-white/5 p-6 max-w-sm mx-auto">
          <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-sm font-bold text-white">No H2H League Found</h2>
          <p className="text-xs text-white/50 mt-1 max-w-xs mx-auto">Create a Head-to-Head league for the current season.</p>
          <button
            onClick={() => {
              setEditForm({
                name: '',
                fantasyTeamIds: [],
                gameweekStart: '1',
                gameweekEnd: '38',
                season: '1',
              });
              setIsEditing(true);
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
          >
            Create League
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* League Detail Dashboard */}
          <div className="rounded-xl border border-white/10 bg-[#1b142d]/80 p-4 sm:p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white tracking-wide">{league.name}</h3>
                
                <div className="flex flex-wrap gap-2.5 mt-2">
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" /> GW {league.gameweekStart}–{league.gameweekEnd}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-white/50 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> {league.fantasyTeams?.length || 0} Teams
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                    Season {league.season}
                  </span>
                  {league.fixtureCount && (
                    <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <Check className="w-3.5 h-3.5" /> {league.completedFixtures || 0}/{league.fixtureCount} Completed
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-start">
                <button
                  onClick={handleAddFixture}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/10 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Fixture
                </button>
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete
                </button>
              </div>
            </div>

            {/* Managed Teams List */}
            {league.fantasyTeams && league.fantasyTeams.length > 0 && (
              <div className="pt-3 border-t border-white/5">
                <label className="block text-[9px] font-extrabold uppercase tracking-widest text-white/40 mb-1.5">League Competitors</label>
                <div className="flex flex-wrap gap-1.5">
                  {league.fantasyTeams.map((t: any) => (
                    <span key={t._id} className="px-2 py-1 rounded-md bg-[#150f24] border border-white/5 text-white/70 text-xs font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {t.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Fixtures Section */}
          <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <h2 className="text-xs font-extrabold text-white/50 uppercase tracking-widest">Match Fixtures</h2>

                <div className="flex flex-col gap-2.5">
                  {/* Row 1: core controls */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Reset to all gameweeks */}
                    <button
                      onClick={() => setSelectedGw(null)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border shrink-0 ${
                        selectedGw === null
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      All
                    </button>

                    {/* Prev / current / next stepper */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={goPrevGw}
                        disabled={selectedGw !== null && selectedGw <= leagueGwStart}
                        title="Previous gameweek"
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <div className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-black uppercase tracking-wider min-w-[74px] text-center tabular-nums">
                        {selectedGw === null ? 'All GWs' : `GW ${selectedGw}`}
                      </div>
                      <button
                        onClick={goNextGw}
                        disabled={selectedGw !== null && selectedGw >= leagueGwEnd}
                        title="Next gameweek"
                        className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:pointer-events-none"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Jump-to dropdown appears once there are more gameweeks than the window */}
                    {gwCount > GW_WINDOW && (
                      <select
                        value={selectedGw ?? 'all'}
                        onChange={(e) => setSelectedGw(e.target.value === 'all' ? null : Number(e.target.value))}
                        title="Jump to gameweek"
                        className="px-2 py-1.5 rounded-lg bg-[#150f24] border border-white/10 text-white text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shrink-0"
                      >
                        <option value="all">{selectedGw === null ? 'All GWs' : 'Jump to GW…'}</option>
                        {uniqueGameweeks.map((gw) => (
                          <option key={gw} value={gw}>
                            GW {gw}
                            {gwFixtureCounts[gw] > 0
                              ? ` · ${gwFixtureCounts[gw]} fixture${gwFixtureCounts[gw] > 1 ? 's' : ''}`
                              : ''}
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="flex-1" />

                    <button
                      onClick={handleAddFixture}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/10 active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Fixture
                    </button>
                  </div>

                  {/* Row 2: windowed gameweek chips with fixture-count badges */}
                  {windowedGameweeks.length > 0 && (
                    <div className="flex gap-1.5 overflow-x-auto pb-1 pt-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                      {windowedGameweeks.map((gw) => {
                        const count = gwFixtureCounts[gw] || 0;
                        return (
                          <button
                            key={gw}
                            onClick={() => setSelectedGw(gw)}
                            className={`relative px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border shrink-0 tabular-nums ${
                              selectedGw === gw
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            GW {gw}
                            {count > 0 && (
                              <span
                                className={`absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-black flex items-center justify-center ${
                                  selectedGw === gw ? 'bg-emerald-400 text-emerald-950' : 'bg-indigo-500/90 text-white'
                                }`}
                              >
                                {count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Fixtures Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {fixturesLoading ? (
                  <div className="col-span-full py-8 flex justify-center">
                    <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                  </div>
                ) : filteredFixtures.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-white/30 text-xs font-semibold">
                    <p>No fixtures {selectedGw ? `for Gameweek ${selectedGw}` : 'yet'}.</p>
                    <button
                      onClick={handleAddFixture}
                      className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 mx-auto shadow-md shadow-indigo-500/10 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Fixture
                    </button>
                  </div>
                ) : (
                  filteredFixtures.map((fixture: H2HFixture) => (
                    <div key={fixture._id} className="rounded-xl bg-[#150f24]/40 border border-white/5 p-3 flex flex-col justify-between hover:bg-[#150f24]/60 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Gameweek {fixture.gameweek}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            fixture.status === 'completed' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-white/5 text-white/40 border border-white/10'
                          }`}>
                            {fixture.status === 'completed' ? 'Completed' : 'Upcoming'}
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm('Delete this fixture?')) deleteFixtureMutation.mutate(fixture._id);
                            }}
                            disabled={deleteFixtureMutation.isPending}
                            title="Delete fixture"
                            className="text-white/25 hover:text-rose-400 transition-colors p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-1">
                        <div className="flex-1 text-right pr-3 min-w-0">
                          <span className={`font-extrabold text-xs truncate block ${fixture.status === 'completed' && fixture.winner === fixture.homeTeam?._id ? 'text-emerald-400' : 'text-white/80'}`}>
                            {fixture.homeTeam?.name || 'TBD'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col items-center shrink-0 min-w-[70px]">
                          {fixture.status === 'completed' ? (
                            <span className="text-xs font-black bg-black/30 px-2 py-0.5 rounded border border-white/5 text-white font-mono">
                              {fixture.homeScore} – {fixture.awayScore}
                            </span>
                          ) : (
                            <span className="text-[10px] font-black text-white/30 uppercase font-mono">VS</span>
                          )}
                          {fixture.status === 'completed' && fixture.winner === 'draw' && (
                            <span className="text-[8px] font-extrabold text-white/40 uppercase tracking-widest mt-0.5">Draw</span>
                          )}
                        </div>
                        
                        <div className="flex-1 text-left pl-3 min-w-0">
                          <span className={`font-extrabold text-xs truncate block ${fixture.status === 'completed' && fixture.winner === fixture.awayTeam?._id ? 'text-emerald-400' : 'text-white/80'}`}>
                            {fixture.awayTeam?.name || 'TBD'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} variant="responsive" maxWidthClass="max-w-md">
        <div className="p-5 relative overflow-hidden text-white">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80" />

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                {league ? 'Edit H2H League' : 'Create H2H League'}
              </h2>
              <button onClick={() => setIsEditing(false)} className="text-white/60 hover:text-white text-xl">✕</button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">League Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Premier League H2H"
                  className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">Start GW</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.gameweekStart}
                    onChange={e => setEditForm(f => ({ ...f, gameweekStart: e.target.value }))}
                    placeholder="1"
                    className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">End GW</label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.gameweekEnd}
                    onChange={e => setEditForm(f => ({ ...f, gameweekEnd: e.target.value }))}
                    placeholder="38"
                    className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">Season</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.season}
                  onChange={e => setEditForm(f => ({ ...f, season: e.target.value }))}
                  placeholder="1"
                  className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">Competitor Teams</label>
                  <span className="text-[9px] font-bold text-indigo-400">{editForm.fantasyTeamIds.length} Selected</span>
                </div>
                <div className="max-h-36 overflow-y-auto rounded-lg border border-white/10 bg-[#150f24] p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {fantasyTeamsLoading ? (
                    <div className="py-6 flex justify-center">
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    </div>
                  ) : fantasyTeamsData?.length ? fantasyTeamsData.map((team: any) => {
                    const isSelected = editForm.fantasyTeamIds.includes(team._id);
                    return (
                      <label
                        key={team._id}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors ${
                          isSelected ? 'bg-indigo-500/10 border border-indigo-500/20' : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setEditForm(f => ({
                              ...f,
                              fantasyTeamIds: isSelected
                                ? f.fantasyTeamIds.filter(id => id !== team._id)
                                : [...f.fantasyTeamIds, team._id],
                            }));
                          }}
                          className="rounded w-3.5 h-3.5 border-white/20 text-indigo-600 focus:ring-0 bg-transparent"
                        />
                        <span className="text-xs text-white/90 font-semibold">{team.name}</span>
                      </label>
                    );
                  }) : (
                    <p className="text-[10px] text-white/40 text-center py-4 italic">No fantasy teams found.</p>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="mt-2 text-[10px] font-bold text-rose-400">{error}</p>}

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-white/5">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!editForm.name.trim() || editForm.fantasyTeamIds.length < 2 || upsertMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-50 text-xs font-black transition-all shadow-md hover:scale-[1.02] active:scale-95"
              >
                {upsertMutation.isPending ? 'Saving...' : league ? 'Save Changes' : 'Create League'}
              </button>
            </div>
          </div>
      </Modal>

      {/* Add Fixtures Modal — add multiple matchups for one gameweek at once */}
      <Modal isOpen={isFixtureModalOpen} onClose={() => setIsFixtureModalOpen(false)} variant="responsive" maxWidthClass="max-w-md">
        <div className="p-5 relative overflow-hidden text-white flex flex-col min-h-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80 shrink-0" />

          <div className="flex items-center justify-between mb-1.5 shrink-0">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Add Fixtures</h2>
            <button onClick={() => setIsFixtureModalOpen(false)} className="text-white/60 hover:text-white text-xl">✕</button>
          </div>
          <p className="text-[11px] text-white/50 font-medium mb-4 shrink-0">
            Add multiple matchups for the same gameweek in one go — teams already scheduled that gameweek are greyed out.
          </p>

          <div className="flex-1 min-h-0 overflow-y-auto pr-1 -mr-1 space-y-3.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">Gameweek</label>
              <select
                value={fixtureForm.gameweek}
                onChange={e => {
                  setFixtureForm(f => ({ ...f, gameweek: e.target.value }));
                  setBulkResult(null);
                  setFixtureError(null);
                }}
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {uniqueGameweeks.map(gw => (
                  <option key={gw} value={gw}>GW {gw}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">Matchups</label>
              <div className="space-y-2">
                {fixtureRows.map((row, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <select
                      value={row.homeTeam}
                      onChange={e => setFixtureRows(rows => rows.map((r, i) => (i === index ? { ...r, homeTeam: e.target.value } : r)))}
                      className="flex-1 min-w-0 px-2.5 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="" disabled>Home</option>
                      {league?.fantasyTeams?.map((t: any) => (
                        <option key={t._id} value={t._id} disabled={scheduledTeamIds.has(t._id) || t._id === row.awayTeam}>{t.name}</option>
                      ))}
                    </select>
                    <span className="text-[9px] font-black text-white/30 uppercase shrink-0">vs</span>
                    <select
                      value={row.awayTeam}
                      onChange={e => setFixtureRows(rows => rows.map((r, i) => (i === index ? { ...r, awayTeam: e.target.value } : r)))}
                      className="flex-1 min-w-0 px-2.5 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="" disabled>Away</option>
                      {league?.fantasyTeams?.map((t: any) => (
                        <option key={t._id} value={t._id} disabled={scheduledTeamIds.has(t._id) || t._id === row.homeTeam}>{t.name}</option>
                      ))}
                    </select>
                    {fixtureRows.length > 1 && (
                      <button
                        onClick={() => handleRemoveRow(index)}
                        title="Remove matchup"
                        className="text-white/25 hover:text-rose-400 transition-colors p-1 rounded shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={handleAddRow}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg border border-dashed border-white/15 text-white/50 hover:text-white hover:border-white/30 text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add another matchup
                </button>
              </div>
            </div>

            {fixtureError && <p className="text-[10px] font-bold text-rose-400">{fixtureError}</p>}

            {bulkResult && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 space-y-1">
                <p className="text-[11px] font-black text-emerald-400">
                  <Check className="w-3.5 h-3.5 inline mr-1" />
                  {bulkResult.created} fixture{bulkResult.created === 1 ? '' : 's'} added
                </p>
                {bulkResult.errors.length > 0 && (
                  <ul className="list-disc pl-4 text-[10px] text-amber-400/90 font-semibold space-y-0.5">
                    {bulkResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-white/5 shrink-0">
            <button
              onClick={() => setIsFixtureModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleBulkAdd}
              disabled={
                !fixtureForm.gameweek ||
                fixtureRows.every(r => !r.homeTeam || !r.awayTeam || r.homeTeam === r.awayTeam) ||
                bulkCreateMutation.isPending
              }
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-50 text-xs font-black transition-all shadow-md hover:scale-[1.02] active:scale-95"
            >
              {bulkCreateMutation.isPending ? 'Adding...' : `Add ${fixtureRows.filter(r => r.homeTeam && r.awayTeam && r.homeTeam !== r.awayTeam).length} Fixture${fixtureRows.filter(r => r.homeTeam && r.awayTeam && r.homeTeam !== r.awayTeam).length === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}