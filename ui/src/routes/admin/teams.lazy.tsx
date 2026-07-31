import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import apiClient from "../../api/client";
import { API_ENDPOINTS, QUERY_KEYS } from "../../api/endpoints";
import { Loader2, Shield } from "lucide-react";

export const Route = createLazyFileRoute("/admin/teams")({
  component: AdminTeams,
});

interface AdminTeam {
  id: number;
  name: string;
  shortName: string;
  nameCode: string;
  logo: string;
  country: { name?: string; alpha2?: string } | null;
  teamColors: { primary?: string; secondary?: string; text?: string } | null;
  disabled: boolean;
  national: boolean;
  playerCount: number;
  fixtureCount: number;
}

function AdminTeams() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.ADMIN_TEAMS],
    queryFn: async () => (await apiClient.get(API_ENDPOINTS.ADMIN.TEAMS)).data.data as AdminTeam[],
  });

  const teams = data || [];

  const filteredTeams = teams.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      t.nameCode.toLowerCase().includes(q) ||
      (t.country?.name || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            Teams
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {filteredTeams.length} Team{filteredTeams.length !== 1 ? "s" : ""}
            </span>
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Real-world clubs, logos and squad sizes
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-2 bg-[#1b142d]/80 border border-white/10 rounded-xl p-2.5 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by name, code or country..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">Colors</th>
                  <th className="py-2.5 px-3 text-center">Players</th>
                  <th className="py-2.5 px-3 text-center">Fixtures</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-white/40 text-xs font-semibold">
                      No teams found
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {team.logo ? (
                            <img src={team.logo} alt={team.name} className="w-7 h-7 rounded-md object-cover border border-white/10 bg-black/30" />
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30">
                              {team.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-white/95 truncate">{team.name}</div>
                            <div className="text-[9px] text-white/40">{team.shortName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                          {team.nameCode || "—"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-white/60 font-semibold">
                        {team.country?.name || team.country?.alpha2 || "—"}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1">
                          {team.teamColors?.primary && (
                            <span className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: team.teamColors.primary }} />
                          )}
                          {team.teamColors?.secondary && (
                            <span className="w-4 h-4 rounded border border-white/10" style={{ backgroundColor: team.teamColors.secondary }} />
                          )}
                          {!team.teamColors?.primary && !team.teamColors?.secondary && (
                            <span className="text-[9px] text-white/30">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-xs text-white/60 font-semibold">{team.playerCount}</td>
                      <td className="py-2.5 px-3 text-center text-xs text-white/60 font-semibold">{team.fixtureCount}</td>
                      <td className="py-2.5 px-3 text-right">
                        {team.disabled ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-1 rounded">
                            <Shield className="w-2.5 h-2.5" /> Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                            <Shield className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
