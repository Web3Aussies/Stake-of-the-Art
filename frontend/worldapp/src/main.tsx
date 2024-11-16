import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { RouterProvider, createRouter } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import QueryProvider from './providers/QueryProvider';
import MiniKitProvider from './providers/minikit-provider';
import { Eruda } from './components/Eruda/eruda-provider';
import { ErudaProvider } from './components/Eruda';
import RouteProvider from './providers/RouteProvider';

// Create a new router instance
const router = createRouter({
    routeTree,
    context: {
        isAuthenticated: false,
    },
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <ErudaProvider>
            <MiniKitProvider>
                <QueryProvider>
                    <RouteProvider router={router} />
                </QueryProvider>
            </MiniKitProvider>
        </ErudaProvider>
    </StrictMode>
);
