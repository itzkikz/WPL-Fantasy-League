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
      <div className="flex items-center justify-between px-4">
        <Button onClick={handleGoBack} type="NoBackground">
          <AngleLeft height="10" width="10" />
        </Button>
        <h1 className="text-lg font-bold">{teamName}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>
    </div>
  );
};

export default Header;
