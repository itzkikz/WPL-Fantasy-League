// src/features/standings/api.ts
import apiClient from '../../api/client'
import { API_ENDPOINTS } from '../../api/endpoints'
import { SubscribeRequest } from './types'

export const notificationApi = {
  subscribe: async ({subscription}: {subscription: SubscribeRequest}): Promise<{message: string;}> => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATION.BASE, { subscription })
    return response.data.data
  }
}
