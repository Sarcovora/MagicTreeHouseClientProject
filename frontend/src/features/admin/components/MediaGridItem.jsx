import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { isImage } from "../utils/projectHelpers";

/**
 * MediaGridItem - Displays a single media item (photo or file) in a grid
 * 
 * Renders images with a clickable lightbox preview, or a download link for non-image files.
 * Handles image loading errors gracefully by falling back to file download display.
 * 
 * @param {object} props
 * @param {string|object} props.photo - Photo URL (string) or photo object with { url, thumbnail }
 * @param {number} props.idx - Index for accessibility labels
 * @param {function} props.openLightbox - Callback to open image in lightbox viewer
 */
const MediaGridItem = ({ photo, idx, openLightbox }) => {
  const [hasError, setHasError] = useState(false);
  
  // Extract URL and thumbnail from photo (supports both string and object formats)
  const url = typeof photo === 'string' ? photo : photo.url;
  const thumbnail = typeof photo === 'string' ? photo : (photo.thumbnail || photo.url);
  const isImg = !hasError && isImage(url);

  // Render image with lightbox if it's an image
  if (isImg) {
    return (
      <div
        className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
        onClick={() => openLightbox(url)}
      >
        <img
          src={thumbnail}
          alt={`Planting or before photo ${idx + 1}`}
          className="h-24 w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // Render download link for non-image files
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      download
      className="flex h-24 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-2 text-center text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
    >
      <FileText className="mb-1 h-8 w-8 text-gray-400" />
      <div className="flex items-center text-xs font-medium">
        <Download className="mr-1 h-3 w-3" />
        Download
      </div>
    </a>
  );
};

export default MediaGridItem;
