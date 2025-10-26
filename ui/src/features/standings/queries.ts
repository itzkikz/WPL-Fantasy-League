// src/features/standings/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { standingsApi } from './api'

export const standingsQueries = {
  all: () => 
    queryOptions({
      queryKey: ['standings'],
      queryFn: standingsApi.getAll,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  detail: (teamName: string, gameWeek: number) =>
    queryOptions({
      queryKey: ['standings', teamName, gameWeek],
      queryFn: () => standingsApi.getByTeamName(teamName, gameWeek),
      enabled: !!teamName,
    }),
}
