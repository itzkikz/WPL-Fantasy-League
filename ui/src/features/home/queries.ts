import { queryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../api/endpoints";
import { homeApi } from "./api";
import { HomePageData, MyFixturesData } from "./types";

export const homeQueries = {
  all: () =>
    queryOptions<HomePageData>({
      queryKey: [QUERY_KEYS.MANAGER, "home"],
      queryFn: async () => {
        return homeApi.getHomePageData();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
  myFixtures: () =>
    queryOptions<MyFixturesData>({
      queryKey: [QUERY_KEYS.MANAGER, "my-fixtures"],
      queryFn: async () => {
        return homeApi.getMyFixtures();
      },
      staleTime: 1000 * 60, // 1 minute
    }),
};
