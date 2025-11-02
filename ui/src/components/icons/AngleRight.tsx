import { FunctionComponent } from "react";

interface AngleRightProps {
  width: string;
  height: string;
}

const AngleRight: FunctionComponent<AngleRightProps> = ({width = 5, height = 5}) => {
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
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
};

export default AngleRight;
