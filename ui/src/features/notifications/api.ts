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
  },
  markAsRead: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.patch(API_ENDPOINTS.NOTIFICATION.READ(id))
    return response.data.data
  },
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.NOTIFICATION.READ_ALL)
    return response.data.data
  },
  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(API_ENDPOINTS.NOTIFICATION.DELETE(id))
    return response.data.data
  }
}
