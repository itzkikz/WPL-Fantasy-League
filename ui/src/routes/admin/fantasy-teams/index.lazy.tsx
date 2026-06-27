import React, { useState, useEffect } from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import api from '../../../api/client';

export const Route = createLazyFileRoute('/admin/fantasy-teams/')({
  component: AdminFantasyTeams
});

function AdminFantasyTeams() {
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/admin/fantasy-teams');
      setTeams(res.data.data);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Fantasy Teams
          </h1>
          <p className="text-text-secondary mt-1 font-medium">
            Manage existing teams and budgets
          </p>
        </div>
        <Link
          to="/admin/fantasy-teams/create"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Create New Team
        </Link>
      </div>
      
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/20 dark:bg-black/40">
              <tr>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Team Name</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Managers</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Budget</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Utilisation</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Balance</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary">Created By</th>
                <th className="py-4 px-6 text-[10px] font-bold uppercase tracking-widest text-text-secondary text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-secondary font-medium">
                    No fantasy teams created yet
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team._id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6 font-bold text-text-primary">{team.name}</td>
                    <td className="py-4 px-6 text-sm text-text-secondary font-medium">
                      {team.managers?.map((m: any) => m.username).join(', ') || 'None'}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary font-medium">{team.finance?.totalBudget ?? 1000}</td>
                    <td className="py-4 px-6 text-sm text-text-secondary font-medium">{team.finance?.utilisation ?? 0}</td>
                    <td className="py-4 px-6 text-sm font-bold text-green-500">
                      {(team.finance?.totalBudget ?? 1000) - (team.finance?.utilisation ?? 0)}
                    </td>
                    <td className="py-4 px-6 text-sm text-text-secondary font-medium">{team.createdBy?.username || "Unknown"}</td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to="/admin/fantasy-teams/edit/$teamId"
                        params={{ teamId: team._id }}
                        className="inline-block text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        Edit Team
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
