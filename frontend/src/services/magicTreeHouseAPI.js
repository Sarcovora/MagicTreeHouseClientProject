/**
 * Magic Tree House API Service
 *
 * A simple, easy-to-use wrapper for interacting with the Magic Tree House backend.
 * Just call the methods and get back clean JSON data - all the complexity is handled for you!
 *
 * @example
 * import api from './services/magicTreeHouseAPI';
 *
 * // Get all seasons
 * const seasons = await api.seasons.getAll();
 *
 * // Get projects for a season
 * const projects = await api.projects.getBySeason('24-25');
 *
 * // Get a specific project
 * const project = await api.projects.getById('rec1dp7COcr1qPsmj');
 *
 * // Create a new project
 * const newProject = await api.projects.create({
 *   season: '24-25',
 *   ownerFirstName: 'John',
 *   ownerLastName: 'Doe',
 *   address: '123 Main St',
 *   propertyId: 'PID123',
 *   siteNumber: 1
 * });
 */

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Simple in-memory cache
const cache = {
  seasons: null,
  seasonsExpiry: null,
  projects: {},
  projectDetails: {},
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Base fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Parse and return JSON
    return await response.json();
  } catch (error) {
    // Network errors or JSON parse errors
    if (!error.status) {
      const networkError = new Error('Network error: Unable to reach the server. Is the backend running?');
      networkError.originalError = error;
      throw networkError;
    }
    throw error;
  }
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(expiry) {
  return expiry && Date.now() < expiry;
}

// ============================================================================
// SEASONS API
// ============================================================================

const seasons = {
  /**
   * Get all available seasons
   * @param {Object} options - Options
   * @param {boolean} options.skipCache - Skip cache and fetch fresh data
   * @returns {Promise<string[]>} Array of season identifiers (e.g., ["25-26", "24-25"])
   *
   * @example
   * const seasons = await api.seasons.getAll();
   * console.log(seasons); // ["25-26", "24-25", "23-24"]
   */
  async getAll({ skipCache = false } = {}) {
    // Return cached data if valid
    if (!skipCache && isCacheValid(cache.seasonsExpiry)) {
      return cache.seasons;
    }

    const data = await fetchAPI('/seasons');

    // Update cache
    cache.seasons = data;
    cache.seasonsExpiry = Date.now() + CACHE_DURATION;

    return data;
  },

  /**
   * Add a new season option
   * @param {string} seasonName - Season identifier (e.g., "25-26")
   * @returns {Promise<Object>} Success message object
   *
   * @example
   * const result = await api.seasons.add('26-27');
   * console.log(result.message); // "Season option '26-27' potentially added..."
   */
  async add(seasonName) {
    if (!seasonName || typeof seasonName !== 'string') {
      throw new Error('seasonName must be a non-empty string');
    }

    const data = await fetchAPI('/seasons', {
      method: 'POST',
      body: JSON.stringify({ seasonName: seasonName.trim() }),
    });

    // Invalidate cache
    cache.seasons = null;
    cache.seasonsExpiry = null;

    return data;
  },

  /**
   * Clear the seasons cache
   */
  clearCache() {
    cache.seasons = null;
    cache.seasonsExpiry = null;
  },
};

// ============================================================================
// PROJECTS API
// ============================================================================

