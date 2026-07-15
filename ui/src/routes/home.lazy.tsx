import { createLazyFileRoute } from "@tanstack/react-router";
import HomePage from "../pages/Home/HomePage";

export const Route = createLazyFileRoute("/home")({
  component: HomePage,
});
