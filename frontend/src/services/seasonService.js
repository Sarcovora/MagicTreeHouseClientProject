// src/services/seasonService.js

/**
 * Service for managing seasons (years).
 * 
 * Seasons are the top-level organization for projects.
 * @module seasonService
 */
import { apiClient } from './apiClient';
import { resetSeasonProjectsCache } from './apiHelpers';

/**
 * Fetch all available seasons
 * @returns {Promise<string[]>} Array of season years
 */
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

/**
 * Add a new season
 * @param {string} seasonYear 
 * @returns {Promise<object>} New season object
 */
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

/**
 * Delete a season
 * @param {string} seasonId 
 * @returns {Promise<object>} Success response
 */
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
