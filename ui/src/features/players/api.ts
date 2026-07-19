// src/features/standings/api.ts
import apiClient from '../../api/client'
import { API_ENDPOINTS } from '../../api/endpoints'
import { PlayerStats, PaginatedResponse, PlayerFilters } from './types'

export const playersApi = {
  getAll: async ({ pageParam = 1, filters = {} }: { pageParam?: number, filters?: PlayerFilters }): Promise<PaginatedResponse<PlayerStats>> => {
    // Pass limit=20 or similar in query key or hardcode here
    const params: any = { page: pageParam, limit: 20 };
    if (filters.clubs?.length) params.clubs = filters.clubs.join(',');
    if (filters.leagues?.length) params.leagues = filters.leagues.join(',');
    if (filters.positions?.length) params.positions = filters.positions.join(',');
    if (filters.freeAgents) params.freeAgents = 'true';

    const response = await apiClient.get<any>(API_ENDPOINTS.PLAYERS.BASE, { params });
    // If backend returns { success: true, data: [], meta: ... }
    // but the response.data usually has extra wrapper?
    // Looking at previous step, res.json({ success: true, data: ..., meta: ... })
    // apiClient likely unwraps or not?
    // Assuming apiClient.get returns AxiosReponse
    // response.data is { success, data, meta }
    // If we want to return full object:
    return response.data;
  },

  getFilters: async (): Promise<{ clubs: string[], leagues: string[] }> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.PLAYERS.BASE + '/filters');
    return response.data.data;
  },

  // create: async (book: Omit<Book, 'id'>): Promise<Book> => {
  //   const response = await apiClient.post('/books', book)
  //   return response.data
  // },

  // update: async (id: string, book: Partial<Book>): Promise<Book> => {
  //   const response = await apiClient.patch(`/books/${id}`, book)
  //   return response.data
  // },

  // delete: async (id: string): Promise<void> => {
  //   await apiClient.delete(`/books/${id}`)
  // },
}
