import { createFileRoute } from '@tanstack/react-router'
import PickTeamPage from '../../../pages/Manager/PickTeamPage'

export const Route = createFileRoute('/manager/pick-team/')({
  component: PickTeamPage,
})

