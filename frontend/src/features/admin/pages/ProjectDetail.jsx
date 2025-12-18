// src/features/admin/pages/ProjectDetail.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Edit,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  User,
  MessageSquare,
} from "lucide-react";
import Carousel from "../../../components/common/Carousel";
import InfoCard from "../../../components/common/InfoCard";
import InfoField from "../../../components/common/InfoField";
import DateSelectionModal from "../../../components/common/DateSelectionModal";
import PdfEditor from "../components/PdfEditor";
import apiService from "../../../services/apiService";
import { useAuth } from "../../auth/AuthProvider";

const formatDate = (value) => {
  if (!value) {
    return "Not recorded";
  }
  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ensureText = (value, fallback = "Not provided") =>
  value ? String(value) : fallback;

const ensureArray = (value) =>
  Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];


const DOCUMENT_SLOTS = [
  {
    key: "carbonDocs",
    label: "Carbon Docs (Notarized)",
    description: "Signed documentation verifying carbon credits.",
    fallbackField: "carbonDocs",
  },
  {
    key: "draftMap",
    label: "Draft Map",
    description: "Latest GIS draft map uploaded for review.",
    fallbackField: "draftMapUrl",
  },
  {
    key: "finalMap",
    label: "Final Map",
    description: "Approved planting map for this site.",
    fallbackField: "finalMapUrl",
  },
  {
    key: "replantingMap",
    label: "Replanting Map",
    description: "Map for replanting scope and revisions.",
    fallbackField: "replantingMapUrl",
  },
  {
    key: "otherAttachments",
    label: "Other Attachments",
    description: "Supplemental project documents.",
    fallbackField: "otherAttachments",
  },
  {
    key: "postPlantingReports",
    label: "Post-Planting Reports",
    description: "Reports documenting post-planting observations.",
    fallbackField: "postPlantingReports",
  },
];

