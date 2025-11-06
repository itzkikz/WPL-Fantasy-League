import { createFileRoute } from '@tanstack/react-router'
import Settings from '../pages/Settings/Settings';

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col h-screen text-center">
      <Settings />
    </div>
  );
}
