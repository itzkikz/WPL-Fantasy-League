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

export const usePlayerDetails = (playerName: string) => {
  return useQuery(playersQueries.detail(playerName))
}

// export const useCreateBook = () => {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: booksApi.create,
//     onSuccess: () => {
//       // Invalidate and refetch books list
//       queryClient.invalidateQueries({ queryKey: ['books'] })
//     },
//   })
// }

// export const useUpdateBook = () => {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: Partial<Book> }) =>
//       booksApi.update(id, data),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ['books'] })
//       queryClient.invalidateQueries({ queryKey: ['books', variables.id] })
//     },
//   })
// }

// export const useDeleteBook = () => {
//   const queryClient = useQueryClient()
  
//   return useMutation({
//     mutationFn: booksApi.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['books'] })
//     },
//   })
// }
