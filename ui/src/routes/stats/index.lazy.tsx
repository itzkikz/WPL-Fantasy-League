import { createLazyFileRoute } from '@tanstack/react-router'
import Stats from '../../pages/Stats'

export const Route = createLazyFileRoute('/stats/')({
  component: Stats,
})
