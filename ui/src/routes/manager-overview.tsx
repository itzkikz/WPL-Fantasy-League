import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/manager-overview")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      teamId: (search.teamId as string) || "",
    };
  },
});
