import { ReactNode} from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { RouterType } from '@/main';

export default function AuthProvider({children, router} : { children: ReactNode, router: RouterType}) {
    return (
        <Auth0Provider
            domain={import.meta.env.VITE_AUTH0_DOMAIN}
            clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
            authorizationParams={
                {
                    redirect_uri: window.location.origin,
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
                    
                }
            }
            
            onRedirectCallback={(AppState) => {
                if(AppState?.returnTo) {
                    router.navigate({to: AppState.returnTo});
                } else {
                    router.navigate({to: '/app'})
                }
            }}>
            {children}
        </Auth0Provider>    
    );
}