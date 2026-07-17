import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../api/client";
import { API_ENDPOINTS } from "../../api/endpoints";
import { H2HLeague, H2HFixture } from "./types";

// Admin: Get single league (one per season)
export const useAdminH2HLeague = (season?: number) => {
  return useQuery({
    queryKey: ['admin', 'h2h-league', season],
    queryFn: async () => {
      const params = season ? { season } : {};
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.H2H_LEAGUES, { params });
      return response.data.data;
    },
    staleTime: 30 * 1000,
  });
};

// Admin: Upsert league
export const useAdminUpsertH2HLeague = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; fantasyTeamIds: string[]; gameweekStart: number; gameweekEnd: number; season?: number }) => {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.H2H_LEAGUES, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-league'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-fixtures'] });
    },
  });
};

// Admin: Delete league
export const useAdminDeleteH2HLeague = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(API_ENDPOINTS.ADMIN.H2H_LEAGUE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-league'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-fixtures'] });
    },
  });
};

// Admin: Generate fixtures
export const useAdminGenerateH2HFixtures = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(API_ENDPOINTS.ADMIN.H2H_GENERATE_FIXTURES(id));
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'h2h-fixtures'] });
    },
  });
};

// Admin: Get league fixtures
export const useAdminH2HLeagueFixtures = (leagueId: string) => {
  return useQuery({
    queryKey: ['admin', 'h2h-fixtures', leagueId],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.ADMIN.H2H_LEAGUE_FIXTURES(leagueId));
      return response.data.data;
    },
    staleTime: 30 * 1000,
    enabled: !!leagueId,
  });
};

// Public: Get my H2H leagues (single for current season)
export const useMyH2HLeagues = () => {
  return useQuery({
    queryKey: ['h2h', 'my-leagues'],
    queryFn: async () => {
      const response = await apiClient.get('/h2h/leagues');
      return response.data.data;
    },
    staleTime: 60 * 1000,
  });
};

export const useH2HStandings = (leagueId: string) => {
  return useQuery({
    queryKey: ['h2h', 'standings', leagueId],
    queryFn: async () => {
      const response = await apiClient.get(`/h2h/leagues/${leagueId}/standings`);
      return response.data.data;
    },
    staleTime: 60 * 1000,
    enabled: !!leagueId,
  });
};

export const useH2HLeagueFixtures = (leagueId: string, gameweek?: number) => {
  return useQuery({
    queryKey: ['h2h', 'fixtures', leagueId, gameweek],
    queryFn: async () => {
      const params = gameweek ? { gameweek } : {};
      const response = await apiClient.get(`/h2h/leagues/${leagueId}/fixtures`, { params });
      return response.data.data;
    },
    staleTime: 60 * 1000,
    enabled: !!leagueId,
  });
};