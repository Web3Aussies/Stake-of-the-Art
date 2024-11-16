import { useMutation, UseQueryOptions } from '@tanstack/react-query';

const keys = {
    profile: 'PROFILE',
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

    return {
        meOptions,
        useOnboardUser,
    };
}
