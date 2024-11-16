import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/app')({
  beforeLoad({ context, location }) {
    if (!context.token && context.loginWithRedirect) {
      throw context.loginWithRedirect({
        appState: {
          returnTo: location.pathname,
        },
      })
    }

    console.log(context)

    if (
      (!context.user?.name || !context.user?.email) &&
      location.pathname != '/app/onboarding' &&
      context.isAuthenticated
    ) {
      throw redirect({ to: '/app/onboarding' })
    }
  },
})
