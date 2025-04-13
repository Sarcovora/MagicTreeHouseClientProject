import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowLeft, File, X } from "lucide-react";
import storageService from "../services/storageService";

/**
 * Component for uploading new documents
 */
const DocumentUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Property Maps",
    projectId: "",
    landowner: "",
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Document categories
  const DOCUMENT_CATEGORIES = [
    "Property Maps",
    "Carbon Credit Agreements",
    "Applications",
    "Quiz Results",
    "Planting Reports",
    "Other",
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-fill title with file name if title is empty
      if (!formData.title) {
        setFormData((prev) => ({
          ...prev,
          title: selectedFile.name.split(".")[0],
        }));
      }
    }
  };

  // Clear selected file
  const handleClearFile = () => {
    setFile(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    if (!formData.title) {
      setError("Please enter a document title");
      return;
    }

    try {
      setIsUploading(true);
      setError("");

      // Upload document using the storage service
      await storageService.uploadDocument(file, formData, (progress) =>
        setUploadProgress(progress)
      );

      // Navigate back to documents page after successful upload
      navigate("/documents");
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload document. Please try again.");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          {/* Back button */}
          <button
            onClick={() => navigate("/documents")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Documents
          </button>
          <h1 className="text-2xl font-bold mb-8">Upload New Document</h1>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Document File
              </label>
              {!file ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, XLS, XLSX up to 10MB
                  </p>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <File className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
            {/* Document Title */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-gray-700 font-medium mb-2"
              >
                Document Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            {/* Description */}
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-gray-700 font-medium mb-2"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            {/* Category */}
            <div className="mb-6">
              <label
                htmlFor="category"
                className="block text-gray-700 font-medium mb-2"
              >
                Document Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                {DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="projectId"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Project ID (Optional)
                </label>
                <input
                  type="text"
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="landowner"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Landowner (Optional)
                </label>
                <input
                  type="text"
                  id="landowner"
                  name="landowner"
                  value={formData.landowner}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            {/* Error Message */}
            {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
            {/* Upload Progress */}
            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Uploading: {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}
            {/* Map Upload Guidelines */}
            {formData.category === "Property Maps" && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  Map Upload Guidelines
                </h3>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  <li>
                    Upload high-resolution images of property maps (minimum
                    1920x1080 pixels recommended)
                  </li>
                  <li>Use PNG or JPEG formats for best quality</li>
                  <li>
                    Avoid compressed or low-quality images to prevent blurriness
                  </li>
                  <li>
                    Maps will be displayed in the Map tab where you can add
                    comments by clicking on the map
                  </li>
                  <li>
                    Larger file sizes will preserve more detail (up to 10MB
                    recommended)
                  </li>
                </ul>
              </div>
            )}
            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={isUploading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload Document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
