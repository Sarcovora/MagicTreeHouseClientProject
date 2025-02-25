import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Search, Filter } from "lucide-react";
import Sidebar from "../components/layouts/SideBar";
import DocumentCard from "../components/documents/DocumentCard";
import storageService from "../services/storageService";
import { DOCUMENT_CATEGORIES } from "../config/constants";

/**
 * Documents page component for displaying and managing documents
 */
const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Documents");

  // Categories for document filtering - moved to a constant that could be imported
  const categories = ["All Documents", ...DOCUMENT_CATEGORIES];

  // Fetch documents on component mount and when category changes
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const docs = storageService.getDocuments(selectedCategory);
        setDocuments(docs);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [selectedCategory]);

  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    try {
      await storageService.deleteDocument(documentId);
      // Update the documents list after deletion
      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc.id !== documentId)
      );
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // Filter documents based on search term
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.landowner?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />

      <div className="flex-1 p-8">
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
    </div>
  );
};

export default Documents;
