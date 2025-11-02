import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-2xl font-semibold mb-2 animate-bounce">
        Your fantasy buzz feed is almost ready!
      </h1>
      <p className="animate-pulse">Stay tuned ⚡</p>
    </div>
  );
}
