// src/services/documentService.js
import { apiClient } from './apiClient';
import { fileToBase64, resetSeasonProjectsCache } from './apiHelpers';

export const uploadProjectDocument = async (projectId, documentType, file) => {
  if (!projectId) {
    throw new Error('Project ID is required to upload a document.');
  }
  if (!documentType) {
    throw new Error('Document type is required.');
  }
  if (!file) {
    throw new Error('A file must be provided.');
  }

  try {
    const base64Data = await fileToBase64(file);
    const payload = {
      documentType,
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      data: base64Data,
    };

    const response = await apiClient.post(
      `/projects/${encodeURIComponent(projectId)}/documents`,
      payload
    );

    resetSeasonProjectsCache();
    return response?.data ?? null;
  } catch (error) {
    console.error(
      `API Call: uploadProjectDocument(${projectId}, ${documentType}) -> Failed.`,
      error
    );
    
    // Check for file too large error (HTTP 413)
    if (error?.response?.status === 413 || 
        error?.message?.toLowerCase().includes('too large') ||
        error?.response?.data?.message?.toLowerCase().includes('too large')) {
      throw new Error('The file is too large to upload. Please try a smaller file (under 30MB) or compress the image before uploading.');
    }
    
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to upload project document.'
    );
  }
};

export const deleteProjectDocument = async (projectId, documentType) => {
  if (!projectId) {
    throw new Error('Project ID is required to delete a document.');
  }
  if (!documentType) {
    throw new Error('Document type is required.');
  }

  try {
    const response = await apiClient.delete(
      `/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(documentType)}`
    );
    resetSeasonProjectsCache();
    return response?.data ?? null;
  } catch (error) {
    console.error(
      `API Call: deleteProjectDocument(${projectId}, ${documentType}) -> Failed.`,
      error
    );
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to delete project document.'
    );
  }
};

/**
 * Replace a specific document at a given index within a multi-file slot.
 * Used for individual file replacement in Final Map.
 * @param {string} projectId - Airtable record ID
 * @param {string} documentType - Document slot key (e.g., 'finalMap')
 * @param {number} index - Index of file to replace (0-based)
 * @param {File} file - The new file to upload
 */
export const replaceProjectDocumentAtIndex = async (projectId, documentType, index, file) => {
  if (!projectId) {
    throw new Error('Project ID is required.');
  }
  if (!documentType) {
    throw new Error('Document type is required.');
  }
  if (typeof index !== 'number' || index < 0) {
    throw new Error('Valid index is required.');
  }
  if (!file) {
    throw new Error('A file must be provided.');
  }

  try {
    const base64Data = await fileToBase64(file);
    const payload = {
      filename: file.name,
      contentType: file.type || 'application/octet-stream',
      data: base64Data,
    };

    const response = await apiClient.put(
      `/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(documentType)}/${index}`,
      payload
    );

    resetSeasonProjectsCache();
    return response?.data ?? null;
  } catch (error) {
    console.error(
      `API Call: replaceProjectDocumentAtIndex(${projectId}, ${documentType}, ${index}) -> Failed.`,
      error
    );
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to replace document at index.'
    );
  }
};

/**
 * Delete a specific document at a given index within a multi-file slot.
 * Used for individual file deletion in Final Map.
 * @param {string} projectId - Airtable record ID
 * @param {string} documentType - Document slot key (e.g., 'finalMap')
 * @param {number} index - Index of file to delete (0-based)
 */
export const deleteProjectDocumentAtIndex = async (projectId, documentType, index) => {
  if (!projectId) {
    throw new Error('Project ID is required.');
  }
  if (!documentType) {
    throw new Error('Document type is required.');
  }
  if (typeof index !== 'number' || index < 0) {
    throw new Error('Valid index is required.');
  }

  try {
    const response = await apiClient.delete(
      `/projects/${encodeURIComponent(projectId)}/documents/${encodeURIComponent(documentType)}/${index}`
    );

    resetSeasonProjectsCache();
    return response?.data ?? null;
  } catch (error) {
    console.error(
      `API Call: deleteProjectDocumentAtIndex(${projectId}, ${documentType}, ${index}) -> Failed.`,
      error
    );
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to delete document at index.'
    );
  }
};
