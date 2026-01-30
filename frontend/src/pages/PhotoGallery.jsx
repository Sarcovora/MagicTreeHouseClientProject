// src/pages/PhotoGallery.jsx
import { useState, useEffect } from "react";
import {
  Image,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle, // For errors
  Upload // For button
} from "lucide-react";
// import storageService from "../services/storageService"; // REMOVE
import apiService from "../services/apiService"; // Keep for later
import { Link } from "react-router-dom"; // Import Link

const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(false); // For lightbox image
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null); // Use index for navigation
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Fetch photos on component mount
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use apiService to get photos
        const photoDocs = await apiService.getPhotos();
        console.log("Fetched photos:", photoDocs)
        setPhotos(photoDocs || []);
      } catch (error) {
        console.error("Error fetching photos:", error);
        setError("Failed to load photos. Please try again.");
        setPhotos([]); // Ensure empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

   // Filter photos based on search term
   // We apply filter directly before rendering map
    const filteredPhotos = photos.filter(
        (photo) =>
        photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Handle photo selection for lightbox
  const openLightbox = (index) => {
     if (index < 0 || index >= filteredPhotos.length) return; // Check index bounds

    setImageLoading(true); // Start loading indicator for lightbox image
    setSelectedPhotoIndex(index);
    setLightboxOpen(true);
  };

   // Close lightbox
   const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedPhotoIndex(null);
  };

  // Handle image load in lightbox
  const handleLightboxImageLoad = () => {
    setImageLoading(false);
  };

   // Navigate lightbox (handles wrapping)
   const navigateLightbox = (direction) => {
      if (selectedPhotoIndex === null || filteredPhotos.length === 0) return;
      setImageLoading(true); // Show loading for next image
      const newIndex = (selectedPhotoIndex + direction + filteredPhotos.length) % filteredPhotos.length;
      setSelectedPhotoIndex(newIndex);
   };

  // Get currently selected photo object for lightbox
  const selectedPhoto = selectedPhotoIndex !== null ? filteredPhotos[selectedPhotoIndex] : null;


  // --- Render Logic ---

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="text-2xl font-bold whitespace-nowrap">
              Photo Gallery
              <span className="ml-3 font-normal text-sm text-gray-500">
                (Click photo to view)
              </span>
            </h1>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search photos..."
                  className="pl-10 p-2 border border-gray-300 rounded-lg w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Link to upload page, pre-selecting 'Photos' category */}
              <Link
                 to="/admin/documents/upload" // Adjust route if needed
                 state={{ defaultCategory: 'Photos' }}
                 className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm"
               >
                <Plus className="w-5 h-5 mr-2" />
                Add Photos
               </Link>
            </div>
          </div>

           {/* General Error Display */}
           {error && (
                <div className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> {error}
                </div>
           )}


          {/* Photo Grid */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
              <h3 className="text-lg font-medium text-gray-700">Loading Photos...</h3>
            </div>
          ) : photos.length === 0 && !searchTerm ? (
              // Initial empty state
             <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-64 text-center">
                <Image size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">Your Photo Gallery is Empty</h3>
                <p className="text-gray-500 mb-6">Upload photos related to your projects to build your gallery.</p>
                <Link
                    to="/admin/documents/upload"
                    state={{ defaultCategory: 'Photos' }}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                >
                    <Upload className="w-5 h-5 mr-2" /> Upload First Photo
                </Link>
            </div>
          ) : filteredPhotos.length > 0 ? (
              // Display filtered photos
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id || index} // Use index as fallback key if id isn't guaranteed yet
                  className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => openLightbox(index)} // Pass index
                >
                  <div className="h-48 relative bg-gray-100">
                    {photo.fileUrl && photo.fileUrl !== '#' ? (
                      <img
                        src={photo.fileUrl}
                        alt={photo.title || photo.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy" // Lazy load images below the fold
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={32} className="text-gray-400" />
                      </div>
                    )}
                     {/* Optional: Overlay on hover */}
                     <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium truncate text-sm" title={photo.title || photo.fileName}>
                      {photo.title || photo.fileName}
                    </h3>
                    {photo.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2" title={photo.description}>
                        {photo.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
             // Empty state when filtering
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-64 text-center">
                <Image size={48} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">No Photos Match Your Search</h3>
                <p className="text-gray-500">Try adjusting your search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 animate-fade-in">
          {/* Close Button */}
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-[52]" // Ensure button is above image
            onClick={closeLightbox}
            title="Close"
          >
            <X size={28} />
          </button>

          {/* Previous Button */}
          {filteredPhotos.length > 1 && (
               <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-[52]"
                onClick={() => navigateLightbox(-1)}
                title="Previous"
               >
                <ChevronLeft size={36} />
               </button>
          )}

          {/* Image Container */}
          <div className="relative flex items-center justify-center w-full h-full max-w-[90vw] max-h-[85vh]">
              {/* Loading Indicator */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-[51]">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
              {/* Image */}
              <img
                src={selectedPhoto.fileUrl}
                alt={selectedPhoto.title || selectedPhoto.fileName}
                className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleLightboxImageLoad}
                 onError={() => setImageLoading(false)} // Stop loading even on error
              />
          </div>

          {/* Next Button */}
          {filteredPhotos.length > 1 && (
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-[52]"
                onClick={() => navigateLightbox(1)}
                title="Next"
              >
                <ChevronRight size={36} />
              </button>
          )}


          {/* Caption */}
          <div className="absolute bottom-4 left-4 right-4 text-center text-white bg-black/30 p-2 rounded z-[51]">
            <h3 className="text-base font-medium mb-1">
              {selectedPhoto.title || selectedPhoto.fileName}
            </h3>
            {selectedPhoto.description && (
              <p className="text-xs text-gray-300 max-w-2xl mx-auto">
                {selectedPhoto.description}
              </p>
            )}
             {filteredPhotos.length > 1 && (
                <p className="text-xs text-gray-400 mt-1">
                    {selectedPhotoIndex + 1} / {filteredPhotos.length}
                </p>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

// Simple fade-in animation for lightbox
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default PhotoGallery;