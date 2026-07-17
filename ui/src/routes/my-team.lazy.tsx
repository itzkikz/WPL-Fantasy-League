import { createLazyFileRoute } from "@tanstack/react-router";
import MyTeamPage from "../pages/Manager/MyTeamPage";
import ProtectedRoute from "./ProtectedRoute";

export const Route = createLazyFileRoute("/my-team")({
  component: () => (
    <ProtectedRoute>
      <MyTeamPage />
    </ProtectedRoute>
  ),
});
