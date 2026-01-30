import { useRef } from "react";

/**
 * PhotoUploadButton - Reusable button for uploading photos
 * 
 * Displays a styled upload button with hidden file input.
 * Accepts images and zip files, with loading state during upload.
 * 
 * @param {object} props
 * @param {string} props.label - Button text to display
 * @param {string} props.slotKey - Key identifying the upload slot (e.g., "plantingPhotos")
 * @param {function} props.onUpload - Callback with (slotKey, file) when file is selected
 * @param {boolean} props.isUploading - Loading state during upload
 */
const PhotoUploadButton = ({ label, slotKey, onUpload, isUploading }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await onUpload(slotKey, selectedFile);
    }
    // Clear input so same file can be selected again
    event.target.value = "";
  };

  return (
    <div className="flex">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`inline-flex items-center justify-center rounded-full border border-green-600/30 bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-green-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 ${
          isUploading
            ? "cursor-not-allowed opacity-70"
            : "hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md active:translate-y-0"
        }`}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : label}
      </button>
      
      {/* Hidden file input for accessibility */}
      <input
        type="file"
        accept="image/*,.zip,application/zip,application/x-zip-compressed"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
};

export default PhotoUploadButton;
