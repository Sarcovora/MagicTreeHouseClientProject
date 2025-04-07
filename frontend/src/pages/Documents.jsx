import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Search, Filter } from "lucide-react";
import DocumentCard from "../components/documents/DocumentCard";
import storageService from "../services/storageService";
import { DOCUMENT_CATEGORIES } from "../config/constants";
import { documentService } from "../services/documentService";

/**
 * Documents page component for displaying and managing documents
 */
const Documents = () => {
  const [documents, setDocuments] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Documents");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Categories for document filtering - moved to a constant that could be imported
  const categories = ["All Documents", ...DOCUMENT_CATEGORIES];

  // Fetch documents on component mount and when category changes
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const docs = await storageService.getDocuments(selectedCategory);
        console.log("Fetched documents:", docs); // Debug log
        setDocuments(docs || []); // Ensure we always set an array
      } catch (err) {
        console.error("Error fetching documents:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [selectedCategory]);

  const handleFileUpload = async (file, category) => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // File validation
      if (!file) throw new Error("No file selected");
      if (file.size > 10 * 1024 * 1024)
        throw new Error("File size exceeds 10MB limit");

      // Upload with progress tracking
      await documentService.uploadDocument(file, category, (progress) => {
        setUploadProgress(progress);
      });

      // Refresh document list after successful upload
      const newDocs = await documentService.getDocuments(selectedCategory);
      setDocuments(newDocs);

      // Reset states
      setUploadProgress(0);
      setIsUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message);
      setIsUploading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!documents) return <div>No documents found</div>;

  // Now documents is guaranteed to be an array
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.landowner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <h1 className="text-2xl font-bold mb-4 md:mb-0">Documents</h1>

            <Link
              to="/documents/upload"
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
                  onDelete={handleDeleteDocument}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText size={48} />
              <p className="mt-4 text-lg">No documents found</p>
              <p className="mt-2">Upload a document to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Add upload progress indicator */}
      {isUploading && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="w-full bg-gray-200 rounded-full">
            <div
              className="bg-green-500 rounded-full h-2"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm mt-2">Uploading: {uploadProgress}%</p>
        </div>
      )}

      {/* Show upload error if any */}
      {uploadError && (
        <div className="fixed top-4 right-4 bg-red-100 text-red-700 p-4 rounded-lg">
          {uploadError}
        </div>
      )}
    </div>
  );
};

export default Documents;
