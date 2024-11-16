import { createFileRoute } from '@tanstack/react-router'
import HomePage from '@/components/pages/IndexPage'

export const Route = createFileRoute('/')({
  component: HomePage,
})
