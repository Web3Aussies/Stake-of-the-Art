import ExplorePage from '@/components/pages/ExplorePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/explore')({
  component: ExplorePage,
})
