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

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [notificationsQueries.all().queryKey[0]] })
    },
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [notificationsQueries.all().queryKey[0]] })
    },
  })
}

export const useDeleteNotification = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [notificationsQueries.all().queryKey[0]] })
    },
  })
}
