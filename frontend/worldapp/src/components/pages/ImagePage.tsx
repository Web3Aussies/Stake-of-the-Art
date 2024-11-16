import { useAssets } from '@/services/assests';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { Button, Spinner } from 'flowbite-react';
import { IoChevronBackCircle } from 'react-icons/io5';
import { FaDownload } from 'react-icons/fa6';

export function ImagePage() {
    const { id } = useParams({ from: '/_app/image/$id/' });
    const { GetAsset, getDownloadLink } = useAssets();

    const { data, isPending } = useQuery(GetAsset({ id: id, height: 1000, width: 1000 }));

    const { mutateAsync, isPending: downloadPending } = useMutation({
        mutationFn: async (id: string) => {
            const url = await getDownloadLink(id);

            return url;
        },
        onSuccess(data, variables, context) {
            window.open(data, '_blank', 'noopener,noreferrer');
        },
    });

    const handleDownload = async () => {
        await mutateAsync(id);
    };

    return (
        <div className="">
            <div className="flex items-center bg-slate-700 px-2 py-4 pt-6">
                <Link to="/" className="flex items-center gap-1 text-slate-200">
                    <IoChevronBackCircle /> Back
                </Link>
                <Button
                    className="ml-auto flex items-center"
                    onClick={handleDownload}
                    isProcessing={downloadPending}
                    color='green'
                    size='sm'
                >
                    <FaDownload className="mr-3 h-4 w-4"/> Download
                </Button>
              
            </div>
            {isPending && (
                <div className="flex items-center justify-center pt-64">
                    <Spinner size="xl" />
                </div>
            )}
            {data && (
                <div className="flex items-center justify-center overflow-hidden pt-2">
                    <img className="max-w-sm object-cover" src={`https://assets.displayz.app${data.imageUrl}`} />
                </div>
            )}
        </div>
    );
}
