import React, { useState, useEffect } from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import api from '../../../api/client';
import { Loader2 } from 'lucide-react';

export const Route = createLazyFileRoute('/admin/fantasy-teams/')({
  component: AdminFantasyTeams
});

function AdminFantasyTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/fantasy-teams');
      setTeams(res.data.data);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeams = teams.filter((team) => {
    const name = (team.name || "").toLowerCase();
    const managers = (team.managers?.map((m: any) => m.username).join(', ') || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || managers.includes(query);
  });

  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      {/* Dense Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            Fantasy Teams
            <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              {filteredTeams.length} Team{filteredTeams.length !== 1 ? "s" : ""}
            </span>
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Manage existing teams, budgets, managers and balances
          </p>
        </div>
        <Link
          to="/admin/fantasy-teams/create"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
        >
          Create New Team
        </Link>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center gap-2 bg-[#1b142d]/80 border border-white/10 rounded-xl p-2.5 shadow-sm">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by team name or manager..."
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
      
      {/* Dense Table wrapper */}
      {loading ? (
        <div className="bg-[#150f24]/50 border border-white/5 rounded-xl overflow-hidden shadow-lg py-14 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
      <div className="bg-[#150f24]/50 border border-white/5 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/40 border-b border-white/5">
              <tr>
                <th className="py-2.5 px-3 text-[9px] font-extrabold uppercase tracking-widest text-white/40">Team Name</th>
                <th className="py-2.5 px-3 text-[9px] font-extrabold uppercase tracking-widest text-white/40">Managers</th>
                <th className="py-2.5 px-3 text-[9px] font-extrabold uppercase tracking-widest text-white/40">Budget</th>
                <th className="py-2.5 px-3 text-[9px] font-extrabold uppercase tracking-widest text-white/40">Utilisation</th>
                <th className="py-2.5 px-3 text-[9px] font-extrabold uppercase tracking-widest text-emerald-400/70">Bonus</th>
                <th className="py-2.5 px-3 text-[9px] font-extrabold uppercase tracking-widest text-rose-400/70">Fine</th>
                <th className="py-2.5 px-3 text-[9px] font-extrabold uppercase tracking-widest text-white/40">Balance</th>
                <th className="py-2.5 px-3 text-[9px] font-extrabold uppercase tracking-widest text-white/40">Created By</th>
                <th className="py-2.5 px-3 text-[9px] font-extrabold uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/40 text-xs font-semibold">
                    No fantasy teams found
                  </td>
                </tr>
              ) : (
                filteredTeams.map((team) => {
                  const budget = team.finance?.totalBudget ?? 1000;
                  const utilization = team.finance?.utilisation ?? 0;
                  const bonus = team.finance?.bonus ?? 0;
                  const fine = team.finance?.fine ?? 0;
                  const balance = budget - utilization + bonus - fine;

                  return (
                    <tr key={team._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          {team.logo ? (
                            <img src={team.logo} alt={team.name} className="w-7 h-7 rounded-md object-cover border border-white/10 bg-black/30" />
                          ) : (
                            <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/30">
                              {team.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="font-bold text-xs text-white/95">{team.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-xs text-white/60 truncate max-w-[200px]" title={team.managers?.map((m: any) => m.username).join(', ')}>
                        {team.managers?.map((m: any) => m.username).join(', ') || 'None'}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-white/60 font-semibold">{budget}</td>
                      <td className="py-2.5 px-3 text-xs text-white/60 font-semibold">{utilization}</td>
                      <td className="py-2.5 px-3 text-xs text-emerald-400 font-semibold">+{bonus}</td>
                      <td className="py-2.5 px-3 text-xs text-rose-400 font-semibold">-{fine}</td>
                      <td className={`py-2.5 px-3 text-xs font-extrabold ${balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {balance}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-white/55">{team.createdBy?.username || "Unknown"}</td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          to="/admin/fantasy-teams/edit/$teamId"
                          params={{ teamId: team._id }}
                          className="inline-block text-[9px] font-extrabold uppercase tracking-wider px-2.5 py-1.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-all shadow-sm"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}
    </div>
  );
}
