import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/404')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div className='flex h-full w-full text-center justify-center items-center'>Updating</div>
}
