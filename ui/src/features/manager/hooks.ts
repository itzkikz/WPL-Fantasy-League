// src/features/standings/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SubstitutionRequest, SubstitutionResponse } from './types'
import { managerApi } from './api'
import { managerQueries } from './queries'

export const useSubstitution = (onSuccess?: (data: SubstitutionResponse) => void) => {
  return useMutation({
    mutationFn: (substitution: SubstitutionRequest[]) => managerApi.substitution(substitution),
    onSuccess,
  })
}

export const useManagerDetails = () => {
  return useQuery(managerQueries.detail())
}
