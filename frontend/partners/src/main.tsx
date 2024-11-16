import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import { createRouter } from '@tanstack/react-router';
import AuthProvider from './providers/AuthProvider';
import QueryProvider from './providers/QueryProvider';
import RouteProvider from './providers/RouteProvider';

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        isAuthenticated: false,
        user: undefined,
        token: undefined,
        loginWithRedirect: undefined!,
        refreshUser: undefined!,
    },
});

export type RouterType = typeof router;

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
            <AuthProvider router={router}>
            <QueryProvider>
                <RouteProvider router={router} />
            </QueryProvider>
        </AuthProvider>
  </StrictMode>,
)
