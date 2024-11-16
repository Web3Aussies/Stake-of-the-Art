import { createRootRouteWithContext } from '@tanstack/react-router';
import { AppState, RedirectLoginOptions } from '@auth0/auth0-react';
import PublicLayout from '../components/layouts/PulibcLayout';

type AppContext = {
    isAuthenticated: boolean;
    token?: string;
    loginWithRedirect: (options?: RedirectLoginOptions<AppState> | undefined) => Promise<void>;
};

export const Route = createRootRouteWithContext<AppContext>()({
    component: PublicLayout,
});
