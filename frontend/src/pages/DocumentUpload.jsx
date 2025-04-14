// src/pages/DocumentUpload.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, ArrowLeft, File, X, AlertCircle } from "lucide-react";
// import storageService from "../services/storageService"; // REMOVE
import apiService from "../services/apiService"; // Keep for later use

// Define categories directly here for now
const DOCUMENT_CATEGORIES = [
    "Property Maps",
    "Carbon Credit Agreements",
    "Applications",
    "Quiz Results",
    "Planting Reports",
    "Photos", // Ensure Photos category exists if needed
    "Other",
];


const DocumentUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: DOCUMENT_CATEGORIES[0], // Default to first category
    projectId: "", // Add if needed for linking
    landowner: "", // Add if needed
  });
  const [uploadProgress, setUploadProgress] = useState(0); // Keep for UI feedback
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
       // Basic validation (example: size limit)
       const maxSize = 10 * 1024 * 1024; // 10 MB
        if (selectedFile.size > maxSize) {
            setError(`File size exceeds the limit of ${maxSize / 1024 / 1024} MB.`);
            setFile(null); // Clear selection
            e.target.value = null; // Reset file input
            return;
        }
      setError(''); // Clear previous errors
      setFile(selectedFile);
      if (!formData.title) {
        setFormData((prev) => ({
          ...prev,
          title: selectedFile.name.split(".").slice(0, -1).join('.'), // Handle names with multiple dots
        }));
      }
    }
  };

  const handleClearFile = () => {
    setFile(null);
    // If you have a ref to the input, reset it: fileInputRef.current.value = null;
    // Or reset by ID if needed:
    const fileInput = document.getElementById("file-upload");
    if(fileInput) fileInput.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    if (!file) {
      setError("Please select a file to upload");
      return;
    }
    if (!formData.title) {
      setError("Please enter a document title");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0); // Start progress

    try {
      // Simulate progress for mock upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const next = prev + 10;
          if (next >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return next;
        });
      }, 100); // Update progress every 100ms

      // Use apiService.addDocument
      await apiService.addDocument(file, formData);

      clearInterval(progressInterval); // Ensure interval is cleared
      setUploadProgress(100); // Set to 100% on success

      // Delay navigation slightly to show 100%
      setTimeout(() => {
         // Navigate back to documents page (adjust path if needed)
         // Assuming this is within the admin section based on previous file structures
          navigate("/admin/documents");
      }, 500);

    } catch (error) {
      console.error("Upload error:", error);
      setError(`Failed to upload document: ${error.message || "Please try again."}`);
      setIsUploading(false);
      setUploadProgress(0); // Reset progress on error
    }
    // Removed finally block as navigation happens on success
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-6">
          <button
            onClick={() => navigate(-1)} // Go back
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                   <label htmlFor="file-upload" className="cursor-pointer hover:bg-gray-50 block p-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        Max 10MB (PDF, DOCX, JPG, PNG, etc.)
                      </p>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only" // Use sr-only for accessibility but hide visually
                        onChange={handleFileChange}
                         accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.gif,.svg" // Example accept types
                      />
                  </label>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center overflow-hidden mr-2">
                    <File className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-medium truncate" title={file.name}>{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB {/* Show size in MB */}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
                    title="Remove file"
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
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                 placeholder="Provide a brief description of the document's content or purpose..."
              />
            </div>
            {/* Category */}
            <div className="mb-6">
              <label
                htmlFor="category"
                className="block text-gray-700 font-medium mb-2"
              >
                Document Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500"
                required
              >
                {DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {/* Additional Fields (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="projectId"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Related Project (Optional)
                </label>
                <input
                  type="text" // Consider changing to a select dropdown if projects are fetched
                  id="projectId"
                  name="projectId"
                  placeholder="Enter Project ID or Name"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label
                  htmlFor="landowner"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Associated Landowner (Optional)
                </label>
                <input
                  type="text" // Consider changing to a select dropdown
                  id="landowner"
                  name="landowner"
                   placeholder="Enter Landowner Name"
                  value={formData.landowner}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center">
                 <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                 {error}
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="my-4">
                 <p className="text-sm font-medium text-gray-700 mb-1">
                   Uploading: {formData.title || file?.name}
                 </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1 text-right">
                   {uploadProgress.toFixed(0)}%
                </p>
              </div>
            )}

            {/* Map Upload Guidelines - Conditional */}
            {formData.category === "Property Maps" && (
               <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-800 mb-2">
                  Map Upload Guidelines
                </h3>
                <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                  <li>Upload high-resolution images (e.g., PNG, JPG).</li>
                  <li>Ensure map boundaries and key features are clear.</li>
                  <li>Maximum file size: 10MB.</li>
                  <li>Maps will appear in the 'Map' tab for commenting.</li>
                </ul>
              </div>
            )}

             {/* Photo Upload Guidelines - Conditional */}
            {formData.category === "Photos" && (
               <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-medium text-purple-800 mb-2">
                  Photo Upload Tips
                </h3>
                <ul className="list-disc pl-5 text-sm text-purple-700 space-y-1">
                   <li>Upload relevant project photos (e.g., site conditions, planting progress, tree growth).</li>
                   <li>Use clear, well-lit images (JPG, PNG).</li>
                   <li>Provide a descriptive title and optional description.</li>
                   <li>Maximum file size: 10MB.</li>
                   <li>Photos will appear in the 'Photo Gallery'.</li>
                </ul>
              </div>
            )}


            {/* Submit Button */}
            <div className="mt-8 flex justify-end"> {/* Aligned button to the right */}
              <button
                type="submit"
                disabled={isUploading || !file} // Disable if uploading or no file selected
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {isUploading ? (
                    <>
                     <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                     Uploading...
                    </>
                ) : (
                   <>
                     <Upload className="w-4 h-4 mr-2" /> Upload Document
                   </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;