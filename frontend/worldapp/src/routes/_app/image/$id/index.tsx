import { ImagePage } from '@/components/pages/ImagePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/image/$id/')({
    component: ImagePage,
});
