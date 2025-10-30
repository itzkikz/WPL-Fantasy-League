import { FunctionComponent } from "react";

interface AngleDownProps {
   height: string;
  width: string;
}

const AngleDown: FunctionComponent<AngleDownProps> = ({width = 5, height = 5}) => {
  return (
    <svg
          className={`w-${width} h-${height}`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 8"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 5.326 5.7a.909.909 0 0 0 1.348 0L13 1"
          />
        </svg>
  );
};

export default AngleDown;
