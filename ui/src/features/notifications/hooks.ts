// src/features/standings/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from './api'
import { SubscribeRequest } from './types'
import { notificationsQueries } from './queries'

export const useNotifications = () => {
  return useQuery(notificationsQueries.all())
}


export const useSubscribe = (onSuccess?: (data: {message: string;}) => void) => {
  return useMutation({
    mutationFn: ({subscription}: {subscription:SubscribeRequest}) => notificationApi.subscribe({subscription}),
    onSuccess,
  })
}
