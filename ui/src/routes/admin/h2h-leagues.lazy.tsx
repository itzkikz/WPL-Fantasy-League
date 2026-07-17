import { createLazyFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAdminH2HLeague, useAdminH2HLeagueFixtures } from "../../features/h2h/hooks";
import { h2hApi } from "../../features/h2h/api";
import { H2HLeague, H2HFixture } from "../../features/h2h/types";
import apiClient from "../../api/client";
import { Users, Plus, Trash2, Zap, Calendar, X, Check, Loader2 } from "lucide-react";

export const Route = createLazyFileRoute("/admin/h2h-leagues")({
  component: AdminH2HLeagues,
});

function AdminH2HLeagues() {
  const queryClient = useQueryClient();
  const { data: league, isLoading, refetch } = useAdminH2HLeague();
  const { data: fixturesData } = useAdminH2HLeagueFixtures(league?._id ?? '');

  const [isEditing, setIsEditing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    fantasyTeamIds: [] as string[],
    gameweekStart: '',
    gameweekEnd: '',
    season: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedGw, setSelectedGw] = useState<number | null>(null);

  const { data: fantasyTeamsData } = useQuery({
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

  const generateMutation = useMutation({
    mutationFn: () => h2hApi.adminGenerateFixtures(league!._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-league'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-fixtures'] });
      setIsGenerating(false);
    },
    onError: (error: any) => {
      setIsGenerating(false);
      setError(error?.response?.data?.error || 'Failed to generate fixtures');
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

  const handleGenerate = async () => {
    if (!league) return;
    if (!window.confirm('Regenerate all fixtures for this league? This will delete existing fixtures.')) return;
    setIsGenerating(true);
    setError(null);
    generateMutation.mutate();
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

  const uniqueGameweeks = [...new Set(fixturesData?.fixtures?.map((f: H2HFixture) => f.gameweek) || [])].sort((a, b) => a - b);
  const filteredFixtures = fixturesData?.fixtures?.filter(
    (f: H2HFixture) => selectedGw === null || f.gameweek === selectedGw
  ) || [];

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
                  onClick={handleGenerate}
                  disabled={isGenerating || generateMutation.isPending}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-indigo-500/10 active:scale-95"
                >
                  {isGenerating || generateMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      Generate Fixtures
                    </>
                  )}
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
          {fixturesData?.fixtures && fixturesData.fixtures.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <h2 className="text-xs font-extrabold text-white/50 uppercase tracking-widest">Match Fixtures</h2>
                
                {/* Scrollable Gameweek Navigation */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <button
                    onClick={() => setSelectedGw(null)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border shrink-0 ${
                      selectedGw === null 
                        ? 'bg-indigo-600 text-white border-indigo-500' 
                        : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    All GWs
                  </button>
                  {uniqueGameweeks.map((gw: number) => (
                    <button
                      key={gw}
                      onClick={() => setSelectedGw(gw)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all border shrink-0 ${
                        selectedGw === gw 
                          ? 'bg-indigo-600 text-white border-indigo-500' 
                          : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      GW {gw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fixtures Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {filteredFixtures.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-white/30 text-xs font-semibold">No fixtures found for selected Gameweek.</div>
                ) : (
                  filteredFixtures.map((fixture: H2HFixture) => (
                    <div key={fixture._id} className="rounded-xl bg-[#150f24]/40 border border-white/5 p-3 flex flex-col justify-between hover:bg-[#150f24]/60 transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Gameweek {fixture.gameweek}</span>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          fixture.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-white/5 text-white/40 border border-white/10'
                        }`}>
                          {fixture.status === 'completed' ? 'Completed' : 'Upcoming'}
                        </span>
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
          )}
        </div>
      )}

      {/* Edit/Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setIsEditing(false)}>
          <div className="bg-[#1b142d] rounded-2xl shadow-2xl w-full max-w-md border border-white/10 p-5 relative overflow-hidden text-white animate-slide-up" onClick={e => e.stopPropagation()}>
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
                  {fantasyTeamsData?.length ? fantasyTeamsData.map((team: any) => {
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
        </div>
      )}
    </div>
  );
}