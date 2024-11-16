import { Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { Flowbite, Footer } from 'flowbite-react';


export default function PublicLayout() {
    return (
        <Flowbite>
            <div className="flex min-h-svh flex-col bg-gray-50 antialiased dark:bg-gray-900">
                
                <main className="container mx-auto flex-grow pb-4 pt-4 text-gray-500 dark:text-gray-400">
                    <Outlet />
                </main>

                <Footer container className="my-auto">
                    <Footer.Copyright href="#" by="Wallpaper" year={2024} />
                </Footer>
            </div>
            <Suspense>
                <TanStackRouterDevtools />
                <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
        </Flowbite>
    );
}