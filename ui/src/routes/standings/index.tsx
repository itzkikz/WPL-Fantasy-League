import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const standingsSearchSchema = z.object({
  sort: z.enum(["asc", "desc"]).optional(),
  filter: z.string().optional(),
});

export const Route = createFileRoute("/standings/")({
  validateSearch: (search) => standingsSearchSchema.parse(search),
});


