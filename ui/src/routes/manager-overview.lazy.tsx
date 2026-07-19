import { createLazyFileRoute } from "@tanstack/react-router";
import ManagerOverviewPage from "../pages/Manager/ManagerOverviewPage";

export const Route = createLazyFileRoute("/manager-overview")({
  component: ManagerOverviewPage,
});
