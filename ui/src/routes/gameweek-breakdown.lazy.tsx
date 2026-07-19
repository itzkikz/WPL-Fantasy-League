import { createLazyFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "./ProtectedRoute";
import GameweekBreakdownPage from "../pages/Manager/GameweekBreakdownPage";

export const Route = createLazyFileRoute("/gameweek-breakdown")({
  component: () => (
    <ProtectedRoute>
      <GameweekBreakdownPage />
    </ProtectedRoute>
  ),
});
