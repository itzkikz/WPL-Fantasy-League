import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: "center" | "bottom" | "responsive";
  maxWidthClass?: string;
}

export const Modal = ({
  isOpen,
  onClose,
  children,
  variant = "responsive",
  maxWidthClass = "max-w-lg",
}: ModalProps) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [animatingOut, setAnimatingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setAnimatingOut(false);
    } else if (shouldRender) {
      setAnimatingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setAnimatingOut(false);
      }, 250); // Matches animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent scroll when open
  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [shouldRender]);

  if (!shouldRender) return null;

  // responsive = bottom sheet on mobile, centered modal on desktop
  const wrapperClass =
    variant === "center"
      ? "fixed inset-0 z-50 flex items-center justify-center p-4"
      : variant === "bottom"
      ? "fixed inset-0 z-50 flex items-end justify-center p-4"
      : "fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4";

  const backdropClass = animatingOut
    ? "absolute inset-0 bg-black/60 backdrop-blur-[0px] animate-modal-backdrop-out"
    : "absolute inset-0 bg-black/60 backdrop-blur-sm animate-modal-backdrop-in";

  let cardAnimClass = "";
  if (variant === "responsive") {
    cardAnimClass = animatingOut
      ? "animate-modal-slide-out sm:animate-modal-scale-out"
      : "animate-modal-slide-in sm:animate-modal-scale-in";
  } else if (variant === "center") {
    cardAnimClass = animatingOut
      ? "animate-modal-scale-out"
      : "animate-modal-scale-in";
  } else {
    cardAnimClass = animatingOut
      ? "animate-modal-slide-out"
      : "animate-modal-slide-in";
  }

  const roundedClass =
    variant === "responsive"
      ? "rounded-t-3xl sm:rounded-3xl"
      : variant === "center"
      ? "rounded-3xl"
      : "rounded-t-3xl";

  return (
    <div className={wrapperClass}>
      {/* Backdrop */}
      <div className={backdropClass} onClick={onClose} />

      {/* Modal Content Card */}
      <div
        className={`relative w-full ${maxWidthClass} bg-elevated border border-border ${roundedClass} shadow-modal overflow-hidden z-10 flex flex-col max-h-[90vh] text-white ${cardAnimClass}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
