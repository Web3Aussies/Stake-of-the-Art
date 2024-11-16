import NewWallpaperPage from '@/components/pages/NewWallpaperPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/assets/new')({
  component: NewWallpaperPage,
})
