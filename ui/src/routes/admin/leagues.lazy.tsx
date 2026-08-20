import { createLazyFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../components/common/Modal";

export const Route = createLazyFileRoute("/admin/leagues")({
  component: AdminLeagues,
});

interface RoundModalProps {
  league: any;
  onClose: () => void;
}

function RoundModal({ league: propLeague, onClose }: RoundModalProps) {
  const queryClient = useQueryClient();
  const [localLeague, setLocalLeague] = useState<any>(null);

  useEffect(() => {
    if (propLeague) {
      setLocalLeague(propLeague);
    }
  }, [propLeague]);

  const league = propLeague || localLeague;

  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [error, setError] = useState("");
  const [showUrl, setShowUrl] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [importError, setImportError] = useState("");
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(() => {
    if (propLeague) {
      setSelectedRound(propLeague.currentRound ?? 1);
      setError("");
      setShowUrl(false);
      setJsonText("");
      setImportError("");
      setImportResult(null);
    }
  }, [propLeague]);

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

  const importMutation = useMutation({
    mutationFn: (payload: any) =>
      apiClient.post(API_ENDPOINTS.ADMIN.IMPORT_LEAGUE_FIXTURES(league._id), payload),
    onSuccess: (res) => {
      setImportResult(res?.data?.data ?? null);
      setImportError("");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_FIXTURES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_LEAGUES] });
    },
    onError: (err: any) => {
      setImportResult(null);
      setImportError(err.response?.data?.error || "Failed to import fixtures. Check that the JSON is valid.");
    },
  });

  const handleImport = () => {
    setImportError("");
    setImportResult(null);
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e: any) {
      setImportError(`Invalid JSON: ${e.message}`);
      return;
    }
    importMutation.mutate(parsed);
  };

  if (!league) return null;

  const totalRounds = league.totalRounds ?? 38;

  const hasSofaConfig = !!league.leagueId && !!league.leagueSeasonId;
  const sofaUrl = hasSofaConfig
    ? `https://www.sofascore.com/api/v1/unique-tournament/${league.leagueId}/season/${league.leagueSeasonId}/events/round/${selectedRound}`
    : "";

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(sofaUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 1500);
    } catch {
      setUrlCopied(false);
    }
  };

  return (
    <Modal isOpen={!!propLeague} onClose={onClose} variant="center" maxWidthClass="max-w-lg">
      <div className="p-5 space-y-4 relative overflow-hidden text-white">
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

        <div className="border-t border-white/10 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-widest text-white/50 uppercase">
              Sofascore Fixtures
            </span>
            {hasSofaConfig && (
              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                Round {selectedRound}
              </span>
            )}
          </div>

          {!hasSofaConfig ? (
            <div className="p-3 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              This league has no external Sofascore leagueId/seasonId configured. Set them before importing fixtures.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setShowUrl(!showUrl)}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-[11px] font-extrabold uppercase tracking-wider py-2 rounded-lg transition-all active:scale-95"
                >
                  {showUrl ? "Hide URL" : "Get Sofascore URL"}
                </button>
                {showUrl && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        readOnly
                        value={sofaUrl}
                        onFocus={(e) => e.target.select()}
                        className="flex-1 min-w-0 px-2.5 py-1.5 bg-black/40 border border-white/10 rounded-lg text-[10px] font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={copyUrl}
                        className="shrink-0 text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all active:scale-95"
                      >
                        {urlCopied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="text-[10px] text-white/40 font-medium leading-snug">
                      Open this URL in a browser, then paste the returned JSON below and import it.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={6}
                  placeholder='Paste the JSON from the Sofascore URL (the { "events": [...] } payload)...'
                  className="w-full px-2.5 py-2 bg-[#150f24] border border-white/10 rounded-lg text-[10px] font-mono text-white/90 placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all resize-y"
                />
                <button
                  onClick={handleImport}
                  disabled={importMutation.isPending || !jsonText.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 rounded-lg text-[11px] font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:transform-none"
                >
                  {importMutation.isPending ? "Importing..." : "Import Fixtures JSON"}
                </button>
                {importError && (
                  <div className="p-2.5 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{importError}</div>
                )}
                {importResult && (
                  <div className="p-2.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Saved {importResult.saved} / {importResult.total} fixtures ({importResult.errors} errors)
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
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

      <RoundModal
        league={selectedLeague}
        onClose={() => setSelectedLeague(null)}
      />
    </div>
  );
}
