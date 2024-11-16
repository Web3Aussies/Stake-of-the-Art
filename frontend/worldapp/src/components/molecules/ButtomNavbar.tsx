import { Link } from "@tanstack/react-router";
import ButtonWithIcon from "../atoms/button/ButtonWithIcon";

type BottomNavbarProps = {
  index?: string;
  explore?: string;
}

export default function BottomNavbar({}: BottomNavbarProps) {
  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
      <div className="grid h-full max-w-lg grid-cols-2 mx-auto font-medium">
        <Link
          to="/"
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true }}
        >
          <ButtonWithIcon />
        </Link>
        <Link
          to="/explore"
          activeProps={{
            className: 'font-bold',
          }}
        >
          <ButtonWithIcon type="explore" />
        </Link>
      </div>
    </div>
  )
}
