import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createLazyFileRoute("/admin/players")({
  component: AdminPlayers,
});

interface AdminPlayer {
  id: number;
  name: string;
  webName: string;
  position: string;
  tmPosition: string;
  team: string;
  teamId: number;
  photo: string;
  shirtNumber: number | null;
  auctionPrice: number | null;
}

interface AdminTeam {
  id: number;
  name: string;
}

const PAGE_SIZE = 25;

const posColor = (pos: string) => {
  switch (pos) {
    case "GK": case "G": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    case "DEF": case "D": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    case "MID": case "M": return "text-sky-400 bg-sky-500/10 border-sky-500/20";
    case "FWD": case "F": case "A": return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    default: return "text-white/50 bg-white/5 border-white/10";
  }
};

function AdminPlayers() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [position, setPosition] = useState("");
  const [teamId, setTeamId] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, position, teamId]);

  const { data: teamsData } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEAMS],
    queryFn: async () => (await apiClient.get(API_ENDPOINTS.ADMIN.TEAMS)).data.data as AdminTeam[],
  });

  const { data: res, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_PLAYERS, debouncedSearch, position, teamId, page],
    queryFn: async () =>
      (
        await apiClient.get(API_ENDPOINTS.ADMIN.ADMIN_PLAYERS, {
          params: {
            includeTaken: true,
            search: debouncedSearch || undefined,
            position: position || undefined,
            teamId: teamId || undefined,
            page,
            limit: PAGE_SIZE,
          },
        })
      ).data as {
        data: AdminPlayer[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      },
  });

  const players = res?.data || [];
  const pagination = res?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total ?? 0;

  const selectClass =
    "px-2.5 py-1.5 rounded-lg bg-[#150f24] border border-white/10 text-white text-[10px] font-bold outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer";

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            Players
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {total} Player{total !== 1 ? "s" : ""}
            </span>
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Full roster with positions, auction prices and shirt numbers
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 bg-[#1b142d]/80 border border-white/10 rounded-xl p-2.5 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by player name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-white/40 focus:outline-none focus:border-indigo-500 transition-all font-medium"
          />
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select value={position} onChange={(e) => setPosition(e.target.value)} className={selectClass}>
          <option value="">All Positions</option>
          <option value="GK">GK</option>
          <option value="DEF">DEF</option>
          <option value="MID">MID</option>
          <option value="FWD">FWD</option>
        </select>
        <select value={teamId} onChange={(e) => setTeamId(e.target.value)} className={selectClass}>
          <option value="">All Teams</option>
          {teamsData?.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="bg-[#150f24]/50 border border-white/5 rounded-xl overflow-hidden shadow-lg py-14 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-[#150f24]/50 border border-white/5 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/40 border-b border-white/5">
                <tr className="text-[9px] font-extrabold uppercase tracking-widest text-white/40">
                  <th className="py-2.5 px-3">Player</th>
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Position</th>
                  <th className="py-2.5 px-3">TM Position</th>
                  <th className="py-2.5 px-3 text-center">Shirt</th>
                  <th className="py-2.5 px-3 text-right">Auction Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {players.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-white/40 text-xs font-semibold">
                      No players found
                    </td>
                  </tr>
                ) : (
                  players.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {p.photo ? (
                            <img src={p.photo} alt={p.name} className="w-7 h-7 rounded-md object-cover border border-white/10 bg-black/30" />
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30">
                              {p.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-white/95 truncate">{p.name}</div>
                            {p.webName && p.webName !== p.name && (
                              <div className="text-[9px] text-white/40 truncate">{p.webName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-white/60 font-semibold truncate max-w-[160px]">{p.team}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${posColor(p.position)}`}>
                          {p.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[10px] text-white/50 font-semibold">{p.tmPosition || "—"}</td>
                      <td className="py-2.5 px-3 text-center text-xs text-white/60 font-semibold">{p.shirtNumber ?? "—"}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`text-[10px] font-extrabold ${p.auctionPrice != null ? "text-emerald-400" : "text-white/30"}`}>
                          {p.auctionPrice != null ? `${p.auctionPrice} M` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex-none flex justify-between items-center px-3 py-3 border-t border-white/5">
              <span className="text-[10px] font-bold text-white/40">
                Page {pagination?.page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isLoading}
                  className="px-3 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40 flex items-center gap-1 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-3 h-3" /> Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="px-3 py-1 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold uppercase tracking-wider disabled:opacity-40 flex items-center gap-1 transition-all active:scale-95"
                >
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
