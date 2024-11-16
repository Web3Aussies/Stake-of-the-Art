import PublicLayout from '@/components/layouts/PublicLayout';
import { createRootRoute, createRootRouteWithContext } from '@tanstack/react-router';

type AppContext = {
    isAuthenticated: boolean;
    token?:string
    
};

export const Route = createRootRouteWithContext<AppContext>()({
    component: PublicLayout,
});
