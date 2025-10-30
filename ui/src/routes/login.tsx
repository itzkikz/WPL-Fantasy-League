import { createFileRoute, redirect } from '@tanstack/react-router'
import LoginPage from '../pages/LoginPage'
import { useUserStore } from '../store/useUserStore';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: () => {
    // Check auth synchronously
  const {user} = useUserStore.getState()

  console.log(user)
    
    if (user?.teamName) {
      throw redirect({ to: "/manager" });
    }
  },
})
