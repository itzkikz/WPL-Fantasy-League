import { FunctionComponent } from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

const Checkbox: FunctionComponent<CheckboxProps> = ({
  label,
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          onChange={onChange}
          checked={checked}
          className="sr-only hidden"
        />
        <div
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors`}
        >
          {checked && (
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
          )}
        </div>
      </div>
      <span className="ml-3 text-base">{label}</span>
    </label>
  );
};

export default Checkbox;
