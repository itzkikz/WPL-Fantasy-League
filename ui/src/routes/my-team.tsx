import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/my-team")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as "current" | "history") || "current",
    };
  },
});
