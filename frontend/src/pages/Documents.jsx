// src/pages/Documents.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Search, Filter } from "lucide-react";
import DocumentCard from "../components/documents/DocumentCard";
// import storageService from "../services/storageService"; // REMOVE
// import { DOCUMENT_CATEGORIES } from "../config/constants"; // REMOVE
// import { documentService } from "../services/documentService"; // REMOVE
import apiService from "../services/apiService"; // Keep this for later use

// Define categories directly here for now
const DOCUMENT_CATEGORIES = [
    "Property Maps",
    "Carbon Credit Agreements",
    "Applications",
    "Quiz Results",
    "Planting Reports",
    "Other",
];

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true); // Keep loading state
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Documents");
  // Comment out upload state for now, will be handled via apiService later
  // const [uploadProgress, setUploadProgress] = useState(0);
  // const [isUploading, setIsUploading] = useState(false);
  // const [uploadError, setUploadError] = useState(null);

  const categories = ["All Documents", ...DOCUMENT_CATEGORIES];

  // Fetch documents using apiService (placeholder for now)
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use apiService - apply filters locally for now
        const allDocs = await apiService.getDocuments(); // Get all docs
        let filteredDocs = allDocs;
        if (selectedCategory !== "All Documents") {
            filteredDocs = allDocs.filter(doc => doc.category === selectedCategory);
        }
         // Apply search term filtering locally
         if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filteredDocs = filteredDocs.filter(doc =>
                doc.title?.toLowerCase().includes(term) ||
                doc.description?.toLowerCase().includes(term) ||
                doc.fileName?.toLowerCase().includes(term) ||
                doc.landowner?.toLowerCase().includes(term)
            );
        }

        setDocuments(filteredDocs || []);
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError("Failed to load documents. Please try again.");
        setDocuments([]); // Ensure array on error
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
    // Re-fetch when category or search term changes
  }, [selectedCategory, searchTerm]);


  // Comment out upload/delete handlers for now - they relied on removed services
   const handleDeleteDocument = async (documentId) => {
     console.log("Attempting to delete document:", documentId);
      try {
          setLoading(true); // Indicate activity
          await apiService.deleteDocument(documentId);
          // Refresh list after delete
          setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
      } catch (err) {
          console.error("Error deleting document:", err);
          setError("Failed to delete document."); // Show error feedback
      } finally {
          setLoading(false);
      }
   };

  /*
  const handleFileUpload = async (file, category) => {
    // ... implementation removed for now ...
  };
  */


  // Filter documents locally (already done in useEffect)
   const filteredDocuments = documents; // State already holds filtered data

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Documents</h1>

            {/* Link to upload page - functionality TBD */}
            {/* Make sure the route /documents/upload exists or adjust */}
             <Link
               to="/admin/documents/upload" // Assuming admin route context
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Attach New Document
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative md:w-64">
                <Filter
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <select
                  className="w-full pl-10 p-2 border border-gray-300 rounded-lg appearance-none bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

           {/* Error Message */}
           {error && <div className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</div>}


          {/* Documents Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDelete={handleDeleteDocument} // Pass the delete handler
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText size={48} />
              <p className="mt-4 text-lg">
                 {searchTerm || selectedCategory !== "All Documents" ? "No documents match your criteria" : "No documents found"}
              </p>
              <p className="mt-2">
                 {!(searchTerm || selectedCategory !== "All Documents") ? "Upload a document to get started" : ""}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comment out upload progress indicators for now */}
      {/*
      {isUploading && (
        // ... progress indicator ...
      )}
      {uploadError && (
        // ... error indicator ...
      )}
      */}
    </div>
  );
};

export default Documents;