// src/components/common/Carousel.jsx
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight, File, Download } from "lucide-react";

/**
 * Carousel - Lightweight image carousel with preloading for smooth navigation
 * 
 * Preloads adjacent images to eliminate delay when navigating.
 * Falls back to a "Preview not available" state for failed/non-image files.
 * 
 * @param {object} props
 * @param {string[]} props.images - Array of image URLs to display
 * @param {string} [props.className] - Additional CSS classes for the outer container
 * @param {string} [props.imageClassName] - Additional CSS classes for the image element
 * @param {string} [props.rounded="rounded-lg"] - Tailwind rounded class for corners
 * @param {string} [props.shadow="shadow-sm"] - Tailwind shadow class
 * @param {string} [props.aspectClass="aspect-video"] - Aspect ratio class for the container
 * @param {boolean} [props.showDots=true] - Whether to show navigation dots below carousel
 * @param {boolean} [props.showArrows=true] - Whether to show left/right arrow buttons
 * @param {function} [props.onImageClick] - Callback(imageUrl) when an image is clicked
 */
const Carousel = ({
  images,
  className = "",
  imageClassName = "",
  rounded = "rounded-lg",
  shadow = "shadow-sm",
  aspectClass = "aspect-video",
  showDots = true,
  showArrows = true,
  onImageClick,
}) => {
  const slides = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [failedSlides, setFailedSlides] = useState(new Set());
  const [loadedSlides, setLoadedSlides] = useState(new Set());

  // Reset when the slide set changes
  useEffect(() => {
    setActiveIndex(0);
    setFailedSlides(new Set());
    setLoadedSlides(new Set());
  }, [slides.length, slides]);

  // Preload adjacent images for smooth navigation
  useEffect(() => {
    if (slides.length <= 1) return;

    const preloadIndices = [
      (activeIndex - 1 + slides.length) % slides.length,
      activeIndex,
      (activeIndex + 1) % slides.length,
      (activeIndex + 2) % slides.length, // Preload 2 ahead for faster scrolling
    ];

    preloadIndices.forEach((idx) => {
      if (!loadedSlides.has(idx) && !failedSlides.has(idx)) {
        const img = new Image();
        img.src = slides[idx];
        img.onload = () => {
          setLoadedSlides((prev) => new Set(prev).add(idx));
        };
      }
    });
  }, [activeIndex, slides, loadedSlides, failedSlides]);

  const handleImageError = (index) => {
    setFailedSlides((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  };

  const handleImageLoad = (index) => {
    setLoadedSlides((prev) => new Set(prev).add(index));
  };

  if (slides.length === 0) {
    return null;
  }

  const goTo = (index) => {
    const nextIndex = (index + slides.length) % slides.length;
    setActiveIndex(nextIndex);
  };

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(slides[activeIndex]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`${rounded} ${shadow} overflow-hidden bg-gray-100 ${aspectClass}`}
      >
        {failedSlides.has(activeIndex) ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-500">
            <File className="mb-2 h-12 w-12 opacity-50" />
            <p className="text-sm font-medium">Preview not available</p>
            <a
              href={slides[activeIndex]}
              target="_blank"
              rel="noreferrer"
              download
              className="mt-4 flex items-center rounded-lg bg-white px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-gray-50"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="mr-2 h-4 w-4" />
              Download File
            </a>
          </div>
        ) : (
          <img
            key={activeIndex} // Force re-render for immediate display
            src={slides[activeIndex]}
            alt={`carousel slide ${activeIndex + 1}`}
            className={`h-full w-full object-cover ${
              onImageClick ? "cursor-pointer" : ""
            } ${imageClassName}`}
            onClick={onImageClick ? handleImageClick : undefined}
            onError={() => handleImageError(activeIndex)}
            onLoad={() => handleImageLoad(activeIndex)}
            loading="eager" // Prioritize current image
          />
        )}

        {showArrows && slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-colors duration-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 active:scale-95"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition-colors duration-100 hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500 active:scale-95"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {showDots && slides.length > 1 && (
        <div className="mt-3 flex items-center justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2.5 w-2.5 rounded-full transition-colors duration-100 ${
                activeIndex === index
                  ? "bg-green-600"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Show image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

Carousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  imageClassName: PropTypes.string,
  rounded: PropTypes.string,
  shadow: PropTypes.string,
  aspectClass: PropTypes.string,
  showDots: PropTypes.bool,
  showArrows: PropTypes.bool,
  onImageClick: PropTypes.func,
};

export default Carousel;

