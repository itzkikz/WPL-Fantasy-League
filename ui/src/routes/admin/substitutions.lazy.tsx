import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import apiClient from "../../api/client";
import { adminApi } from "../../features/admin/api";
import { SubstitutionHistoryRecord, SubstitutionType } from "../../features/admin/types";
import {
  Calendar,
  Loader2,
  Filter,
  Shield,
  User,
} from "lucide-react";

const posColor = (pos: string) => {
  switch (pos) {
    case "GK": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "DEF": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "MID": return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    case "FWD": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    default: return "text-white/50 bg-white/5 border-white/10";
  }
};

const typeColor = (type: SubstitutionType) => {
  switch (type) {
    case 'captain': return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case 'vice-captain': return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    case 'swap': 
    default: return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
  }
};

const typeLabel = (type: SubstitutionType) => {
  switch (type) {
    case 'captain': return 'Captain';
    case 'vice-captain': return 'Vice-Captain';
    case 'swap': 
    default: return 'Swap';
  }
};

const typeIcon = (type: SubstitutionType) => {
  switch (type) {
    case 'captain': return <Shield className="w-3 h-3" />;
    case 'vice-captain': return <User className="w-3 h-3" />;
    case 'swap': 
    default: return null;
  }
};

export const Route = createLazyFileRoute("/admin/substitutions")({
  component: AdminSubstitutions,
});

function AdminSubstitutions() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [selectedTeamId, setSelectedTeamId] = useState("");
  const { data: teamsData, isLoading: teamsLoading } = useQuery({
    queryKey: ["admin", "fantasy-teams"],
    queryFn: async () => (await apiClient.get("/admin/fantasy-teams")).data.data,
  });

  const { data: gameweeksData, isLoading: gameweeksLoading } = useQuery({
    queryKey: ["admin", "gameweeks"],
    queryFn: async () => (await apiClient.get("/admin/gameweeks")).data.data,
  });

  // Filters
  const [filterTeam, setFilterTeam] = useState("");
  const [filterGw, setFilterGw] = useState<number | "">("");
  const [filterType, setFilterType] = useState<SubstitutionType | "">("");

  const { data: substitutions, isLoading: substitutionsLoading, isFetching: substitutionsFetching } = useQuery({
    queryKey: ["admin", "substitutions", filterTeam, filterGw, filterType],
    queryFn: async () =>
      adminApi.getSubstitutionHistory({ teamId: filterTeam || undefined, gameweek: filterGw || undefined, type: filterType || undefined }),
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "substitutions"] });
  };

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-indigo-400" />
            Substitution History
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            All substitutions & role changes made by managers across gameweeks
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={substitutionsFetching}
          className="px-3 py-1.5 rounded-lg bg-[#150f24] border border-white/10 text-white text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 hover:bg-white/5 disabled:opacity-50 self-start sm:self-auto"
        >
          <Loader2 className={`w-3.5 h-3.5 ${substitutionsFetching ? "animate-spin text-indigo-400" : "text-white/50"}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs font-bold text-rose-400">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-white/10 bg-[#1b142d]/80 p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400" /> Filters
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#150f24] border border-white/10 text-white text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 min-w-[180px]"
            >
              <option value="">All Teams</option>
              {teamsData?.map((t: any) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            <select
              value={filterGw}
              onChange={(e) => setFilterGw(e.target.value === "" ? "" : Number(e.target.value))}
              className="px-2.5 py-1.5 rounded-lg bg-[#150f24] border border-white/10 text-white text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 min-w-[120px]"
            >
              <option value="">All GWs</option>
              {gameweeksData?.map((g: any) => (
                <option key={g._id} value={g.number}>GW {g.number}{g.isCurrent ? " (Current)" : ""}</option>
              ))}
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as SubstitutionType | "")}
              className="px-2.5 py-1.5 rounded-lg bg-[#150f24] border border-white/10 text-white text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 min-w-[140px]"
            >
              <option value="">All Types</option>
              <option value="swap">Swap</option>
              <option value="captain">Captain</option>
              <option value="vice-captain">Vice-Captain</option>
            </select>
          </div>
        </div>
      </div>

      {/* Substitution History Table */}
      <div className="rounded-xl border border-white/10 bg-[#1b142d]/80 p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-black text-white tracking-wide flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" /> History
            {substitutions?.length ? (
              <span className="text-[10px] font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded-md">{substitutions.length}</span>
            ) : null}
          </h2>
        </div>

        {substitutionsLoading || substitutionsFetching ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
          </div>
        ) : !substitutions || substitutions.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-xs font-semibold">No substitutions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-border/50 text-text-muted uppercase tracking-wider font-extrabold text-[10px]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3 text-center">GW</th>
                  <th className="py-2.5 px-3 text-center">Type</th>
                  <th className="py-2.5 px-3">Player Out</th>
                  <th className="py-2.5 px-3">Player In</th>
                  <th className="py-2.5 px-3">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 font-semibold text-white">
                {substitutions.map((s: SubstitutionHistoryRecord) => (
                  <tr key={s._id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 px-3 text-white/70 font-mono">
                      {dayjs(s.date).format("DD MMM YYYY, HH:mm")}
                    </td>
                    <td className="py-3 px-3 font-bold text-white/90 truncate max-w-[150px]">
                      {s.teamName}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/60 text-[10px] font-black">
                        GW {s.gameweek}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border flex items-center justify-center gap-1 ${typeColor(s.type)}`}>
                        {typeIcon(s.type)}
                        {typeLabel(s.type)}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 ${posColor(s.swapOut.position)}`}>
                          {s.swapOut.position}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white/90 truncate">{s.swapOut.name}</p>
                          <p className="text-[9px] text-white/40">Team ID: {s.swapOut.teamId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 ${posColor(s.swapIn.position)}`}>
                          {s.swapIn.position}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-emerald-400 truncate">{s.swapIn.name}</p>
                          <p className="text-[9px] text-white/40">Team ID: {s.swapIn.teamId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-white/60 text-[10px]">
                      {s.createdBy || "Unknown"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}