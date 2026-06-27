// src/features/standings/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { playersApi } from './api'
import { QUERY_KEYS } from '../../api/endpoints'

import { PlayerFilters } from './types'

export const playersQueries = {
  // ... existing all ...
  all: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.PLAYERS, 'all'],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryFn: () => playersApi.getAll({ pageParam: 1 } as any),
      staleTime: 5 * 60 * 1000,
    }),
  filters: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.PLAYERS, 'filters'],
      queryFn: playersApi.getFilters,
      staleTime: 60 * 60 * 1000, // 1 hour
    }),
  infinite: (filters: PlayerFilters = {}) => ({
    queryKey: [QUERY_KEYS.PLAYERS, 'infinite', filters],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryFn: ({ pageParam }: any) => playersApi.getAll({ pageParam, filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      return lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000,
  }),

  detail: (playerName: string) =>
    queryOptions({
      queryKey: [QUERY_KEYS.PLAYERS, playerName],
      queryFn: () => playersApi.getByPlayerName(playerName),
      enabled: !!playerName,
    }),
}
