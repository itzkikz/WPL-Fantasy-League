import { useRouter } from "@tanstack/react-router";

interface HeaderProps {
  teamName: string;
}

const Header = ({ teamName }: HeaderProps) => {
  const router = useRouter();
  return (
    <div className="flex-none">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button
          className="cursor-pointer w-10 h-10 rounded-full flex items-center justify-center"
          onClick={() => router.history.back()}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold">{teamName}</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>
    </div>
  );
};

export default Header;
