import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import Modal from "../../components/common/Modal";

type TeamInfo = {
  id: number;
  name: string;
};

type PlayerDiff = {
  playerId: number;
  name: string;
  position?: string;
};

type PreviewData = {
  teamId: number;
  teamName: string;
  added: PlayerDiff[];
  removed: PlayerDiff[];
  unchanged: number;
  totalExisting: number;
  totalIncoming: number;
};

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

function PlayerImportModal({ team, onClose }: { team: TeamInfo; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [resultText, setResultText] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_TEAMS] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_PLAYERS] });
  };

  const previewMutation = useMutation({
    mutationFn: (payload: any) =>
      apiClient.post(API_ENDPOINTS.ADMIN.IMPORT_TEAM_PLAYERS_PREVIEW(team.id), payload),
    onSuccess: (res) => {
      setPreview(res?.data?.data as PreviewData);
      setResultText(null);
      setError("");
    },
    onError: (err: any) => {
      setPreview(null);
      setResultText(null);
      setError(err.response?.data?.error || "Failed to parse JSON. Check that the payload is valid.");
    },
  });

  const applyMutation = useMutation({
    mutationFn: (payload: any) =>
      apiClient.post(API_ENDPOINTS.ADMIN.IMPORT_TEAM_PLAYERS_APPLY(team.id), payload),
    onSuccess: (res) => {
      const d = res?.data?.data as { added: number; removed: number; totalAfter: number };
      setResultText(`Imported: +${d.added} added, -${d.removed} removed, ${d.totalAfter} players now on the team.`);
      setError("");
      setPreview(null);
      setJsonText("");
      invalidate();
    },
    onError: (err: any) => {
      setResultText(null);
      setError(err.response?.data?.error || "Failed to apply changes.");
    },
  });

  const handleParse = () => {
    setError("");
    setResultText(null);
    setPreview(null);
    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
      return;
    }
    previewMutation.mutate(parsed);
  };

  const handleApply = () => {
    if (!preview) return;
    setError("");
    setResultText(null);
    applyMutation.mutate({ added: preview.added, removed: preview.removed });
  };

  const playersUrl = team ? `https://www.sofascore.com/api/v1/team/${team.id}/players` : "";

  return (
    <Modal isOpen={!!team} onClose={onClose} variant="center" maxWidthClass="max-w-2xl">
      <div className="p-5 space-y-4 relative overflow-y-auto text-white max-h-[88vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80" />

        <div className="flex justify-between items-center">
          <h2 className="text-base font-black tracking-tight truncate max-w-[240px]">
            {team?.name || ""}
          </h2>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-colors text-xs font-bold">✕</button>
        </div>
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-white/40 -mt-3">Import Players</p>

        <div className="space-y-2">
          <div className="space-y-1">
            <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">Sofascore Players URL</label>
            <CopyUrlRow url={playersUrl} />
          </div>
          <p className="text-[10px] text-white/40 font-medium leading-snug">
            Open this URL in a browser, then paste the returned JSON below and parse to preview changes.
          </p>
        </div>

        <div className="border-t border-white/10 pt-3 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-extrabold tracking-widest text-white/50 uppercase">Players JSON</label>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={6}
              disabled={previewMutation.isPending || applyMutation.isPending}
              placeholder='Paste the JSON from the Sofascore URL (the { "players": [...] } payload)...'
              className="w-full px-2.5 py-2 bg-[#150f24] border border-white/10 rounded-lg text-[10px] font-mono text-white/90 placeholder-white/30 focus:outline-none focus:border-indigo-500 transition-all resize-y"
            />
            <button
              onClick={handleParse}
              disabled={previewMutation.isPending || applyMutation.isPending || !jsonText.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg text-[11px] font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:transform-none"
            >
              {previewMutation.isPending ? "Parsing..." : "Parse JSON"}
            </button>
          </div>

          {error && (
            <div className="p-2.5 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{error}</div>
          )}

          {preview && (
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-white/50">
                  Changes Preview
                </h3>
                <span className="text-[9px] font-bold text-white/40">
                  {preview.totalExisting} existing → {preview.totalIncoming} incoming ({preview.unchanged} unchanged)
                </span>
              </div>

              {preview.added.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                    +{preview.added.length} Added
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-0.5">
                    {preview.added.map((p) => (
                      <div key={p.playerId} className="text-[10px] font-mono text-white/80 flex items-center justify-between">
                        <span>{p.name}</span>
                        <span className="text-white/30">#{p.playerId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {preview.removed.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400">
                    -{preview.removed.length} Removed
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-0.5">
                    {preview.removed.map((p) => (
                      <div key={p.playerId} className="text-[10px] font-mono text-white/80 flex items-center justify-between">
                        <span>{p.name}</span>
                        <span className="text-white/30">#{p.playerId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {preview.added.length === 0 && preview.removed.length === 0 && (
                <p className="text-[11px] text-white/40 font-semibold">Roster is up to date — no changes detected.</p>
              )}

              <button
                onClick={handleApply}
                disabled={applyMutation.isPending || (preview.added.length === 0 && preview.removed.length === 0)}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 rounded-lg text-[11px] font-black shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:transform-none"
              >
                {applyMutation.isPending ? "Applying..." : "Confirm Import"}
              </button>
            </div>
          )}

          {resultText && (
            <div className="p-2.5 rounded-lg text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{resultText}</div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default PlayerImportModal;