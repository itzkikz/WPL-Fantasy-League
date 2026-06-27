import { createFileRoute } from '@tanstack/react-router'
import TeamDetailsPage from '../../pages/Standings/TeamDetailsPage'

export const Route = createFileRoute('/standings/$teamId')({
  component: TeamDetailsPage,
})
