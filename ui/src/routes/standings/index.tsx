// src/routes/books/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import StandingsPage from "../../pages/Standings/StandingsPage";

export const Route = createFileRoute("/standings/")({
  component: StandingsPage,
});


