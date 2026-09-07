import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import { Loader2, History, ArrowRight, Plus, Minus, Users } from "lucide-react";
import dayjs from "dayjs";

export const Route = createLazyFileRoute("/admin/roster-changes")({
  component: AdminRosterChanges,
});

interface RosterPlayer {
  playerId: number;
  name: string;
  position?: string;
}

interface RosterChangeItem {
  _id: string;
  teamId: number;
  teamName: string;
  added: RosterPlayer[];
  removed: RosterPlayer[];
  totalBefore: number;
  totalAfter: number;
  createdBy?: { _id: string; username: string } | null;
  date: string;
}

interface AdminTeam {
  id: number;
  name: string;
}

function AdminRosterChanges() {
  const [teamFilter, setTeamFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const teamsQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEAMS],
    queryFn: async () => (await apiClient.get(API_ENDPOINTS.ADMIN.TEAMS)).data.data as AdminTeam[],
  });
  const teams = teamsQuery.data || [];

  const changesQuery = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_ROSTER_CHANGES, teamFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (teamFilter) params.set("teamId", teamFilter);
      const res = await apiClient.get(`${API_ENDPOINTS.ADMIN.ROSTER_CHANGES}?${params.toString()}`);
      return res.data as { data: RosterChangeItem[]; total: number; page: number; limit: number };
    },
  });

  const isLoading = changesQuery.isLoading;
  const changes = changesQuery.data?.data || [];
  const total = changesQuery.data?.total || 0;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  const handleTeamFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTeamFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            <History className="w-5 h-5 text-indigo-400" /> Roster Changes
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {total} Log{total !== 1 ? "s" : ""}
            </span>
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Squad import history — players added to or removed from team rosters
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 bg-[#1b142d]/80 border border-white/10 rounded-xl p-2.5 shadow-sm">
        <div className="flex-1 relative">
          <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
          <select
            value={teamFilter}
            onChange={handleTeamFilter}
            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 transition-all font-medium cursor-pointer"
          >
            <option value="" className="bg-[#1b142d] text-white">All Teams</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id} className="bg-[#1b142d] text-white">
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-xs text-white/50 font-semibold">Loading roster changes...</p>
        </div>
      ) : changes.length === 0 ? (
        <div className="p-12 flex flex-col items-center justify-center gap-3 bg-[#1b142d]/60 border border-white/5 rounded-xl">
          <History className="w-10 h-10 text-white/20" />
          <p className="text-xs text-white/40 font-semibold">
            {teamFilter ? "No roster changes logged for this team yet." : "No roster changes logged yet. Import players from a team page to get started."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {changes.map((change) => {
            const net = change.added.length - change.removed.length;
            return (
              <div
                key={change._id}
                className="bg-[#150f24]/50 hover:bg-[#1b142d]/80 border border-white/5 hover:border-white/10 rounded-xl px-3.5 py-3 transition-all duration-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-black tracking-tight text-white/90 truncate">{change.teamName}</span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/30">Team #{change.teamId}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-wide ${
                        net > 0
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : net < 0
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-white/5 text-white/40 border-white/10"
                      }`}
                    >
                      {net > 0 ? `+${net}` : net} net
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-white/50 tabular-nums">
                      {change.totalBefore} <ArrowRight className="w-3 h-3 text-white/30" /> {change.totalAfter}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/30 bg-black/30 border border-white/5 px-2 py-0.5 rounded">
                      {change.added.length} in · {change.removed.length} out
                    </span>
                  </div>
                </div>

                {(change.added.length > 0 || change.removed.length > 0) && (
                  <div className="mt-2.5 flex flex-col gap-1.5">
                    {change.added.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="flex items-center gap-0.5 text-[8px] font-extrabold uppercase tracking-wider text-emerald-400 w-10 shrink-0">
                          <Plus className="w-2.5 h-2.5" /> Added
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {change.added.map((p) => (
                            <span
                              key={p.playerId}
                              className="text-[10px] font-medium text-white/80 bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-0.5"
                            >
                              {p.name}
                              {p.position ? <span className="text-white/30 ml-1">· {p.position}</span> : null}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {change.removed.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="flex items-center gap-0.5 text-[8px] font-extrabold uppercase tracking-wider text-rose-400 w-10 shrink-0">
                          <Minus className="w-2.5 h-2.5" /> Out
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {change.removed.map((p) => (
                            <span
                              key={p.playerId}
                              className="text-[10px] font-medium text-white/70 bg-rose-500/10 border border-rose-500/20 rounded-md px-2 py-0.5 line-through decoration-rose-400/50"
                            >
                              {p.name}
                              {p.position ? <span className="text-white/30 ml-1">· {p.position}</span> : null}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] text-white/40 font-medium">
                  <span>{dayjs(change.date).format("DD MMM YYYY, h:mm A")}</span>
                  {change.createdBy?.username && <span>by {change.createdBy.username}</span>}
                </div>
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-[#1b142d]/80 border border-white/10 rounded-xl px-3 py-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white border border-white/10 transition-all disabled:opacity-40 disabled:hover:text-white/70"
              >
                ← Prev
              </button>
              <span className="text-[10px] font-bold text-white/50 tabular-nums">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 text-white/70 hover:text-white border border-white/10 transition-all disabled:opacity-40 disabled:hover:text-white/70"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}