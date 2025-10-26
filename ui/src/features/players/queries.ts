// src/features/standings/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { playersApi } from './api'

export const playersQueries = {
  all: () => 
    queryOptions({
      queryKey: ['players'],
      queryFn: playersApi.getAll,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  detail: (playerName: string) =>
    queryOptions({
      queryKey: ['players', playerName],
      queryFn: () => playersApi.getByPlayerName(playerName),
      enabled: !!playerName,
    }),
}
