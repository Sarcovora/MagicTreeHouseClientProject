// src/services/landownerService.js
import { apiClient } from './apiClient';
import { normalizeProjectRecord } from './apiHelpers';

/**
 * Fetches the PRIMARY project associated with the logged-in landowner.
 * Used for single-project views.
 * 
 * @returns {Promise<object|null>} Normalized project record or null if not found
 */
export const getLandownerProject = async () => {
    try {
      const response = await apiClient.get('/projects/my-project');
      if (!response?.data) {
        return null;
      }
      return normalizeProjectRecord(response.data);
    } catch (error) {
      console.error(`API Call: getLandownerProject() -> Failed.`, error);
      if (error.response?.status === 404) {
          return null;
      }
      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch landowner project.'
      );
    }
  };
  
  /**
   * Fetches ALL projects associated with the logged-in landowner's email.
   * Supports landowners with multiple projects.
   * @returns {Promise<Array>} Array of normalized project records
   */
  export const getLandownerProjects = async () => {
    try {
      const response = await apiClient.get('/projects/my-projects');
      if (!response?.data || !Array.isArray(response.data)) {
        return [];
      }
      return response.data.map(normalizeProjectRecord);
    } catch (error) {
      console.error(`API Call: getLandownerProjects() -> Failed.`, error);
      if (error.response?.status === 404) {
          return [];
      }
      throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch landowner projects.'
      );
    }
  };
