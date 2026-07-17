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

    // Hide after 2.8 seconds
    const hideTimer = setTimeout(() => setVisible(false), 2800);

    // Unmount after exit transition (300ms)
    const unmountTimer = setTimeout(() => {
      onClose?.();
    }, 3100);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(unmountTimer);
    };
  }, [open, onClose]);

  // Color mapping based on type
  const isSuccess = message?.type === "SUCCESS";
  const borderClass = isSuccess ? "border-l-4 border-emerald-500" : "border-l-4 border-rose-500";
  const shadowClass = isSuccess 
    ? "shadow-[0_8px_30px_rgba(16,185,129,0.15)]" 
    : "shadow-[0_8px_30px_rgba(239,68,68,0.15)]";

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[90%] sm:max-w-md pointer-events-none px-4 select-none">
      <div
        role="status"
        className={`pointer-events-auto w-full bg-[#180f30]/95 backdrop-blur-md border border-[#372166] rounded-xl p-4 flex items-start gap-3.5 transition-all duration-300 ease-out transform
          ${visible 
            ? "translate-y-0 opacity-100 scale-100" 
            : "-translate-y-4 opacity-0 scale-95"}
          ${borderClass} ${shadowClass}`}
      >
        {/* Type Icon */}
        {isSuccess ? (
          <svg className="w-5.5 h-5.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-5.5 h-5.5 text-rose-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}

        {/* Message Text */}
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-0.5">
            {isSuccess ? "Success" : "Notification"}
          </span>
          <p className="text-xs md:text-sm font-bold text-white leading-tight">
            {message?.message}
          </p>
        </div>
      </div>
    </div>
  );
}
