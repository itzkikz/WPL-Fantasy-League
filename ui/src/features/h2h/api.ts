import apiClient from "../../api/client";
import { H2HLeague, H2HFixture, H2HStanding } from "./types";

export const h2hApi = {
  // Public (authenticated user) endpoints
  getMyLeagues: async (): Promise<H2HLeague[]> => {
    const response = await apiClient.get('/h2h/leagues');
    return response.data.data;
  },

  getStandings: async (leagueId: string): Promise<{ league: H2HLeague; standings: H2HStanding[] }> => {
    const response = await apiClient.get(`/h2h/leagues/${leagueId}/standings`);
    return response.data.data;
  },

  getLeagueFixtures: async (leagueId: string, gameweek?: number): Promise<{ fixtures: H2HFixture[]; byGameweek: Record<number, H2HFixture[]> }> => {
    const params = gameweek ? { gameweek } : {};
    const response = await apiClient.get(`/h2h/leagues/${leagueId}/fixtures`, { params });
    return response.data.data;
  },

  // Admin endpoints
  adminGetLeague: async (season?: number): Promise<H2HLeague | null> => {
    const params = season ? { season } : {};
    const response = await apiClient.get('/admin/h2h-leagues', { params });
    return response.data.data;
  },

  adminUpsertLeague: async (data: { name: string; fantasyTeamIds: string[]; gameweekStart: number; gameweekEnd: number; season?: number }): Promise<H2HLeague> => {
    const response = await apiClient.post('/admin/h2h-leagues', data);
    return response.data.data;
  },

  adminDeleteLeague: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/h2h-leagues/${id}`);
  },

  adminCreateFixture: async (id: string, data: { homeTeam: string; awayTeam: string; gameweek: number }): Promise<H2HFixture> => {
    const response = await apiClient.post(`/admin/h2h-leagues/${id}/fixtures`, data);
    return response.data.data;
  },

  adminBulkCreateFixtures: async (id: string, data: { gameweek: number; matchups: { homeTeam: string; awayTeam: string }[] }): Promise<{ created: number; fixtures: H2HFixture[]; errors: string[] }> => {
    const response = await apiClient.post(`/admin/h2h-leagues/${id}/fixtures/bulk`, data);
    return response.data.data;
  },

  adminDeleteFixture: async (id: string, fixtureId: string): Promise<void> => {
    await apiClient.delete(`/admin/h2h-leagues/${id}/fixtures/${fixtureId}`);
  },

  adminGetLeagueFixtures: async (id: string): Promise<{ fixtures: H2HFixture[]; byGameweek: Record<number, H2HFixture[]> }> => {
    const response = await apiClient.get(`/admin/h2h-leagues/${id}/fixtures`);
    return response.data.data;
  },
};