// src/features/standings/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { notificationApi } from './api'
import { QUERY_KEYS } from '../../api/endpoints'

export const notificationsQueries = {
    all: () =>
        queryOptions({
            queryKey: [QUERY_KEYS.NOTIFICATIONS],
            queryFn: notificationApi.getAll,
            staleTime: 5 * 60 * 1000, // 5 minutes
        }),
}
