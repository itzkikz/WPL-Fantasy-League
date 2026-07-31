import { createFileRoute, redirect } from '@tanstack/react-router'
import LoginPage from '../pages/LoginPage'
import { useUserStore } from '../store/useUserStore';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: () => {
    // Check auth synchronously
    const { user, isGuest } = useUserStore.getState()
    const token = localStorage.getItem("token")

    if ((user?.teamName || token) && !isGuest) {
      throw redirect({ to: "/home" });
    }
  },
})
