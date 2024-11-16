import AppHomePage from '@/components/pages/AppHomePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/')({
  component: AppHomePage,
})
