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
    <div className="flex items-center justify-between py-2 border-b border-gray-100">
      <p className="text-gray-700 text-sm">{label}</p>
      <div className="flex items-center gap-3">
        {per90 && (
          <>
            <p className="text-gray-900 text-sm font-semibold">{value}</p>
            <p className="text-gray-500 text-xs">Per 90</p>
            <p className="text-gray-900 text-sm font-semibold">{per90}</p>
          </>
        )}
        {suffix && (
          <>
            <p className="text-gray-900 text-sm font-semibold">{value}</p>
            <p className="text-gray-500 text-xs">{suffix}</p>
          </>
        )}
        {!per90 && !suffix && (
          <p className="text-gray-900 text-sm font-semibold">{value}</p>
        )}
      </div>
    </div>
  );
}

export default StatRow;