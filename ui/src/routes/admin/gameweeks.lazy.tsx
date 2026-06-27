import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import dayjs from "dayjs";

export const Route = createLazyFileRoute("/admin/gameweeks")({
  component: AdminGameweeks,
});

function AdminGameweeks() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [assigningGwId, setAssigningGwId] = useState<string | null>(null);
  const [selectedFixtures, setSelectedFixtures] = useState<number[]>([]);
  
  const [editingGwId, setEditingGwId] = useState<string | null>(null);
  const [deadlineDate, setDeadlineDate] = useState("");

  const [formData, setFormData] = useState({
    number: "",
    season: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    fixtures: "",
  });

  const [editFormData, setEditFormData] = useState({
    number: "",
    season: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    fixtures: "",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_GAMEWEEKS],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.GAMEWEEKS);
      return response.data;
    },
  });

  const { data: seasonsData } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_SEASONS],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.SEASONS);
      return response.data;
    },
  });

  const { data: fixturesData } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_FIXTURES],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.FIXTURES);
      return response.data;
    },
  });

  const { data: pickTeamData } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_PICK_TEAM_STATUS],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.PICK_TEAM_STATUS);
      return response.data;
    },
  });

  useEffect(() => {
    if (pickTeamData?.data?.deadlineDate) {
      setDeadlineDate(dayjs(pickTeamData.data.deadlineDate).format("YYYY-MM-DDTHH:mm"));
    }
  }, [pickTeamData]);

  const togglePickTeamMutation = useMutation({
    mutationFn: async (payload: { enabled: boolean, deadlineDate?: string }) => {
      return await apiClient.post(API_ENDPOINTS.ADMIN.PICK_TEAM_STATUS, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PICK_TEAM_STATUS] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post(API_ENDPOINTS.ADMIN.COMPLETE_GAMEWEEK(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_GAMEWEEKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PICK_TEAM_STATUS] });
    },
  });

  const revertMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.post(`${API_ENDPOINTS.ADMIN.GAMEWEEKS}/${id}/revert`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_GAMEWEEKS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PICK_TEAM_STATUS] });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newGameweek: any) => {
      return await apiClient.post(API_ENDPOINTS.ADMIN.GAMEWEEKS, newGameweek);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_GAMEWEEKS] });
      setIsCreating(false);
      setFormData({
        number: "",
        season: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        fixtures: "",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiClient.put(`${API_ENDPOINTS.ADMIN.GAMEWEEKS}/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_GAMEWEEKS] });
      setAssigningGwId(null);
      setSelectedFixtures([]);
      setEditingGwId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      number: Number(formData.number),
      season: Number(formData.season),
      fixtures: formData.fixtures
        .split(",")
        .map((f) => Number(f.trim()))
        .filter((f) => !isNaN(f) && f !== 0),
    };
    createMutation.mutate(payload);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGwId) return;
    const payload = {
      ...editFormData,
      number: Number(editFormData.number),
      season: Number(editFormData.season),
      fixtures: editFormData.fixtures
        .split(",")
        .map((f) => Number(f.trim()))
        .filter((f) => !isNaN(f) && f !== 0),
    };
    updateMutation.mutate({ id: editingGwId, data: payload });
  };

  const toggleCurrent = (id: string, isCurrent: boolean) => {
    updateMutation.mutate({ id, data: { isCurrent } });
  };

  const openEditForm = (gw: any) => {
    setEditingGwId(gw._id);
    setEditFormData({
      number: gw.number?.toString() || "",
      season: gw.season?.toString() || "",
      startDate: dayjs(gw.startDate).format("YYYY-MM-DDTHH:mm"),
      endDate: dayjs(gw.endDate).format("YYYY-MM-DDTHH:mm"),
      isCurrent: !!gw.isCurrent,
      fixtures: (gw.fixtures || []).join(", "),
    });
  };

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
        Failed to load gameweeks. Please try again.
      </div>
    );
  }

  const gameweeks = data?.data || [];
  const seasons = seasonsData?.data || [];
  const allFixtures = fixturesData?.data || [];

  const allAssignedFixtureIds = new Set(
    gameweeks.flatMap((gw: any) => gw.fixtures || [])
  );

  const unassignedFixtures = allFixtures.filter(
    (f: any) => !allAssignedFixtureIds.has(f.fixture.id)
  );

  const handleAssignFixtures = () => {
    if (!assigningGwId || selectedFixtures.length === 0) return;
    const gw = gameweeks.find((g: any) => g._id === assigningGwId);
    if (!gw) return;

    const newFixtures = Array.from(new Set([...(gw.fixtures || []), ...selectedFixtures]));
    updateMutation.mutate({ id: assigningGwId, data: { fixtures: newFixtures } });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Admin Gameweeks
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            Manage gameweeks for the current season
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          {isCreating ? "Cancel" : "Create Gameweek"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-sm mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Pick Team Enabler</h2>
          <p className="text-sm text-text-secondary mt-0.5">Allow users to modify their teams and set the deadline.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-bold tracking-widest text-text-secondary uppercase">Deadline Date</label>
            <input
              type="datetime-local"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium"
            />
          </div>
          <button
            onClick={() => togglePickTeamMutation.mutate({ enabled: !pickTeamData?.data?.enabled, deadlineDate })}
            disabled={togglePickTeamMutation.isPending}
            className={`px-5 py-2.5 rounded-full font-bold transition-all shadow-md disabled:opacity-50 mt-1 sm:mt-5 w-full sm:w-auto whitespace-nowrap ${pickTeamData?.data?.enabled ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20' : 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20'}`}
          >
            {togglePickTeamMutation.isPending ? 'Toggling...' : pickTeamData?.data?.enabled ? 'Disable Picking' : 'Enable Picking'}
          </button>
        </div>
      </div>

      {assigningGwId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
            
            <div className="p-6 sm:p-8 border-b border-white/10 flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Assign Fixtures</h2>
                <p className="text-sm font-medium text-text-secondary mt-1">Select fixtures to add to this gameweek</p>
              </div>
              <button onClick={() => setAssigningGwId(null)} className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-text-secondary hover:text-text-primary transition-all">
                ✕
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-3 custom-scrollbar relative z-10">
              {unassignedFixtures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
                  <span className="text-4xl mb-3">📅</span>
                  <p className="font-medium text-lg">No unassigned fixtures available.</p>
                </div>
              ) : (
                unassignedFixtures.map((f: any) => (
                  <label key={f.fixture.id} className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl cursor-pointer transition-all group">
                    <input
                      type="checkbox"
                      checked={selectedFixtures.includes(f.fixture.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFixtures([...selectedFixtures, f.fixture.id]);
                        } else {
                          setSelectedFixtures(selectedFixtures.filter((id) => id !== f.fixture.id));
                        }
                      }}
                      className="w-5 h-5 rounded border-white/20 text-purple-500 focus:ring-purple-500 bg-black/20 transition-all"
                    />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="font-bold text-text-primary text-lg">
                        {f.teams.home.name} <span className="text-[10px] uppercase tracking-widest text-text-secondary mx-2">vs</span> {f.teams.away.name}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-black/20 rounded-full text-text-secondary">
                        {dayjs(f.fixture.date).format("MMM D, YYYY HH:mm")}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="p-6 sm:p-8 border-t border-white/10 flex justify-end space-x-4 relative z-10 bg-black/20">
              <button
                onClick={() => setAssigningGwId(null)}
                className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:bg-white/5 border border-transparent hover:border-white/10 rounded-full transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignFixtures}
                disabled={selectedFixtures.length === 0 || updateMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-2.5 rounded-full font-bold shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
              >
                {updateMutation.isPending ? "Assigning..." : `Assign ${selectedFixtures.length} Fixtures`}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 backdrop-blur-md border border-white/10 p-6 sm:p-8 rounded-3xl shadow-xl mb-8 space-y-6"
        >
          <h2 className="text-2xl font-black text-text-primary tracking-tight mb-2">
            New Gameweek
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                Gameweek Number
              </label>
              <input
                type="number"
                required
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                Season (Year)
              </label>
              <select
                required
                value={formData.season}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              >
                <option value="" disabled className="bg-bg">Select a season</option>
                {seasons.map((s: any) => (
                  <option key={s._id || s.id} value={s.id} className="bg-bg">
                    {s.name || s.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                Start Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                End Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                Fixture IDs (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. 101, 102, 103"
                value={formData.fixtures}
                onChange={(e) =>
                  setFormData({ ...formData, fixtures: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              />
            </div>
            <div className="flex items-center space-x-3 md:col-span-2 mt-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <input
                type="checkbox"
                id="isCurrent"
                checked={formData.isCurrent}
                onChange={(e) =>
                  setFormData({ ...formData, isCurrent: e.target.checked })
                }
                className="w-5 h-5 rounded border-white/20 text-indigo-500 focus:ring-indigo-500 bg-black/20"
              />
              <label
                htmlFor="isCurrent"
                className="text-sm font-bold text-text-primary cursor-pointer select-none"
              >
                Set as Current Gameweek
              </label>
            </div>
          </div>
          <div className="pt-6 flex justify-end">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2.5 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
            >
              {createMutation.isPending ? "Saving..." : "Save Gameweek"}
            </button>
          </div>
        </form>
      )}

      {editingGwId && (
        <form
          onSubmit={handleEditSubmit}
          className="bg-white/5 backdrop-blur-md border border-indigo-500/30 p-6 sm:p-8 rounded-3xl shadow-xl shadow-indigo-500/10 mb-8 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -mr-32 -mt-32 pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Edit Gameweek {editFormData.number}
            </h2>
            <button
              type="button"
              onClick={() => setEditingGwId(null)}
              className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                Gameweek Number
              </label>
              <input
                type="number"
                required
                value={editFormData.number}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, number: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                Season (Year)
              </label>
              <select
                required
                value={editFormData.season}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, season: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              >
                <option value="" disabled className="bg-bg">Select a season</option>
                {seasons.map((s: any) => (
                  <option key={s._id || s.id} value={s.id} className="bg-bg">
                    {s.name || s.id}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                Start Date
              </label>
              <input
                type="datetime-local"
                required
                value={editFormData.startDate}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, startDate: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                End Date
              </label>
              <input
                type="datetime-local"
                required
                value={editFormData.endDate}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, endDate: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-[10px] font-bold tracking-widest text-text-secondary uppercase">
                Fixture IDs (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. 101, 102, 103"
                value={editFormData.fixtures}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fixtures: e.target.value })
                }
                className="w-full px-5 py-3 bg-black/10 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-text-primary font-medium shadow-inner"
              />
            </div>
            <div className="flex items-center space-x-3 md:col-span-2 mt-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <input
                type="checkbox"
                id="editIsCurrent"
                checked={editFormData.isCurrent}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, isCurrent: e.target.checked })
                }
                className="w-5 h-5 rounded border-white/20 text-indigo-500 focus:ring-indigo-500 bg-black/20"
              />
              <label
                htmlFor="editIsCurrent"
                className="text-sm font-bold text-text-primary cursor-pointer select-none"
              >
                Set as Current Gameweek
              </label>
            </div>
          </div>
          <div className="pt-6 flex justify-end space-x-4 relative z-10">
             <button
              type="button"
              onClick={() => setEditingGwId(null)}
              className="px-6 py-2.5 text-text-secondary hover:bg-white/5 border border-transparent hover:border-white/10 rounded-full font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-2.5 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {gameweeks.map((gw: any, index: number) => {
          const lastCompletedGw = gameweeks.filter((g: any) => g.isCompleted).sort((a: any, b: any) => b.number - a.number)[0];
          return (
          <div
            key={gw._id}
            className={`bg-white/5 backdrop-blur-md dark:bg-white/5 border rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all flex flex-col gap-4 relative overflow-hidden ${
              gw.isCurrent ? 'border-indigo-500/30 shadow-indigo-500/10' : 'border-white/10'
            }`}
          >
            {gw.isCurrent && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none" />
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col items-center sm:items-start min-w-[120px]">
                <span className="text-3xl font-black text-text-primary tracking-tight">
                  GW {gw.number}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-text-secondary mt-1 font-bold">
                  Season: {gw.season}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <span className="text-sm font-bold text-text-primary bg-bg/50 px-3 py-1 rounded-full border border-border">
                  {dayjs(gw.startDate).format("MMM D, YYYY HH:mm")}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary my-2">to</span>
                <span className="text-sm font-bold text-text-primary bg-bg/50 px-3 py-1 rounded-full border border-border">
                  {dayjs(gw.endDate).format("MMM D, YYYY HH:mm")}
                </span>
              </div>

              <div className="flex flex-col items-center sm:items-end min-w-[120px] space-y-3 z-10">
                <span
                  className={`text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold shadow-sm ${
                    gw.isCompleted
                      ? "bg-green-500/10 text-green-500 border border-green-500/20"
                      : gw.isCurrent
                      ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                      : "bg-bg text-text-secondary border border-border"
                  }`}
                >
                  {gw.isCompleted ? "Completed" : gw.isCurrent ? "Current GW" : "Past/Future"}
                </span>
                
                <div className="flex flex-wrap justify-center sm:justify-end gap-2 mt-2">
                  <button
                    onClick={() => openEditForm(gw)}
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleCurrent(gw._id, !gw.isCurrent)}
                    disabled={updateMutation.isPending}
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-colors disabled:opacity-50"
                  >
                    Toggle Current
                  </button>
                  <button
                    onClick={() => {
                      setAssigningGwId(gw._id);
                      setSelectedFixtures([]);
                    }}
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
                  >
                    Assign Fixtures
                  </button>
                  {!gw.isCompleted && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to complete this gameweek? This will apply auto-subs.')) {
                          completeMutation.mutate(gw._id);
                        }
                      }}
                      disabled={completeMutation.isPending}
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors disabled:opacity-50"
                    >
                      Complete GW
                    </button>
                  )}
                  {gw.isCompleted && lastCompletedGw?._id === gw._id && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to revert this gameweek? This will roll back auto-subs to their exact pre-completion state.')) {
                          revertMutation.mutate(gw._id);
                        }
                      }}
                      disabled={revertMutation.isPending}
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    >
                      Revert GW
                    </button>
                  )}
                </div>
              </div>
            </div>

            {gw.fixtures && gw.fixtures.length > 0 && (
              <div className="border-t border-border pt-4">
                <h4 className="text-[11px] font-semibold text-text-secondary uppercase mb-3">
                  Assigned Fixtures ({gw.fixtures.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gw.fixtures.map((fId: number) => {
                    const f = allFixtures.find((af: any) => af.fixture.id === fId);
                    if (!f) return null;
                    return (
                      <div key={fId} className="text-[11px] bg-bg border border-border px-2 py-1 rounded-md flex items-center space-x-1 whitespace-nowrap group">
                        <span className="font-medium text-text-primary">{f.teams.home.name}</span>
                        <span className="text-text-secondary px-1">v</span>
                        <span className="font-medium text-text-primary">{f.teams.away.name}</span>
                        <button
                          onClick={() => {
                             const newFixtures = gw.fixtures.filter((id: number) => id !== fId);
                             updateMutation.mutate({ id: gw._id, data: { fixtures: newFixtures } });
                          }}
                          disabled={updateMutation.isPending}
                          title="Remove fixture"
                          className="ml-2 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

        {gameweeks.length === 0 && (
          <div className="text-center py-12 bg-surface rounded-xl border border-border">
            <p className="text-text-secondary">No gameweeks found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
