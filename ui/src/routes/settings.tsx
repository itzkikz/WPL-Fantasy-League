import { createFileRoute } from "@tanstack/react-router";
import Settings from "../pages/Settings/Settings";
import ProtectedRoute from "./ProtectedRoute";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen text-center">
        <Settings />
      </div>
    </ProtectedRoute>
  );
}
