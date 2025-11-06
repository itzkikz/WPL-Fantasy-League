import { createFileRoute } from "@tanstack/react-router";
import Notifications from "../pages/Notifications";

export const Route = createFileRoute("/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <Notifications />
    </div>
  );
}
