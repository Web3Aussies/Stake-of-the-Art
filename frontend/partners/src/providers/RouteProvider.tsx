import { RouterType } from '@/main';
import { useProfile, UserProfile } from '@/services/profile';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export default function RouteProvider({ router }: { router: RouterType }) {
    const { isLoading, isAuthenticated, loginWithRedirect, getAccessTokenSilently } = useAuth0();

    const [isReady, setReady] = useState(false);
    const [token, setToken] = useState<string>();
    const [user, setUser] = useState<UserProfile | undefined>();

    const { meOptions } = useProfile({ token });

    const { data } = useQuery(meOptions);

    const refreshUser = (user: UserProfile) => {
        setUser(user);
    };

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                getAccessTokenSilently().then((t) => setToken(t));
            } else {
                setReady(true);
            }
        }
    }, [isLoading]);

    useEffect(() => {
        if (token && !isReady) {
            setUser(data);
            setReady(true);
        }
    }, [data]);

    useEffect(() => {
        router.invalidate();
    }, [user]);

    return (
        <>
            {isReady && (
                <RouterProvider
                    router={router}
                    context={{ user, token, isAuthenticated, loginWithRedirect, refreshUser }}
                />
            )}
        </>
    );
}
