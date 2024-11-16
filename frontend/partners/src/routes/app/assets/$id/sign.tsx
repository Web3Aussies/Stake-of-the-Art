import SignWallpaperPage from '@/components/pages/SignWallpaperPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/assets/$id/sign')({
  component: SignWallpaperPage,
})
