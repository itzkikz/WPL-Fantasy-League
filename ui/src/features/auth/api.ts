// src/features/standings/api.ts
import apiClient from '../../api/client'
import { API_ENDPOINTS } from '../../api/endpoints'
import { LoginResponse, ValidateResponse } from './types'

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { email, password })
    return response.data.data
  },
  validate: async (): Promise<ValidateResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.VALIDATE)
    return response.data.data
  }
}
