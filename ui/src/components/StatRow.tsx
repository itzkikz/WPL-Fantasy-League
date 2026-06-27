const StatRow = ({
  label,
  value = 0,
  per90,
  suffix,
  border = true,
  textSize = "text-sm"
}: {
  label: string;
  value?: string | number;
  per90?: string;
  suffix?: string;
  border?: boolean;
  textSize?: string;
}) => {
  const displayValue = (value === null || value === undefined) ? 0 : value;
  return (
    <div className={`flex items-center justify-between ${border ? " border-b border-light-border dark:border-dark-border" : ""}`}>
      <p className={textSize}>{label}</p>
      <div className="flex items-center gap-3">
        {per90 && (
          <>
            <p className="text-sm font-semibold">{displayValue}</p>
            <p className="text-xs">Per 90</p>
            <p className="text-sm font-semibold">{per90}</p>
          </>
        )}
        {suffix && (
          <>
            <p className="text-sm font-semibold">{displayValue}</p>
            <p className="text-xs">{suffix}</p>
          </>
        )}
        {!per90 && !suffix && (
          <p className={`${textSize} font-semibold`}>{displayValue}</p>
        )}
      </div>
    </div>
  );
}

export default StatRow;