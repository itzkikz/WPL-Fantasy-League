// src/features/standings/api.ts
import apiClient from '../../api/client'
import { API_ENDPOINTS } from '../../api/endpoints'

export const authApi = {
  login: async (teamName: string, password: string,): Promise<{ token: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { teamName, password })
    return response.data.data
  },
  validate: async (): Promise<{
    valid: boolean, user: {
      userId: string,
      info: string,
      iat: number
    }
  }> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.VALIDATE)
    return response.data.data
  }

  // getByPlayerName: async (playerName: string): Promise<PlayerStats> => {
  //   const response = await apiClient.get(`players/${playerName}`)
  //   return response.data.data
  // },

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
