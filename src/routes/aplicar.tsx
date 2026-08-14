import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";

const searchSchema = z.object({
  edicao: z.string().optional(),
});

// The application form now lives at "/" — redirect any visits to /aplicar there,
// preserving search params (e.g. ?edicao=slug) and hash so existing links keep working.
export const Route = createFileRoute("/aplicar")({
  validateSearch: searchSchema,
  beforeLoad: ({ search, location }) => {
    throw redirect({
      to: "/",
      search: search as { edicao?: string },
      hash: location.hash,
    });
  },
});
