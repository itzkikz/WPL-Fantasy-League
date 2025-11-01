// src/features/standings/api.ts
import apiClient from '../../api/client'
import { API_ENDPOINTS } from '../../api/endpoints'
import { TeamDetails } from '../standings/types'
import { SubstitutionRequest, SubstitutionResponse } from './types'

export const managerApi = {
  substitution: async (substitution: SubstitutionRequest[]): Promise<SubstitutionResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.MANAGER.SUBSTITUTION, { substitution })
    return response.data.data
  },
  getDetails: async (): Promise<TeamDetails> => {
    const response = await apiClient.get(API_ENDPOINTS.MANAGER.BASE)
    return response.data.data
  },
}
