// src/services/apiService.js

/**
 * Main API Service Entry Point
 * 
 * This file aggregates all sub-services for backward compatibility.
 * Ideally, components should import directly from the specific service files
 * in the future (e.g., import { getSeasons } from './seasonService').
 */

import * as projectService from './projectService';
import * as seasonService from './seasonService';
import * as documentService from './documentService';
import * as landownerService from './landownerService';
import { resetSeasonProjectsCache } from './apiHelpers';

// Re-export specific functions for named imports
export * from './projectService';
export * from './seasonService';
export * from './documentService';
export * from './landownerService';
export { resetSeasonProjectsCache } from './apiHelpers';

// Default export object containing all methods
const apiService = {
  ...projectService,
  ...seasonService,
  ...documentService,
  ...landownerService,
  resetSeasonProjectsCache,
};

export default apiService;
