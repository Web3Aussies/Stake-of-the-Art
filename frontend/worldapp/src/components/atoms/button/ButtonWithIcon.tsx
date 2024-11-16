import { Button } from "flowbite-react";
import { HiOutlineSearch } from "react-icons/hi";
import { IoHome } from "react-icons/io5";


type ButtonWithIconProps = {
  type?: "explore" | "index";
}

const ButtonWithIcon = ({type = "index"}: ButtonWithIconProps) => {
  const buttonLabel = type === "index" ? "For You" : "Explore";
  return (
    <Button className="flex flex-row items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group w-full h-full p-4 button">
      {type === "index" ?
        <IoHome />
        :
        <HiOutlineSearch />
      }
      <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
        {buttonLabel}
      </span>
    </Button>
  )
}

export default ButtonWithIcon;