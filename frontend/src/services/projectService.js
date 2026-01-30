// src/services/projectService.js
import { apiClient } from './apiClient';
import { 
    normalizeSeasonKey, 
    normalizeProjectRecord, 
    seasonProjectsCache, 
    fullyLoadedSeasons,
    resetSeasonProjectsCache,
    getCachedProject
} from './apiHelpers';
import { getSeasons } from './seasonService';

// --- Fetching ---

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
    throw error;
  }
};

// --- CRUD ---

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
