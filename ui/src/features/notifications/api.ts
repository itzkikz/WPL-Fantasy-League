// src/features/standings/api.ts
import apiClient from '../../api/client'
import { API_ENDPOINTS } from '../../api/endpoints'
import { Notifications, SubscribeRequest } from './types'

export const notificationApi = {
   getAll: async (): Promise<Notifications[]> => {
    const response = await apiClient.get(API_ENDPOINTS.NOTIFICATION.BASE)
    return response.data.data
  },
  subscribe: async ({subscription}: {subscription: SubscribeRequest}): Promise<{message: string;}> => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATION.SUBSCRIBE, { subscription })
    return response.data.data
  }
}
