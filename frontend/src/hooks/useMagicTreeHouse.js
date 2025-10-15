/**
 * React Hooks for Magic Tree House API
 *
 * These hooks make it incredibly easy to use the API in React components.
 * They handle loading states, errors, and data fetching automatically!
 *
 * @example
 * import { useSeasons, useProjects, useProject } from './hooks/useMagicTreeHouse';
 *
 * function MyComponent() {
 *   const { seasons, loading, error } = useSeasons();
 *   const { projects, loading, error, refresh } = useProjects('24-25');
 *   const { project, loading, error } = useProject('rec1dp7COcr1qPsmj');
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return <div>{JSON.stringify(data)}</div>;
 * }
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/magicTreeHouseAPI';

// ============================================================================
// SEASONS HOOKS
// ============================================================================

/**
 * Hook to fetch all available seasons
 * @param {Object} options - Options
 * @param {boolean} options.skipCache - Skip cache and fetch fresh data
 * @returns {Object} { seasons, loading, error, refresh }
 *
 * @example
 * function SeasonSelector() {
 *   const { seasons, loading, error, refresh } = useSeasons();
 *
 *   if (loading) return <div>Loading seasons...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <select>
 *       {seasons.map(season => (
 *         <option key={season} value={season}>{season}</option>
 *       ))}
 *     </select>
 *   );
 * }
 */
export function useSeasons({ skipCache = false } = {}) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSeasons = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.seasons.getAll({ skipCache });
      setSeasons(data);
    } catch (err) {
      setError(err.message);
      console.error('useSeasons error:', err);
    } finally {
      setLoading(false);
    }
  }, [skipCache]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  return {
    seasons,
    loading,
    error,
    refresh: fetchSeasons,
  };
}

/**
 * Hook to add a new season
 * @returns {Object} { addSeason, loading, error, success }
 *
 * @example
 * function AddSeasonForm() {
 *   const { addSeason, loading, error, success } = useAddSeason();
 *   const [seasonName, setSeasonName] = useState('');
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await addSeason(seasonName);
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input value={seasonName} onChange={e => setSeasonName(e.target.value)} />
 *       <button disabled={loading}>Add Season</button>
 *       {success && <div>Season added successfully!</div>}
 *       {error && <div>Error: {error}</div>}
 *     </form>
 *   );
 * }
 */
export function useAddSeason() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addSeason = useCallback(async (seasonName) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.seasons.add(seasonName);
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message);
      console.error('useAddSeason error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    addSeason,
    loading,
    error,
    success,
  };
}

// ============================================================================
// PROJECTS HOOKS
// ============================================================================

/**
 * Hook to fetch projects for a specific season
 * @param {string} season - Season identifier (e.g., "24-25")
 * @param {Object} options - Options
 * @param {boolean} options.skipCache - Skip cache and fetch fresh data
 * @param {boolean} options.enabled - Enable/disable auto-fetching (default: true)
 * @returns {Object} { projects, loading, error, refresh }
 *
 * @example
 * function ProjectsList() {
 *   const [selectedSeason, setSelectedSeason] = useState('24-25');
 *   const { projects, loading, error, refresh } = useProjects(selectedSeason);
 *
 *   if (loading) return <div>Loading projects...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *
 *   return (
 *     <div>
 *       <button onClick={refresh}>Refresh</button>
 *       <ul>
 *         {projects.map(p => (
 *           <li key={p.id}>
 *             {p.ownerFullName} - {p.address} - {p.status}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 */
export function useProjects(season, { skipCache = false, enabled = true } = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    if (!season || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.projects.getBySeason(season, { skipCache });
      setProjects(data);
    } catch (err) {
      setError(err.message);
      console.error('useProjects error:', err);
    } finally {
      setLoading(false);
    }
  }, [season, skipCache, enabled]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    refresh: fetchProjects,
  };
}

/**
 * Hook to fetch a specific project by ID
 * @param {string} recordId - Airtable record ID
 * @param {Object} options - Options
 * @param {boolean} options.skipCache - Skip cache and fetch fresh data
 * @param {boolean} options.enabled - Enable/disable auto-fetching (default: true)
 * @returns {Object} { project, loading, error, refresh }
 *
 * @example
 * function ProjectDetails({ recordId }) {
 *   const { project, loading, error, refresh } = useProject(recordId);
 *
 *   if (loading) return <div>Loading project...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   if (!project) return <div>Project not found</div>;
 *
 *   return (
 *     <div>
 *       <h1>{project.ownerFullName}</h1>
 *       <p>{project.address}</p>
 *       <p>Status: {project.status}</p>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 */
