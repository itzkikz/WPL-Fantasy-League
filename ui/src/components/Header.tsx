import { useRouter } from "@tanstack/react-router";
import AngleLeft from "../components/icons/AngleLeft";
import Button from "./common/Button";

interface HeaderProps {
  teamName: string;
}

const Header = ({ teamName }: HeaderProps) => {
  const router = useRouter();
  const handleGoBack = () => {
    router.history.back();
  };
  return (
    <div className="flex-none">
      <div className="flex items-center justify-between px-2">
        <Button onClick={handleGoBack} type="NoBackground">
          <AngleLeft height="8" width="8" />
        </Button>
        <h1 className="text-base font-bold">{teamName}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>
    </div>
  );
};

export default Header;
