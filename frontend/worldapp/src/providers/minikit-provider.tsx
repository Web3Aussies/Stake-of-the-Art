import { MiniKit } from '@worldcoin/minikit-js';
import { ReactNode, useEffect } from 'react';

export default function MiniKitProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        MiniKit.install(import.meta.env.VITE_APP_ID);
    }, []);

    return <>{children}</>;
}
