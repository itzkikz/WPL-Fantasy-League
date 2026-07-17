import React from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import FantasyTeamForm from '../../../components/admin/FantasyTeamForm';
import { ArrowLeft, Edit3 } from 'lucide-react';

export const Route = createLazyFileRoute('/admin/fantasy-teams/edit/$teamId')({
  component: EditFantasyTeam
});

function EditFantasyTeam() {
  const { teamId } = Route.useParams();
  
  return (
    <div className="w-full p-2 sm:p-4 space-y-4 animate-fade-in text-white">
      {/* Dense Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2 text-white">
            <Edit3 className="w-5 h-5 text-indigo-400" />
            Edit Fantasy Team
          </h1>
          <p className="text-[11px] text-white/50 font-medium">
            Update team configurations, managers, and modify squad picks
          </p>
        </div>
        <Link
          to="/admin/fantasy-teams"
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-lg border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Teams
        </Link>
      </div>
      
      <FantasyTeamForm teamId={teamId} />
    </div>
  );
}
