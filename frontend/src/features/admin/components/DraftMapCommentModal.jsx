import { useState } from "react";
import { Loader2, Upload, Pencil, MessageSquare } from "lucide-react";
import PropTypes from "prop-types";

/**
 * DraftMapCommentModal - Modal for landowners to add comments/feedback on draft maps
 * 
 * Supports three modes:
 * - 'standalone': Just adding a comment (no file action)
 * - 'upload': Adding a comment with a file upload
 * - 'edit': Adding a comment after editing/annotating
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Controls modal visibility
 * @param {function} props.onClose - Callback to close the modal
 * @param {function} props.onSubmit - Callback with comment text (and file for upload mode)
 * @param {boolean} props.isSubmitting - Loading state during submission
 * @param {'standalone'|'upload'|'edit'} props.mode - Modal mode
 * @param {string} props.fileName - File name for upload/edit context display
 */
const DraftMapCommentModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  mode = 'standalone',
  fileName = ''
}) => {
  const [comment, setComment] = useState("");

  // Don't render if modal is closed
  if (!isOpen) return null;

  // Determine if comment is required based on mode
  const isCommentRequired = mode === 'upload' || mode === 'edit';

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(comment);
    setComment(""); // Clear after submission
  };

  // Mode-specific content
  const getModalContent = () => {
    switch (mode) {
      case 'upload':
        return {
          icon: <Upload className="h-5 w-5 text-green-600" />,
          title: "Upload New Draft Map Version",
          description: fileName 
            ? `File: ${fileName}` 
            : "You're uploading a new version of the draft map.",
          placeholder: "Please describe your changes or feedback about this version...",
          submitLabel: "Upload & Submit",
          requirementNote: "A comment is required when uploading a new version."
        };
      case 'edit':
        return {
          icon: <Pencil className="h-5 w-5 text-blue-600" />,
          title: "Save Annotated Draft Map",
          description: "You've made annotations to the draft map.",
          placeholder: "Please describe your annotations or changes...",
          submitLabel: "Save & Submit",
          requirementNote: "A comment is required when saving annotations."
        };
      default: // standalone
        return {
          icon: <MessageSquare className="h-5 w-5 text-gray-600" />,
          title: "Add Draft Map Comment",
          description: null,
          placeholder: "Enter your feedback regarding the draft map...",
          submitLabel: "Submit Comment",
          requirementNote: null
        };
    }
  };

  const content = getModalContent();
  const canSubmit = comment.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            {content.icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {content.title}
            </h3>
            {content.description && (
              <p className="text-sm text-gray-500 truncate max-w-[280px]">
                {content.description}
              </p>
            )}
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Requirement note */}
          {content.requirementNote && (
            <p className="text-xs text-amber-600 mb-2 flex items-center">
              <span className="mr-1">*</span>
              {content.requirementNote}
            </p>
          )}
          
          <textarea
            className="w-full rounded-md border border-gray-300 p-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            rows={4}
            maxLength={500}
            placeholder={content.placeholder}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required={isCommentRequired}
            disabled={isSubmitting}
          />
          <div className="mt-1 text-xs text-gray-500 text-right">
            {comment.length}/500 characters
          </div>
          
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
              className="flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={isSubmitting || !canSubmit}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {content.submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

DraftMapCommentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
  mode: PropTypes.oneOf(['standalone', 'upload', 'edit']),
  fileName: PropTypes.string,
};

export default DraftMapCommentModal;
