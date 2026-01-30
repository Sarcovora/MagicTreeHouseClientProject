// src/components/common/Lightbox.jsx
import { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Lightbox - Displays an image in a full-screen modal overlay with navigation controls
 * 
 * Supports updating the current image via index prop.
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the lightbox is visible
 * @param {function} props.onClose - Callback to close the lightbox
 * @param {Array} props.images - Array of image objects { fileUrl, title, description }
 * @param {number} props.currentIndex - Index of the currently displayed image
 * @param {function} props.onNavigate - Callback(newIndex) when navigating
 */
const Lightbox = ({ 
  isOpen, 
  onClose, 
  images, 
  currentIndex, 
  onNavigate 
}) => {
  const [loading, setLoading] = useState(true);

  // Reset loading state when image changes
  useEffect(() => {
    setLoading(true);
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handleNavigate(-1);
      if (e.key === "ArrowRight") handleNavigate(1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, onClose]);

  if (!isOpen || images.length === 0 || currentIndex === null) return null;

  const currentImage = images[currentIndex];
  const hasMultiple = images.length > 1;

  const handleNavigate = (direction) => {
    if (!hasMultiple) return;
    const newIndex = (currentIndex + direction + images.length) % images.length;
    onNavigate(newIndex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-opacity animate-in fade-in duration-200">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 focus:outline-none"
        aria-label="Close lightbox"
      >
        <X size={24} />
      </button>

      {/* Navigation - Left */}
      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); handleNavigate(-1); }}
          className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 focus:outline-none"
          aria-label="Previous image"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {/* Image Container */}
      <div className="relative flex h-full w-full items-center justify-center" onClick={onClose}>
        {/* Loading Spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-600 border-t-white"></div>
          </div>
        )}

        <img
          src={currentImage.fileUrl || currentImage.url}
          alt={currentImage.title || currentImage.fileName || 'Gallery Image'}
          className={`max-h-[85vh] max-w-[90vw] object-contain shadow-2xl transition-opacity duration-300 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
          onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
          onLoad={() => setLoading(false)}
          onError={() => setLoading(false)}
        />

        {/* Caption Overlay */}
        <div 
            className="absolute bottom-4 left-0 right-0 mx-auto max-w-2xl rounded-lg bg-black/60 px-4 py-3 text-center text-white backdrop-blur-sm"
            onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-medium">
            {currentImage.title || currentImage.fileName}
          </h3>
          {currentImage.description && (
            <p className="mt-1 text-sm text-gray-300">{currentImage.description}</p>
          )}
          {hasMultiple && (
            <p className="mt-1 text-xs text-gray-400">
              {currentIndex + 1} / {images.length}
            </p>
          )}
        </div>
      </div>

     {/* Navigation - Right */}
     {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); handleNavigate(1); }}
          className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-white/20 focus:outline-none"
          aria-label="Next image"
        >
          <ChevronRight size={32} />
        </button>
      )}
    </div>
  );
};

Lightbox.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  images: PropTypes.array.isRequired,
  currentIndex: PropTypes.number,
  onNavigate: PropTypes.func.isRequired,
};

export default Lightbox;
