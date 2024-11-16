import { useMutation, UseQueryOptions } from '@tanstack/react-query';
import { MiniKit } from '@worldcoin/minikit-js';

const keys = {
    profile: 'PROFILE',
    nonce: 'NONCE',
};

type OnboardingUser = {
    name: string;
    email: string;
};

export type UserProfile = {
    id: string;
    name?: string;
    email?: string;
    acceptedOn?: Date;
    picture?: string;
};

export type Nonce = {
    nonce: string;
};

export type LoginResponse = {
    token: string;
};

export function useProfile({ token }: { token?: string }) {
    const meOptions: UseQueryOptions<UserProfile> = {
        queryKey: [keys.profile, token],
        queryFn: async () => {
            if (!token) return undefined;

            const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/admin/accounts`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            return data;
        },
    };

    const useOnboardUser = useMutation({
        mutationFn: async ({ name, email }: OnboardingUser): Promise<UserProfile> => {
            const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/admin/accounts`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            if (!res.ok) if (!res.ok) throw Error(`${res.status} - ${res.statusText}`);

            return await res.json();
        },
    });

    const getNonce = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/app/accounts/nonce`, {
            method: 'GET',
        });
        const data = await res.json();
        return data;
    };

    const useLogin = useMutation({
        mutationFn: async () => {
            const nonce = await getNonce();

            console.log(nonce);

            const { commandPayload: generateMessageResult, finalPayload } = await MiniKit.commandsAsync.walletAuth({
                nonce: nonce,
                // expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                // notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
                statement: 'Welcome to StakingArt. Come and Enjoy the world of Art.',
            });

            console.log(finalPayload);

            if (finalPayload.status === 'error') throw Error('Login Failed');

            const loginRes = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/app/accounts/world/login`, {
                method: 'POST',
                body: JSON.stringify({
                    nonce,
                    message: finalPayload.message,
                    signature: finalPayload.signature,
                    address: finalPayload.address,
                }),
            });

            const res: LoginResponse = await loginRes.json();

            return res;
        },
    });

    return {
        meOptions,
        useOnboardUser,
        getNonce,
    };
}
