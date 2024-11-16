import { Category } from '@/services/assests';
import { Badge, Button } from 'flowbite-react';
import styles from './SearchComponent.module.css';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

type CategoriesProps = {
    clearCat?: boolean;
    data: Array<Category>;
    type?: 'Color' | 'Category';
    onHandleSelect?: (selectedCat: Array<Category>) => void;
};

const Categories = ({ data, clearCat, onHandleSelect, type = 'Category' }: CategoriesProps) => {
    const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (clearCat) {
            setSelectedCategories([]);
        }
    }, [clearCat]);

    const handleClick = (item: Category) => {
        let updatedCategories = new Array<Category>();
        if (selectedCategories.some((cat) => cat.name === item.name)) {
            updatedCategories = selectedCategories.filter((cat) => cat.name !== item.name);
        } else {
            updatedCategories = updatedCategories.concat(selectedCategories).concat(item);
        }
        setSelectedCategories(updatedCategories);
        onHandleSelect?.(updatedCategories);
    };

    return (
        <div className={clsx('flex max-w-md flex-row gap-4 overflow-x-auto px-2', styles.container)}>
            <Button.Group className={clsx("", type === "Category" ? "gap-2" : "gap-4")}>
                {data.map((b) => (
                    <Button
                        key={b.name}
                        style={b.type == 'Color' ? { backgroundColor: b.name } : {}}
                        onClick={() => handleClick(b)}
                        size="xl"
                        className='text-nowrap rounded-md'
                        // className={clsx(' text-nowrap', styles.colorButton)}

                    >
                        {b.type == 'Category' ? b.name : ' '}
                    </Button>
                ))}
            </Button.Group>
        </div>
    );
};

export default Categories;
