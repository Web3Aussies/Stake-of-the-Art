import ImageList from "../organisms/ImageList";
import { Asset } from "@/services/assests";
import styles from "./ExplorePage.module.css";
import clsx from "clsx";
import SearchComponent from "../organisms/SearchComponent";

const data: Asset[] = [
  {
    filename: "filename",
    id: "1",
    imageUrl: "umageUrl",
    title: "title1"
  },
  {
    filename: "filename2",
    id: "2",
    imageUrl: "umageUrl2",
    title: "title2"
  },
  {
    filename: "filename3",
    id: "3",
    imageUrl: "umageUrl3",
    title: "title3"
  },
  {
    filename: "filename4",
    id: "4",
    imageUrl: "umageUrl4",
    title: "title4"
  },
  {
    filename: "filename5",
    id: "5",
    imageUrl: "umageUrl5",
    title: "title5"
  },
  {
    filename: "filename6",
    id: "6",
    imageUrl: "umageUrl6",
    title: "title6"
  }
]

const ExplorePage = () => {

  return (
    <div className="p-2 flex flex-1 flex-col items-center">
      <SearchComponent colorsData={[]} categoriesData={[]} />
      <ImageList imageList={data} />
    </div>
  )
}

export default ExplorePage;