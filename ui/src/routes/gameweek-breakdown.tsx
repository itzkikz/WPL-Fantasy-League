import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/gameweek-breakdown")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      gw: Number(search.gw) || 1,
      teamId: (search.teamId as string) || "",
    };
  },
});
