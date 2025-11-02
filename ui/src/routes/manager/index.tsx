// src/routes/books/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import ManagerPage from "../../pages/Manager/ManagerPage";
import ProtectedRoute from "../ProtectedRoute";

export const Route = createFileRoute("/manager/")({
  component: () => (
    <ProtectedRoute>
      <ManagerPage />
    </ProtectedRoute>
  ),
});
