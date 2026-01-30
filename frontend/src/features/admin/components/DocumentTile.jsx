/**
 * DocumentTile - Versatile document slot component handling uploads and versions
 * 
 * Features:
 * - Document display with versioning support (multiple files per slot)
 * - Upload/Replace/Delete/Edit actions with permission checks
 * - Special handling for draft maps (landowner uploads, comments)
 * - Loading states for all async operations
 * - Version selector dropdown for multi-file documents
 * 
 * Permission Model:
 * - Admins: Full control (upload, delete, edit all documents)
 * - Landowners: Can only upload new versions of draft maps (no delete)
 * 
 * @param {object} props
 */

import { useRef, useState } from "react";
import { Loader2, Plus, Pencil, MessageSquare, Trash2 } from "lucide-react";

// ==================== Constants ====================

/**
 * Image file extensions that can be edited in PdfEditor
 */
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg'];

/**
 * PDF file extension
 */
const PDF_EXTENSION = 'pdf';

// ==================== Helper Functions ====================

/**
 * Parse comments string from Airtable into structured array.
 * 
 * Comments are stored as newline-separated entries in Airtable.
 * Supports two formats:
 * 1. Backend format: "[Jan 15, 2026, 10:00 AM] comment text"
 * 2. Legacy/Manual format: "Jan 15, 2026 - comment text"
 * 
 * @param {string} commentsString - Raw comments string from Airtable
 * @returns {Array<{id: number, date: string|null, text: string}>} Parsed comments
 */
const parseComments = (commentsString) => {
  if (!commentsString) return [];
  
  // Split by double newline (comment separator) or single newline if no doubles
  const separator = commentsString.includes('\n\n') ? '\n\n' : '\n';
  const parts = commentsString.split(separator).filter(Boolean);
  
  return parts.map((part, index) => {
    // Try backend format first: "[timestamp] comment text"
    const bracketMatch = part.match(/^\[(.*?)(?:\])\s*(.*)$/s);
    if (bracketMatch) {
      return {
        id: index,
        date: bracketMatch[1],
        text: bracketMatch[2].trim()
      };
    }

    // Try legacy format: "Jan 15, 2026 - comment text"
    const legacyMatch = part.match(/^(\w{3}\s+\d{1,2},?\s+\d{4})\s*[-–:]\s*(.*)$/s);
    if (legacyMatch) {
      return {
        id: index,
        date: legacyMatch[1],
        text: legacyMatch[2].trim()
      };
    }
    
    // Fallback: no recognized date format
    return {
      id: index,
      date: null,
      text: part.trim()
    };
  });
};

/**
 * Extracts file info from a file object or string URL.
 * 
 * Airtable can return files as either:
 * - Object: { url: "...", filename: "..." }
 * - String: Direct URL
 * 
 * @param {string|object} file - File data from Airtable
 * @returns {{url: string, filename: string, extension: string}} Normalized file info
 */
const getFileInfo = (file) => {
  if (!file) return { url: '', filename: '', extension: '' };
  
  const url = typeof file === 'object' ? file.url : file;
  const filename = typeof file === 'object' ? file.filename : '';
  
  // Determine extension from filename if available, else from URL
  let extension = '';
  if (filename) {
    extension = filename.split('.').pop().toLowerCase();
  } else {
    // Fallback to URL parsing (less reliable for signed URLs)
    const cleanUrl = url.split('?')[0].toLowerCase();
    if (cleanUrl.match(/\.[a-z0-9]+$/)) {
      extension = cleanUrl.split('.').pop();
    }
  }
  
  return { url, filename, extension };
};

/**
 * Determines if a file should be treated as a PDF for editing.
 * 
 * @param {string} extension - File extension
 * @param {string} slotKey - Document slot key (e.g., 'draftMap')
 * @returns {boolean} True if file should be opened as PDF
 */
const isPdfFile = (extension, slotKey) => {
  const hasImageExt = IMAGE_EXTENSIONS.includes(extension);
  const hasPdfExt = extension === PDF_EXTENSION;
  
  // It's a PDF if explicit pdf extension, OR (if extension is missing AND it's draftMap)
  return hasPdfExt || (slotKey === 'draftMap' && !hasImageExt);
};

// ==================== Subcomponents ====================

