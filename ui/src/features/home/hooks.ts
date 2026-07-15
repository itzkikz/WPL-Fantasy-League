import { useQuery } from "@tanstack/react-query";
import { homeQueries } from "./queries";

export const useHomePage = () => {
  return useQuery(homeQueries.all());
};
