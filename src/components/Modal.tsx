/* eslint-disable no-irregular-whitespace */
import React from "react";
import ReactDOM from "react-dom";
import { FaTimes } from "react-icons/fa";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: "w-full max-w-md",
  md: "w-full max-w-2xl",
  lg: "w-full max-w-4xl",
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  showCloseButton = true,
}) => {
  // Removed scrollY state and useEffect as position: fixed is used for the overlay

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    // 🛑 FIX: Use fixed, inset-0, and add a semi-transparent background (bg-black/50)
    <div
      className="fixed inset-0 z-[1000] bg-black/50 flex items-start justify-center overflow-y-auto p-4"
      // Removed custom style={{ top: scrollY + 100 }}
      onClick={onClose}
    >
      {/* Inner container for the modal content itself. */}
      <div
        className={`
          relative mt-16 mb-8 // Add vertical margin for visual offset
          ${sizeClasses[size]} mx-auto 
          bg-white rounded-2xl shadow-2xl // ✅ FIX: Solid white background for visibility
          p-6 sm:p-8 
          max-h-[85vh] // Use a slightly smaller max-h now that the outer container scrolls 
          animate-fade-in
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            {title && <h2 className="text-xl font-bold text-gray-800">{title}</h2>}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-500 transition-colors text-2xl p-2 rounded-full hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            )}
          </div>
        )}
        {/* Inner content container */}
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;