import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";

export const Route = createLazyFileRoute("/admin/leagues")({
  component: AdminLeagues,
});

interface RoundModalProps {
  league: any;
  onClose: () => void;
}

function RoundModal({ league, onClose }: RoundModalProps) {
  const queryClient = useQueryClient();
  const totalRounds = league.totalRounds ?? 38;
  const [selectedRound, setSelectedRound] = useState<number>(league.currentRound ?? 1);
  const [error, setError] = useState("");

  const updateMutation = useMutation({
    mutationFn: (currentRound: number) =>
      apiClient.put(API_ENDPOINTS.ADMIN.UPDATE_LEAGUE(league._id), { currentRound }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_LEAGUES] });
      onClose();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to update round");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-[#1b142d] border border-white/10 p-5 rounded-2xl shadow-2xl space-y-4 relative overflow-hidden w-full max-w-sm animate-slide-up z-10 text-white">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80" />

        <div className="flex justify-between items-center">
          <h2 className="text-base font-black tracking-tight truncate max-w-[200px]">
            {league.name}
          </h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors text-xs font-bold">✕</button>
        </div>

        {error && (
          <div className="p-3 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{error}</div>
        )}

        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
            Select Current Round
          </label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#150f24] border border-white/10 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-white text-xs font-semibold cursor-pointer"
          >
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
              <option key={round} value={round} className="bg-[#1b142d] text-white">Round {round}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => updateMutation.mutate(selectedRound)}
          disabled={updateMutation.isPending}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg text-xs font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:transform-none"
        >
          {updateMutation.isPending ? "Saving..." : `Set Round ${selectedRound}`}
        </button>
      </div>
    </div>
  );
}

function AdminLeagues() {
  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_LEAGUES],
    queryFn: () => apiClient.get(API_ENDPOINTS.ADMIN.LEAGUES),
  });

  const [selectedLeague, setSelectedLeague] = useState<any>(null);

  const leagues = data?.data?.data || [];

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      {/* Dense Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            Admin Leagues
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {leagues.length} Active
            </span>
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            View all leagues and configure their rounds
          </p>
        </div>
      </div>

      {/* Dense Table wrapper */}
      <div className="bg-[#150f24]/50 border border-white/5 rounded-xl overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-white/40 text-xs font-semibold">Loading...</div>
        ) : leagues.length === 0 ? (
          <div className="p-8 text-center bg-[#150f24]/30 rounded-xl border border-white/5">
            <p className="text-white/40 text-xs">No leagues found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/40 border-b border-white/5">
                <tr className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Current Round</th>
                  <th className="py-2.5 px-3">Total Rounds</th>
                  <th className="py-2.5 px-3">Teams</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leagues.map((league: any) => (
                  <tr key={league._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-xs text-white/95">{league.name}</td>
                    <td className="py-2.5 px-3 text-xs text-white/60 font-semibold">{league.currentRound ?? '-'}</td>
                    <td className="py-2.5 px-3 text-xs text-white/60 font-semibold">{league.totalRounds ?? '-'}</td>
                    <td className="py-2.5 px-3 text-xs text-white/60 font-semibold">{league.teams?.length ?? 0}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedLeague(league)}
                        className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all shadow-sm active:scale-95"
                      >
                        Set Round
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedLeague && (
        <RoundModal
          league={selectedLeague}
          onClose={() => setSelectedLeague(null)}
        />
      )}
    </div>
  );
}
