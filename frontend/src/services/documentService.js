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
