// frontend/src/services/apiService.js
import axios from 'axios';

// Get the base URL from environment variables or use a default
const API_BASE_URL = import.meta.env.API_BASE_URL || 'http://localhost:3000/api';

// Optional: Create an Axios instance for configuration (e.g., setting base URL)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Handles errors from API calls.
 * Logs the error and potentially formats it for the UI.
 * @param {string} context - Description of the operation being attempted.
 * @param {Error} error - The error object caught.
 */
const handleError = (context, error) => {
  console.error(`API Service Error (${context}):`, error);
  let errorMessage = `Failed to ${context}.`;

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Status:', error.response.status);
    console.error('Data:', error.response.data);
    // Use the backend's error message if available
    errorMessage = error.response.data?.message || `Server responded with status ${error.response.status}.`;
  } else if (error.request) {
    // The request was made but no response was received
    console.error('Request:', error.request);
    errorMessage = 'No response received from server. Check network or backend status.';
  } else {
    // Something happened in setting up the request that triggered an Error
    errorMessage = error.message || 'An unexpected error occurred.';
  }
  // Re-throw the error so the calling component can handle it (e.g., show a notification)
  // You might want to throw a more specific error object or just the message
  throw new Error(errorMessage);
};

// --- Service Functions ---

/**
 * Fetches all available season options.
 * Corresponds to: GetAllSeason()
 * @returns {Promise<string[]>} A promise that resolves to an array of season strings.
 */
export const getAllSeasons = async () => {
  try {
    const response = await apiClient.get('/seasons');
    return response.data; // Should be an array of strings like ["24-25", "25-26"]
  } catch (error) {
    handleError('fetch seasons', error);
  }
};

/**
 * Fetches projects filtered by a specific season.
 * Corresponds to: GetProjectsForSeason(season)
 * @param {string} season - The season name (e.g., "24-25").
 * @returns {Promise<object[]>} A promise that resolves to an array of project summary objects.
 *                               Each object should contain fields like id, ownerFullName, address,
 *                               plantingDate, description, initialMapUrl, plantingPhotoUrls etc. (as defined in backend service).
 */
export const getProjectsBySeason = async (season) => {
  if (!season) {
    console.error("getProjectsBySeason requires a season parameter.");
    throw new Error("Season parameter is required."); // Or return empty array?
  }
  try {
    // Encode the season string to handle special characters like spaces or slashes if necessary
    const encodedSeason = encodeURIComponent(season);
    const response = await apiClient.get(`/projects/season/${encodedSeason}`);
    // The backend's processRecord should format the data, including image URLs
    return response.data;
  } catch (error) {
    handleError(`fetch projects for season ${season}`, error);
  }
};

/**
 * Fetches detailed information for a single project.
 * Corresponds to: GetProjectStatus(), GetLandownerInformation()
 * @param {string} recordId - The Airtable record ID of the project.
 * @returns {Promise<object|null>} A promise that resolves to a detailed project object, or null if not found.
 */
export const getProjectDetails = async (recordId) => {
  if (!recordId) {
    console.error("getProjectDetails requires a recordId parameter.");
    throw new Error("Record ID parameter is required.");
  }
  try {
    const response = await apiClient.get(`/projects/details/${recordId}`);
    return response.data; // Backend should return the detailed processed record
  } catch (error) {
    // Specifically handle 404 Not Found from the backend
    if (error.response && error.response.status === 404) {
      console.warn(`Project details not found for recordId: ${recordId}`);
      return null; // Return null if not found
    }
    handleError(`fetch project details for ${recordId}`, error);
  }
};

/**
 * Adds a new season option using the backend workaround.
 * Corresponds to: AddNewFolder(seasonName)
 * @param {string} seasonName - The name of the new season (e.g., "30-31").
 * @returns {Promise<object>} A promise that resolves to the success message object from the backend.
 */
export const addSeason = async (seasonName) => {
  if (!seasonName || typeof seasonName !== 'string' || seasonName.trim() === '') {
    console.error("addSeason requires a non-empty seasonName string.");
    throw new Error("Valid seasonName is required.");
  }
  try {
    const response = await apiClient.post('/seasons', { seasonName: seasonName.trim() });
    return response.data; // e.g., { message: "Season option '...' potentially added..." }
  } catch (error) {
    handleError(`add season ${seasonName}`, error);
  }
};

/**
 * Adds a new project record to Airtable.
 * Corresponds to: AddNewProject(...)
 * @param {object} projectData - An object containing the project details.
 *                               Keys should match the frontend API keys defined in the backend's FIELD_MAP.apiToAirtable
 *                               (e.g., season, ownerLastName, ownerFirstName, address, etc.).
 * @returns {Promise<object>} A promise that resolves to the newly created project object (as processed by the backend).
 */
export const addProject = async (projectData) => {
  if (!projectData || typeof projectData !== 'object' || Object.keys(projectData).length === 0) {
    console.error("addProject requires a projectData object.");
    throw new Error("Project data is required.");
  }
  // Add basic client-side validation if desired (e.g., check for required fields)
  if (!projectData.season) throw new Error("Project data must include a 'season'.");
  if (!projectData.ownerLastName) throw new Error("Project data must include 'ownerLastName'.");
  if (!projectData.address) throw new Error("Project data must include 'address'.");
  // ... add other required field checks based on your backend's needs ...

  try {
    const response = await apiClient.post('/projects', projectData);
    return response.data; // The newly created record, processed by the backend
  } catch (error) {
    handleError('add new project', error);
  }
};
