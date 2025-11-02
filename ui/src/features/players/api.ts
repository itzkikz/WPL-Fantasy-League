// src/features/standings/api.ts
import apiClient from '../../api/client'
import { API_ENDPOINTS } from '../../api/endpoints'
import { PlayerStats } from './types'

export const playersApi = {
  getAll: async (): Promise<PlayerStats[]> => {
    const response = await apiClient.get(API_ENDPOINTS.PLAYERS.BASE)
    return response.data.data
  },

  getByPlayerName: async (playerName: string): Promise<PlayerStats> => {
    const response = await apiClient.get(API_ENDPOINTS.PLAYERS.BY_PLAYERNAME(playerName))
    return response.data.data
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
