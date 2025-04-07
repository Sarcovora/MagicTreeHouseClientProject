import { useState, useEffect } from "react";
import {
  Image,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../components/layouts/SideBar";
import storageService from "../services/storageService";

/**
 * Photo Gallery component for displaying property images
 */
const PhotoGallery = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Fetch photos on component mount
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        // Get documents with image file types
        const docs = storageService.getDocuments();
        const imageFiles = docs.filter(
          (doc) =>
            doc.fileType?.startsWith("image/") &&
            doc.category !== "Property Maps" // Exclude maps
        );
        setPhotos(imageFiles);
      } catch (error) {
        console.error("Error fetching photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // Handle photo selection for lightbox
  const openLightbox = (photo) => {
    setImageLoading(true);
    setSelectedPhoto(photo);
    setLightboxOpen(true);
  };

  // Handle image load in lightbox
  const handleLightboxImageLoad = () => {
    setImageLoading(false);
  };

  // Navigate to next photo in lightbox
  const nextPhoto = () => {
    setImageLoading(true);
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[nextIndex]);
  };

  // Navigate to previous photo in lightbox
  const prevPhoto = () => {
    setImageLoading(true);
    const currentIndex = photos.findIndex((p) => p.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[prevIndex]);
  };

  // Filter photos based on search term
  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Photo Gallery</h1>

            <div className="flex space-x-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search photos..."
                  className="pl-10 p-2 border border-gray-300 rounded-lg w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <a
                href="/documents/upload"
                className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Photos
              </a>
            </div>
          </div>

          {!loading ? (
            filteredPhotos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => openLightbox(photo)}
                  >
                    <div className="h-48 relative">
                      {photo.fileUrl ? (
                        <img
                          src={photo.fileUrl}
                          alt={photo.title || photo.fileName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <Image size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium truncate">
                        {photo.title || photo.fileName}
                      </h3>
                      {photo.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-64">
                <Image size={64} className="text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Photos Found
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  Upload photos to start building your gallery.
                </p>
                <a
                  href="/documents/upload"
                  className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Upload Photos
                </a>
              </div>
            )
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mb-4"></div>
              <h3 className="text-xl font-medium text-gray-700">
                Loading Photos...
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button
            className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={() => setLightboxOpen(false)}
          >
            <X size={24} />
          </button>

          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={prevPhoto}
          >
            <ChevronLeft size={32} />
          </button>

          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}

          <img
            src={selectedPhoto.fileUrl}
            alt={selectedPhoto.title || selectedPhoto.fileName}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onLoad={handleLightboxImageLoad}
          />

          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-gray-800"
            onClick={nextPhoto}
          >
            <ChevronRight size={32} />
          </button>

          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            <h3 className="text-xl font-medium">
              {selectedPhoto.title || selectedPhoto.fileName}
            </h3>
            {selectedPhoto.description && (
              <p className="text-gray-300 mt-2 max-w-2xl mx-auto">
                {selectedPhoto.description}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoGallery;
