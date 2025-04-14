// src/components/common/Modal.jsx
import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  // Prevent clicks inside the modal content from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose} // Click outside closes modal
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-transform duration-300 ease-out scale-100" // Initial scale
        onClick={handleContentClick}
        style={{ animation: 'modal-scale-in 0.3s ease-out forwards' }} // Add scale animation
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

// Add simple animations via CSS (could be in index.css or here)
const styles = `
  @keyframes fadeInFast {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in-fast {
    animation: fadeInFast 0.2s ease-out forwards;
  }
   @keyframes modalScaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
   }
  .animate-modal-scale-in {
      animation: modalScaleIn 0.3s ease-out forwards;
  }
`;
// Inject styles (consider moving to index.css)
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default Modal;