// src/features/standings/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationApi } from './api'
import { SubscribeRequest } from './types'

export const useSubscribe = (onSuccess?: (data: {message: string;}) => void) => {
  return useMutation({
    mutationFn: ({subscription}: {subscription:SubscribeRequest}) => notificationApi.subscribe({subscription}),
    onSuccess,
  })
}
