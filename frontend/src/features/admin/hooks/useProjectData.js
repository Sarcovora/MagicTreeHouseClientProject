/**
 * useProjectData Hook
 * 
 * Custom hook that manages project data fetching, loading states, and error handling.
 * This hook handles the core data operations for the ProjectDetail page including:
 * - Loading project details from the API
 * - Managing loading and error states
 * - Fetching landowner projects for the project selector
 * - Handling project deletion with navigation
 * - Automatic redirect for unauthorized access (403 errors)
 * 
 * @param {string} projectId - The ID of the project to fetch
 * @returns {Object} Project data and operations
 * @returns {Object|null} project - The loaded project data
 * @returns {Function} setProject - Setter for updating project state
 * @returns {boolean} loading - Loading state indicator
 * @returns {string|null} error - Error message if loading failed
 * @returns {Function} setError - Setter for updating error state
 * @returns {Array} landownerProjects - List of projects for landowner selector
 * @returns {Function} loadProjectDetails - Function to reload project data
 * @returns {Function} deleteProject - Function to delete the current project
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../../services/apiService";
import { useAuth } from "../../auth/AuthProvider";

export const useProjectData = (projectId) => {
  const { isAdmin, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [landownerProjects, setLandownerProjects] = useState([]);

  // Fetch all projects for landowner to populate selector
  useEffect(() => {
    if (!isAdmin && user) {
        apiService.getLandownerProjects()
            .then(projects => {
                if (projects && projects.length > 0) {
                    setLandownerProjects(projects);
                }
            })
            .catch(err => console.error("Failed to load landowner projects:", err));
    }
  }, [isAdmin, user]);

  const loadProjectDetails = useCallback(async () => {
    if (!projectId) {
      setError("Project ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getProjectDetails(projectId);
      if (data) {
        setProject(data);
      } else {
        setError(`Project with ID ${projectId} not found.`);
      }
    } catch (err) {
      console.error("Failed to fetch project details:", err);
      
      // Handle 403 - landowner trying to access wrong project
      if (err.response?.status === 403 && !isAdmin) {
        console.log("Landowner tried to access wrong project, redirecting to dashboard...");
        navigate('/landowner/dashboard', { replace: true });
        return;
      }
      
      setError("Could not load project details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [projectId, isAdmin, navigate]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }
    loadProjectDetails();
  }, [loadProjectDetails, user, authLoading]);

  const deleteProject = async () => {
    if (!projectId) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete project "${project?.name || projectId}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    setError(null);
    try {
      await apiService.deleteProject(projectId);
      if (project?.seasonYear) {
        navigate(`/admin/seasons/${project.seasonYear}`);
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError(`Failed to delete project: ${err.message || "Please try again."}`);
    }
  };

  return {
    project,
    setProject,
    loading,
    error,
    setError,
    landownerProjects,
    loadProjectDetails,
    deleteProject
  };
};
