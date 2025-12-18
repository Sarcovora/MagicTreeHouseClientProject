// src/services/apiService.js

/**
 * This module centralizes calls the frontend makes to the backend.
 *
 * REAL DATA
 * --------
 *   - getSeasons           → GET /api/seasons
*   - getProjectsBySeason  → GET /api/projects/season/:season
*   - getAllProjects       → Aggregates the above
*   - getProjectDetails    → GET /api/projects/details/:recordId
 *   - addSeason            → POST /api/seasons
 * MOCK DATA (temporary fallbacks while endpoints come online)
 * -----------------------------------------------------------
 *   - Document library helpers, forms, and user profile still use static mocks.
 */

import axios from 'axios';
import { auth } from '../firebase';

// --- Configuration ---
const DEFAULT_API_BASE = 'http://localhost:3000';
const apiBaseFromEnv = (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');
const apiPrefix = import.meta?.env?.VITE_API_PREFIX ?? '/api';
const apiClient = axios.create({
  baseURL: `${apiBaseFromEnv}${apiPrefix}`,
  timeout: 45000,
});

apiClient.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Unable to attach auth token:", error);
    }
  }
  return config;
});

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        const base64 = result.split(",").pop();
        resolve(base64 || "");
      } else {
        reject(new Error("Unable to read file as base64."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file for upload."));
    };
    reader.readAsDataURL(file);
  });
// --- Mock Data ---

let mockDocuments = [
      {
          id: 'doc1',
          title: 'Property Map - Site A',
          description: 'Detailed map of the primary planting area.',
          category: 'Property Maps',
          fileName: 'site_a_map.jpg',
          fileType: 'image/jpeg',
          fileSize: 2 * 1024 * 1024, // 2MB
          fileUrl: '/images/property-maps/nicehouse.jpeg', // Example map image path
          uploadDate: new Date('2023-10-15T10:00:00Z'),
          landowner: 'John Doe',
          localFilePath: 'documents/Property Maps/1678886400000_site_a_map.jpg' // Example simulated path
      },
      {
          id: 'doc2',
          title: 'Carbon Credit Agreement - ABCD Park',
          description: 'Signed agreement for carbon credits.',
          category: 'Carbon Credit Agreements',
          fileName: 'abcd_carbon_agreement.pdf',
          fileType: 'application/pdf',
          fileSize: 500 * 1024, // 500KB
          fileUrl: '/pdfs/carbonCreditForm.pdf', // Example PDF path
          uploadDate: new Date('2023-11-01T14:30:00Z'),
          landowner: 'John Doe',
          localFilePath: 'documents/Carbon Credit Agreements/1678886400000_abcd_carbon_agreement.pdf'
      },
       {
          id: 'doc3',
          title: 'Planting Report Q1 2024',
          description: 'Progress report for the first quarter.',
          category: 'Planting Reports',
          fileName: 'planting_report_q1_2024.docx',
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileSize: 1.5 * 1024 * 1024, // 1.5MB
          fileUrl: '#', // No direct preview for docx usually
          uploadDate: new Date('2024-04-05T09:15:00Z'),
          landowner: 'Jane Smith',
          localFilePath: 'documents/Planting Reports/1678886400000_planting_report_q1_2024.docx'
      },
      {
          id: 'photo1',
          title: 'Site Prep - ABCD Park',
          description: 'Photo showing initial site preparation.',
          category: 'Photos', // Or a more specific category if needed
          fileName: 'site_prep_abcd.jpg',
          fileType: 'image/jpeg',
          fileSize: 3 * 1024 * 1024, // 3MB
          fileUrl: '/images/project-images/forest_revival.jpg', // Reusing an image for example
          uploadDate: new Date('2023-01-10T11:00:00Z'),
          landowner: 'John Doe',
          localFilePath: 'documents/Photos/1678886400000_site_prep_abcd.jpg'
      },
       {
          id: 'photo2',
          title: 'Volunteer Planting Day',
          description: 'Volunteers planting saplings.',
          category: 'Photos',
          fileName: 'volunteer_day.png',
          fileType: 'image/png',
          fileSize: 4.5 * 1024 * 1024, // 4.5MB
          fileUrl: '/images/project-images/green_future.jpeg', // Reusing an image for example
          uploadDate: new Date('2023-04-22T15:00:00Z'),
          landowner: 'Jane Smith',
          localFilePath: 'documents/Photos/1678886400000_volunteer_day.png'
      },
  ];

  const mockMapComments = {
      'doc1': [ // Assuming 'doc1' is the ID of the map 'Property Map - Site A'
          { id: 'c1', mapId: 'doc1', x: 25.5, y: 40.2, text: 'Possible erosion point here.', author: 'Admin', timestamp: new Date('2024-01-15T10:30:00Z') },
          { id: 'c2', mapId: 'doc1', x: 60.0, y: 75.8, text: 'Dense undergrowth, needs clearing before planting.', author: 'John Doe', timestamp: new Date('2024-01-16T14:00:00Z') },
      ],
  };

  const mockUser = {
      id: 'user123',
      name: 'John Doe',
      role: 'Admin', // or 'Landowner'
      email: 'john@example.com',
      phone: '+1 234 567 8900'
  };

