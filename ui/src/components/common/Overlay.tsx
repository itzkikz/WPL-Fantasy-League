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
    // Trigger animation first
    setAnimate(false);

    // Wait for animation to complete before unmounting
    setTimeout(() => {
      onClose();
    }, DURATION);
  };

  // Mount/unmount animation
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      // Small timeout to ensure browser paints initial state before animating
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

  // Touch handlers for swipe down
  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    currentY.current = 0;

    if (panelRef.current) {
      panelRef.current.style.transition = "none";
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
      // Swipe down to close
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
      // Snap back
      panelRef.current.style.transition = `transform ${DURATION}ms cubic-bezier(0.25, 1, 0.5, 1)`;
      panelRef.current.style.transform = `translateY(0)`;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{
        opacity: animate ? 1 : 0,
        transition: "opacity 300ms cubic-bezier(0.25, 1, 0.5, 1)"
      }}
      onClick={closeWithAnimation}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        ref={panelRef}
        className="relative w-full"
        style={{
          transform: animate ? "translateY(0)" : "translateY(100%)",
          transition: "transform 300ms cubic-bezier(0.25, 1, 0.5, 1)"
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="w-full max-h-[80vh] bg-white dark:bg-dark-bg rounded-t-3xl shadow-xl flex flex-col">
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