/**
 * Renders the empty state with upload button or read-only placeholder.
 */
const EmptyState = ({ slot, canModify, isUploading, openPicker, inputId, handleFileChange }) => {
  // Read-only state: no permission to upload
  if (!canModify) {
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

  // Upload state: show upload button
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
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>
    </div>
  );
};

/**
 * Renders the version selector dropdown for multi-file slots.
 */
const VersionSelector = ({ files, slot, selectedVersionIndex, onVersionChange }) => {
  if (files.length <= 1) return null;
  
  return (
    <div className="mt-3">
      <label className="text-xs font-medium text-gray-600">
        {slot.key === 'draftMap' ? 'Select version:' : 'Select file:'}
      </label>
      <select
        value={selectedVersionIndex !== null ? selectedVersionIndex : files.length - 1}
        onChange={(e) => onVersionChange(Number(e.target.value))}
        className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs"
      >
        {files.map((file, index) => {
          const { filename } = getFileInfo(file);
          const displayLabel = slot.key === 'draftMap' 
            ? `Version ${index + 1}`
            : (filename || `File ${index + 1}`);
            
          return (
            <option key={index} value={index}>
              {displayLabel}
            </option>
          );
        }).reverse()} 
        {/* Reverse so newest/last added is at top */}
      </select>
    </div>
  );
};

/**
 * Renders action buttons (View, Edit, Replace, Delete).
 */
