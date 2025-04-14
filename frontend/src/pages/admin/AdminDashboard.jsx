// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AddNewFolderIcon from "../../assets/icons/addNewFolder.svg?react";
import AddNewProjectIcon from "../../assets/icons/addNewProject.svg?react";

import ProjectCard from "../../components/projects/ProjectCard";
import SeasonCard from "../../components/SeasonCard";
import SearchBar from "../../components/SearchBar";
import Modal from "../../components/common/Modal";
import AddSeasonForm from "../../components/modals/AddSeasonForm";
import apiService from "../../services/apiService";
import { AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState("seasons");
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [isAddSeasonModalOpen, setIsAddSeasonModalOpen] = useState(false);
  const [isSubmittingSeason, setIsSubmittingSeason] = useState(false);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setActionError(null);
      try {
        const [seasonsData, projectsData] = await Promise.all([
          apiService.getSeasons(),
          apiService.getAllProjects(),
        ]);
        setSeasons(seasonsData ? seasonsData.sort((a, b) => b.year.localeCompare(a.year)) : []);
        setProjects(projectsData || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load data. Please try again later.");
        setSeasons([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter projects
  const filteredProjects = viewMode === 'projects'
    ? projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.address && project.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.landowner && project.landowner.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : [];

  // Filter seasons
  const filteredSeasons = viewMode === 'seasons'
    ? seasons.filter(
      (season) =>
        season.year.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  // --- Handlers ---

  const handleOpenAddSeasonModal = () => {
    setActionError(null);
    setIsAddSeasonModalOpen(true);
  };

  const handleCloseAddSeasonModal = () => {
    setIsAddSeasonModalOpen(false);
    // Clear error when closing modal explicitly
    setActionError(null);
  };

  const handleSeasonAdd = async (newSeasonYear) => {
    setIsSubmittingSeason(true);
    setActionError(null); // Clear previous specific errors before trying again
    console.log("Dashboard: Attempting to add season:", newSeasonYear);
    try {
      const addedSeason = await apiService.addSeason(newSeasonYear);
      console.log("Dashboard: Season added successfully via API:", addedSeason);
      setSeasons(prevSeasons =>
        [...prevSeasons, addedSeason].sort((a, b) => b.year.localeCompare(a.year))
      );
      handleCloseAddSeasonModal();
    } catch (err) {
      console.error("Dashboard: Failed to add season:", err);
      setActionError(`Failed to add season '${newSeasonYear}'. Error: ${err.message || 'Please try again.'}`);
    } finally {
      setIsSubmittingSeason(false);
    }
  };

  // --- NEW DELETE HANDLER ---
  const handleSeasonDelete = async (seasonId, seasonYear) => {
    setActionError(null); // Clear previous errors

    // Confirmation Dialog
    if (!window.confirm(`Are you sure you want to delete the season "${seasonYear}"? This action cannot be undone.`)) {
      return; // Abort if user cancels
    }

    console.log(`Dashboard: Attempting to delete season ID: ${seasonId}, Year: ${seasonYear}`);
    try {
      await apiService.deleteSeason(seasonId);
      console.log(`Dashboard: Season ${seasonYear} (${seasonId}) deleted successfully.`);
      // Update state by removing the deleted season
      setSeasons(prevSeasons => prevSeasons.filter(season => season.id !== seasonId));
    } catch (err) {
      console.error(`Dashboard: Failed to delete season ${seasonYear} (${seasonId}):`, err);
      // Display the error from the API (e.g., "cannot delete season with projects")
      setActionError(err.message || `Failed to delete season "${seasonYear}". Please try again.`);
    }
    // No 'finally' block needed here unless adding a loading state for delete
  };
  // --- END DELETE HANDLER ---

  // --- Render Logic ---

  const renderContent = () => {
    // ... (loading indicator) ...
    // ... (page error display) ...

    // Action error display (now only shows if modal is closed)
    const renderActionError = () => actionError && !isAddSeasonModalOpen && (
      <div className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-lg flex items-center justify-center shadow-sm">
        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> {actionError}
      </div>
    );

    // ... (rest of project/season rendering logic) ...

    if (viewMode === "seasons") {
      if (seasons.length === 0) {
        return <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">No seasons found. Click 'Add New Folder' to create one.</div>;
      }
      if (filteredSeasons.length === 0 && searchTerm) {
        return <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">No seasons match your search term "{searchTerm}".</div>;
      }
      return (
        <>
          {renderActionError()} {/* Show non-modal errors here */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> {/* Potentially allow 4 cols */}
            {filteredSeasons.map((season) => (
              <SeasonCard
                key={season.id}
                season={season}
                onDelete={() => handleSeasonDelete(season.id, season.year)} // Pass delete handler
              />
            ))}
          </div>
        </>
      );
    } else { // Projects view (simplified for brevity)
      // ... project rendering logic ...
      if (projects.length === 0) {
        return (
          <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">
            No projects found.
            <Link to="/admin/add-project" className="text-green-600 hover:underline ml-1">Add a new project</Link> to get started.
          </div>
        );
      }
      if (filteredProjects.length === 0 && searchTerm) {
        return <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">No projects match your search term "{searchTerm}".</div>;
      }
      return (
        <>
          {renderActionError()} {/* Show non-modal errors here */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      );
    }
  };

  return (
    <>
      <div className="mb-8">
        {/* ... (Header section with title, add buttons, view toggles, search bar) ... */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          {/* Title and Add Button */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-semibold mb-2">
              {viewMode === "projects"
                ? "Your Reforestation Projects"
                : "Your Reforestation Seasons"}
            </h1>
            {viewMode === "seasons" ? (
              <button
                onClick={handleOpenAddSeasonModal}
                className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                <AddNewFolderIcon className="w-5 h-5 mr-2 fill-current" />
                Add New Folder
              </button>
            ) : (
              <Link
                to="/admin/add-project"
                className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors inline-flex">
                <AddNewProjectIcon className="w-5 h-5 mr-2 fill-current" />
                Add New Project
              </Link>
            )}
          </div>

          {/* View Mode Toggles */}
          <div className="flex space-x-2 self-start sm:self-center">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === "projects"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              onClick={() => { setViewMode("projects"); setActionError(null); }}
            >
              Projects
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === "seasons"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              onClick={() => { setViewMode("seasons"); setActionError(null); }}
            >
              Seasons
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <SearchBar
            value={searchTerm}
            onChange={(value) => { setSearchTerm(value); setActionError(null); }}
            placeholder={viewMode === 'projects' ? "Search projects by name, address, landowner..." : "Search seasons by year..."}
          />
        </div>
      </div>


      {/* Content Area */}
      {renderContent()}

      {/* Add Season Modal */}
      <Modal
        isOpen={isAddSeasonModalOpen}
        onClose={!isSubmittingSeason ? handleCloseAddSeasonModal : () => { }}
        title="Add New Season"
      >
        <AddSeasonForm
          onSubmit={handleSeasonAdd}
          onCancel={handleCloseAddSeasonModal}
          existingSeasons={seasons}
          isLoading={isSubmittingSeason}
        />
        {/* Display API error inside the modal */}
        {actionError && isAddSeasonModalOpen && ( // Only show if modal is open
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
            {actionError}
          </div>
        )}
      </Modal>
    </>
  );
};

export default AdminDashboard;
