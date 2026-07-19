// src/features/standings/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { standingsApi } from './api'
import { QUERY_KEYS } from '../../api/endpoints'

export const standingsQueries = {
  all: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.STANDINGS],
      queryFn: standingsApi.getAll,
      retry: false,
      staleTime: Infinity, // <--- prevents re-fetching
      gcTime: 1000 * 60 * 10, // cache for 10 minutes
    }),

  detail: (teamId: string, gameWeek: number) =>
    queryOptions({
      queryKey: [QUERY_KEYS.STANDINGS, teamId, gameWeek],
      queryFn: () => standingsApi.getByTeamId(teamId, gameWeek),
      enabled: !!teamId && gameWeek > 0,
    }),

  overview: (teamId: string) =>
    queryOptions({
      queryKey: [QUERY_KEYS.STANDINGS, 'overview', teamId],
      queryFn: () => standingsApi.getOverview(teamId),
      enabled: !!teamId,
    }),

  fixtures: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.STANDINGS, 'fixtures'],
      queryFn: standingsApi.getFixtures,
      staleTime: 60 * 1000,
    }),
}
