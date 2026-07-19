// src/features/standings/hooks.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { playersQueries } from './queries'

import { PlayerFilters } from './types'

export const usePlayers = (filters: PlayerFilters = {}) => {
  return useInfiniteQuery(playersQueries.infinite(filters))
}

export const usePlayerFilters = () => {
  return useQuery(playersQueries.filters())
}
