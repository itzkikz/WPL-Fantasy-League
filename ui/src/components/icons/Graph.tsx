import { FunctionComponent } from "react";

interface Props {
    isActive: boolean;
}

const Graph: FunctionComponent<Props> = ({isActive}) => {
  return (
    <svg
      className={`w-5 h-5 transition-colors ${
        isActive ? "text-[#A855F7]" : "text-gray-500 dark:text-[#8E89A6]"
      }`}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 4v15a1 1 0 0 0 1 1h15M8 16l2.5-5.5 3 3L17.273 7 20 9.667"
      />
    </svg>
  );
};

export default Graph;