export function useProject(recordId, { skipCache = false, enabled = true } = {}) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProject = useCallback(async () => {
    if (!recordId || !enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await api.projects.getById(recordId, { skipCache });
      setProject(data);
    } catch (err) {
      setError(err.message);
      console.error('useProject error:', err);
    } finally {
      setLoading(false);
    }
  }, [recordId, skipCache, enabled]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refresh: fetchProject,
  };
}

/**
 * Hook to create a new project
 * @returns {Object} { createProject, loading, error, success, createdProject }
 *
 * @example
 * function CreateProjectForm() {
 *   const { createProject, loading, error, success, createdProject } = useCreateProject();
 *   const [formData, setFormData] = useState({
 *     season: '24-25',
 *     ownerFirstName: '',
 *     ownerLastName: '',
 *     address: '',
 *     propertyId: '',
 *     siteNumber: 1
 *   });
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await createProject(formData);
 *     if (result) {
 *       console.log('Created project:', result.id);
 *       // Reset form or redirect
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         value={formData.ownerFirstName}
 *         onChange={e => setFormData({...formData, ownerFirstName: e.target.value})}
 *         placeholder="First Name"
 *       />
 *       {/* More form fields... *\/}
 *       <button disabled={loading}>
 *         {loading ? 'Creating...' : 'Create Project'}
 *       </button>
 *       {success && <div>Project created: {createdProject.id}</div>}
 *       {error && <div>Error: {error}</div>}
 *     </form>
 *   );
 * }
 */
export function useCreateProject() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [createdProject, setCreatedProject] = useState(null);

  const createProject = useCallback(async (projectData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setCreatedProject(null);

    try {
      const data = await api.projects.create(projectData);
      setCreatedProject(data);
      setSuccess(true);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('useCreateProject error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProject,
    loading,
    error,
    success,
    createdProject,
  };
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Hook that provides seasons and projects together
 * Useful for components that show a season selector and project list
 * @param {string} initialSeason - Initial season to load (optional)
 * @returns {Object} { seasons, selectedSeason, setSelectedSeason, projects, loading, error }
 *
 * @example
 * function ProjectsPage() {
 *   const {
 *     seasons,
 *     selectedSeason,
 *     setSelectedSeason,
 *     projects,
 *     loading,
 *     error
 *   } = useSeasonsAndProjects('24-25');
 *
 *   return (
 *     <div>
 *       <select value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)}>
 *         {seasons.map(s => <option key={s} value={s}>{s}</option>)}
 *       </select>
 *
 *       {loading && <div>Loading...</div>}
 *       {error && <div>Error: {error}</div>}
 *
 *       <ul>
 *         {projects.map(p => <li key={p.id}>{p.ownerFullName}</li>)}
 *       </ul>
 *     </div>
 *   );
 * }
 */
export function useSeasonsAndProjects(initialSeason = null) {
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);

  // Fetch seasons
  const {
    seasons,
    loading: seasonsLoading,
    error: seasonsError,
  } = useSeasons();

  // Auto-select first season if none selected
  useEffect(() => {
    if (!selectedSeason && seasons.length > 0) {
      setSelectedSeason(seasons[0]);
    }
  }, [seasons, selectedSeason]);

  // Fetch projects for selected season
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    refresh: refreshProjects,
  } = useProjects(selectedSeason, { enabled: !!selectedSeason });

  return {
    // Seasons
    seasons,
    selectedSeason,
    setSelectedSeason,

    // Projects
    projects,
    refreshProjects,

    // Combined states
    loading: seasonsLoading || projectsLoading,
    error: seasonsError || projectsError,
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook to check backend health
 * @returns {Object} { isHealthy, loading, checkHealth }
 *
 * @example
 * function StatusIndicator() {
 *   const { isHealthy, loading, checkHealth } = useBackendHealth();
 *
 *   return (
 *     <div>
 *       {loading && <span>Checking...</span>}
 *       {!loading && (
 *         <span style={{ color: isHealthy ? 'green' : 'red' }}>
 *           {isHealthy ? '● Online' : '● Offline'}
 *         </span>
 *       )}
 *       <button onClick={checkHealth}>Check</button>
 *     </div>
 *   );
 * }
 */
export function useBackendHealth() {
  const [isHealthy, setIsHealthy] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    try {
      const healthy = await api.utils.healthCheck();
      setIsHealthy(healthy);
    } catch (err) {
      setIsHealthy(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    isHealthy,
    loading,
    checkHealth,
  };
}
