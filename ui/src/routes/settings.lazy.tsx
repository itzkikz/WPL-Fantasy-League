import { createLazyFileRoute } from "@tanstack/react-router";
import Settings from "../pages/Settings/Settings";
import ProtectedRoute from "./ProtectedRoute";

export const Route = createLazyFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-dvh text-center">
        <Settings />
      </div>
    </ProtectedRoute>
  );
}
