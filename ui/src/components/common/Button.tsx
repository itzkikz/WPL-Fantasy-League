import React, { FunctionComponent } from "react";

interface ButtonProps {
  label?: string;
  type: "Primary" | "Secondary" | "NoBackground";
  children?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  width?: string;
}

const Button: FunctionComponent<ButtonProps> = ({
  label,
  type = "Primary",
  children,
  onClick,
  disabled = false,
  icon,
  width
}) => {
  const addClassName =
    type === "Primary"
      ? `${disabled ? "bg-[#1e0021]/40 dark:bg-white/40" : "bg-[#1e0021] dark:bg-white"} text-white dark:text-[#2a1134]`
      : "bg-[#ebe5eb] dark:bg-[#2a1134] text-[#2a1134] dark:text-white";
  return (
    <button
      disabled={disabled}
      className={`${width ? width : ""} flex items-center justify-center gap-2 py-2 px-2 mr-2 text-base rounded-full ${type !== "NoBackground" ? addClassName : ""}`}
      onClick={() => onClick()}
    >
      {icon && icon}
      {label ?? children}
    </button>
  );
};

export default Button;
