// src/services/apiService.js

/**
 * This service centralizes all interactions with the backend API.
 * Initially, it contains hardcoded data/functions to simulate API calls.
 */

import axios from 'axios';

// --- Configuration ---
const DEFAULT_API_BASE = 'http://localhost:3001';
const apiBaseFromEnv = (import.meta?.env?.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '');
const apiPrefix = import.meta?.env?.VITE_API_PREFIX ?? '/api';
const apiClient = axios.create({
  baseURL: `${apiBaseFromEnv}${apiPrefix}`,
  timeout: 10000,
});

// --- Mock Data ---

const mockProjects = [
    {
      id: 1,
      seasonYear: "2023", // Added field to link project to season
      name: "ABCD Park",
      landowner: "John Doe",
      location: "California", // General location
      address: "Bee Caves, Austin TX", // Specific address
      image: "/images/project-images/abcd_park.jpg", // Corrected path based on file structure
      contact: {
        phone: "+1 234 567 8900",
        email: "john@example.com",
      },
      metrics: {
        canopyGrowth: "15% increase",
        biodiversity: "24 species",
        carbonOffset: "150 tons",
        treesSurvival: "92%",
      },
      description:
        "A comprehensive reforestation project aimed at restoring native woodland...",
      status: "Active",
      startDate: "2023-01-15",
      lastUpdated: "2024-01-20",
    },
    {
      id: 2,
      seasonYear: "2023", // Added field
      name: "Forest Revival",
      landowner: "Jane Smith",
      location: "Oregon",
      address: "2100 Nueces St, Austin TX",
      image: "/images/project-images/forest_revival.jpg", // Corrected path
      contact: {
        phone: "+1 345 678 9012",
        email: "jane@example.com",
      },
      metrics: {
        canopyGrowth: "22% increase",
        biodiversity: "31 species",
        carbonOffset: "180 tons",
        treesSurvival: "88%",
      },
      description:
        "A project focused on reviving forest ecosystems in the Pacific Northwest...",
      status: "Active",
      startDate: "2023-03-10",
      lastUpdated: "2024-02-15",
    },
    {
      id: 3,
      seasonYear: "2022", // Added field
      name: "Green Future",
      landowner: "Bob Wilson",
      location: "Washington",
      address: "123 Rio Grande St, Austin TX",
      image: "/images/project-images/green_future.jpeg", // Corrected path
      contact: {
        phone: "+1 456 789 0123",
        email: "bob@example.com",
      },
      metrics: {
        canopyGrowth: "18% increase",
        biodiversity: "27 species",
        carbonOffset: "130 tons",
        treesSurvival: "95%",
      },
      description:
        "An innovative approach to urban reforestation in Washington state...",
      status: "Completed", // Changed status for variety
      startDate: "2022-05-20", // Adjusted start date
      lastUpdated: "2023-11-30",
    },
    {
      id: 4,
      seasonYear: "2024", // Added field
      name: "Oak Hill Preservation",
      landowner: "Alice Green",
      location: "Texas",
      address: "456 Preservation Way, Austin TX",
      image: null, // Example project without an image
      contact: {
          phone: "+1 555 111 2222",
          email: "alice@example.com",
      },
      metrics: {
          canopyGrowth: "N/A",
          biodiversity: "N/A",
          carbonOffset: "N/A",
          treesSurvival: "N/A",
      },
      description: "A newly initiated project focused on preserving oak trees.",
      status: "Pending",
      startDate: "2024-07-01",
      lastUpdated: "2024-07-01",
    },
  ];
  
  const mockSeasons = [
    { id: 1, year: "2024", projectCount: mockProjects.filter(p => p.seasonYear === "2024").length },
    { id: 2, year: "2023", projectCount: mockProjects.filter(p => p.seasonYear === "2023").length },
    { id: 3, year: "2022", projectCount: mockProjects.filter(p => p.seasonYear === "2022").length },
    { id: 4, year: "2021", projectCount: 0 },
    { id: 5, year: "2020", projectCount: 0 },
    { id: 6, year: "2019", projectCount: 0 },
  ];
  
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

const resetSeasonProjectsCache = () => {
  seasonProjectsCache.clear();
};

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

  const name =
    record.name ??
    record.title ??
    record.ownerDisplayName ??
    record.ownerFullName ??
    record.ownerFirstName ??
    record.uniqueId ??
    'Untitled Project';

  const landowner =
    record.landowner ??
    record.ownerFullName ??
    record.ownerDisplayName ??
    record.ownerFirstName ??
    'N/A';

  return {
    id: record.id ?? record.uniqueId ?? `${name}-${computedSeasonYear}`,
    seasonYear: computedSeasonYear,
    name,
    landowner,
    location: record.location ?? record.city ?? '',
    address: record.address ?? '',
    image: primaryImage,
    contact: ensureContact(record.contact),
    metrics: ensureMetrics(record.metrics),
    description: record.description ?? record.landRegion ?? 'No description provided.',
    status: record.status ?? 'Unknown',
    startDate: record.startDate ?? record.plantingDate ?? record.applicationDate ?? '',
    lastUpdated: record.lastUpdated ?? record.updatedAt ?? '',
    raw: record.raw ?? record,
  };
};

