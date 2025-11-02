// src/features/standings/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { QUERY_KEYS } from '../../api/endpoints'
import { managerApi } from './api'

export const managerQueries = {
  detail: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.MANAGER],
      queryFn: () => managerApi.getDetails(),
    }),
}
