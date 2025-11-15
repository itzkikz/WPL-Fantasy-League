import { createFileRoute } from "@tanstack/react-router";
import Notifications from "../pages/Notifications";
import ProtectedRoute from "./ProtectedRoute";

export const Route = createFileRoute("/notifications")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <Notifications />
      </div>
    </ProtectedRoute>
  );
}
