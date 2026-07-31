import { useQuery } from "@tanstack/react-query";
import { homeQueries } from "./queries";

export const useHomePage = (options?: { enabled?: boolean }) => {
  return useQuery({
    ...homeQueries.all(),
    enabled: options?.enabled ?? true,
  });
};

export const useMyFixtures = (options?: { enabled?: boolean }) => {
  return useQuery({
    ...homeQueries.myFixtures(),
    enabled: options?.enabled ?? true,
  });
};
