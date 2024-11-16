import { Category, useAssets } from '@/services/assests';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Card } from 'flowbite-react';
import SearchComponent from '../organisms/SearchComponent';
import { useState } from 'react';

const HomePage = () => {
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
    const [keyword, setKeyword] = useState<string>();
    const { SearchQuery, GetCategoriesQuery } = useAssets();
    const { data: categories } = useQuery(GetCategoriesQuery());
    const { data, isPending } = useQuery(SearchQuery({keyword: keyword, categories: selectedCategories?.map(cat => cat.name).join(",")}));

    const updateSearch = (categories: Category[], keyword: string) => {
        console.log('search = ', categories);
        setSelectedCategories(categories);
        setKeyword(keyword);
    }

    return (
        <div className="p-2">
            {categories && (
                <SearchComponent
                    colorsData={categories.results.filter(cat => cat.type === "Color")}
                    categoriesData={categories.results.filter(cat => cat.type === "Category")}
                    handleSearch={updateSearch}
                />)
            }
            {data && (
                <div className="grid grid-flow-row grid-cols-2 gap-4">
                    {data.results?.map((i) => (
                        <Link to="/image/$id" params={{ id: i.id }}>
                            <Card
                                key={i.id}
                                className="max-w-sm"
                                imgAlt={i.title}
                                imgSrc={`https://assets.displayz.app${i.imageUrl}`}
                            >
                                {i.category}
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;
