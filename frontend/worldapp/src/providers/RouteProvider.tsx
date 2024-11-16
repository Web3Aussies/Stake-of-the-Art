import { RouterType } from '@/main';
import { LoginResponse, useProfile, UserProfile } from '@/services/profile';

import { useMutation, useQuery } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { MiniKit, WalletAuthInput } from '@worldcoin/minikit-js';

export default function RouteProvider({ router }: { router: RouterType }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isReady, setReady] = useState(false);
    const [token, setToken] = useState<string>();
    const [user, setUser] = useState<UserProfile | undefined>();
    const { getNonce } = useProfile({ token });

    const { mutateAsync } = useMutation({
        mutationFn: async () => {
            const nonce = await getNonce();

            const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
                nonce: nonce,
                // expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                // notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                statement: 'Welcome to StakingArt. Come and Enjoy the world of Art.',
            });

            if (finalPayload.status === 'error') throw Error('Login Failed');

            const payload = {
                nonce: nonce.nonce,
                message: finalPayload.message,
                signature: finalPayload.signature,
                address: finalPayload.address,
            };

            const loginRes = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/app/accounts/world/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const res: LoginResponse = await loginRes.json();

            return res;
        },
        onSuccess(data, variables, context) {
            setToken(data.token);
        },
    });

    useEffect(() => {
        if (!MiniKit.isInstalled()) {
            return;
        }
        if (token) return;

        mutateAsync();
    }, []);

    useEffect(() => {
        router.invalidate();
    }, [user]);

    useEffect(() => {
        if (!token) return;

        console.log('token', token);
        setReady(true);
    }, [token]);

    return <>{isReady && <RouterProvider router={router} context={{ token, isAuthenticated }} />}</>;
}
