import styles from "./SearchComponent.module.css";
import clsx from "clsx";
import { TextInput } from "flowbite-react";
import { Category } from "@/services/assests";
import { useState } from "react";
import Categories from "./Categories";

type SearchComponentProps = {
  colorsData: Category[];
  categoriesData: Category[];
  handleSearch?: () => void;
}

const SearchComponent = ({ colorsData, categoriesData, handleSearch }: SearchComponentProps) => {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedColors, setSelectedColors] = useState<Category[]>([]);
  const doSearch = () => {
    handleSearch?.();
  }

  return (
    <div className={clsx("flex max-w-md flex-col gap-4", styles.container)}>
      <h3 className={clsx(styles.title)}>Explore</h3>
      <TextInput id="searchText" type="text" sizing="md" />
      <Categories onHandleSelect={() => {}} data={[]} />
      <Categories onHandleSelect={() => {}} type="Category" data={[]} />
    </div>
  )
}

export default SearchComponent;