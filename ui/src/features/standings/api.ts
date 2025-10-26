// src/features/standings/api.ts
import apiClient from '../../api/client'
import { Standings, TeamDetails } from './types'

export const standingsApi = {
  getAll: async (): Promise<Standings[]> => {
    const response = await apiClient.get('/standings')
    return response.data.data
  },

  getByTeamName: async (teamName: string, gameWeek: number): Promise<TeamDetails> => {
    const response = await apiClient.get(`/standings/${teamName}/${gameWeek}`)
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
