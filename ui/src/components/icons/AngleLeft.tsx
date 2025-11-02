import { FunctionComponent } from "react";

interface AngleLeftProps {
  height: string;
  width: string;
}

const AngleLeft: FunctionComponent<AngleLeftProps> = ({width = 5, height = 5}) => {
  return (
    <svg
            className={`w-${width} h-${height}`}
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
  );
};

export default AngleLeft;
