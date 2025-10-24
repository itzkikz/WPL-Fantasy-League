'use client';

export default function DataTable({ data, fields, onEdit, onDelete }) {
  // Get position indicator color
  const getPositionColor = (index) => {
    if (index === 0) return 'bg-gray-300'; // 1st place
    if (index === 1) return 'bg-green-500'; // 2nd place
    if (index === 2) return 'bg-red-500'; // 3rd place
    return 'bg-green-500'; // Others up arrow
  };

  const getPositionIcon = (index) => {
    if (index === 0) return '—';
    if (index === 1) return '▲';
    if (index === 2) return '▼';
    return '▲';
  };

  return (
    <div className="space-y-3">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
        <div className="col-span-1">Pos</div>
        <div className="col-span-5">{fields[1]?.replace(/_/g, ' ') || 'Name'}</div>
        {fields.slice(2, 4).map((field) => (
          <div key={field} className="col-span-2 text-center">
            {field.replace(/_/g, ' ')}
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {data.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
          No records found
        </div>
      ) : (
        data.map((row, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="grid grid-cols-12 gap-2 items-center px-4 py-4">
              {/* Position with indicator */}
              <div className="col-span-1 flex items-center space-x-2">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-gray-800">
                    {index + 1}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getPositionColor(
                      index
                    )}`}
                  >
                    {getPositionIcon(index)}
                  </div>
                </div>
              </div>

              {/* Name/Team with subtitle */}
              <div className="col-span-5">
                <h3 className="text-base font-bold text-gray-900">
                  {row[fields[1]] || 'N/A'}
                </h3>
                <p className="text-sm text-gray-500">
                  {row[fields[2]] || row[fields[0]] || ''}
                </p>
              </div>

              {/* Stats columns */}
              {fields.slice(2, 4).map((field) => (
                <div key={field} className="col-span-2 text-center">
                  <p className="text-base font-semibold text-gray-800">
                    {row[field] || '0'}
                  </p>
                </div>
              ))}             
            </div>
          </div>
        ))
      )}
    </div>
  );
}
