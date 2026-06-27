import React from 'react';
import { createLazyFileRoute } from '@tanstack/react-router';
import FantasyTeamForm from '../../../components/admin/FantasyTeamForm';

export const Route = createLazyFileRoute('/admin/fantasy-teams/edit/$teamId')({
  component: EditFantasyTeam
});

function EditFantasyTeam() {
  const { teamId } = Route.useParams();
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Edit Fantasy Team</h1>
      <FantasyTeamForm teamId={teamId} />
    </div>
  );
}