// --- Helpers & Cache ---

const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const seasonProjectsCache = new Map(); // Map<string, Array<NormalizedProject>>
const fullyLoadedSeasons = new Set(); // Tracks which seasons have a complete project list cached

const resetSeasonProjectsCache = () => {
  seasonProjectsCache.clear();
  fullyLoadedSeasons.clear();
};

const normalizeSeasonKey = (value) => String(value ?? '').trim();

const getCachedProject = (projectId) => {
  for (const projects of seasonProjectsCache.values()) {
    const match = projects.find(project => `${project.id}` === `${projectId}`);
    if (match) {
      return match;
    }
  }
  return null;
};

const normalizeProjectRecord = (record = {}, { seasonYear } = {}) => {
  const computedSeasonYear = record.seasonYear ?? record.season ?? seasonYear ?? '';

  const ensureMetrics = (metrics) => ({
    canopyGrowth: metrics?.canopyGrowth ?? (record.totalTrees ? `${record.totalTrees} trees` : 'N/A'),
    biodiversity: metrics?.biodiversity ?? 'N/A',
    carbonOffset: metrics?.carbonOffset ?? 'N/A',
    treesSurvival: metrics?.treesSurvival ?? 'N/A',
  });

  const ensureContact = (contact) => ({
    phone: contact?.phone ?? record.phone ?? 'N/A',
    email: contact?.email ?? record.email ?? 'N/A',
  });

  const toArray = (value) => Array.isArray(value) ? value : value ? [value] : [];

  if (record.name && record.seasonYear) {
    const normalizedContact = ensureContact(record.contact);
    const normalizedMetrics = ensureMetrics(record.metrics);
    return {
      ...record,
      seasonYear: computedSeasonYear || record.seasonYear,
      contact: normalizedContact,
      metrics: normalizedMetrics,
    };
  }

  const primaryImage =
    record.image ??
    (Array.isArray(record.plantingPhotoUrls) && record.plantingPhotoUrls[0]) ??
    (Array.isArray(record.beforePhotoUrls) && record.beforePhotoUrls[0]) ??
    record.finalMapUrl ??
    null;

  const displayNameCandidate =
    record.title ??
    record.ownerDisplayName ??
    record.ownerFullName ??
    record.ownerFirstName ??
    record.landowner ??
    undefined;

  const landowner =
    record.landowner ??
    record.ownerFullName ??
    record.ownerDisplayName ??
    record.ownerFirstName ??
    'N/A';

  const fallbackIdBase =
    record.uniqueId ??
    displayNameCandidate ??
    record.propertyId ??
    record.siteNumber ??
    'project';

  const documentLinks = {
    carbonDocs: toArray(record.carbonDocs),
    draftMap: toArray(record.draftMapUrl),
    finalMap: toArray(record.finalMapUrl),
    postPlantingReports: toArray(record.postPlantingReports),
  };

  return {
    id: record.id ?? record.uniqueId ?? `${fallbackIdBase}-${computedSeasonYear || 'unknown'}`,
    seasonYear: computedSeasonYear,
    landowner,
    location: record.location ?? record.city ?? '',
    address: record.address ?? '',
    image: primaryImage,
    contact: ensureContact(record.contact),
    metrics: ensureMetrics(record.metrics),
    description: record.description ?? record.landRegion ?? 'No description provided.',
    ownerFirstName: record.ownerFirstName ?? '',
    ownerDisplayName: record.ownerDisplayName ?? '',
    phone: record.phone ?? record.contact?.phone ?? '',
    email: record.email ?? record.contact?.email ?? '',
    applicationDate: record.applicationDate ?? '',
    consultationDate: record.consultationDate ?? '',
    flaggingDate: record.flaggingDate ?? '',
    plantingDate: record.plantingDate ?? '',
    quizScorePreConsultation: record.quizScorePreConsultation ?? '',
    quizScorePostPlanting: record.quizScorePostPlanting ?? '',
    beforePhotoUrls: toArray(record.beforePhotoUrls),
    plantingPhotoUrls: toArray(record.plantingPhotoUrls),
    propertyImageUrls: toArray(record.propertyImageUrls),
    activeCarbonShapefiles: toArray(record.activeCarbonShapefiles),
    wetlandAcres: record.wetlandAcres ?? "",
    uplandAcres: record.uplandAcres ?? "",
    totalAcres: record.totalAcres ?? "",
    wetlandTrees: record.wetlandTrees ?? "",
    uplandTrees: record.uplandTrees ?? "",
    totalTrees: record.totalTrees ?? "",
    status: record.status ?? 'Unknown',
    documents: documentLinks,
    raw: record.raw ?? record,
  };
};

