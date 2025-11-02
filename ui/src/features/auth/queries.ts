// src/features/standings/queries.ts
import { queryOptions } from '@tanstack/react-query'
import { authApi } from './api';
import { QUERY_KEYS } from '../../api/endpoints';

export const authQueries = {
  validateToken: () =>
    queryOptions({
      queryKey: [QUERY_KEYS.AUTH],
      queryFn: async () => authApi.validate(),
      retry: false,
      staleTime: Infinity, // <--- prevents re-fetching
      gcTime: 1000 * 60 * 10, // cache for 10 minutes
    }),
}
