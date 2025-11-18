import React, { useState, useEffect } from "react";

const Overlay = ({
  isOpen,
  onClose,
  children,
  showBackButton = true
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showBackButton: boolean;
}) => {
  // Keep this in sync with the Tailwind duration classes below (700ms)
  const ANIM_MS = 700;

  const [mounted, setMounted] = useState(isOpen);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Trigger enter transition on the next frame to ensure the initial styles apply before animating
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      // Start exit transition
      setIsAnimating(false);
      // Unmount after the transition finishes
      const t = setTimeout(() => setMounted(false), ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  const requestClose = () => onClose();

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-700 ease-in-out ${
        isAnimating ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={requestClose}
    >
      <div className="absolute inset-0 bg-dark-bg/80" />
      <div
        className={`relative w-full h-[90vh] bg-light-bg dark:bg-dark-bg rounded-t-3xl shadow-xl transform transition-transform duration-700 ease-in-out ${
          isAnimating ? "translate-y-0" : "translate-y-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {showBackButton && (
          <button
            onClick={requestClose}
            className="absolute z-10 top-4 left-4 w-10 h-10 rounded-full bg-light-text-secondary backdrop-blur-sm flex items-center justify-center"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {children}
      </div>
    </div>
  );
};

export default Overlay;
