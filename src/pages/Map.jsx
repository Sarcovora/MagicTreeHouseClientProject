import { useState, useEffect } from "react";
import { MapPin, Image, Plus, Search, MessageCircle } from "lucide-react";
import Sidebar from "../components/layouts/SideBar";
import storageService from "../services/storageService";

/**
 * Map page component for displaying property maps with comments
 */
const Map = () => {
  const [selectedMap, setSelectedMap] = useState(null);
  const [maps, setMaps] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newCommentPosition, setNewCommentPosition] = useState({ x: 0, y: 0 });
  const [newCommentText, setNewCommentText] = useState("");

  // Fetch maps on component mount
  useEffect(() => {
    const fetchMaps = async () => {
      try {
        setLoading(true);
        // Get documents with category "Property Maps" - now returns a promise
        const docs = await storageService.getDocuments("Property Maps");
        console.log("Fetched maps with URLs:", docs);

        setMaps(docs);

        // Select the first map by default if available
        if (docs.length > 0) {
          setSelectedMap(docs[0]);
          loadCommentsForMap(docs[0].id);
        }
      } catch (error) {
        console.error("Error fetching maps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaps();

    // Clean up blob URLs on unmount
    return () => {
      maps.forEach((map) => {
        if (map.fileUrl?.startsWith("blob:")) {
          URL.revokeObjectURL(map.fileUrl);
        }
      });
    };
  }, []);

  // Load comments for a specific map
  const loadCommentsForMap = (mapId) => {
    // Implementation for loading comments
    // This would typically fetch from a database or local storage
    const mapComments = []; // Replace with actual comment loading logic
    setComments(mapComments);
  };

  // Handle map selection
  const handleMapSelect = (map) => {
    setImageLoading(true);
    setSelectedMap(map);
    loadCommentsForMap(map.id);
  };

  // Handle map click for adding comments
  const handleMapClick = (e) => {
    // Get click position relative to the map container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNewCommentPosition({ x, y });
    setShowCommentModal(true);
  };

  // Handle image load event
  const handleImageLoad = () => {
    console.log("Image loaded successfully:", selectedMap?.title);
    setImageLoading(false);
  };

  // Handle image error event
  const handleImageError = () => {
    console.error("Failed to load image:", selectedMap);
    setImageLoading(false);
  };

  // Format date for comment timestamps
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Filter maps based on search term
  const filteredMaps = maps.filter(
    (map) =>
      map.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      map.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Property Maps</h1>

            <div className="flex space-x-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search maps..."
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
                Add New Map
              </a>
            </div>
          </div>

          {!loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Map List - Left Sidebar */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4">
                <h2 className="font-bold text-lg mb-4">Available Maps</h2>

                {filteredMaps.length > 0 ? (
                  <div className="space-y-2">
                    {filteredMaps.map((map) => (
                      <div
                        key={map.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMap?.id === map.id
                            ? "bg-gray-100 border-l-4 border-gray-600"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleMapSelect(map)}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center mr-3">
                            <Image size={20} className="text-gray-500" />
                          </div>
                          <div>
                            <h3 className="font-medium">{map.title}</h3>
                            <p className="text-sm text-gray-500 truncate">
                              {map.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No maps found
                  </p>
                )}
              </div>

              {/* Map Display - Right Content */}
              <div className="lg:col-span-3">
                {selectedMap ? (
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="font-bold text-xl mb-4">
                      {selectedMap.title}
                    </h2>

                    {/* Map Container - Simple Image Display */}
                    <div
                      className="relative rounded-lg overflow-hidden"
                      style={{ height: "calc(100vh - 16rem)" }}
                      onClick={handleMapClick}
                    >
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600"></div>
                        </div>
                      )}

                      {selectedMap.fileUrl ? (
                        <img
                          src={selectedMap.fileUrl}
                          alt={selectedMap.title}
                          className="w-full h-full object-contain"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-white">
                          <Image size={64} className="text-gray-400 mb-4" />
                          <p className="text-gray-600">
                            Map image not available
                          </p>
                        </div>
                      )}

                      {/* Map Comments */}
                      {comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="absolute cursor-pointer"
                          style={{
                            left: `${comment.x}%`,
                            top: `${comment.y}%`,
                          }}
                          title={comment.text}
                        >
                          <div className="relative">
                            <MessageCircle
                              size={24}
                              className="text-gray-600 fill-yellow-400"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comments Section */}
                    <div className="mt-4">
                      <h3 className="font-medium text-lg mb-2">
                        Comments ({comments.length})
                      </h3>
                      <div className="max-h-60 overflow-y-auto">
                        {comments.length > 0 ? (
                          comments.map((comment) => (
                            <div
                              key={comment.id}
                              className="p-3 border-b border-gray-100"
                            >
                              <div className="flex justify-between items-start">
                                <p className="font-medium">{comment.author}</p>
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.timestamp)}
                                </span>
                              </div>
                              <p className="text-gray-700 mt-1">
                                {comment.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 p-3">
                            No comments yet. Click on the map to add a comment.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                    <MapPin size={64} className="text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                      No Map Selected
                    </h3>
                    <p className="text-gray-500 text-center">
                      Select a map from the list or upload a new one to get
                      started.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 mb-4"></div>
              <h3 className="text-xl font-medium text-gray-700">
                Loading Maps...
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add Comment</h3>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg mb-4 h-32"
              placeholder="Enter your comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            ></textarea>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setShowCommentModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-gray-600 text-white rounded-lg"
                onClick={() => {
                  // Implementation for adding comment
                  setShowCommentModal(false);
                }}
              >
                Add Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