const fetchProjectsBySeasonFromApi = async (seasonYear, { useCache = true } = {}) => {
  const normalizedSeason = normalizeSeasonKey(seasonYear);
  if (!normalizedSeason) {
    return [];
  }

  if (useCache && fullyLoadedSeasons.has(normalizedSeason) && seasonProjectsCache.has(normalizedSeason)) {
    return seasonProjectsCache.get(normalizedSeason);
  }

  const response = await apiClient.get(`/projects/season/${encodeURIComponent(normalizedSeason)}`);
  const records = Array.isArray(response.data) ? response.data : [];
  const normalizedProjects = records.map(record =>
    normalizeProjectRecord({ ...record, seasonYear: record.season ?? normalizedSeason }, { seasonYear: normalizedSeason })
  );

  seasonProjectsCache.set(normalizedSeason, normalizedProjects);
  if (normalizedProjects.length > 0) {
    fullyLoadedSeasons.add(normalizedSeason);
  } else {
    fullyLoadedSeasons.delete(normalizedSeason);
  }
  return normalizedProjects;
};

// --- REAL API FUNCTIONS ----------------------------------------------------

export const getSeasons = async () => {
  try {
    const response = await apiClient.get('/seasons');
    if (!Array.isArray(response.data)) {
      return [];
    }
    return response.data
      .filter(Boolean)
      .map(String)
      .sort((a, b) => b.localeCompare(a));
  } catch (error) {
    console.error('API Call: getSeasons -> Failed.', error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch seasons from backend.'
    );
  }
};

export const getAllProjects = async () => {
  try {
    const seasons = await getSeasons();
    const seasonYears = [...new Set(seasons)].filter(Boolean);

    if (seasonYears.length === 0) {
      return [];
    }

    const projectLists = await Promise.all(
      seasonYears.map(async (seasonYear) => {
        try {
          return await fetchProjectsBySeasonFromApi(seasonYear, { useCache: true });
        } catch (error) {
          console.error(`API Call: getAllProjects -> Failed to fetch projects for season ${seasonYear}`, error);
          return [];
        }
      })
    );

    const flattened = projectLists.flat();
    if (flattened.length > 0) {
      return flattened;
    }
    return [];
  } catch (error) {
    console.error('API Call: getAllProjects -> Failed.', error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Failed to fetch projects from backend.'
    );
  }
};

export const getProjectsBySeason = async (seasonYear, { forceFresh = false } = {}) => {
  const normalizedSeason = normalizeSeasonKey(seasonYear);
  if (!normalizedSeason) {
    return [];
  }

  try {
    const useCache = !forceFresh;
    return await fetchProjectsBySeasonFromApi(normalizedSeason, { useCache });
  } catch (error) {
    console.error(`API Call: getProjectsBySeason(${normalizedSeason}) -> Failed.`, error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      `Failed to fetch projects for season ${seasonYear}.`
    );
  }
};

export const getProjectDetails = async (projectId) => {
  if (!projectId) {
    return null;
  }

  const cachedProject = getCachedProject(projectId);
  if (cachedProject && cachedProject.wetlandAcres !== undefined) {
    return cachedProject;
  }

  try {
    const response = await apiClient.get(`/projects/details/${encodeURIComponent(projectId)}`);
    if (!response.data) {
      return null;
    }

    const normalized = normalizeProjectRecord(response.data);
    if (normalized.seasonYear) {
      const seasonKey = normalizeSeasonKey(normalized.seasonYear);
      const existing = seasonProjectsCache.get(seasonKey) || [];
      if (!existing.some(project => `${project.id}` === `${normalized.id}`)) {
        seasonProjectsCache.set(seasonKey, [...existing, normalized]);
      }
    }

    return normalized;
  } catch (error) {
    console.error(`API Call: getProjectDetails(${projectId}) -> Failed.`, error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      `Failed to fetch project ${projectId} from backend.`
    );
  }
};

export const addSeason = async (seasonYear) => {
  if (!seasonYear || typeof seasonYear !== 'string' || !seasonYear.trim()) {
    throw new Error('Season year is required.');
  }

  try {
    const payload = { seasonName: seasonYear.trim() };
    const response = await apiClient.post('/seasons', payload);

    // A season option addition may affect cached project lists
    resetSeasonProjectsCache();

    return {
      id: seasonYear.trim(),
      year: seasonYear.trim(),
      message: response?.data?.message ?? null,
      raw: response?.data ?? null,
    };
  } catch (error) {
    console.error(`API Call: addSeason(${seasonYear}) -> Failed.`, error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      `Failed to add season '${seasonYear}'.`
    );
  }
};

