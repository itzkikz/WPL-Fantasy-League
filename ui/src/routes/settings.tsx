import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-semibold mb-2 animate-pulse">
        Customizations coming soon —
      </h1>
      <p className="animate-bounce">Make it truly yours!</p>
    </div>
  );
}
