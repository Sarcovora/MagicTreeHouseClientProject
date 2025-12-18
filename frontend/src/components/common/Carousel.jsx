// src/components/common/Carousel.jsx
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Lightweight image carousel that keeps controls inside the frame and
 * centers pagination dots under the media. Designed for project detail view
 * but reusable anywhere we need a simple slider.
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

  // Reset when the slide set changes (e.g., navigating to a different project).
  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length]);

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
        <img
          src={slides[activeIndex]}
          alt={`carousel slide ${activeIndex + 1}`}
          className={`h-full w-full object-cover ${onImageClick ? "cursor-pointer" : ""} ${imageClassName}`}
          onClick={onImageClick ? handleImageClick : undefined}
        />

        {showArrows && slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow-md transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className={`h-2.5 w-2.5 rounded-full transition ${
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
