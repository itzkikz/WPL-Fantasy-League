import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

const statsSearchSchema = z.object({
    clubs: z.array(z.string()).optional().default([]),
    leagues: z.array(z.string()).optional().default([]),
    positions: z.array(z.string()).optional().default([]),
    freeAgents: z.boolean().optional().default(false),
})

export const Route = createFileRoute('/stats/')({
    validateSearch: (search) => statsSearchSchema.parse(search),
})
