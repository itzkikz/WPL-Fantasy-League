import AngleLeft from "../components/icons/AngleLeft";
import Button from "./common/Button";

interface HeaderProps {
  teamName: string;
  onBack: () => void;
}

const Header = ({ teamName, onBack }: HeaderProps) => {

  return (
    <div className="sticky top-0 z-50 bg-light-bg dark:bg-dark-bg/90 backdrop-blur-md flex-none transition-colors duration-200">
      <div className="flex items-center justify-between px-2">
        <Button onClick={onBack} type="NoBackground">
          <AngleLeft height="8" width="8" />
        </Button>
        <h1 className="text-base font-bold">{teamName}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>
    </div>
  );
};

export default Header;
