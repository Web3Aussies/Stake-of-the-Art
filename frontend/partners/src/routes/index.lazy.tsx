import HomePage from '@/components/pages/HomePage';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/')({
    component: HomePage,
});
