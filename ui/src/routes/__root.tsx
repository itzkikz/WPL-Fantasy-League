import { createRootRoute } from "@tanstack/react-router";
import { MainLayout } from "../components/layouts/MainLayout";

export const Route = createRootRoute({
  component: MainLayout,
  notFoundComponent: () => <div className="p-4 text-center">Page Not Found</div>,
  errorComponent: () => <div className="p-4 text-center text-red-500">An error occurred</div>,
});
