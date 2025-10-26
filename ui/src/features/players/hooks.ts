// src/features/standings/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { playersQueries } from './queries'

export const usePlayers = () => {
  return useQuery(playersQueries.all())
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
