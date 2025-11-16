import React, { FunctionComponent } from "react";

interface ButtonProps {
  label?: string;
  type: "Primary" | "Secondary" | "NoBackground" | "Danger";
  children?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  width?: string;
  size?:string;
}

const Button: FunctionComponent<ButtonProps> = ({
  label,
  type = "Primary",
  children,
  onClick,
  disabled = false,
  icon,
  width,
  size
}) => {
  const getClassName = () => {
    if(type === 'Primary'){
      if(disabled){
        return "bg-[#1e0021]/40 dark:bg-white/4 text-white dark:text-[#2a1134]";
      }
      return "bg-[#1e0021] dark:bg-white text-white dark:text-[#2a1134]";
    }
    if(type === 'Danger'){
      return "bg-light-accent text-white"
    }
  }
  
  return (
    <button
      disabled={disabled}
      className={`${width ? width : ""} cursor-pointer flex items-center justify-center gap-2 py-2 px-2 mr-2 ${size ? size : 'text-base'} rounded-full ${type !== "NoBackground" ? getClassName() : ""}`}
      onClick={() => onClick()}
    >
      {icon && icon}
      {label ?? children}
    </button>
  );
};

export default Button;
