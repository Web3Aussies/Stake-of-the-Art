import styles from "./SearchComponent.module.css";
import clsx from "clsx";
import { TextInput } from "flowbite-react";
import { Category } from "@/services/assests";
import { useCallback, useEffect, useRef, useState } from "react";
import Categories from "./Categories";
import { HiSearch } from "react-icons/hi";
import { debounce } from "lodash";

type SearchComponentProps = {
  colorsData: Category[];
  categoriesData: Category[];
  handleSearch?: (categories: Category[], keyword: string) => void;
}

const SearchComponent = ({ colorsData, categoriesData, handleSearch }: SearchComponentProps) => {
  const searchInputRef = useRef(null);
  const [keyword, setKeyword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedColors, setSelectedColors] = useState<Category[]>([]);
  const doSearch = () => {
    handleSearch?.(selectedColors.concat(selectedCategories), keyword);
  }

  useEffect(() => {
    doSearch();
  }, [selectedColors, selectedCategories]);

  const hansleColorChange = (cat: Category[]) => {
    setSelectedColors(cat);
  }

  const hansleCategoryChange = (cat: Category[]) => {
    setSelectedCategories(cat);
  }

  const handleKeywordSearch = (text: string) => {
    setKeyword(text);
    if (text.length > 2) {
    }
    if (text === "") {
      searchInputRef?.current?.reset();
    }
  }

  const handleSearchDebounce = useCallback(debounce(handleKeywordSearch, 400), []);

  return (
    <div className={clsx("flex max-w-md flex-col gap-4", styles.container)}>
      <div className="max-w-md">
      <TextInput
        ref={searchInputRef}
        onChange={value => handleSearchDebounce(value.target.value)}
        id="search"
        type="text"
        rightIcon={HiSearch}
        placeholder="Search..."
        required={true}
        className="w-full"
      />
    </div>
      <Categories onHandleSelect={hansleColorChange} type="Color" data={colorsData} />
      <Categories onHandleSelect={hansleCategoryChange} data={categoriesData} />
    </div>
  )
}

export default SearchComponent;