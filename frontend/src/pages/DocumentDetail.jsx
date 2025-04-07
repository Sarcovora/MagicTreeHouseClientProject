import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Maximize,
  Download,
  FileText,
} from "lucide-react";
import Sidebar from "../components/layouts/AdminSidebar";
import storageService from "../services/storageService";
import UserAvatar from "../components/common/UserAvatar";

/**
 * Document detail page showing document preview and associated members
 */
const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mock collaborators data - in a real app, this would come from your backend
  const [collaborators, setCollaborators] = useState([
    {
      id: 1,
      name: "Jane Doe",
      role: "Landowner",
      email: "jane.doe@example.com",
      phone: "+1 (555) 123-4567",
      avatar: null,
    },
    {
      id: 2,
      name: "Alvin Doe",
      role: "Landowner",
      email: "alvin.doe@example.com",
      phone: "+1 (555) 987-6543",
      avatar: null,
    },
    {
      id: 3,
      name: "Theodore Doe",
      role: "TreeFolks Admin",
      email: "theodore.doe@treefolks.org",
      phone: "+1 (555) 456-7890",
      avatar: null,
    },
  ]);

  // Fetch document details
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const docs = storageService.getDocumentsFromStorage();
        const doc = docs.find((d) => d.id === id);

        if (doc) {
          setDocument(doc);
        } else {
          setError("Document not found");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle assigning a user
  const handleAssignUser = (userId) => {
    // In a real app, this would update the document's collaborators
    console.log(`Assigning user ${userId} to document ${id}`);
    alert(`User assignment would be updated in a real application`);
  };

  // Handle making changes to the document
  const handleMakeChanges = () => {
    // In a real app, this might open an editor or form
    alert("This would allow editing the document in a real application");
  };

  // Handle another action (placeholder for additional functionality)
  const handleAnotherAction = () => {
    alert("This would trigger another action in a real application");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Documents
          </button>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm">
            <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
            <p>{error || "Document not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Documents
          </button>

          <h1 className="text-3xl font-bold mb-8">{document.title}</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Document Preview Section */}
            <div className="lg:w-1/2">
              <div className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center relative mb-6">
                {document.fileType?.includes("image") ? (
                  <img
                    src={document.fileUrl}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : document.fileType?.includes("pdf") ? (
                  <object
                    data={document.fileUrl}
                    type="application/pdf"
                    width="100%"
                    height="100%"
                    className="rounded-lg"
                  >
                    <div className="flex flex-col items-center justify-center h-full">
                      <FileText size={64} className="text-gray-400 mb-4" />
                      <p className="text-gray-600">PDF preview not available</p>
                      <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Open PDF
                      </a>
                    </div>
                  </object>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <FileText size={64} className="text-gray-400 mb-4" />
                    <p className="text-gray-600">Preview not available</p>
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Download File
                    </a>
                  </div>
                )}
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                >
                  <Maximize size={20} />
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">Document Details:</h2>
                <p className="mb-4">
                  {document.description ||
                    "A short synopsis of the location and reforestation efforts."}
                </p>

                <p className="mb-4">
                  Include net coverage and other carbon credit growth or stats
                  that may be associated with the specific location.
                </p>

                <p className="mb-4">
                  This body of text can also serve as latest updates (can be
                  imported from the notification section)
                </p>

                <h3 className="text-lg font-bold mt-6 mb-2">Latest Updates:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>
                    Signed On:{" "}
                    {formatDate(document.signedDate || document.uploadDate)}
                  </li>
                  <li>
                    Last modified:{" "}
                    {formatDate(document.lastModified || document.uploadDate)}
                  </li>
                  <li>
                    Document Upload Date: {formatDate(document.uploadDate)}
                  </li>
                </ul>
              </div>
            </div>

            {/* Associated Members Section */}
            <div className="lg:w-1/2">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleMakeChanges}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg"
                >
                  Make Changes
                </button>
                <button
                  onClick={handleAnotherAction}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg"
                >
                  Another Action
                </button>
              </div>

              <h2 className="text-2xl font-bold mb-6">Associated Members</h2>

              <div className="space-y-6">
                {collaborators.map((user) => (
                  <div key={user.id} className="flex items-start gap-4">
                    <UserAvatar name={user.name} size={64} />
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{user.name}</h3>
                      <div className="inline-block bg-gray-200 text-xs px-2 py-1 rounded-full mb-2">
                        {user.role}
                      </div>

                      <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail size={16} />
                          <span className="bg-gray-200 h-4 w-48 rounded"></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone size={16} />
                          <span className="bg-gray-200 h-4 w-48 rounded"></span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAssignUser(user.id)}
                        className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white py-1 px-4 rounded-lg text-sm"
                      >
                        Assign "user"
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg">
                  Cancel
                </button>
                <button className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg">
                  Save
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg ml-auto">
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;
