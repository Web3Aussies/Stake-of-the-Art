import { createRootRouteWithContext } from '@tanstack/react-router';
import { AppState, RedirectLoginOptions } from '@auth0/auth0-react';
import PublicLayout from '../components/layouts/PublicLayout';
import { UserProfile } from '@/services/profile';

type AppContext = {
    isAuthenticated: boolean;
    user?: UserProfile;
    token?: string;
    loginWithRedirect: (options?: RedirectLoginOptions<AppState> | undefined) => Promise<void>;
    refreshUser: (profile: UserProfile) => void;
};

export const Route = createRootRouteWithContext<AppContext>()({
    component: PublicLayout,
});
