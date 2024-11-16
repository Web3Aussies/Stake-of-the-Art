import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import { RouterProvider, createRouter } from '@tanstack/react-router';

// Import the generated route tree
import { routeTree } from './routeTree.gen';
import QueryProvider from './providers/QueryProvider';
import MiniKitProvider from './minikit-provider';

// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <MiniKitProvider>
            <QueryProvider>
                <RouterProvider router={router} />
            </QueryProvider>
        </MiniKitProvider>
    </StrictMode>
);
