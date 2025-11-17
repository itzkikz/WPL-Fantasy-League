import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const NotificationItem = ({
  title,
  message,
  time,
  onDismiss,
}: {
  title: string;
  message: string;
  time: number;
  onDismiss: () => void;
}) => {
  const d = dayjs.utc(time).tz("Asia/Kolkata");
  const formatted = d.format("ddd D MMM, HH:mm");

  return (
    <div className="flex items-start w-full justify-between p-4 mb-3 rounded-lg shadow-sm border border-light-border dark:border-dark-border">
      <div className="flex-1">
        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <p className="text-sm">{message}</p>
        {time && (
          <span className="text-xs text-gray-400 mt-2 block">{formatted}</span>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-4 hidden">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default NotificationItem;
