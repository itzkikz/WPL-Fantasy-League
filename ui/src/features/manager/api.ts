// src/features/standings/api.ts
import apiClient from '../../api/client'
import { API_ENDPOINTS } from '../../api/endpoints'
import { Roles } from '../../store/types'
import { TeamDetails } from '../standings/types'
import { ManagerDetailsResponse, SubstitutionRequest, SubstitutionResponse } from './types'

export const managerApi = {
  substitution: async (substitution: SubstitutionRequest[], roles: Roles): Promise<SubstitutionResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.MANAGER.SUBSTITUTION, { substitution, roles })
    return response.data.data
  },
  getDetails: async (): Promise<ManagerDetailsResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.MANAGER.BASE)
    return response.data.data
  },
}
