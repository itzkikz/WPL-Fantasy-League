import { createFileRoute } from "@tanstack/react-router";
import PickTeamPage from "../../../pages/Manager/PickTeamPage";
import ProtectedRoute from "../../ProtectedRoute";

export const Route = createFileRoute("/manager/pick-team/")({
  component: () => (
    <ProtectedRoute>
      <PickTeamPage />
    </ProtectedRoute>
  ),
});
