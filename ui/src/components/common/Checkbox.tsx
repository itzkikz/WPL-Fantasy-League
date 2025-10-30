import { FunctionComponent } from "react";

interface CheckboxProps {
    label: string;
}

const Checkbox: FunctionComponent<CheckboxProps> = ({label}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input type="checkbox" checked={true} className="sr-only hidden" />
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors`}
        >
          {
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          }
        </div>
      </div>
      <span className="ml-3 text-base">{label}</span>
    </label>
  );
};

export default Checkbox;