const fetchProjectsBySeasonFromApi = async (seasonYear, { useCache = true } = {}) => {
  if (!seasonYear) {
    return [];
  }

  if (useCache && seasonProjectsCache.has(seasonYear)) {
    return seasonProjectsCache.get(seasonYear);
  }

  const response = await apiClient.get(`/projects/season/${encodeURIComponent(seasonYear)}`);
  const records = Array.isArray(response.data) ? response.data : [];
  const normalizedProjects = records.map(record =>
    normalizeProjectRecord({ ...record, seasonYear: record.season ?? seasonYear }, { seasonYear })
  );

  seasonProjectsCache.set(seasonYear, normalizedProjects);
  return normalizedProjects;
};

// --- API Functions ---

export const getSeasons = async () => {
  try {
    const response = await apiClient.get('/seasons');
    const rawSeasons = Array.isArray(response.data) ? response.data : [];

    const normalized = rawSeasons
      .map((entry, index) => {
        if (typeof entry === 'string') {
          return {
            id: entry,
            year: entry,
            projectCount: 0,
          };
        }
        if (entry && typeof entry === 'object') {
          const year = entry.year || entry.name || entry.label || '';
          if (!year) {
            return null;
          }
          return {
            id: entry.id || year || index,
            year,
            projectCount: typeof entry.projectCount === 'number'
              ? entry.projectCount
              : 0,
          };
        }
        return null;
      })
      .filter(Boolean);

    const seasonsWithCounts = await Promise.all(
      normalized.map(async (season) => {
        if (!season.year) {
          return season;
        }
        try {
          const projects = await fetchProjectsBySeasonFromApi(season.year, { useCache: true });
          return {
            ...season,
            projectCount: projects.length,
          };
        } catch (innerError) {
          console.warn(`API Call: getSeasons -> Failed to fetch projects for season ${season.year}`, innerError);
          return season;
        }
      })
    );

    return seasonsWithCounts.sort((a, b) => b.year.localeCompare(a.year));
  } catch (error) {
    console.error('API Call: getSeasons -> Failed, falling back to mock data.', error);
    resetSeasonProjectsCache();
    const fallbackSeasons = mockSeasons
      .map((season) => ({
        ...season,
        projectCount: mockProjects.filter(project => project.seasonYear === season.year).length,
      }))
      .sort((a, b) => b.year.localeCompare(a.year));

    fallbackSeasons.forEach((season) => {
      const projects = mockProjects
        .filter(project => project.seasonYear === season.year)
        .map(project => normalizeProjectRecord(project, { seasonYear: project.seasonYear }));
      seasonProjectsCache.set(season.year, projects);
    });

    return fallbackSeasons;
  }
};

export const getAllProjects = async () => {
  try {
    const seasons = await getSeasons();
    const seasonYears = seasons.map(season => season.year).filter(Boolean);

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
  } catch (error) {
    console.error('API Call: getAllProjects -> Failed, falling back to mock data.', error);
  }

  await simulateDelay();
  return mockProjects.map(project => normalizeProjectRecord(project, { seasonYear: project.seasonYear }));
};

export const getProjectsBySeason = async (seasonYear) => {
  if (!seasonYear) {
    return [];
  }

  try {
    return await fetchProjectsBySeasonFromApi(seasonYear, { useCache: true });
  } catch (error) {
    console.error(`API Call: getProjectsBySeason(${seasonYear}) -> Failed, falling back to mock data.`, error);
    await simulateDelay();
    const fallbackProjects = mockProjects
      .filter(project => project.seasonYear === seasonYear)
      .map(project => normalizeProjectRecord(project, { seasonYear }));
    seasonProjectsCache.set(seasonYear, fallbackProjects);
    return fallbackProjects;
  }
};

