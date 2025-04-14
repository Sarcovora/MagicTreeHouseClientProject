// src/pages/landowner/DocumentDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Maximize,
  Download,
  FileText,
  AlertCircle // For errors
} from "lucide-react";
// import Sidebar from "../../components/layouts/AdminSidebar"; // This seems wrong for a landowner page? Maybe LandownerSidebar? Let's remove for now.
// import storageService from "../../services/storageService"; // REMOVE
import apiService from "../services/apiService"; // Keep for later
import UserAvatar from "../components/common/UserAvatar";

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [collaborators, setCollaborators] = useState([]); // State for collaborators
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDocument = async () => {
       if (!id) {
          setError("Document ID is missing.");
          setLoading(false);
          return;
       }
      try {
        setLoading(true);
        setError("");
        // Fetch document details using apiService
        const doc = await apiService.getDocumentDetails(id);

        if (doc) {
          setDocument(doc);
          // Assuming collaborators are part of the doc details from API
          setCollaborators(doc.collaborators || []);
        } else {
          setError("Document not found");
          setDocument(null); // Ensure document is null if not found
          setCollaborators([]);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError("Failed to load document details. Please try again.");
        setDocument(null);
        setCollaborators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [id]);

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
       // Handle potential Firestore Timestamps or Date objects or ISO strings
       const date = typeof dateString === 'string' ? new Date(dateString) : dateString.toDate ? dateString.toDate() : dateString;
       return date.toLocaleDateString("en-US", {
         year: "numeric",
         month: "long",
         day: "numeric",
       });
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date";
    }
  };

  const handleAssignUser = (userId) => {
    console.log(`Assigning user ${userId} to document ${id}`);
    alert(`User assignment simulation for user ${userId}.`);
  };

  const handleMakeChanges = () => {
    alert("Simulating 'Make Changes' action.");
  };

  const handleAnotherAction = () => {
    alert("Simulating 'Another Action'.");
  };

 // --- Render Logic ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  // Consolidated error/not found display
  if (error || !document) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Consider adding LandownerSidebar here if appropriate */}
        <div className="flex-1 p-8">
          <button
            onClick={() => navigate('/documents')} // Adjust path if needed for landowner
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Documents
          </button>
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm text-center">
             <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h1 className="text-xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600">{error || "Document not found"}</p>
          </div>
        </div>
      </div>
    );
  }

  // Main component return if document is loaded
  return (
    <div className="min-h-screen bg-gray-50">
        {/* Consider adding LandownerSidebar here */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
           <button
            onClick={() => navigate('/documents')} // Adjust path if needed
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Documents
          </button>

          <h1 className="text-3xl font-bold mb-8">{document.title || 'Document Detail'}</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Document Preview Section */}
            <div className="lg:w-1/2 flex flex-col"> {/* Added flex-col */}
                {/* Preview Area */}
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center relative mb-6 border border-gray-200">
                {/* Basic preview logic (can be enhanced) */}
                {document.fileType?.startsWith("image/") && document.fileUrl ? (
                  <img
                    src={document.fileUrl}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : document.fileType === "application/pdf" && document.fileUrl ? (
                   <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                     <FileText size={64} className="text-red-400 mb-4" />
                     <p className="text-gray-600 mb-2">PDF Document</p>
                      <a
                        href={document.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                      >
                        Open PDF
                      </a>
                   </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <FileText size={64} className="text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">Preview not available for this file type.</p>
                     {document.fileUrl && document.fileUrl !== '#' && (
                         <a
                           href={document.fileUrl}
                           target="_blank"
                           rel="noopener noreferrer"
                           download={document.fileName}
                           className="mt-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm"
                         >
                           Download File
                         </a>
                     )}
                  </div>
                )}
                 {/* Maximize button if URL exists */}
                 {document.fileUrl && document.fileUrl !== '#' && (
                     <a
                       href={document.fileUrl}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="absolute bottom-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                       title="Open in new tab"
                     >
                       <Maximize size={18} />
                     </a>
                 )}
              </div>

                {/* Details Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm flex-grow"> {/* Added flex-grow */}
                <h2 className="text-xl font-bold mb-4">Document Details:</h2>
                <p className="text-gray-700 mb-4">
                  {document.description || "No description provided."}
                </p>

                 {/* Use details from API if available */}
                 {document.details?.synopsis && <p className="mb-4 text-gray-600">{document.details.synopsis}</p>}
                 {document.details?.stats && <p className="mb-4 text-gray-600">{document.details.stats}</p>}
                 {document.details?.updates && <p className="mb-4 text-gray-600">{document.details.updates}</p>}

                <h3 className="text-lg font-bold mt-6 mb-2">Information:</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
                  <li>Category: {document.category || 'N/A'}</li>
                  <li>File Name: {document.fileName || 'N/A'}</li>
                  <li>File Size: {document.fileSize ? (document.fileSize / (1024*1024)).toFixed(2) + ' MB' : 'N/A'}</li>
                  <li>Uploaded On: {formatDate(document.uploadDate)}</li>
                  {/* Add more relevant info like Last Modified if available */}
                </ul>
              </div>
            </div>

            {/* Associated Members Section */}
            <div className="lg:w-1/2">
               {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleMakeChanges}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm"
                >
                  Make Changes
                </button>
                <button
                  onClick={handleAnotherAction}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm"
                >
                  Another Action
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-6">Associated Members</h2>

                {collaborators.length > 0 ? (
                  <div className="space-y-6">
                    {collaborators.map((user) => (
                      <div key={user.id} className="flex items-start gap-4 border p-4 rounded-lg">
                        <UserAvatar name={user.name} size={48} /> {/* Slightly larger avatar */}
                        <div className="flex-1">
                          <h3 className="text-base font-medium">{user.name}</h3>
                          <div className="inline-block bg-gray-100 text-xs px-2 py-0.5 rounded-full mb-2 text-gray-600">
                            {user.role}
                          </div>

                          <div className="space-y-1 mt-2">
                            {user.email && (
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Mail size={14} className="flex-shrink-0" />
                                <a href={`mailto:${user.email}`} className="hover:text-green-600 break-all">{user.email}</a>
                                </div>
                            )}
                             {user.phone && (
                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <Phone size={14} className="flex-shrink-0" />
                                <a href={`tel:${user.phone}`} className="hover:text-green-600">{user.phone}</a>
                                </div>
                             )}
                          </div>

                          {/* Example Action Button */}
                          <button
                            onClick={() => handleAssignUser(user.id)}
                            className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-lg text-xs"
                          >
                            Manage Access
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                    <p className="text-gray-500 text-center">No associated members found for this document.</p>
                )}
              </div>

               {/* Bottom Action/Save Buttons (Example) */}
              <div className="flex gap-4 mt-8 justify-end">
                 {document.fileUrl && document.fileUrl !== '#' && (
                     <a
                         href={document.fileUrl}
                         download={document.fileName}
                         className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center text-sm"
                     >
                         <Download size={16} className="mr-2"/> Download
                     </a>
                 )}
                {/* Add other relevant actions like Save if changes were made */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetail;