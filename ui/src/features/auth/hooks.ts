// src/features/standings/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from './api'
import { LoginRequest, LoginResponse } from './types'
import { authQueries } from './queries'



export const useLogin = (onSuccess?: (data: LoginResponse) => void) => {

  return useMutation({
    mutationFn: ({ teamName, password }: LoginRequest) => authApi.login(teamName, password),
    onSuccess,
  })
}

export function useValidateToken() {
  return useQuery(authQueries.validateToken());
}
