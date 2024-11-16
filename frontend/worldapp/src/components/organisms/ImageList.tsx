import { Asset } from "@/services/assests";
import styles from "./ImageList.module.css";
import { Card } from "flowbite-react";
import clsx from "clsx";

type ImageListProps = {
  imageList: Asset[];
}

const ImageList = ({imageList}: ImageListProps) => {

  const imageListItems = imageList.map((asset, index) => {

    return (
      <Card
        key={asset.id}
        className={clsx("max-w-sm", styles.card)}
        imgAlt={asset.title}
        imgSrc={`https://assets.displayz.app/${asset.imageUrl}`}
      >
      </Card>
    )
  });


  return <ul className={clsx("grid grid-flow-row gap-4 grid-cols-2", styles.imageGrid)}>{imageListItems}</ul>;
}

export default ImageList;