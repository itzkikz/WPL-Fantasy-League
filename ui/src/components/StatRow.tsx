const StatRow = ({
  label,
  value = 0,
  per90,
  suffix,
}: {
  label: string;
  value?: string | number;
  per90?: string;
  suffix?: string;
}) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#ebe5eb] dark:border-[#541e5d]">
      <p className="text-sm">{label}</p>
      <div className="flex items-center gap-3">
        {per90 && (
          <>
            <p className="text-sm font-semibold">{value}</p>
            <p className="text-xs">Per 90</p>
            <p className="text-sm font-semibold">{per90}</p>
          </>
        )}
        {suffix && (
          <>
            <p className="text-sm font-semibold">{value}</p>
            <p className="text-xs">{suffix}</p>
          </>
        )}
        {!per90 && !suffix && (
          <p className="text-sm font-semibold">{value}</p>
        )}
      </div>
    </div>
  );
}

export default StatRow;