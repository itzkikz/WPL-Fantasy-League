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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden w-full max-w-md animate-slide-up z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] opacity-80" />

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
            {league.name}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors font-bold">✕</button>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm font-bold bg-[#D0004A]/10 text-[#D0004A] border border-[#D0004A]/20">{error}</div>
        )}

        <div className="space-y-3">
          <label className="block text-[11px] font-extrabold tracking-widest text-[var(--color-text-secondary)] uppercase">
            Select Round
          </label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            className="w-full px-5 py-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-[var(--color-text-primary)] font-semibold shadow-inner appearance-none cursor-pointer"
          >
            {Array.from({ length: totalRounds }, (_, i) => i + 1).map((round) => (
              <option key={round} value={round}>Round {round}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => updateMutation.mutate(selectedRound)}
          disabled={updateMutation.isPending}
          className="w-full bg-[var(--color-primary)] text-[var(--color-bg)] px-8 py-4 rounded-full font-black shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:transform-none"
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
    <div className="space-y-8 max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-[var(--color-text-primary)] tracking-tight">
            Admin Leagues
          </h1>
          <p className="text-[var(--color-text-secondary)] font-medium text-lg">
            View all leagues and configure their rounds
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] p-6 sm:p-8 rounded-3xl shadow-lg transition-interactive">
        {isLoading ? (
          <div className="p-8 text-center text-[var(--color-text-secondary)] font-medium">Loading...</div>
        ) : leagues.length === 0 ? (
          <div className="p-8 text-center bg-[var(--color-bg)] rounded-2xl border border-dashed border-[var(--color-border)]">
            <p className="text-[var(--color-text-secondary)] font-medium">No leagues found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-[11px] font-extrabold tracking-widest text-[var(--color-text-secondary)] uppercase">
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">Current Round</th>
                  <th className="py-4 px-4">Total Rounds</th>
                  <th className="py-4 px-4">Teams</th>
                  <th className="py-4 px-4">Rounds</th>
                </tr>
              </thead>
              <tbody>
                {leagues.map((league: any) => (
                  <tr key={league._id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-[var(--color-text-primary)]">{league.name}</td>
                    <td className="py-4 px-4 text-[var(--color-text-secondary)] font-semibold">{league.currentRound ?? '-'}</td>
                    <td className="py-4 px-4 text-[var(--color-text-secondary)] font-semibold">{league.totalRounds ?? '-'}</td>
                    <td className="py-4 px-4 text-[var(--color-text-secondary)] font-semibold">{league.teams?.length ?? 0}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => setSelectedLeague(league)}
                        className="bg-[var(--color-primary)] text-[var(--color-bg)] px-5 py-2 rounded-full font-black text-sm shadow-lg shadow-[var(--color-primary)]/30 hover:shadow-[var(--color-primary)]/50 transition-all hover:-translate-y-0.5 active:translate-y-0"
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
