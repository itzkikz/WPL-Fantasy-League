import { createLazyFileRoute } from "@tanstack/react-router";
import ManagerPage from "../../pages/Manager/ManagerPage";
import ProtectedRoute from "../ProtectedRoute";

export const Route = createLazyFileRoute("/manager/")({
  component: () => (
    <ProtectedRoute>
      <ManagerPage />
    </ProtectedRoute>
  ),
});
