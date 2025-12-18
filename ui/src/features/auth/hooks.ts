// src/features/standings/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from './api'
import { LoginRequest, LoginResponse } from './types'
import { authQueries } from './queries'

export const useLogin = (onSuccess?: (data: LoginResponse) => void) => {
  return useMutation({
    mutationFn: ({ email, password }: LoginRequest) => authApi.login(email, password),
    onSuccess,
  })
}

export function useValidateToken() {
  return useQuery(authQueries.validateToken());
}
