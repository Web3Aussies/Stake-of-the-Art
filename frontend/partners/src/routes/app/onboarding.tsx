import OnBoardingPage from '@/components/pages/OnBoardingPage'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app/onboarding')({
  component: OnBoardingPage,
  beforeLoad: ({ context: { user } }) => {
    if (user?.email && user?.name) {
      return redirect({ to: '/app' })
    }
  },
})
