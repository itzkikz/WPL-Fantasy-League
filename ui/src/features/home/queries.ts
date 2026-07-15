import { queryOptions } from "@tanstack/react-query";
import { QUERY_KEYS } from "../../api/endpoints";
import { getMockHomeData } from "./api";
import { HomePageData } from "./types";

export const homeQueries = {
  all: () =>
    queryOptions<HomePageData>({
      queryKey: [QUERY_KEYS.MANAGER, "home"],
      queryFn: async () => {
        // TODO: Replace with actual API call
        // const response = await axiosInstance.get('/home');
        // return response.data;
        return getMockHomeData();
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
    }),
};
