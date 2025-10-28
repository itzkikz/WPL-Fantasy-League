// src/routes/books/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import ManagerPage from "../../pages/Manager/ManagerPage";

export const Route = createFileRoute("/manager/")({
  component: ManagerPage,
});


