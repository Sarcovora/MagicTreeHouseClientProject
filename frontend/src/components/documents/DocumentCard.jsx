import PropTypes from "prop-types";
import {
  FileText,
  Download,
  Trash2,
  User,
  FileImage,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

/**
 * Component for displaying a document card
 */
const DocumentCard = ({ document, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Get file extension for icon display
  const getFileExtension = (fileName) => {
    return fileName.split(".").pop().toLowerCase();
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle document deletion
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        setIsDeleting(true);
        await onDelete(document.id);
      } catch (error) {
        console.error("Error deleting document:", error);
        alert("Failed to delete document");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Determine icon based on file type
  const getFileIcon = () => {
    const extension = getFileExtension(document.fileName);

    switch (extension) {
      case "pdf":
        return <FileText size={40} className="text-red-500" />;
      case "doc":
      case "docx":
        return <FileText size={40} className="text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet size={40} className="text-green-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage size={40} className="text-purple-500" />;
      case "html":
      case "css":
      case "js":
        return <FileCode size={40} className="text-yellow-500" />;
      default:
        return <FileText size={40} className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Document Preview - Make this a link to the detail page */}
      <Link to={`/documents/${document.id}`}>
        <div className="h-40 bg-gray-100 flex items-center justify-center">
          {getFileIcon()}
        </div>
      </Link>

      {/* Document Info */}
      <div className="p-4">
        <Link to={`/documents/${document.id}`} className="hover:text-blue-600">
          <h3
            className="font-medium text-lg mb-1 truncate"
            title={document.title}
          >
            {document.title}
          </h3>
        </Link>

        <div
          className="text-sm text-gray-600 mb-3 truncate"
          title={document.description}
        >
          {document.description || "No description"}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>
            <p className="truncate" title={document.fileName}>
              {document.fileName}
            </p>
            <p>{formatFileSize(document.fileSize)}</p>
          </div>

          <div className="mt-3 flex items-center text-xs text-gray-500">
            <User size={14} className="mr-1" />
            <span>Uploaded {formatDate(document.uploadDate)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-3 flex justify-between">
        <a
          href={document.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-800 flex items-center text-sm"
          download={document.fileName}
        >
          <Download size={16} className="mr-1" />
          Download
        </a>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-gray-600 hover:text-red-600 flex items-center text-sm"
        >
          <Trash2 size={16} className="mr-1" />
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

DocumentCard.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    fileName: PropTypes.string.isRequired,
    fileSize: PropTypes.number.isRequired,
    fileUrl: PropTypes.string.isRequired,
    uploadDate: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.object, // For Firestore Timestamps
      PropTypes.string, // For date strings
    ]).isRequired,
    category: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default DocumentCard;
