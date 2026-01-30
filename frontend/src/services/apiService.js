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


// --- Helpers & Cache ---



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
    replantingMap: toArray(record.replantingMapUrl),
    otherAttachments: toArray(record.otherAttachments),
    postPlantingReports: toArray(record.postPlantingReports),
  };

  return {
    id: record.id ?? record.uniqueId ?? `${fallbackIdBase}-${computedSeasonYear || 'unknown'}`,
    seasonYear: computedSeasonYear,
    landowner,
    location: record.location ?? record.city ?? '',
    address: record.address ?? '',
    zipCode: record.zipCode ?? '',
    siteNumber: record.siteNumber ?? '',
    image: primaryImage,
    contact: ensureContact(record.contact),
    metrics: ensureMetrics(record.metrics),
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


export const addDraftMapComment = async (projectId, comment) => {
  try {
    const response = await apiClient.post(`/projects/${projectId}/draft-map/comments`, { comment });
    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to add comment');
    }
    // Return relevant data, possibly updated project
    return normalizeProjectRecord(response.data.project);
  } catch (error) {
    console.error(`API Call: addDraftMapComment(${projectId}) -> Failed.`, error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'Failed to submit comment.'
    );
  }
};




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
    deleteProjectDocument,
    deleteSeason, 
    getLandownerProject,
  addDraftMapComment, // Export new function

  };

  export default apiService;