const ActionButtons = ({
  primaryUrl,
  canEdit,
  isAdmin,
  slot,
  isBusy,
  isUploading,
  isDeleting,
  onEdit,
  openPicker,
  onDelete,
  inputId,
  handleFileChange,
  fileInputRef
}) => {
  const disabledLinkClass = isBusy ? "pointer-events-none opacity-60" : "";
  
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {/* View Button */}
      <a
        href={primaryUrl}
        target="_blank"
        rel="noreferrer"
        className={`flex-1 rounded-lg border border-green-600/30 bg-green-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm shadow-green-500/20 transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 ${disabledLinkClass}`}
      >
        View
      </a>
      
      {/* Edit Button - Draft Map Only */}
      {canEdit && (
        <button
          type="button"
          onClick={onEdit}
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
      
      {/* Replace/Upload New Version Button */}
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
      
      {/* Delete Button - Admin Only */}
      {isAdmin && (
        <button
          type="button"
          onClick={onDelete}
          className={`rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 ${
            isBusy ? "opacity-70" : ""
          }`}
          disabled={isBusy}
        >
          Delete
        </button>
      )}
      
      {/* Hidden File Input */}
      {(isAdmin || slot.key === 'draftMap') && (
        <input
          id={inputId}
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          disabled={isBusy}
        />
      )}
    </div>
  );
};

/**
 * Renders the draft map comments section.
 */
const CommentsSection = ({ parsedComments, isAdmin, hasFiles, onAddComment }) => {
  return (
    <div className="mt-4 border-t border-gray-100 pt-3">
      {/* Show the most recent comment for both admins and landowners */}
      {parsedComments.length > 0 && (
        <div className="rounded-md bg-yellow-50 p-3 mb-3">
          <p className="text-xs font-semibold text-yellow-800 mb-2">
            Last Landowner Comment:
          </p>
          {(() => {
            const lastComment = parsedComments[0];
            return (
              <div className="text-xs text-yellow-700 border-l-2 border-yellow-300 pl-2">
                {lastComment.date && (
                  <p className="font-medium text-yellow-800">{lastComment.date}</p>
                )}
                <p className="whitespace-pre-wrap">{lastComment.text}</p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Landowner: Add Comment Button */}
      {!isAdmin && hasFiles && (
        <div className="space-y-3">
          <button
            onClick={onAddComment}
            className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
          >
            <MessageSquare className="mr-2 h-4 w-4 text-gray-500" />
            Add Comment / Feedback
          </button>
        </div>
      )} 
    </div>
  );
};

/**
 * List view for Final Map documents with individual actions.
 */
const FinalMapList = ({ 
  files, 
  isAdmin, 
  isBusy, 
  onView, 
  triggerReplace, 
  triggerDelete, 
  triggerAdd 
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-3 mb-4">
        {files.map((file, index) => {
          const { filename, url } = getFileInfo(file);
          const displayName = filename || `Document ${index + 1}`;
          
          return (
            <div key={index} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-white border border-gray-200 text-gray-400">
                  <span className="text-xs font-bold">PDF</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-700" title={displayName}>
                    {displayName}
                  </p>
                  <button 
                    onClick={() => onView(url)}
                    className="text-xs text-green-600 hover:text-green-700 hover:underline"
                  >
                    View
                  </button>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={() => triggerReplace(index)}
                    disabled={isBusy}
                    className="p-1.5 text-gray-500 hover:bg-white hover:text-blue-600 rounded-md transition-colors disabled:opacity-50"
                    title="Replace this file"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => triggerDelete(index, displayName)}
                    disabled={isBusy}
                    className="p-1.5 text-gray-500 hover:bg-white hover:text-red-600 rounded-md transition-colors disabled:opacity-50"
                    title="Delete this file"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAdmin && (
        <button
          onClick={triggerAdd}
          disabled={isBusy}
          className="mt-auto flex w-full items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-green-400 hover:text-green-600 disabled:opacity-50 transition-colors"
        >
          {isBusy ? (
             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
             <Plus className="mr-2 h-4 w-4" />
          )}
          Add Another Document
        </button>
      )}
    </div>
  );
};

// ==================== Main Component ====================

/**
 * DocumentTile - Manages document uploads, versions, and permissions.
 * 
 * @param {object} props
 * @param {object} props.slot - Document slot config { key, label, description, fallbackField }
 * @param {Array} props.files - Array of file objects or URLs for this slot
 * @param {function} props.onUpload - Callback(slotKey, file) for uploads (admin only for draftMap)
 * @param {function} props.onUploadWithComment - Callback(file) for landowner draftMap uploads
 * @param {function} props.onDelete - Callback(slot) for deletions
 * @param {function} props.onEdit - Callback(slotKey, url, isPdf, filename) to open editor
 * @param {function} props.onReplaceAtIndex - Callback(slotKey, file, index) for replacing specific file
 * @param {function} props.onDeleteAtIndex - Callback(slot, index, filename) for deleting specific file
 * @param {boolean} props.isUploading - Loading state during upload
 * @param {boolean} props.isDeleting - Loading state during deletion
 * @param {boolean} props.isAdmin - Whether current user is admin
 * @param {string} props.comments - Draft map comments (Airtable blob - newline separated)
 * @param {function} props.onAddComment - Callback to show standalone comment modal
 */
const DocumentTile = ({
  slot,
  files,
  onUpload,
  onUploadWithComment,
  onDelete,
  onEdit,
  onReplaceAtIndex,
  onDeleteAtIndex,
  isUploading,
  isDeleting,
  isAdmin,
  comments,
  onAddComment,
}) => {
  // ==================== Refs & State ====================
  
  const fileInputRef = useRef(null);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(null);
  
  // Track context for file picker actions:
  // null = default/global upload/replace
  // { type: 'replace', index: 1 } = replace specific file
  // { type: 'add' } = add new file to list
  const [pendingAction, setPendingAction] = useState(null);

  // ==================== Computed Values ====================
  
  const parsedComments = parseComments(comments);
  const inputId = `upload-${slot.key}`;
  const canEdit = slot.key === 'draftMap' && files.length > 0;
  
  // Landowners can only upload versions if a file already exists
  // Initial upload is Admin only
  const canModify = isAdmin || (slot.key === 'draftMap' && files.length > 0);
  const isBusy = isUploading || isDeleting;

  // ==================== Event Handlers ====================
  
  /**
   * Handles file selection from the hidden file input.
   * Routes to correct handler based on pendingAction.
   */
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    try {
      if (pendingAction?.type === 'replace' && typeof pendingAction.index === 'number') {
        // Replace specific file at index
        if (onReplaceAtIndex) {
          await onReplaceAtIndex(slot.key, selectedFile, pendingAction.index);
        }
      } else if (pendingAction?.type === 'add') {
         // Add new file to list (append)
         await onUpload(slot.key, selectedFile);
      } else {
        // Default behavior (existing logic)
        // For landowner draftMap uploads, use the comment-required flow
        if (!isAdmin && slot.key === 'draftMap' && onUploadWithComment) {
          onUploadWithComment(selectedFile);
        } else {
          await onUpload(slot.key, selectedFile);
        }
      }
    } finally {
       setPendingAction(null);
       event.target.value = ""; // Allow re-selecting same file
    }
  };

  /**
   * Opens the hidden file picker with optional action context.
   */
  const openPicker = (actionContext = null) => {
    setPendingAction(actionContext);
    // Use timeout to ensure state updates before click, although usually sync in React 18 event handlers
    setTimeout(() => {
        fileInputRef.current?.click();
    }, 0);
  };

  /**
   * Actions for Final Map List
   */
  const triggerReplaceAtIndex = (index) => {
      openPicker({ type: 'replace', index });
  };
  
  const triggerAddDocument = () => {
      openPicker({ type: 'add' });
  };

  const triggerDeleteAtIndex = (index, filename) => {
      if (onDeleteAtIndex) {
          onDeleteAtIndex(slot, index, filename);
      }
  };
  
  const handleViewUrl = (url) => {
      window.open(url, '_blank');
  };

  /**
   * Handles edit button click - opens PdfEditor with selected file.
   */
  const handleEdit = () => {
    if (!onEdit) return;
    
    // Use selected version, or default to newest (last in array)
    const indexToEdit = selectedVersionIndex !== null ? selectedVersionIndex : files.length - 1;
    const fileData = files[indexToEdit];
    const { url, extension, filename } = getFileInfo(fileData);
    
    const isPdf = isPdfFile(extension, slot.key);
    onEdit(slot.key, url, isPdf, filename);
  };

  // ==================== Render: Empty State ====================
  
  if (files.length === 0) {
    // If not uploading, show empty state
    // If uploading, we still want to show the empty state with spinner usually, 
    // but the EmptyState component handles isUploading prop to show spinner.
    return (
      <EmptyState
        slot={slot}
        canModify={canModify}
        isUploading={isUploading}
        openPicker={() => openPicker(null)}
        inputId={inputId}
        handleFileChange={handleFileChange}
      />
    );
  }

  // ==================== Render: Final Map Special View ====================
  
  if (slot.key === 'finalMap') {
      return (
        <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            {/* Header */}
           <div className="mb-4">
               <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                 {slot.label}
               </p>
               <p className="mt-1 text-xs text-gray-400">
                 {slot.description}
               </p>
           </div>
           
           <FinalMapList 
             files={files}
             isAdmin={isAdmin}
             isBusy={isBusy}
             onView={handleViewUrl}
             triggerReplace={triggerReplaceAtIndex}
             triggerDelete={triggerDeleteAtIndex}
             triggerAdd={triggerAddDocument}
           />
           
            {/* Hidden File Input Shared */}
           <input
             id={inputId}
             type="file"
             ref={fileInputRef}
             className="hidden"
             onChange={handleFileChange}
             disabled={isBusy}
           />
        </div>
      );
  }

  // ==================== Render: Standard Document Exists ====================
  
  // Default to newest version (last in array) if none selected
  const indexToUse = selectedVersionIndex !== null 
    ? selectedVersionIndex 
    : files.length - 1;
    
  const primaryFile = files[indexToUse];
  const { url: primaryUrl } = getFileInfo(primaryFile);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {slot.label}
      </p>
      
      {/* File Info */}
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

      {/* Version Selector (for multiple files) */}
      <VersionSelector
        files={files}
        slot={slot}
        selectedVersionIndex={selectedVersionIndex}
        onVersionChange={setSelectedVersionIndex}
      />

      {/* Action Buttons */}
      <ActionButtons
        primaryUrl={primaryUrl}
        canEdit={canEdit}
        isAdmin={isAdmin}
        slot={slot}
        isBusy={isBusy}
        isUploading={isUploading}
        isDeleting={isDeleting}
        onEdit={handleEdit}
        openPicker={() => openPicker(null)}
        onDelete={() => onDelete?.(slot)}
        inputId={inputId}
        handleFileChange={handleFileChange}
        fileInputRef={fileInputRef}
      />

      {/* Draft Map Comments Section */}
      {slot.key === 'draftMap' && (
        <CommentsSection
          parsedComments={parsedComments}
          isAdmin={isAdmin}
          hasFiles={files.length > 0}
          onAddComment={() => onAddComment?.()}
        />
      )}
    </div>
  );
};

export default DocumentTile;
