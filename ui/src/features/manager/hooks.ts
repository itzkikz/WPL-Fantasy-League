// src/features/standings/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SubstitutionRequest, SubstitutionResponse } from './types'
import { managerApi } from './api'
import { managerQueries } from './queries'
import { QUERY_KEYS } from '../../api/endpoints'
import { Roles } from '../../store/types'

export const useSubstitution = (onSuccess?: (data: SubstitutionResponse) => void) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ substitution, roles }: { substitution: SubstitutionRequest[], roles: Roles }) => managerApi.substitution(substitution, roles),
    onSuccess: () => {
      // Invalidate and refetch books list
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MANAGER] })
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MANAGER] })
    }
  })
}

export const useManagerDetails = () => {
  return useQuery(managerQueries.detail())
}
