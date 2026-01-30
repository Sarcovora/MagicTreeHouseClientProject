// src/pages/Map.jsx
import { useState, useEffect, useRef } from "react";
import { MapPin, Image, Plus, Search, MessageCircle, AlertCircle, X } from "lucide-react";
import apiService from "../services/apiService";
import { Link } from "react-router-dom";

const Map = () => {
  const [selectedMap, setSelectedMap] = useState(null);
  const [maps, setMaps] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true); // For initial map list loading
  const [loadingComments, setLoadingComments] = useState(false);
  const [imageLoading, setImageLoading] = useState(false); // For selected map image
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newCommentPosition, setNewCommentPosition] = useState({ x: 0, y: 0 });
  const [newCommentText, setNewCommentText] = useState("");
  const mapImageRef = useRef(null);

  // Fetch maps on component mount
  useEffect(() => {
    const fetchMaps = async () => {
      setLoading(true); // Start loading indicator
      setError(null);
      setMaps([]); // Clear previous maps
      setSelectedMap(null); // Clear selected map
      try {
        const mapDocs = await apiService.getMaps();
        console.log("Fetched maps:", mapDocs);
        setMaps(mapDocs || []);

        if (mapDocs && mapDocs.length > 0) {
          // Automatically select the first map
          handleMapSelect(mapDocs[0]); // This will trigger image loading
        }
        // *** Set loading to false AFTER attempting to fetch and process maps ***
        setLoading(false);

      } catch (error) {
        console.error("Error fetching maps:", error);
        setError("Failed to load maps. Please try again.");
        setMaps([]);
        setLoading(false); // Also stop loading on error
      }
      // Removed finally block
    };

    fetchMaps();
  }, []); // Run once on mount

  // Load comments for a specific map
  const loadCommentsForMap = async (mapId) => {
    if (!mapId) return;
    setLoadingComments(true);
    setCommentError(null);
    try {
      const mapComments = await apiService.getMapComments(mapId);
      setComments(mapComments || []);
    } catch (error) {
      console.error(`Error fetching comments for map ${mapId}:`, error);
      setCommentError("Could not load comments for this map.");
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  // Handle map selection from the list
  const handleMapSelect = (map) => {
    if (!map || map.id === selectedMap?.id) return; // Prevent re-selecting same map unnecessarily
    setImageLoading(true); // Start loading indicator for the specific map image
    setSelectedMap(map);
    setComments([]); // Clear previous comments
    loadCommentsForMap(map.id); // Fetch comments for the new map
  };

  // Handle map click for adding comments
  const handleMapClick = (e) => {
    if (!selectedMap || imageLoading || !mapImageRef.current) return;
    const rect = mapImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setNewCommentPosition({ x, y });
    setNewCommentText("");
    setShowCommentModal(true);
  };

  // Handle submitting a new comment
  const handleAddComment = async () => {
     if (!newCommentText.trim() || !selectedMap) return;
     const commentData = { x: newCommentPosition.x, y: newCommentPosition.y, text: newCommentText, author: "Current User" }; // Placeholder author
     try {
         const addedComment = await apiService.addMapComment(selectedMap.id, commentData);
         setComments(prevComments => [...prevComments, addedComment]);
         setShowCommentModal(false);
         setNewCommentText("");
     } catch (error) { console.error("Error adding comment:", error); alert("Failed to add comment. Please try again."); }
  };

  // Handle image load event for the selected map
  const handleImageLoad = () => {
    console.log("Map image loaded:", selectedMap?.title);
    setImageLoading(false); // Stop the image-specific loading indicator
  };

  // Handle image error event
  const handleImageError = (e) => {
    console.error("Failed to load map image:", selectedMap?.fileUrl, e);
    setImageLoading(false);
  };

  // Format date
  const formatDate = (timestamp) => { /* ... (same as before) ... */
    if (!timestamp) return "";
    try {
        const date = new Date(timestamp);
        return date.toLocaleString("en-US", { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return "Invalid Date"; }
  };

  // Filter maps based on search term
  const filteredMaps = maps.filter( map =>
      map.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      map.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDER LOGIC ---

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-8"> {/* Ensure consistent padding */}
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="text-2xl font-bold whitespace-nowrap">Property Maps</h1>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search maps..." className="pl-10 p-2 border border-gray-300 rounded-lg w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div>
              <Link to="/admin/documents/upload" state={{ defaultCategory: 'Property Maps' }} className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm"><Plus className="w-5 h-5 mr-2" />Add New Map</Link>
            </div>
          </div>

          {/* General Error */}
          {error && (<div className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-lg flex items-center justify-center"><AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> {error}</div>)}

          {/* Main Content Area */}
          {loading ? (
              // Initial Loading State for the whole map section
               <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-[calc(100vh-18rem)]"> {/* Adjust height */}
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mb-4"></div>
                 <h3 className="text-lg font-medium text-gray-700">Loading Maps...</h3>
               </div>
           ) : maps.length === 0 && !searchTerm ? (
               // Empty state when no maps exist
                <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-[calc(100vh-18rem)] text-center">
                    <MapPin size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Maps Found</h3>
                    <p className="text-gray-500 mb-6">Upload a property map document to get started.</p>
                     <Link to="/admin/documents/upload" state={{ defaultCategory: 'Property Maps' }} className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"><Plus className="w-5 h-5 mr-2" />Add New Map</Link>
                </div>
           ) : (
             // Display Map List and Selected Map View
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Map List */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-4 self-start">
                <h2 className="font-bold text-lg mb-4">Available Maps</h2>
                {filteredMaps.length > 0 ? (
                  <div className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto"> {/* Adjusted max-height */}
                    {filteredMaps.map((map) => (
                      <div key={map.id} className={`p-3 rounded-lg cursor-pointer transition-colors border border-transparent ${selectedMap?.id === map.id ? "bg-green-50 border-l-4 border-green-500" : "hover:bg-gray-50 hover:border-gray-200"}`} onClick={() => handleMapSelect(map)} title={map.description || map.title}>
                        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0"><Image size={20} className="text-gray-500" /></div><div className="overflow-hidden"><h3 className="font-medium text-sm truncate">{map.title}</h3><p className="text-xs text-gray-500 truncate">{map.description || "No description"}</p></div></div>
                      </div>
                    ))}
                  </div>
                ) : ( <p className="text-gray-500 text-center py-4 text-sm">{searchTerm ? "No maps match search." : "No maps available."}</p> )}
              </div>

              {/* Map Display Area */}
              <div className="lg:col-span-3">
                {selectedMap ? (
                  // Selected Map View
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <h2 className="font-bold text-xl mb-4">{selectedMap.title}</h2>
                    {/* Map Image Container */}
                    <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 cursor-crosshair" style={{ minHeight: "400px", maxHeight: "70vh" }} onClick={handleMapClick}>
                      {/* Image Loading Spinner (for selected image) */}
                      {imageLoading && (<div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600"></div></div>)}
                      {/* The Image Itself */}
                      {selectedMap.fileUrl && selectedMap.fileUrl !== '#' ? (<img ref={mapImageRef} src={selectedMap.fileUrl} alt={selectedMap.title} className={`w-full h-full object-contain transition-opacity duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`} onLoad={handleImageLoad} onError={handleImageError}/>) : (<div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-4"><Image size={48} className="text-gray-400 mb-4" /><p className="text-gray-600 font-medium">Map Image Not Available</p><p className="text-sm text-gray-500">Could not load the image for this map.</p></div>)}
                      {/* Comment Markers */}
                      {!imageLoading && comments.map((comment) => (<div key={comment.id} className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group" style={{ left: `${comment.x}%`, top: `${comment.y}%`, zIndex: 5 }} title={`Comment by ${comment.author}`}><MessageCircle size={20} className="text-yellow-600 fill-yellow-400 drop-shadow-md group-hover:scale-110 transition-transform" /><div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none min-w-[150px] max-w-[250px]">{comment.text}<div className="text-[10px] text-gray-400 mt-1">{comment.author} - {formatDate(comment.timestamp)}</div></div></div>))}
                    </div>
                    {/* Comments Section */}
                    <div className="mt-6">
                      <h3 className="font-medium text-lg mb-3 flex items-center"><MessageCircle size={18} className="mr-2 text-gray-600"/> Comments ({comments.length}){loadingComments && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-500 ml-2"></div>}</h3>
                      {commentError && <div className="mb-2 text-sm text-red-500 bg-red-50 p-2 rounded">{commentError}</div>}
                      <div className="max-h-60 overflow-y-auto border rounded-md divide-y divide-gray-100 bg-gray-50">
                        {comments.length > 0 ? ( comments.map((comment) => (<div key={comment.id} className="p-3"><div className="flex justify-between items-start mb-1"><p className="font-medium text-sm">{comment.author || 'Anonymous'}</p><span className="text-xs text-gray-500">{formatDate(comment.timestamp)}</span></div><p className="text-gray-700 text-sm">{comment.text}</p></div>)) ) : ( <p className="text-gray-500 p-4 text-center text-sm">{loadingComments ? "Loading comments..." : "No comments yet. Click on the map to add one."}</p> )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Placeholder when no map is selected but maps exist
                  <div className="bg-white rounded-lg shadow-sm p-8 flex flex-col items-center justify-center h-[calc(100vh-18rem)] text-center">
                    <MapPin size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">{filteredMaps.length > 0 ? "Select a Map" : "No Maps Found"}</h3>
                    <p className="text-gray-500">{filteredMaps.length > 0 ? "Choose a map from the list on the left." : (searchTerm ? "No maps match search." : "Upload a map document.")}</p>
                  </div>
                )}
              </div>
            </div>
            )}
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && ( /* ... (Modal JSX remains the same) ... */
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
             <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold">Add Comment</h3><button onClick={() => setShowCommentModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button></div>
                <p className="text-sm text-gray-500 mb-3">Adding comment at position ({newCommentPosition.x.toFixed(1)}%, {newCommentPosition.y.toFixed(1)}%)</p>
                <textarea className="w-full p-2 border border-gray-300 rounded-lg mb-1 h-24 focus:ring-green-500 focus:border-green-500" placeholder="Enter your comment here..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} maxLength={500} rows={3}></textarea>
                <div className="text-xs text-gray-500 text-right mb-3">{newCommentText.length}/500 characters</div>
                <div className="flex justify-end space-x-3"><button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm" onClick={() => setShowCommentModal(false)}>Cancel</button><button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:bg-gray-400" onClick={handleAddComment} disabled={!newCommentText.trim()}>Add Comment</button></div>
             </div>
          </div>
       )}
    </div>
  );
};

export default Map;