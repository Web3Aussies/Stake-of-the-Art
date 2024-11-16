import { Button } from 'flowbite-react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link, useRouteContext } from '@tanstack/react-router';

export default function HomePage() {
    const { loginWithRedirect } = useAuth0();
    const { isAuthenticated } = useRouteContext({ strict: false });

    const handleClick = async () => {
        await loginWithRedirect();
    };

    return (
        <div className="pb-2 pt-2">
            <p>Home page</p>

            {(isAuthenticated && (
                <Link className="text-primary-600 dark:text-primary-500 hover:underline" to="/app">
                    Go to Dashboard
                </Link>
            )) || (
                <Button onClick={handleClick} className="">
                    Login
                </Button>
            )}
        </div>
    );
}
