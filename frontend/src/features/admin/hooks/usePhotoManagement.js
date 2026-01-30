/**
 * usePhotoManagement Hook
 * 
 * Custom hook that manages photo uploads with date metadata and lightbox functionality.
 * This hook handles:
 * - Photo upload workflow with date selection modal
 * - Automatic filename formatting with date (name_M_D_YYYY.ext)
 * - Photo upload state tracking (uploading, errors)
 * - Lightbox state for viewing full-size images
 * - Support for multiple photo slots (planting, before, landowner submissions)
 * 
 * Workflow:
 * 1. User selects a photo file
 * 2. Date selection modal opens
 * 3. User confirms date
 * 4. Photo is renamed with date and uploaded
 * 
 * @param {string} projectId - The ID of the project
 * @param {Function} loadProjectDetails - Function to reload project data after upload
 * @returns {Object} Photo management state and operations
 * @returns {Object} photoUploadState - Upload state { key, error, errorSlot }
 * @returns {Object|null} pendingPhotoUpload - Pending upload { file, slotKey }
 * @returns {string|null} lightboxImage - URL of image currently in lightbox
 * @returns {Function} initiatePhotoUpload - Function to start photo upload flow
 * @returns {Function} handleDateConfirm - Function to confirm date and upload photo
 * @returns {Function} handleDateCancel - Function to cancel photo upload
 * @returns {Function} openLightbox - Function to open lightbox with image
 * @returns {Function} closeLightbox - Function to close lightbox
 */

import { useState } from "react";
import apiService from "../../../services/apiService";

export const usePhotoManagement = (projectId, loadProjectDetails) => {
  const [photoUploadState, setPhotoUploadState] = useState({ key: null, error: null, errorSlot: null });
  const [pendingPhotoUpload, setPendingPhotoUpload] = useState(null); // { file, slotKey }
  const [lightboxImage, setLightboxImage] = useState(null);

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
    setPhotoUploadState({ key: slotKey, error: null, errorSlot: null });
    try {
      await apiService.uploadProjectDocument(projectId, slotKey, newFile);
      await loadProjectDetails();
      setPhotoUploadState({ key: null, error: null, errorSlot: null });
    } catch (uploadErr) {
      console.error("Failed to upload photo:", uploadErr);
      setPhotoUploadState({
        key: null,  // Reset key so button stops showing "Uploading..."
        error: uploadErr?.message || "Failed to upload photo.",
        errorSlot: slotKey,  // Track which slot had the error for display
      });
    }
  };

  const handleDateCancel = () => {
    setPendingPhotoUpload(null);
  };

  const openLightbox = (url) => {
    if (url) {
      setLightboxImage(url);
    }
  };

  const closeLightbox = () => setLightboxImage(null);

  return {
    photoUploadState,
    pendingPhotoUpload,
    lightboxImage,
    initiatePhotoUpload,
    handleDateConfirm,
    handleDateCancel,
    openLightbox,
    closeLightbox
  };
};
