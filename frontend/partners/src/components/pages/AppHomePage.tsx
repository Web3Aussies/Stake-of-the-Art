import { useAssets } from '@/services/assets';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useRouteContext } from '@tanstack/react-router';
import { Badge, Card, Spinner, Button, ButtonGroup } from 'flowbite-react';
import { FaDownload } from 'react-icons/fa';
import { HiCheck } from 'react-icons/hi';
import { MdAddPhotoAlternate } from 'react-icons/md';
import { LuRefreshCw } from 'react-icons/lu';
import { IoCloudOffline } from 'react-icons/io5';

export default function AppHomePage() {
    const navigate = useNavigate();
    const { token } = useRouteContext({ strict: false });
    const { SearchQuery, RefreshSearch } = useAssets({ token });

    const { data, isLoading } = useQuery(SearchQuery({}));

    const handleAddAsset = () => {
        navigate({ to: '/app/assets/new' });
    };

    return (
        <div className="px-4 py-2">
            <div className="flex items-center pb-4">
                <h3 className="text-3xl">My Wallpapers</h3>
                <ButtonGroup className="ml-auto">
                    <Button onClick={RefreshSearch} size="sm">
                        <LuRefreshCw className="mr-2 h-5 w-5" />
                    </Button>
                    <Button onClick={handleAddAsset} size="sm">
                        <MdAddPhotoAlternate className="mr-2 h-5 w-5" /> Add
                    </Button>
                </ButtonGroup>
            </div>

            <div className="grid grid-flow-row gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoading && <Spinner aria-label="Extra large spinner example" size="xl" title="Loading Wallpapers" />}
                {!data || (data.totalRecords <= 0 && <span>No Wallpapers uploaded!</span>)}
                {data?.results.map((i) => (
                    <Card
                        key={i.id}
                        className="max-w-sm"
                        imgAlt={i.title}
                        imgSrc={
                            i.status != 'Pending' ? `https://assets.displayz.app${i.imageUrl}` : '/placeholder.png'
                        }
                    >
                        <div className="flex flex-row gap-2">
                            {(i.downloads && i.downloads > 0 && (
                                <Badge color="gray" icon={FaDownload}>
                                    {i.downloads && <span className="mx-1">{i.downloads} downloads</span>}
                                </Badge>
                            )) ||
                                ''}
                            {i.status === 'Ready' && (
                                <Badge color="green" icon={HiCheck} className="ml-auto">
                                    <span className="mx-2">Ready</span>
                                </Badge>
                            )}
                           
                            {i.status === 'Deactivated' && (
                                <Badge color="gray" icon={IoCloudOffline} className="ml-auto">
                                    <span className="mx-2">Deactivated</span>
                                </Badge>
                            )}
                        </div>

                        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{i.title}</h5>
                    </Card>
                ))}
            </div>
        </div>
    );
}
