import { createLazyFileRoute } from "@tanstack/react-router";
import MyTeamPage from "../../pages/Manager/MyTeamPage";
import ProtectedRoute from "../ProtectedRoute";

export const Route = createLazyFileRoute("/manager/")({
  component: () => (
    <ProtectedRoute>
      <MyTeamPage />
    </ProtectedRoute>
  ),
});
