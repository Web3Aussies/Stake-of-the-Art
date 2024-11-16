import { useAssets } from '@/services/assests';
import { useQuery } from '@tanstack/react-query';
import { Card } from 'flowbite-react';

const HomePage = () => {
    const { SearchQuery } = useAssets();

    const { data } = useQuery(SearchQuery({}));

    return (
        <div className="p-2">
            <h3>Home</h3>
            {data && (
                <div className="grid grid-flow-row grid-cols-2 gap-4">
                    {data.results.map((i) => (
                        <Card
                            key={i.id}
                            className="max-w-sm"
                            imgAlt={i.title}
                            imgSrc={`https://assets.displayz.app${i.imageUrl}`}
                        >
                            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                                {i.title}
                            </h5>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;