// --- Draft Map Comment Modal ---
const DraftMapCommentModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(comment);
    setComment("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-fade-in-up">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Add Draft Map Comment</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            rows={4}
            placeholder="Enter your feedback regarding the draft map..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            disabled={isSubmitting}
          />
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Comment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DocumentTile = ({
  slot,
  files,
  onUpload,
  onDelete,
  onEdit,
  isUploading,
  isDeleting,
  isAdmin,
  comments, // String blob from Airtable
  onAddComment, // Handler
}) => {
  const fileInputRef = useRef(null);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await onUpload(slot.key, selectedFile);
    }
    event.target.value = "";
  };

  const openPicker = () => {
    fileInputRef.current?.click();
  };

  const handleEdit = () => {
    if (onEdit) {
      // Use selected version, or default to newest (last in array)
      const indexToEdit = selectedVersionIndex !== null ? selectedVersionIndex : files.length - 1;
      onEdit(slot.key, files[indexToEdit]);
    }
  };

  const inputId = `upload-${slot.key}`;
  // Check if it's a PDF - either contains .pdf in URL or is from airtable (Draft Maps are typically PDFs)
  const fileUrl = files[0]?.toLowerCase() || '';
  const isPdf = fileUrl.includes('.pdf') || (slot.key === 'draftMap' && fileUrl.includes('airtable'));
  const canEdit = slot.key === 'draftMap' && files.length > 0;

  // Landowners can only upload versions if a file already exists. Initial upload is Admin only.
  const canModify = isAdmin || (slot.key === 'draftMap' && files.length > 0);
  const showUpload = files.length === 0 && canModify;
  
  if (files.length === 0 || isUploading) {
      if (!canModify && files.length === 0) {
        return (
             <div className="flex h-full flex-col justify-between rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-4 text-center">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{slot.label}</p>
                  <p className="mt-2 text-xs text-gray-500">{slot.description}</p>
                  <p className="mt-4 text-xs italic text-gray-400">No document uploaded.</p>
                </div>
             </div>
        );
      }
    return (
      <div className="flex h-full flex-col justify-between rounded-2xl border-2 border-dashed border-green-500/40 bg-green-50/50 p-4 text-center">
        <div>
          <p className="text-sm font-semibold text-gray-800">{slot.label}</p>
          <p className="mt-2 text-xs text-gray-500">{slot.description}</p>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={openPicker}
            className={`inline-flex items-center justify-center rounded-full border border-green-600/30 bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-green-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 ${
              isUploading
                ? "cursor-not-allowed opacity-70"
                : "hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md active:translate-y-0"
            }`}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading to Airtable...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </>
            )}
          </button>
          <input
            id={inputId}
            type="file"
            ref={fileInputRef}
            className="sr-only"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>
      </div>
    );
  }

  // Use the last file (newest) for Draft Map, first file for others
  const primaryUrl = slot.key === 'draftMap' ? files[files.length - 1] : files[0];
  const isBusy = isUploading || isDeleting;
  const disabledLinkClass = isBusy ? "pointer-events-none opacity-60" : "";

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {slot.label}
      </p>
      <div className="mt-3 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          File attached
        </p>
        <p className="mt-2 text-xs text-gray-500 line-clamp-3">
          {slot.description}
        </p>
        {files.length > 1 && (
          <p className="mt-2 text-xs text-gray-400">
            +{files.length - 1} additional file
            {files.length - 1 > 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Version Selector for Draft Map with multiple files */}
      {canEdit && files.length > 1 && (
        <div className="mt-3">
          <label className="text-xs font-medium text-gray-600">Edit version:</label>
          <select
            value={selectedVersionIndex !== null ? selectedVersionIndex : files.length - 1}
            onChange={(e) => setSelectedVersionIndex(Number(e.target.value))}
            className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
          >
            {files.map((_, index) => (
              <option key={index} value={index}>
                {index === files.length - 1 ? 'Newest' : index === 0 ? 'Original' : `Version ${index}`}
              </option>
            )).reverse()}
          </select>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <a
          href={primaryUrl}
          target="_blank"
          rel="noreferrer"
          className={`flex-1 rounded-lg border border-green-600/30 bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm shadow-green-500/20 transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 ${disabledLinkClass}`}
        >
          View
        </a>
        {canEdit && (
          <button
            type="button"
            onClick={handleEdit}
            className={`rounded-lg border border-blue-600/30 bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
              isBusy ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isBusy}
          >
            <span className="flex items-center">
              <Pencil className="mr-1 h-4 w-4" />
              Edit
            </span>
          </button>
        )}
        {/* Only show Replace button if user has permission */}
        {(isAdmin || slot.key === 'draftMap') && (
        <button
          type="button"
          onClick={openPicker}
          className={`rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 ${
            isBusy ? "opacity-70" : ""
          }`}
          disabled={isBusy}
        >
          {isUploading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading to Airtable...
            </span>
          ) : isDeleting ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Deleting...
            </span>
          ) : (
            (!isAdmin && slot.key === 'draftMap') ? "Upload New Version" : "Replace"
          )}
        </button>
        )}
        {/* Only allow deletion if Admin. User explicitly requested landowners CANNOT delete. */}
        {isAdmin && (
        <button
          type="button"
          onClick={() => onDelete?.(slot)}
          className={`rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 ${
            isBusy ? "opacity-70" : ""
          }`}
          disabled={isBusy}
        >
          Delete
        </button>
        )}
        {(isAdmin || slot.key === 'draftMap') && (
        <input
          id={inputId}
          type="file"
          ref={fileInputRef}
          className="sr-only"
          onChange={handleFileChange}
          disabled={isBusy}
        />
        )}
      </div>

      {/* Draft Map Comments Section */}
      {slot.key === 'draftMap' && (
        <div className="mt-4 border-t border-gray-100 pt-3">
          {/* Admin View: Show most recent comment */}
          {isAdmin && comments && (
             <div className="rounded-md bg-yellow-50 p-3">
                <p className="text-xs font-semibold text-yellow-800 mb-1">Latest Landowner Comment:</p>
                <div className="text-xs text-yellow-700 whitespace-pre-wrap max-h-24 overflow-y-auto">
                   {/* Extract first comment block (split by double newline usually) */}
                   {comments.split('\n\n')[0]}
                </div>
             </div>
          )}

          {/* Landowner View: Add Comment Button */}
          {!isAdmin && files.length > 0 && (
            <button
                onClick={() => onAddComment?.()}
                className="mt-2 flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
            >
                <MessageSquare className="mr-2 h-4 w-4 text-gray-500" />
                Add Comment / Feedback
            </button>
          )} 
        </div>
      )}
    </div>
  );
};

const PhotoUploadButton = ({ label, slotKey, onUpload, isUploading }) => {
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await onUpload(slotKey, selectedFile);
    }
    event.target.value = "";
  };

  return (
    <div className="flex">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`inline-flex items-center justify-center rounded-full border border-green-600/30 bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-green-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 ${
          isUploading
            ? "cursor-not-allowed opacity-70"
            : "hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md active:translate-y-0"
        }`}
        disabled={isUploading}
      >
        {isUploading ? "Uploading..." : label}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="sr-only"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
};



const ProjectDetail = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [docUploadState, setDocUploadState] = useState({ key: null, error: null });
  const [docDeleteState, setDocDeleteState] = useState({ key: null, error: null });
  const [photoUploadState, setPhotoUploadState] = useState({ key: null, error: null });
  const [lightboxImage, setLightboxImage] = useState(null);
  const [pendingPhotoUpload, setPendingPhotoUpload] = useState(null); // { file, slotKey }
  const [pdfEditorState, setPdfEditorState] = useState({ isOpen: false, pdfUrl: null, documentType: null });

  const loadProjectDetails = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getProjectDetails(projectId);
      if (data) {
        setProject(data);
      } else {
        setError(`Project with ID ${projectId} not found.`);
      }
    } catch (err) {
      console.error("Failed to fetch project details:", err);
      setError("Could not load project details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // --- Comment Logic ---
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const handleAddComment = async (comment) => {
      setIsSubmittingComment(true);
      try {
          const updatedProject = await apiService.addDraftMapComment(projectId, comment);
          setProject(updatedProject);
          setIsCommentModalOpen(false);
      } catch (err) {
          console.error("Failed to add comment:", err);
          setError("Failed to submit comment. Please try again.");
      } finally {
          setIsSubmittingComment(false);
      }
  };

  useEffect(() => {
    loadProjectDetails();
  }, [loadProjectDetails]);

  const handleDeleteProject = async () => {
    if (!projectId) {
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete project "${project?.name || projectId}"? This action cannot be undone.`
    );
    if (!confirmed) {
      return;
    }
    setError(null);
    try {
      await apiService.deleteProject(projectId);
      if (project?.seasonYear) {
        navigate(`/admin/seasons/${project.seasonYear}`);
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError(`Failed to delete project: ${err.message || "Please try again."}`);
    }
  };

  const handleGoBack = () => {
    if (!isAdmin) {
      navigate('/landowner/dashboard');
      return;
    }
    if (project?.seasonYear) {
      navigate(`/admin/seasons/${project.seasonYear}`);
      return;
    }
    navigate("/admin/dashboard");
  };

  const beforePhotos = ensureArray(project?.beforePhotoUrls);
  const plantingPhotos = ensureArray(project?.plantingPhotoUrls);
  const combinedPhotos = Array.from(
    new Set([...beforePhotos, ...plantingPhotos].filter(Boolean))
  );
  const landownerPhotos = ensureArray(project?.propertyImageUrls);
  const activeCarbonShapefiles = ensureArray(project?.activeCarbonShapefiles);
  const shapefileSummary =
    activeCarbonShapefiles.length > 0
      ? `${activeCarbonShapefiles.length} file${activeCarbonShapefiles.length === 1 ? "" : "s"} available`
      : "No shape files uploaded yet";
  const carouselPhotos =
    combinedPhotos.length > 0
      ? combinedPhotos
      : project?.image
      ? [project.image]
      : [];

  const handleDocumentUpload = async (slotKey, file) => {
    if (!projectId || !file) {
      return;
    }
    setDocUploadState({ key: slotKey, error: null });
    try {
      await apiService.uploadProjectDocument(projectId, slotKey, file);
      // Give Airtable a brief window to finish hosting (especially PDFs) before reloading
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await loadProjectDetails();
    } catch (uploadErr) {
      console.error("Failed to upload document:", uploadErr);
      setDocUploadState({
        key: null,
        error: uploadErr?.message || "Failed to upload document.",
      });
      return;
    }
    setDocUploadState({ key: null, error: null });
  };

  const handleDocumentDelete = async (slot) => {
    if (!projectId || !slot?.key) {
      return;
    }
    const confirmed = window.confirm(
      `Delete "${slot.label}"? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }
    setDocDeleteState({ key: slot.key, error: null });
    try {
      await apiService.deleteProjectDocument(projectId, slot.key);
      await loadProjectDetails();
      setDocDeleteState({ key: null, error: null });
    } catch (deleteErr) {
      console.error("Failed to delete document:", deleteErr);
      setDocDeleteState({
        key: null,
        error: deleteErr?.message || "Failed to delete document.",
      });
    }
  };

  const handleDocumentEdit = (documentType, pdfUrl) => {
    setPdfEditorState({ isOpen: true, pdfUrl, documentType });
  };

  const handlePdfEditorSave = async (blob) => {
    if (!projectId || !pdfEditorState.documentType) return;

    try {
      // Get current file name from URL
      const urlParts = pdfEditorState.pdfUrl.split('/');
      const currentFileName = urlParts[urlParts.length - 1].split('?')[0];

      // Extract base name and determine next version
      const versionMatch = currentFileName.match(/_v(\d+)\.pdf$/i);
      const baseFileName = currentFileName.replace(/_v\d+\.pdf$/i, '.pdf').replace(/\.pdf$/i, '');
      const nextVersion = versionMatch ? parseInt(versionMatch[1]) + 1 : 1;
      const newFileName = `${baseFileName}_v${nextVersion}.pdf`;

      // Create File object from blob
      const file = new File([blob], newFileName, { type: 'application/pdf' });

      // Close editor and upload
      setPdfEditorState({ isOpen: false, pdfUrl: null, documentType: null });

      // Upload the new version
      console.log(`Uploading annotated PDF: ${newFileName}, size: ${blob.size} bytes`);
      await handleDocumentUpload(pdfEditorState.documentType, file);
      
      // Explicit check if upload updated the state (although handleDocumentUpload handles its own state/errors)
      // We assume success if no error thrown.
    } catch (error) {
      console.error('Failed to save annotated PDF:', error);
      alert(`Failed to save annotated PDF: ${error.message || 'Unknown error'}`);
    }
  };

  const handlePdfEditorCancel = () => {
    setPdfEditorState({ isOpen: false, pdfUrl: null, documentType: null });
  };

  const initiatePhotoUpload = (slotKey, file) => {
    if (!projectId || !file) return;
    setPendingPhotoUpload({ slotKey, file });
  };

  const handleDateConfirm = async (dateString) => {
    if (!pendingPhotoUpload) return;
    const { file, slotKey } = pendingPhotoUpload;

    // Format: name_M_D_YYYY.ext
    // dateString is YYYY-MM-DD
    const [year, month, day] = dateString.split("-");
    const safeMonth = parseInt(month, 10);
    const safeDay = parseInt(day, 10);

    const originalName = file.name;
    const lastDotIndex = originalName.lastIndexOf(".");
    const namePart = lastDotIndex !== -1 ? originalName.slice(0, lastDotIndex) : originalName;
    const extPart = lastDotIndex !== -1 ? originalName.slice(lastDotIndex) : "";
    
    // Construct new name
    const newName = `${namePart}_${safeMonth}_${safeDay}_${year}${extPart}`;
    
    // Create new File object
    const newFile = new File([file], newName, { type: file.type });

    setPendingPhotoUpload(null); // Close modal
    
    // Proceed with upload
    setPhotoUploadState({ key: slotKey, error: null });
    try {
      await apiService.uploadProjectDocument(projectId, slotKey, newFile);
      await loadProjectDetails();
      setPhotoUploadState({ key: null, error: null });
    } catch (uploadErr) {
      console.error("Failed to upload photo:", uploadErr);
      setPhotoUploadState({
        key: slotKey,
        error: uploadErr?.message || "Failed to upload photo.",
      });
    }
  };

  const handleDateCancel = () => {
    setPendingPhotoUpload(null);
  };

  const handleDownloadShapeFiles = () => {
    if (!activeCarbonShapefiles.length) {
      return;
    }
    activeCarbonShapefiles.forEach((url) => {
      if (!url) return;
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const projectDocuments = project?.documents || {};
  const resolvedDocumentSlots = DOCUMENT_SLOTS.map((slot) => {
    const primary = ensureArray(projectDocuments[slot.key]);
    const fallback = slot.fallbackField
      ? ensureArray(project?.[slot.fallbackField])
      : [];
    return {
      ...slot,
      files: primary.length > 0 ? primary : fallback,
    };
  });

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-500" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="mx-auto max-w-7xl px-8 py-6 text-center">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-xl font-semibold text-red-600">
          Error Loading Project
        </h2>
        <p className="mb-6 text-gray-600">{error}</p>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="mx-auto mt-6 flex items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!project) {
    return <div className="p-8 text-center">Project data not found.</div>;
  }

  const primaryContactName = ensureText(
    project.ownerDisplayName || project.ownerFirstName || project.landowner
  );
  const primaryContactPhone =
    project.phone || project.contact?.phone || "";
  const sanitizedPhoneHref = primaryContactPhone
    ? `tel:${primaryContactPhone.replace(/[^+\d]/g, "")}`
    : undefined;

  const associatedMemberFields = [
    {
      label: "Owner First Name or Organization",
      value: ensureText(project.ownerFirstName || project.landowner),
    },
    {
      label: "Owner Last Name or Site Name",
      value: ensureText(project.ownerDisplayName || project.landowner),
    },
    {
      label: "Email",
      value: project.email || project.contact?.email || "",
      href: project.email || project.contact?.email
        ? `mailto:${project.email || project.contact.email}`
        : undefined,
    },
    {
      label: "Phone",
      value: ensureText(primaryContactPhone, "Not provided"),
      href: sanitizedPhoneHref,
    },
  ];

  const activityDateFields = [
    {
      label: "Application Date",
      value: project.applicationDate ? formatDate(project.applicationDate) : "",
      placeholder: "Not recorded",
    },
    {
      label: "Consultation Date",
      value: project.consultationDate
        ? formatDate(project.consultationDate)
        : "",
      placeholder: "Not recorded",
    },
    {
      label: "Flagging Date",
      value: project.flaggingDate ? formatDate(project.flaggingDate) : "",
      placeholder: "Not recorded",
    },
    {
      label: "Planting Date",
      value: project.plantingDate ? formatDate(project.plantingDate) : "",
      placeholder: "Not recorded",
    },
  ];

  const quizScoreFields = [
    {
      label: "Quiz Score - Pre-consult",
      value: ensureText(project.quizScorePreConsultation, "Not recorded"),
      placeholder: "Not recorded",
    },
    {
      label: "Quiz Score - Post-planting",
      value: ensureText(project.quizScorePostPlanting, "Not recorded"),
      placeholder: "Not recorded",
    },
  ];

  const statusValueClass =
    project.status === "Active"
      ? "text-green-600 bg-green-50 border-green-200"
      : project.status === "Completed"
      ? "text-blue-600 bg-blue-50 border-blue-200"
      : "text-gray-700 bg-gray-100 border-gray-200";

  const statusFields = [
    {
      label: "Status",
      value: project.status || "N/A",
      valueClassName: statusValueClass,
      placeholder: "N/A",
    },
    {
      label: "Season",
      value: project.seasonYear || "N/A",
      placeholder: "N/A",
    },
  ];

  const acreageFields = [
    {
      label: "Wetland Acres",
      value: ensureText(project.wetlandAcres, "Not recorded"),
      placeholder: "Not recorded",
    },
    {
      label: "Upland Acres",
      value: ensureText(project.uplandAcres, "Not recorded"),
      placeholder: "Not recorded",
    },
    {
      label: "Total Acres",
      value: ensureText(project.totalAcres, "Not recorded"),
      placeholder: "Not recorded",
    },
    {
      label: "Wetland Trees",
      value: ensureText(project.wetlandTrees, "Not recorded"),
      placeholder: "Not recorded",
    },
    {
      label: "Upland Trees",
      value: ensureText(project.uplandTrees, "Not recorded"),
      placeholder: "Not recorded",
    },
    {
      label: "Total Trees",
      value: ensureText(project.totalTrees, "Not recorded"),
      placeholder: "Not recorded",
    },
  ];

  const hasQuizScores = quizScoreFields.some(
    (field) => field.value && field.value !== "Not recorded"
  );

  const openLightbox = (url) => {
    if (url) {
      setLightboxImage(url);
    }
  };

  const closeLightbox = () => setLightboxImage(null);

  const timelinePhases = [
    {
      title: "June — August",
      points: [
        "On-site consultations with TreeFolks' experts & create draft maps",
        'Establish "Grow Zones" in planting areas',
        "Fence out livestock from grow zones",
      ],
    },
    {
      title: "September — November",
      points: [
        "Ideal time for seeding wildflowers & native grasses",
        "Mark planting areas & finalize maps",
      ],
    },
    {
      title: "December — February",
      points: [
        "Trees are planted by contractors or volunteers",
      ],
    },
    {
      title: "March — May",
      points: [
        "Carbon+ Credit docs filed w/ county clerks",
        "Landowners submit photo points annually",
      ],
    },
  ];

  return (
    <div className="bg-gray-50">
      {isAdmin && (
      <div className="border-b border-gray-200 bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={handleGoBack}
            className="flex items-center text-sm text-gray-600 transition hover:text-gray-800"
            title={
              project?.seasonYear
                ? `Back to Season ${project.seasonYear}`
                : "Back to Dashboard"
            }
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
              Back
            </button>
          <div className="flex space-x-2">
            <Link
              to={`/admin/project/${projectId}/edit`}
              className="flex items-center rounded-lg px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-100"
            >
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Link>
            {isAdmin && (
            <button
              onClick={handleDeleteProject}
              className="flex items-center rounded-lg px-3 py-1.5 text-sm text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Delete
            </button>
            )}
          </div>
        </div>
      </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 space-y-10">
        {error && (
          <div className="mb-4 flex items-center justify-center rounded-lg bg-red-100 p-3 text-center text-red-500 shadow-sm">
            <AlertCircle className="mr-2 h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-10">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Planting Photos & Before Photos</p>
              {carouselPhotos.length > 0 ? (
                <Carousel
                  images={carouselPhotos}
                  className="mb-4 lg:mb-6"
                  aspectClass="aspect-[4/3] lg:aspect-[3/2]"
                  onImageClick={openLightbox}
                />
              ) : (
                <div className="mb-4 flex aspect-[4/3] max-h-[360px] items-center justify-center rounded-lg bg-gray-200 shadow-sm lg:mb-6">
                  <p className="text-gray-500">No photos available</p>
                </div>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <PhotoUploadButton
                  label="Upload Planting Photo"
                  slotKey="plantingPhotoUrls"
                  onUpload={initiatePhotoUpload}
                  isUploading={photoUploadState.key === "plantingPhotoUrls"}
                />
                <PhotoUploadButton
                  label="Upload Before Photo"
                  slotKey="beforePhotoUrls"
                  onUpload={initiatePhotoUpload}
                  isUploading={photoUploadState.key === "beforePhotoUrls"}
                />
              </div>
              {photoUploadState.error &&
                ["plantingPhotoUrls", "beforePhotoUrls"].includes(photoUploadState.key) && (
                  <p className="text-xs text-red-600">{photoUploadState.error}</p>
                )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">Landowner Submissions</p>
              {landownerPhotos.length > 0 ? (
                <Carousel
                  images={landownerPhotos}
                  className="mb-4 lg:mb-6"
                  aspectClass="aspect-[4/3] lg:aspect-[3/2]"
                  onImageClick={openLightbox}
                />
              ) : (
                <div className="mb-4 flex aspect-[4/3] max-h-[360px] items-center justify-center rounded-lg bg-gray-200 shadow-sm lg:mb-6">
                  <p className="text-gray-500">No landowner submissions yet</p>
                </div>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <PhotoUploadButton
                  label="Upload Landowner Submission"
                  slotKey="propertyImageUrls"
                  onUpload={initiatePhotoUpload}
                  isUploading={photoUploadState.key === "propertyImageUrls"}
                />
              </div>
              {photoUploadState.error && photoUploadState.key === "propertyImageUrls" && (
                <p className="text-xs text-red-600">{photoUploadState.error}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 text-gray-600">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">
                {primaryContactName}
              </h1>
              {project?.status && (
                <span
                  className={`rounded-full border px-3 py-1 text-sm font-medium ${statusValueClass}`}
                >
                  {project.status}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 flex-shrink-0" />
              <span>{project.address || "No property address recorded"}</span>
            </div>
            {project.location && (
              <div className="flex items-center">
                <span className="ml-7">{project.location}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <InfoCard title="Associated Members">
              <div className="mb-1 flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {primaryContactName}
                  </p>
                  <p className="text-sm text-gray-500">Primary Contact</p>
                </div>
              </div>
              {associatedMemberFields.map(({ label, value, href }) => (
                <InfoField
                  key={label}
                  label={label}
                  value={value}
                  href={href}
                />
              ))}
            </InfoCard>

            <InfoCard title="Activity Dates">
              {activityDateFields.map(({ label, value, placeholder }) => (
                <InfoField
                  key={label}
                  label={label}
                  value={value}
                  placeholder={placeholder}
                />
              ))}
            </InfoCard>

            {(hasQuizScores || !quizScoreFields.every((f) => !f.value)) && (
              <InfoCard title="Quiz Scores">
                {quizScoreFields.map(({ label, value, placeholder }) => (
                  <InfoField
                    key={label}
                    label={label}
                    value={value}
                    placeholder={placeholder}
                  />
                ))}
              </InfoCard>
            )}

            <InfoCard title="Project Status">
              {statusFields.map(
                ({ label, value, valueClassName, placeholder }) => (
                  <InfoField
                    key={label}
                    label={label}
                    value={value}
                    valueClassName={valueClassName}
                    placeholder={placeholder}
                  />
                )
              )}
            </InfoCard>

            <InfoCard title="Acreage & Trees">
              {acreageFields.map(({ label, value, placeholder }) => (
                <InfoField
                  key={label}
                  label={label}
                  value={value}
                  placeholder={placeholder}
                />
              ))}
            </InfoCard>

            <InfoCard
              title="Active Carbon Shapefiles"
              bodyClassName="space-y-4"
            >
              <InfoField label="Availability" value={shapefileSummary} />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDownloadShapeFiles}
                  disabled={!activeCarbonShapefiles.length}
                  className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 ${
                    activeCarbonShapefiles.length
                      ? "border-green-600/30 bg-green-600 text-white shadow-sm shadow-green-500/20 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-md active:translate-y-0"
                      : "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 shadow-none"
                  }`}
                >
                  Download All
                </button>
                {activeCarbonShapefiles.map((url, idx) => (
                  <a
                    key={`${url}-${idx}`}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    File {idx + 1}
                  </a>
                ))}
              </div>
            </InfoCard>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Associated Documents
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Keep carbon paperwork and mapping artifacts together with each project.
          </p>
          {(docUploadState.error || docDeleteState.error) && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {docUploadState.error || docDeleteState.error}
            </div>
          )}
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {resolvedDocumentSlots.map((slot) => (
              <DocumentTile
                key={slot.key}
                slot={slot}
                files={slot.files}
                onUpload={handleDocumentUpload}
                onDelete={handleDocumentDelete}
                onEdit={handleDocumentEdit}
                isUploading={docUploadState.key === slot.key}
                isDeleting={docDeleteState.key === slot.key}
                isAdmin={isAdmin}
                comments={slot.key === 'draftMap' ? project?.draftMapComments : null}
                onAddComment={() => setIsCommentModalOpen(true)}
              />
            ))}
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Photo Gallery</h2>
          <p className="mt-1 text-sm text-gray-500">
            Quick view thumbnails from each photo set.
          </p>

          <div className="mt-6 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Planting Photos & Before Photos
                </p>
                <span className="text-xs text-gray-500">
                  {combinedPhotos.length} photo{combinedPhotos.length === 1 ? "" : "s"}
                </span>
              </div>
              {combinedPhotos.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {combinedPhotos.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                      onClick={() => openLightbox(url)}
                    >
                      <img
                        src={url}
                        alt={`Planting or before photo ${idx + 1}`}
                        className="h-24 w-full object-cover cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  No planting or before photos yet.
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Landowner Submissions
                </p>
                <span className="text-xs text-gray-500">
                  {landownerPhotos.length} photo{landownerPhotos.length === 1 ? "" : "s"}
                </span>
              </div>
              {landownerPhotos.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  {landownerPhotos.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className="overflow-hidden rounded-lg border border-gray-100 bg-gray-50"
                      onClick={() => openLightbox(url)}
                    >
                      <img
                        src={url}
                        alt={`Landowner submission ${idx + 1}`}
                        className="h-24 w-full object-cover cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  No landowner submissions yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DraftMapCommentModal 
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        onSubmit={handleAddComment}
        isSubmitting={isSubmittingComment}
      />

      <DateSelectionModal
        isOpen={!!pendingPhotoUpload}
        onClose={handleDateCancel}
        onConfirm={handleDateConfirm}
        displayName="this photo"
      />

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeLightbox}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-700 shadow-md transition hover:bg-white"
            >
              Close
            </button>
            <img
              src={lightboxImage}
              alt="Selected project media"
              className="max-h-[85vh] w-full object-contain bg-black"
            />
          </div>
        </div>
      )}

      {/* PDF Editor Modal */}
      {pdfEditorState.isOpen && pdfEditorState.pdfUrl && (
        <PdfEditor
          pdfUrl={pdfEditorState.pdfUrl}
          onSave={handlePdfEditorSave}
          onCancel={handlePdfEditorCancel}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
