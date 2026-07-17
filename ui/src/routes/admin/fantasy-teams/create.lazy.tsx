import React from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import FantasyTeamForm from '../../../components/admin/FantasyTeamForm';
import { ArrowLeft, Users } from 'lucide-react';

export const Route = createLazyFileRoute('/admin/fantasy-teams/create')({
  component: CreateFantasyTeam
});

function CreateFantasyTeam() {
  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      {/* Dense Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-indigo-400" />
            Create Fantasy Team
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Set team settings, assign managers, and build the starting roster
          </p>
        </div>
        <Link
          to="/admin/fantasy-teams"
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Teams
        </Link>
      </div>
      
      <FantasyTeamForm />
    </div>
  );
}
