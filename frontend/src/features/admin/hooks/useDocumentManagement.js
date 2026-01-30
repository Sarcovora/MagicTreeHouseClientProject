/**
 * useDocumentManagement Hook
 * 
 * Custom hook that handles document upload, deletion, and versioning logic.
 * This hook manages all document-related operations including:
 * - Uploading documents with automatic versioning for draft maps
 * - Deleting documents with confirmation
 * - Managing upload and delete state (loading, errors)
 * - Calculating next version numbers for draft maps
 * - Handling fallback document fields from legacy data
 * - Individual file replace/delete for multi-file slots (e.g., Final Map)
 * 
 * Versioning Logic:
 * - Draft maps are automatically versioned as draftMap_v1, draftMap_v2, etc.
 * - Other document types keep their original filenames
 * 
 * @param {string} projectId - The ID of the project
 * @param {Object} project - The current project data
 * @param {Function} loadProjectDetails - Function to reload project data after operations
 * @returns {Object} Document management state and operations
 */

import { useState } from "react";
import apiService from "../../../services/apiService";
import { ensureArray } from "../utils/projectHelpers";
import { DOCUMENT_SLOTS } from "../constants/projectConstants";

export const useDocumentManagement = (projectId, project, loadProjectDetails) => {
  const [docUploadState, setDocUploadState] = useState({ key: null, error: null });
  const [docDeleteState, setDocDeleteState] = useState({ key: null, error: null });

  /**
   * Upload a document to a project
   * @param {string} slotKey - The document slot key (e.g., 'draftMap', 'agreement')
   * @param {File} file - The file to upload
   * @param {Object} options - Optional settings
   * @param {boolean} options.skipRefresh - If true, skip calling loadProjectDetails after upload
   */
  const handleDocumentUpload = async (slotKey, file, options = {}) => {
    const { skipRefresh = false } = options;
    
    if (!projectId || !file) {
      return;
    }

    // --- Versioning / Renaming Logic ---
    const primaryDocs = ensureArray(project?.documents?.[slotKey]);
    const fallbackDocs = DOCUMENT_SLOTS.find(s => s.key === slotKey)?.fallbackField 
        ? ensureArray(project?.[DOCUMENT_SLOTS.find(s => s.key === slotKey).fallbackField]) 
        : [];
    const currentFiles = primaryDocs.length > 0 ? primaryDocs : fallbackDocs;
    
    let newName = file.name;
    let renamedFile = file;

    // ONLY for draft maps: enforce version naming
    if (slotKey === 'draftMap') {
        const nextVersionIndex = currentFiles.length + 1; // 1-based versioning
        const originalName = file.name;
        const lastDotIndex = originalName.lastIndexOf(".");
        const ext = lastDotIndex !== -1 ? originalName.slice(lastDotIndex) : "";
        newName = `${slotKey}_v${nextVersionIndex}${ext}`;
        renamedFile = new File([file], newName, { type: file.type });
    }

    setDocUploadState({ key: slotKey, error: null });
    try {
      await apiService.uploadProjectDocument(projectId, slotKey, renamedFile);
      // Give Airtable a window to finish hosting
      await new Promise((resolve) => setTimeout(resolve, 5000));
      
      // Only refresh if caller didn't request to skip
      // (e.g., when adding a comment after upload, caller will refresh after comment is added)
      if (!skipRefresh) {
        await loadProjectDetails();
      }
    } catch (uploadErr) {
      console.error("Failed to upload document:", uploadErr);
      setDocUploadState({
        key: null,
        error: uploadErr?.message || "Failed to upload document.",
      });
      throw uploadErr; // Re-throw so caller knows upload failed
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

  /**
   * Replace a specific document at a given index within a multi-file slot.
   * Used for individual file replacement in Final Map.
   * @param {string} slotKey - The document slot key (e.g., 'finalMap')
   * @param {File} file - The new file to upload
   * @param {number} index - Index of file to replace (0-based)
   */
  const handleDocumentReplaceAtIndex = async (slotKey, file, index) => {
    if (!projectId || !file || typeof index !== 'number') {
      return;
    }

    setDocUploadState({ key: slotKey, error: null });
    try {
      await apiService.replaceProjectDocumentAtIndex(projectId, slotKey, index, file);
      // Give Airtable a window to finish hosting
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await loadProjectDetails();
    } catch (uploadErr) {
      console.error(`Failed to replace document at index ${index}:`, uploadErr);
      setDocUploadState({
        key: null,
        error: uploadErr?.message || "Failed to replace document.",
      });
      throw uploadErr;
    }
    setDocUploadState({ key: null, error: null });
  };

  /**
   * Delete a specific document at a given index within a multi-file slot.
   * Used for individual file deletion in Final Map.
   * @param {Object} slot - The document slot object { key, label }
   * @param {number} index - Index of file to delete (0-based)
   * @param {string} filename - Optional filename for confirmation dialog
   */
  const handleDocumentDeleteAtIndex = async (slot, index, filename) => {
    if (!projectId || !slot?.key || typeof index !== 'number') {
      return;
    }
    
    const displayName = filename || `File ${index + 1}`;
    const confirmed = window.confirm(
      `Delete "${displayName}" from ${slot.label}? This cannot be undone.`
    );
    if (!confirmed) {
      return;
    }

    setDocDeleteState({ key: slot.key, error: null });
    try {
      await apiService.deleteProjectDocumentAtIndex(projectId, slot.key, index);
      await loadProjectDetails();
      setDocDeleteState({ key: null, error: null });
    } catch (deleteErr) {
      console.error(`Failed to delete document at index ${index}:`, deleteErr);
      setDocDeleteState({
        key: null,
        error: deleteErr?.message || "Failed to delete document.",
      });
    }
  };

  return {
    docUploadState,
    docDeleteState,
    handleDocumentUpload,
    handleDocumentDelete,
    handleDocumentReplaceAtIndex,
    handleDocumentDeleteAtIndex
  };
};
