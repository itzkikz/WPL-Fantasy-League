import React, { useState, useEffect, useRef } from "react";

const Overlay = ({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  const DURATION = 300;

  const [mounted, setMounted] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef<number | null>(null);
  const currentY = useRef(0);

  // Smooth close used by click AND swipe
  const closeWithAnimation = () => {
    if (panelRef.current) {
      // Remove inline styles completely so Tailwind classes can work
      panelRef.current.style.removeProperty('transition');
      panelRef.current.style.removeProperty('transform');
    }

    // Trigger animation first
    setAnimate(false);

    // Wait for animation to complete before unmounting
    setTimeout(() => {
      onClose();
    }, DURATION);
  };

  // Mount/unmount animation
  // Mount/unmount animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Use a small timeout to ensure the browser paints the initial state (translate-y-full)
      // before we switch to the animate state (translate-y-0).
      const t = setTimeout(() => {
        setAnimate(true);
      }, 10);
      return () => clearTimeout(t);
    } else {
      setAnimate(false);
      const t = setTimeout(() => setMounted(false), DURATION);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!mounted) return null;

  // ───────────────────────────────
  // TOUCH HANDLERS FOR SWIPE DOWN
  // ───────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    currentY.current = 0;

    if (panelRef.current) {
      panelRef.current.style.transition = "none"; // disable animation during drag
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null) return;

    const y = e.touches[0].clientY;
    const delta = y - startY.current;

    if (delta > 0) {
      currentY.current = delta;
      if (panelRef.current) {
        panelRef.current.style.transform = `translateY(${delta}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    const dragged = currentY.current;
    startY.current = null;

    if (!panelRef.current) return;

    if (dragged > 80) {
      // Sufficient swipe → animate to bottom then close
      panelRef.current.style.transition = `transform ${DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;
      panelRef.current.style.transform = `translateY(100%)`;

      setTimeout(() => {
        if (panelRef.current) {
          panelRef.current.style.removeProperty('transition');
          panelRef.current.style.removeProperty('transform');
        }
        setAnimate(false);
        setTimeout(() => onClose(), DURATION);
      }, DURATION);
    } else {
      // Snap back to top
      panelRef.current.style.transition = `transform ${DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;
      panelRef.current.style.transform = `translateY(0)`;
    }
  };

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-end 
        transition-opacity duration-300
        ${animate ? "opacity-100" : "opacity-0"}
      `}
      style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
      onClick={closeWithAnimation} // clicking outside closes with animation
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        ref={panelRef}
        className={`
          relative w-full transform transition-transform duration-300
          ${animate ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ transitionTimingFunction: "cubic-bezier(0.25, 1, 0.5, 1)" }}
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full h-[90vh] bg-white dark:bg-dark-bg rounded-t-3xl shadow-xl flex flex-col">

          {/* Drag Handle */}
          <div
            onClick={closeWithAnimation}
            className="absolute z-10 top-4 w-full flex justify-center py-3 cursor-pointer"
          >
            <div className="h-1.5 w-14 bg-gray-400 rounded-full opacity-70" />
          </div>

          <div className="overflow-y-auto flex-1 px-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overlay;
