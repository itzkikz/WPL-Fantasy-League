// src/features/standings/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { playersApi } from './api'
import { QUERY_KEYS } from '../../api/endpoints'

export const playersQueries = {
  all: () => 
    queryOptions({
      queryKey: [QUERY_KEYS.PLAYERS],
      queryFn: playersApi.getAll,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  detail: (playerName: string) =>
    queryOptions({
      queryKey: [QUERY_KEYS.PLAYERS, playerName],
      queryFn: () => playersApi.getByPlayerName(playerName),
      enabled: !!playerName,
    }),
}
