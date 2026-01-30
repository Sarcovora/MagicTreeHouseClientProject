/**
 * PhotoGallery Page
 *
 * Displays a grid of all project photos with search/filter capabilities.
 * Allows users to view photos in a full-screen lightbox.
 *
 * Features:
 * - Lazy-loaded image grid
 * - Keyword search filter for titles and descriptions
 * - Upload button (redirects to upload page)
 * - Lightbox integration for viewing interactions
 */

import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Image,
  Plus,
  Search,
  AlertCircle, 
  Upload
} from "lucide-react";
import apiService from "../services/apiService";
import Lightbox from "../components/common/Lightbox";

/**
 * Main PhotoGallery Component
 * @returns {JSX.Element} The rendered PhotoGallery page
 */
const PhotoGallery = () => {
  // --- State ---
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  
  // Lightbox State
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // --- Effects ---

  /**
   * Fetch all photos on component mount.
   * This retrieves photos from all projects visible to the user.
   * Aggregates photos from various fields (planting, before, property).
   */
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all projects to aggregate photos
        const allProjects = await apiService.getAllProjects();
        
        // Aggregate all photos from all projects
        const aggregatedPhotos = allProjects.flatMap(project => {
            const projectPhotos = [];
            
            // Helper to add photo
            const add = (url, type, desc) => {
                if (url) projectPhotos.push({
                    id: `${project.id}-${type}-${url}`, // Generate unique ID
                    fileUrl: url,
                    title: `${project.title || project.siteNumber || 'Project'} - ${type}`,
                    description: desc || project.landowner,
                    projectId: project.id
                });
            };

            // Add various photo types
            project?.plantingPhotoUrls?.forEach(url => add(url, 'Planting', 'Planting Photo'));
            project?.beforePhotoUrls?.forEach(url => add(url, 'Before', 'Before Photo'));
            project?.propertyImageUrls?.forEach(url => add(url, 'Property', 'Property Image'));
            
            return projectPhotos;
        });

        console.log(`Aggregated ${aggregatedPhotos.length} photos from projects`);
        setPhotos(aggregatedPhotos);

      } catch (error) {
        console.error("Error fetching photos:", error);
        setError("Failed to load photos. Please try again.");
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

  // --- Computed Values ---

  /**
   * Filter photos based on search term.
   * Memoized to prevent re-filtering on every render.
   * Checks title, description, and raw filename.
   */
  const filteredPhotos = useMemo(() => {
    if (!searchTerm) return photos;
    
    const lowerTerm = searchTerm.toLowerCase();
    return photos.filter((photo) =>
      photo.title?.toLowerCase().includes(lowerTerm) ||
      photo.description?.toLowerCase().includes(lowerTerm) ||
      photo.fileName?.toLowerCase().includes(lowerTerm)
    );
  }, [photos, searchTerm]);

  // --- Handlers ---

  /**
   * Opens the lightbox at the specified index.
   * @param {number} index - Index of the photo in the filtered list
   */
  const openLightbox = (index) => {
    if (index >= 0 && index < filteredPhotos.length) {
      setSelectedPhotoIndex(index);
      setLightboxOpen(true);
    }
  };

  /**
   * Closes the lightbox and resets selection.
   */
  const closeLightbox = () => {
    setLightboxOpen(false);
    setSelectedPhotoIndex(null);
  };

  /**
   * Handles navigation within the lightbox.
   * @param {number} newIndex - The new index to display
   */
  const handleNavigateLightbox = (newIndex) => {
    setSelectedPhotoIndex(newIndex);
  };

  // --- Render ---

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-7xl">
          
          {/* Header Section */}
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h1 className="whitespace-nowrap text-2xl font-bold">
              Photo Gallery
              <span className="ml-3 text-sm font-normal text-gray-500">
                (Click photo to view)
              </span>
            </h1>

            {/* Actions: Search & Upload */}
            <div className="flex w-full flex-col space-y-2 sm:w-auto sm:flex-row sm:space-x-4 sm:space-y-0">
              <div className="relative flex-grow">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search photos..."
                  className="w-full rounded-lg border border-gray-300 p-2 pl-10 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Upload Button */}
              <Link
                to="/admin/documents/upload"
                state={{ defaultCategory: 'Photos' }}
                className="flex items-center justify-center whitespace-nowrap rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Photos
              </Link>
            </div>
          </div>

          {/* Feedback: Error */}
          {error && (
            <div className="mb-4 flex items-center justify-center rounded-lg bg-red-100 p-3 text-center text-red-500">
              <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" /> 
              {error}
            </div>
          )}

          {/* Content Area */}
          {loading ? (
            // Loading State
            <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-white p-8 shadow-sm">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-600"></div>
              <h3 className="text-lg font-medium text-gray-700">Loading Photos...</h3>
            </div>
          ) : photos.length === 0 && !searchTerm ? (
            // Empty State
            <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-sm">
              <Image size={48} className="mb-4 text-gray-400" />
              <h3 className="mb-2 text-xl font-medium text-gray-700">Your Photo Gallery is Empty</h3>
              <p className="mb-6 text-gray-500">Upload photos related to your projects to build your gallery.</p>
              <Link
                to="/admin/documents/upload" // Ensure this route exists or redirect correctly
                state={{ defaultCategory: 'Photos' }}
                className="flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              >
                <Upload className="mr-2 h-5 w-5" /> 
                Upload First Photo
              </Link>
            </div>
          ) : filteredPhotos.length > 0 ? (
            // Photo Grid
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id || index}
                  className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
                  onClick={() => openLightbox(index)}
                >
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={photo.fileUrl}
                      alt={photo.title || "Photo"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 group-hover:bg-opacity-20"></div>
                  </div>
                  
                  <div className="p-3">
                    <h3 className="truncate text-sm font-medium" title={photo.title}>
                      {photo.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500" title={photo.description}>
                      {photo.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // No Search Results
            <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-sm">
              <Image size={48} className="mb-4 text-gray-400" />
              <h3 className="mb-2 text-xl font-medium text-gray-700">No Photos Match Your Search</h3>
              <p className="text-gray-500">Try adjusting your search term.</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Overlay */}
      <Lightbox
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        images={filteredPhotos}
        currentIndex={selectedPhotoIndex}
        onNavigate={handleNavigateLightbox}
      />
    </div>
  );
};

export default PhotoGallery;