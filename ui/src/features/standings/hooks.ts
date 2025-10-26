// src/features/standings/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { standingsApi } from './api'
import { standingsQueries } from './queries'

export const useStandings = () => {
  return useQuery(standingsQueries.all())
}

export const useTeamDetails = (teamName: string, gameWeek: number) => {
  return useQuery(standingsQueries.detail(teamName, gameWeek))
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