const projects = {
  /**
   * Get all projects for a specific season
   * @param {string} season - Season identifier (e.g., "24-25")
   * @param {Object} options - Options
   * @param {boolean} options.skipCache - Skip cache and fetch fresh data
   * @returns {Promise<Object[]>} Array of project objects
   *
   * @example
   * const projects = await api.projects.getBySeason('24-25');
   * projects.forEach(p => {
   *   console.log(`${p.ownerFullName} - ${p.address} - ${p.status}`);
   * });
   */
  async getBySeason(season, { skipCache = false } = {}) {
    if (!season) {
      throw new Error('season parameter is required');
    }

    const cacheKey = season;

    // Return cached data if valid
    if (!skipCache && cache.projects[cacheKey]) {
      const cached = cache.projects[cacheKey];
      if (isCacheValid(cached.expiry)) {
        return cached.data;
      }
    }

    const encodedSeason = encodeURIComponent(season);
    const data = await fetchAPI(`/projects/season/${encodedSeason}`);

    // Update cache
    cache.projects[cacheKey] = {
      data,
      expiry: Date.now() + CACHE_DURATION,
    };

    return data;
  },

  /**
   * Get detailed information for a specific project
   * @param {string} recordId - Airtable record ID (starts with "rec")
   * @param {Object} options - Options
   * @param {boolean} options.skipCache - Skip cache and fetch fresh data
   * @returns {Promise<Object|null>} Project object or null if not found
   *
   * @example
   * const project = await api.projects.getById('rec1dp7COcr1qPsmj');
   * if (project) {
   *   console.log(project.ownerFullName, project.status);
   * }
   */
  async getById(recordId, { skipCache = false } = {}) {
    if (!recordId) {
      throw new Error('recordId parameter is required');
    }

    // Return cached data if valid
    if (!skipCache && cache.projectDetails[recordId]) {
      const cached = cache.projectDetails[recordId];
      if (isCacheValid(cached.expiry)) {
        return cached.data;
      }
    }

    try {
      const data = await fetchAPI(`/projects/details/${recordId}`);

      // Update cache
      cache.projectDetails[recordId] = {
        data,
        expiry: Date.now() + CACHE_DURATION,
      };

      return data;
    } catch (error) {
      // Return null for 404 errors (not found)
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Create a new project
   * @param {Object} projectData - Project data object
   * @param {string} projectData.season - Required: Season identifier
   * @param {string} projectData.ownerLastName - Required: Owner last name or site name
   * @param {string} projectData.address - Required: Property address
   * @param {string} projectData.propertyId - Required: Property ID number
   * @param {number} projectData.siteNumber - Required: Site number
   * @param {string} [projectData.ownerFirstName] - Owner first name
   * @param {string} [projectData.city] - City
   * @param {string} [projectData.zipCode] - ZIP code
   * @param {string} [projectData.county] - County
   * @param {string} [projectData.phone] - Phone number
   * @param {string} [projectData.email] - Email address
   * @param {string} [projectData.status] - Current status
   * @param {string} [projectData.landRegion] - Land region
   * @param {string} [projectData.participationStatus] - Participation status
   * @param {string} [projectData.contactDate] - Contact date (YYYY-MM-DD)
   * @param {string} [projectData.consultationDate] - Consultation date (YYYY-MM-DD)
   * @param {string} [projectData.applicationDate] - Application date (YYYY-MM-DD)
   * @param {string} [projectData.flaggingDate] - Flagging date (YYYY-MM-DD)
   * @param {string} [projectData.plantingDate] - Planting date (YYYY-MM-DD)
   * @returns {Promise<Object>} The newly created project object
   *
   * @example
   * const newProject = await api.projects.create({
   *   season: '24-25',
   *   ownerFirstName: 'John',
   *   ownerLastName: 'Doe',
   *   address: '123 Main Street',
   *   city: 'Austin',
   *   zipCode: '78701',
   *   propertyId: 'PID12345',
   *   siteNumber: 1,
   *   phone: '(512) 555-1234',
   *   email: 'john@example.com',
   *   status: 'Initial Contact (call/email)'
   * });
   * console.log('Created project:', newProject.id);
   */
  async create(projectData) {
    // Validate required fields
    const requiredFields = ['season', 'ownerLastName', 'address', 'propertyId', 'siteNumber'];
    const missingFields = requiredFields.filter(field => !projectData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const data = await fetchAPI('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });

    // Invalidate relevant caches
    if (projectData.season) {
      delete cache.projects[projectData.season];
    }

    return data;
  },

  /**
   * Clear all project caches
   */
  clearCache() {
    cache.projects = {};
    cache.projectDetails = {};
  },

  /**
   * Clear cache for a specific season
   * @param {string} season - Season to clear cache for
   */
  clearSeasonCache(season) {
    delete cache.projects[season];
  },

  /**
   * Clear cache for a specific project
   * @param {string} recordId - Record ID to clear cache for
   */
  clearProjectCache(recordId) {
    delete cache.projectDetails[recordId];
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const utils = {
  /**
   * Clear all caches
   */
  clearAllCaches() {
    seasons.clearCache();
    projects.clearCache();
  },

  /**
   * Get the current cache state (for debugging)
   */
  getCacheState() {
    return {
      seasons: {
        cached: !!cache.seasons,
        valid: isCacheValid(cache.seasonsExpiry),
        expiresIn: cache.seasonsExpiry ? cache.seasonsExpiry - Date.now() : null,
      },
      projects: {
        cachedSeasons: Object.keys(cache.projects),
        count: Object.keys(cache.projects).length,
      },
      projectDetails: {
        cachedRecords: Object.keys(cache.projectDetails),
        count: Object.keys(cache.projectDetails).length,
      },
    };
  },

  /**
   * Configure the API
   * @param {Object} config - Configuration options
   * @param {string} config.baseURL - Override the base URL
   */
  configure(config) {
    if (config.baseURL) {
      // This would require refactoring to make API_BASE_URL mutable
      console.warn('Runtime baseURL configuration not yet implemented. Set VITE_API_BASE_URL in .env instead.');
    }
  },

  /**
   * Health check - verify the backend is reachable
   * @returns {Promise<boolean>} True if backend is reachable
   */
  async healthCheck() {
    try {
      await fetch(API_BASE_URL.replace('/api', ''));
      return true;
    } catch (error) {
      return false;
    }
  },
};

// ============================================================================
// EXPORT
// ============================================================================

const api = {
  seasons,
  projects,
  utils,
};

export default api;

// Also export individual modules for tree-shaking
export { seasons, projects, utils };
