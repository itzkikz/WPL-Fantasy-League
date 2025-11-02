// Toast.jsx
import { useEffect, useState } from "react";

export default function Toast({
  message = { message: "Saved successfully", type: "SUCCESS" },
  open,
  onClose,
}: {
  message: { message: string; type: "SUCCESS" | "ERROR" | "NORMAL" };
  open: boolean;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    setVisible(true);

    // Hide after 3 seconds
    const hideTimer = setTimeout(() => setVisible(false), 3000);

    // Unmount after exit transition (300ms)
    const unmountTimer = setTimeout(() => {
      onClose?.();
    }, 3300);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, [open, onClose]);

  const bgColor = message?.type === "SUCCESS" ? "bg-green-500" : "bg-red-500";

  // Keep mounted while exiting to play the transition
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        role="status"
        className={[
          "pointer-events-auto max-w-sm w-full rounded-md text-white shadow-lg px-4 py-3",
          "transition-opacity duration-300 ease-out",
          "absolute top-1/2 left-1/2 -translate-x-1/2",
          visible
            ? "-translate-y-1/2 opacity-100"
            : "-translate-y-[calc(50%-0.5rem)] opacity-0",
          bgColor,
        ].join(" ")}
      >
        <p className="text-sm">{message?.message}</p>
      </div>
    </div>
  );
}
