// src/features/standings/api.ts
import apiClient from '../../api/client'
import { PlayerStats } from './types'

export const playersApi = {
  getAll: async (): Promise<PlayerStats[]> => {
    const response = await apiClient.get('/players')
    return response.data.data
  },

  getByPlayerName: async (playerName: string): Promise<PlayerStats> => {
    const response = await apiClient.get(`players/${playerName}`)
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
