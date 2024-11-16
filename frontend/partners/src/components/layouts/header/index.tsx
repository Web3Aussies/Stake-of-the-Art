import { useAuth0 } from '@auth0/auth0-react';
import { Link, useRouteContext } from '@tanstack/react-router';
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import { DarkThemeToggle } from 'flowbite-react';

export function Header() {
    const { user } = useRouteContext({ strict: false });
    const { logout, isAuthenticated } = useAuth0();

    const handleLogout = async () => {
        logout({ logoutParams: { returnTo: import.meta.env.VITE_LOGOUT_RETURN_URL } });
    };

    return (
        <header>
            <Navbar className="border-b border-gray-200 bg-white px-4 py-2.5 dark:border-gray-700 dark:bg-gray-800">
                <Navbar.Brand as={Link} to={isAuthenticated ? '/app' : '/'}>
                    <img src="/logo.svg" className="mr-3 h-6 sm:h-9" alt="Stake of the Art Logo" />
                    <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
                        Staking Art
                    </span>
                </Navbar.Brand>
                <div className="flex gap-2 md:order-2">
                    <DarkThemeToggle />
                    {!isAuthenticated && <Avatar rounded />}
                    {isAuthenticated && (
                        <Dropdown
                            arrowIcon={false}
                            inline
                            label={
                                <Avatar
                                    alt="User settings"
                                    img={
                                        user?.picture || 'https://flowbite.com/docs/images/people/profile-picture-5.jpg'
                                    }
                                    rounded
                                />
                            }
                        >
                            <Dropdown.Header>
                                <span className="block text-sm">{user?.name}</span>
                                <span className="block truncate text-sm font-medium">{user?.email}</span>
                            </Dropdown.Header>
                          
                            <Dropdown.Item onClick={handleLogout}>Sign out</Dropdown.Item>
                        </Dropdown>
                    )}
                </div>
            </Navbar>
        </header>
    );
}
