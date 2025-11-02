import React from "react";

export const ArrowRight = ({
  height = 5,
  width = 5,
}: {
  height: number;
  width: number;
}) => {
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
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
};