export const getProjectDetails = async (projectId) => {
  if (!projectId) {
    return null;
  }

  const cachedProject = getCachedProject(projectId);
  if (cachedProject) {
    return cachedProject;
  }

  try {
    const response = await apiClient.get(`/projects/details/${encodeURIComponent(projectId)}`);
    if (!response.data) {
      return null;
    }

    const normalized = normalizeProjectRecord(response.data);
    if (normalized.seasonYear) {
      const existing = seasonProjectsCache.get(normalized.seasonYear) || [];
      if (!existing.some(project => `${project.id}` === `${normalized.id}`)) {
        seasonProjectsCache.set(normalized.seasonYear, [...existing, normalized]);
      }
    }

    return normalized;
  } catch (error) {
    console.error(`API Call: getProjectDetails(${projectId}) -> Failed, falling back to mock data.`, error);
    await simulateDelay();
    const fallback = mockProjects.find(project => `${project.id}` === `${projectId}`);
    return fallback ? normalizeProjectRecord(fallback, { seasonYear: fallback.seasonYear }) : null;
  }
};

  export const addSeason = async (year) => {
      await simulateDelay();
      const newSeason = {
          id: Date.now(), // simple unique ID
          year: year,
          projectCount: 0
      };
      mockSeasons.push(newSeason);
      // Ensure seasons are sorted? Or handle sorting on frontend.
      mockSeasons.sort((a, b) => b.year.localeCompare(a.year)); // Keep sorted by year desc
      console.log("API Call: addSeason -> New Seasons:", mockSeasons);
      return { ...newSeason };
  };
  
  export const addProject = async (projectData) => {
      await simulateDelay();
      const newProject = {
          id: Date.now(), // simple unique ID
          ...projectData,
          // Ensure required fields like image are handled (e.g., set to null if not provided)
          image: projectData.image || null,
          // Add default metrics/contact if needed
          metrics: projectData.metrics || { canopyGrowth: "N/A", biodiversity: "N/A", carbonOffset: "N/A", treesSurvival: "N/A"},
          contact: projectData.contact || { phone: "N/A", email: "N/A"},
          lastUpdated: new Date().toISOString().split('T')[0], // Set current date
      };
      mockProjects.push(newProject);
  
      // Update project count for the relevant season
      const seasonIndex = mockSeasons.findIndex(s => s.year === newProject.seasonYear);
      if (seasonIndex !== -1) {
          mockSeasons[seasonIndex].projectCount++;
      } else {
          // Optionally add the season if it doesn't exist? Or handle this case?
          console.warn(`Season ${newProject.seasonYear} not found for new project.`);
          // For now, let's add the season if it's missing
          await addSeason(newProject.seasonYear); // Recursively call addSeason
           const newSeasonIndex = mockSeasons.findIndex(s => s.year === newProject.seasonYear);
           if (newSeasonIndex !== -1) {
              mockSeasons[newSeasonIndex].projectCount = 1;
           }
      }
  
      console.log("API Call: addProject -> New Project:", newProject);
      return { ...newProject };
  };
  
  export const updateProject = async (projectId, projectData) => {
      await simulateDelay();
      const idToUpdate = parseInt(projectId, 10);
      const projectIndex = mockProjects.findIndex(p => p.id === idToUpdate);
      if (projectIndex !== -1) {
          mockProjects[projectIndex] = {
              ...mockProjects[projectIndex],
              ...projectData,
              lastUpdated: new Date().toISOString().split('T')[0], // Update last updated date
          };
          console.log(`API Call: updateProject(${projectId}) -> Updated Project:`, mockProjects[projectIndex]);
          return { ...mockProjects[projectIndex] }; // Return copy
      }
      console.error(`API Call: updateProject(${projectId}) -> Project not found`);
      return null;
  };
  
  export const deleteProject = async (projectId) => {
      await simulateDelay();
      const idToDelete = parseInt(projectId, 10);
      const projectIndex = mockProjects.findIndex(p => p.id === idToDelete);
      if (projectIndex !== -1) {
          const deletedProject = mockProjects.splice(projectIndex, 1)[0];
  
          // Update project count for the relevant season
          const seasonIndex = mockSeasons.findIndex(s => s.year === deletedProject.seasonYear);
          if (seasonIndex !== -1 && mockSeasons[seasonIndex].projectCount > 0) {
              mockSeasons[seasonIndex].projectCount--;
          }
  
          console.log(`API Call: deleteProject(${projectId}) -> Success`);
          return { success: true };
      }
      console.error(`API Call: deleteProject(${projectId}) -> Project not found`);
      return { success: false };
  };
  
  
  
export const deleteSeason = async (seasonId) => {
    await simulateDelay();
    const seasonIndex = mockSeasons.findIndex(s => s.id === seasonId);
    if (seasonIndex !== -1) {
        // Check if the season has projects before deleting
        if (mockSeasons[seasonIndex].projectCount > 0) {
            console.error(`API Call: deleteSeason(${seasonId}) -> Failed: Season has projects.`);
            // Throw an error that can be caught by the frontend
            throw new Error(`Cannot delete season "${mockSeasons[seasonIndex].year}" because it contains projects. Please move or delete the projects first.`);
        }

        // Proceed with deletion if project count is 0
        mockSeasons.splice(seasonIndex, 1);
        console.log(`API Call: deleteSeason(${seasonId}) -> Success`);
        return { success: true };
    }
    console.error(`API Call: deleteSeason(${seasonId}) -> Season not found`);
    return { success: false }; // Or throw not found error
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
    deleteSeason, // Add deleteSeason here
  getFormDetails,
    getUserProfile,
  };
  
  export default apiService;