// --- MUTATING PROJECT OPERATIONS (REAL API) ---------------------------------

export const addProject = async (projectData) => {
  if (!projectData || typeof projectData !== 'object') {
    throw new Error('Project data is required to create a project.');
  }

  try {
    const response = await apiClient.post('/projects', projectData);
    resetSeasonProjectsCache();

    if (!response?.data) {
      return null;
    }

    const normalized = normalizeProjectRecord(response.data, {
      seasonYear: projectData.seasonYear || projectData.season,
    });

    return normalized;
  } catch (error) {
    console.error('API Call: addProject -> Failed.', error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Failed to create project.'
    );
  }
};

export const updateProject = async (projectId, projectData) => {
  if (!projectId) {
    throw new Error('Project ID is required to update a project.');
  }
  if (!projectData || typeof projectData !== 'object' || Object.keys(projectData).length === 0) {
    throw new Error('Project update payload must include at least one field.');
  }

  try {
    const response = await apiClient.patch(`/projects/${encodeURIComponent(projectId)}`, projectData);
    resetSeasonProjectsCache();

    if (!response?.data) {
      return null;
    }

    return normalizeProjectRecord(response.data);
  } catch (error) {
    console.error(`API Call: updateProject(${projectId}) -> Failed.`, error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      `Failed to update project ${projectId}.`
    );
  }
};

export const deleteProject = async (projectId) => {
  if (!projectId) {
    throw new Error('Project ID is required to delete a project.');
  }

  try {
    const response = await apiClient.delete(`/projects/${encodeURIComponent(projectId)}`);
    resetSeasonProjectsCache();

    return response?.data ?? { success: true };
  } catch (error) {
    console.error(`API Call: deleteProject(${projectId}) -> Failed.`, error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      `Failed to delete project ${projectId}.`
    );
  }
};

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
    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        'Failed to upload project document.'
    );
  }
};



export const deleteSeason = async (seasonId) => {
  const normalizedId = String(seasonId ?? "").trim();
  if (!normalizedId) {
    throw new Error("Season ID is required.");
  }

  try {
    const response = await apiClient.delete(`/seasons/${encodeURIComponent(normalizedId)}`);

    // Removing a season invalidates any cached project lists
    resetSeasonProjectsCache();

    console.log(`API Call: deleteSeason(${normalizedId}) -> Success`);
    return {
      success: true,
      message: response?.data?.message ?? null,
      raw: response?.data ?? null,
    };
  } catch (error) {
    console.error(`API Call: deleteSeason(${normalizedId}) -> Failed.`, error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      `Failed to delete season '${normalizedId}'.`
    );
  }
};


  export const getFormDetails = async (formId) => {
      await simulateDelay();
       // Find the form based on id - using a mock form for now
       const mockForm = {
          id: formId, // Use the passed ID
          title: "Carbon Credit Form",
          description: "Standard environmental assessment form for new project areas",
          lastEdited: "2023-05-15",
          pdfUrl: "/pdfs/carbonCreditForm.pdf", // Use the actual path from public
          status: "Active",
          associatedMembers: [ // This data should ideally come from the backend
              { id: 1, name: "Jane Doe", role: "Landowner", email: "jane@example.com", phone: "123-456-7890", avatar: null },
              { id: 2, name: "John Smith", role: "Project Manager", email: "john@example.com", phone: "123-456-7891", avatar: null },
              { id: 3, name: "Alice Johnson", role: "Environmental Specialist", email: "alice@example.com", phone: "123-456-7892", avatar: null }
          ],
          submissionHistory: [ // This data should also come from the backend
              { date: "2023-05-15", action: "Form Created", user: "Jane Doe" },
              { date: "2023-05-16", action: "Form Updated", user: "John Smith" },
              { date: "2023-05-17", action: "Form Submitted", user: "Alice Johnson" }
          ],
          details: { // Added a details section
              synopsis: "A short synopsis of the location and reforestation efforts.",
              stats: "Include net coverage and other carbon credit growth or stats.",
              updates: "This body of text can also serve as latest updates."
          }
      };
      console.log(`API Call: getFormDetails(${formId}) -> Returning:`, mockForm);
      return mockForm;
  };

  export const getUserProfile = async () => {
      await simulateDelay(100); // Faster delay for user profile
      console.log("API Call: getUserProfile -> Returning:", mockUser);
      return { ...mockUser }; // Return copy
  }


  // Export all functions
const apiService = {
    getSeasons,
    getAllProjects,
    getProjectsBySeason,
    getProjectDetails,
    addSeason,
    addProject,
    updateProject,
    deleteProject,
    uploadProjectDocument,
    deleteSeason, // Add deleteSeason here
  getFormDetails,
    getUserProfile,
  };

  export default apiService;
