import { createLazyFileRoute } from "@tanstack/react-router";
import StandingsPage from "../../pages/Standings/StandingsPage";

export const Route = createLazyFileRoute("/standings/")({
    component: StandingsPage,
});
