import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import dayjs from "dayjs";
import { Calendar, Settings, AlertCircle, Plus, Zap, Check, Lock, Unlock, Loader2, Edit3, X } from "lucide-react";
import Modal from "../../components/common/Modal";

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
  const [expandedGwFixtures, setExpandedGwFixtures] = useState<Record<string, boolean>>({});

  const toggleGwFixtures = (gwId: string) => {
    setExpandedGwFixtures(prev => ({
      ...prev,
      [gwId]: !prev[gwId]
    }));
  };

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

  const { data: leaguesData } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LEAGUES],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.LEAGUES);
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FIXTURES] });
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
      <div className="w-full p-8 text-center text-white/40">
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl max-w-lg mx-auto mt-8 text-xs font-semibold flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Failed to load gameweeks. Please refresh the page.
      </div>
    );
  }

  const gameweeks = data?.data || [];
  const seasons = seasonsData?.data || [];
  const allFixtures = fixturesData?.data || [];
  const leagues = leaguesData?.data || [];

  const allAssignedFixtureIds = new Set(
    gameweeks.flatMap((gw: any) => gw.fixtures || [])
  );

  const unassignedFixtures = allFixtures.filter(
    (f: any) => !allAssignedFixtureIds.has(f.fixtureId)
  );

  const handleAssignFixtures = () => {
    if (!assigningGwId || selectedFixtures.length === 0) return;
    const gw = gameweeks.find((g: any) => g._id === assigningGwId);
    if (!gw) return;

    const newFixtures = Array.from(new Set([...(gw.fixtures || []), ...selectedFixtures]));
    updateMutation.mutate({ id: assigningGwId, data: { fixtures: newFixtures } });
  };

  const handleAutoAssign = (gw: any) => {
    const gwStart = dayjs(gw.startDate).valueOf() / 1000;
    const gwEnd = dayjs(gw.endDate).valueOf() / 1000;

    const matchingFixtures = unassignedFixtures
      .filter((f: any) => f.startTimestamp >= gwStart && f.startTimestamp <= gwEnd)
      .map((f: any) => f.fixtureId);

    if (matchingFixtures.length === 0) {
      alert("No unassigned fixtures found in this date range.");
      return;
    }

    const newFixtures = Array.from(new Set([...(gw.fixtures || []), ...matchingFixtures]));
    updateMutation.mutate({ id: gw._id, data: { fixtures: newFixtures } });
  };

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Admin Gameweeks
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Manage gameweeks timeline, current active rounds and fixtures
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="self-start sm:self-auto px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 whitespace-nowrap flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> {isCreating ? "Cancel" : "Create Gameweek"}
        </button>
      </div>

      {/* Pick Team Deadline Enabler Dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#1b142d]/80 border border-white/10 p-4 rounded-xl shadow-lg gap-4">
        <div className="space-y-0.5">
          <h2 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-indigo-400" />
            Pick Team Deadline
          </h2>
          <p className="text-[10px] text-white/50 leading-normal">
            Configure the global deadline timing when player picker locks.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <input
            type="datetime-local"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            className="px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg outline-none text-xs font-semibold text-white/80"
          />
          <button
            onClick={() => togglePickTeamMutation.mutate({ enabled: !pickTeamData?.data?.enabled, deadlineDate })}
            disabled={togglePickTeamMutation.isPending}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 border ${
              pickTeamData?.data?.enabled 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            {togglePickTeamMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : pickTeamData?.data?.enabled ? (
              <>
                <Lock className="w-3.5 h-3.5" /> Lock Picking
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" /> Enable Picking
              </>
            )}
          </button>
        </div>
      </div>

      {/* Assign Fixtures Overlay Modal */}
      <Modal isOpen={!!assigningGwId} onClose={() => setAssigningGwId(null)} variant="responsive" maxWidthClass="max-w-lg">
        <div className="relative overflow-hidden text-white flex flex-col max-h-[80vh] w-full">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80" />
            
            <div className="p-4 border-b border-white/10 flex justify-between items-center relative z-10">
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-white">Assign Fixtures</h2>
                <p className="text-[10px] text-white/50 mt-0.5">Select fixtures to add to this gameweek</p>
              </div>
              <button onClick={() => setAssigningGwId(null)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all text-xs font-bold">
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 space-y-2.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {unassignedFixtures.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-white/30 text-xs">
                  <p className="font-semibold text-center italic">No unassigned fixtures available.</p>
                </div>
              ) : (
                unassignedFixtures.map((f: any) => (
                  <label key={f.fixtureId} className="flex items-center space-x-3.5 p-3 bg-[#150f24]/50 border border-white/5 rounded-xl cursor-pointer hover:bg-[#150f24]/80 transition-all group">
                    <input
                      type="checkbox"
                      checked={selectedFixtures.includes(f.fixtureId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFixtures([...selectedFixtures, f.fixtureId]);
                        } else {
                          setSelectedFixtures(selectedFixtures.filter((id) => id !== f.fixtureId));
                        }
                      }}
                      className="w-4 h-4 rounded border-white/20 text-indigo-600 focus:ring-0 bg-transparent transition-all"
                    />
                    <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                      <p className="font-bold text-xs text-white/95 truncate">
                        {f.homeTeamName} <span className="text-[9px] uppercase tracking-widest text-white/40 mx-1">vs</span> {f.awayTeamName}
                      </p>
                      <p className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-white/55 shrink-0">
                        {dayjs.unix(f.startTimestamp).format("MMM D, YYYY HH:mm")}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-white/5 flex justify-end gap-2 bg-black/25">
              <button
                onClick={() => setAssigningGwId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignFixtures}
                disabled={selectedFixtures.length === 0 || updateMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-1.5 rounded-lg text-xs font-black shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
              >
                {updateMutation.isPending ? "Assigning..." : `Assign ${selectedFixtures.length} Fixtures`}
              </button>
            </div>
          </div>
      </Modal>

      {/* Create Gameweek Form */}
      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#1b142d]/80 border border-white/10 p-5 rounded-xl shadow-xl space-y-4"
        >
          <h2 className="text-sm font-black uppercase tracking-wider text-white">
            Create Gameweek
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Gameweek Number
              </label>
              <input
                type="number"
                required
                value={formData.number}
                onChange={(e) =>
                  setFormData({ ...formData, number: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Season (Year)
              </label>
              <select
                required
                value={formData.season}
                onChange={(e) =>
                  setFormData({ ...formData, season: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="" disabled className="bg-[#1b142d] text-white/50">Select a season</option>
                {seasons.map((s: any) => (
                  <option key={s._id || s.id} value={s.id} className="bg-[#1b142d] text-white">
                    {s.name || s.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Fixture IDs (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. 101, 102, 103"
                value={formData.fixtures}
                onChange={(e) =>
                  setFormData({ ...formData, fixtures: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-3.5 md:col-span-2 bg-[#150f24] p-3 rounded-lg border border-white/5">
              <input
                type="checkbox"
                id="isCurrent"
                checked={formData.isCurrent}
                onChange={(e) =>
                  setFormData({ ...formData, isCurrent: e.target.checked })
                }
                className="w-4.5 h-4.5 rounded border-white/20 text-indigo-600 focus:ring-0 bg-transparent"
              />
              <label
                htmlFor="isCurrent"
                className="text-xs font-bold text-white/90 cursor-pointer select-none"
              >
                Set as Current Gameweek
              </label>
            </div>
          </div>
          
          <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-1.5 rounded-lg text-xs font-black shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {createMutation.isPending ? "Saving..." : "Save Gameweek"}
            </button>
          </div>
        </form>
      )}

      {/* Edit Gameweek Form */}
      {editingGwId && (
        <form
          onSubmit={handleEditSubmit}
          className="bg-[#1b142d]/80 border border-indigo-500/30 p-5 rounded-xl shadow-xl shadow-indigo-500/5 space-y-4"
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Edit Gameweek {editFormData.number}
            </h2>
            <button
              type="button"
              onClick={() => setEditingGwId(null)}
              className="text-white/60 hover:text-white text-xs font-bold"
            >
              Cancel
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Gameweek Number
              </label>
              <input
                type="number"
                required
                value={editFormData.number}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, number: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Season (Year)
              </label>
              <select
                required
                value={editFormData.season}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, season: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none cursor-pointer"
              >
                <option value="" disabled className="bg-[#1b142d] text-white/50">Select a season</option>
                {seasons.map((s: any) => (
                  <option key={s._id || s.id} value={s.id} className="bg-[#1b142d] text-white">
                    {s.name || s.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                required
                value={editFormData.startDate}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, startDate: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                required
                value={editFormData.endDate}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, endDate: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase mb-1">
                Fixture IDs (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. 101, 102, 103"
                value={editFormData.fixtures}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fixtures: e.target.value })
                }
                className="w-full px-3 py-1.5 bg-[#150f24] border border-white/10 rounded-lg text-white text-xs font-semibold outline-none"
              />
            </div>
            <div className="flex items-center space-x-3.5 md:col-span-2 bg-[#150f24] p-3 rounded-lg border border-white/5">
              <input
                type="checkbox"
                id="editIsCurrent"
                checked={editFormData.isCurrent}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, isCurrent: e.target.checked })
                }
                className="w-4.5 h-4.5 rounded border-white/20 text-indigo-600 focus:ring-0 bg-transparent"
              />
              <label
                htmlFor="editIsCurrent"
                className="text-xs font-bold text-white/90 cursor-pointer select-none"
              >
                Set as Current Gameweek
              </label>
            </div>
          </div>
          
          <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setEditingGwId(null)}
              className="px-3.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-1.5 rounded-lg text-xs font-black shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Gameweeks List */}
      <div className="space-y-3">
        {gameweeks.map((gw: any) => {
          const lastCompletedGw = gameweeks.filter((g: any) => g.isCompleted).sort((a: any, b: any) => b.number - a.number)[0];
          return (
            <div
              key={gw._id}
              className={`bg-[#1b142d]/80 border rounded-xl p-4 transition-all flex flex-col gap-3 shadow-md relative overflow-hidden ${
                gw.isCurrent ? 'border-indigo-500/40 shadow-indigo-500/5 bg-[#1f1636]' : 'border-white/5'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex sm:flex-col items-baseline sm:items-start gap-2 sm:gap-0.5">
                  <span className="text-base font-black text-white tracking-wide">
                    Gameweek {gw.number}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">
                    Season: {gw.season}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-white/70 bg-[#150f24]/50 border border-white/5 px-2.5 py-1 rounded-lg">
                  <span className="font-semibold">{dayjs(gw.startDate).format("MMM D, YYYY HH:mm")}</span>
                  <span className="text-white/30 font-bold">to</span>
                  <span className="font-semibold">{dayjs(gw.endDate).format("MMM D, YYYY HH:mm")}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                      gw.isCompleted
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : gw.isCurrent
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-white/5 text-white/40 border-white/10"
                    }`}
                  >
                    {gw.isCompleted ? "Completed" : gw.isCurrent ? "Current" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5 z-10">
                <button
                  onClick={() => openEditForm(gw)}
                  className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-all flex items-center gap-1 active:scale-95"
                >
                  <Edit3 className="w-2.5 h-2.5" /> Edit
                </button>
                <button
                  onClick={() => toggleCurrent(gw._id, !gw.isCurrent)}
                  disabled={updateMutation.isPending}
                  className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all active:scale-95"
                >
                  Toggle Current
                </button>
                <button
                  onClick={() => {
                    setAssigningGwId(gw._id);
                    setSelectedFixtures([]);
                  }}
                  className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 transition-all active:scale-95"
                >
                  Assign Fixtures
                </button>
                <button
                  onClick={() => handleAutoAssign(gw)}
                  disabled={updateMutation.isPending}
                  className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all active:scale-95"
                >
                  Auto Assign
                </button>
                {!gw.isCompleted && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to complete this gameweek? This will apply auto-subs.')) {
                        completeMutation.mutate(gw._id);
                      }
                    }}
                    disabled={completeMutation.isPending}
                    className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all active:scale-95"
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
                    className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95"
                  >
                    Revert GW
                  </button>
                )}
                {gw.fixtures && gw.fixtures.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggleGwFixtures(gw._id)}
                    className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-1 rounded bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 transition-all active:scale-95 flex items-center gap-1"
                  >
                    {expandedGwFixtures[gw._id] ? "Hide Fixtures" : `Show Fixtures (${gw.fixtures.length})`}
                  </button>
                )}
              </div>

              {/* Grouped Assigned Fixtures List */}
              {gw.fixtures && gw.fixtures.length > 0 && expandedGwFixtures[gw._id] && (
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <h4 className="text-[9px] font-extrabold text-white/40 uppercase tracking-wider">
                    Assigned Fixtures ({gw.fixtures.length})
                  </h4>
                  <div className="space-y-2.5">
                    {(() => {
                      const leagueMap = new Map(leagues.map((l: any) => [l.leagueId, l.name]));
                      const grouped: Record<number, { name: string; fixtures: any[] }> = {};

                      for (const fId of gw.fixtures) {
                        const f = allFixtures.find((af: any) => af.fixtureId === fId);
                        if (!f) continue;
                        const leagueId = f.uniqueTournament?.id ?? 0;
                        const leagueName = leagueMap.get(leagueId) || f.tournament?.name || `League #${leagueId}`;
                        if (!grouped[leagueId]) grouped[leagueId] = { name: leagueName, fixtures: [] };
                        grouped[leagueId].fixtures.push({ ...f, fId });
                      }

                      return Object.entries(grouped).sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([leagueId, group]) => (
                        <div key={leagueId} className="space-y-1">
                          <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400/80">{group.name}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.fixtures.map((f: any) => (
                              <div key={f.fId} className="text-[10px] bg-[#150f24]/50 border border-white/5 px-2 py-0.5 rounded-md flex items-center space-x-1.5 whitespace-nowrap text-white/80">
                                <span className="font-semibold">{f.homeTeamName}</span>
                                <span className="text-white/40 font-bold">vs</span>
                                <span className="font-semibold">{f.awayTeamName}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newFixtures = gw.fixtures.filter((id: number) => id !== f.fId);
                                    updateMutation.mutate({ id: gw._id, data: { fixtures: newFixtures } });
                                  }}
                                  disabled={updateMutation.isPending}
                                  title="Remove fixture"
                                  className="ml-1.5 text-white/40 hover:text-rose-400 transition-colors disabled:opacity-50"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {gameweeks.length === 0 && (
          <div className="text-center py-12 bg-[#150f24]/30 rounded-xl border border-white/5 p-6">
            <p className="text-white/40 text-xs">No gameweeks found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
