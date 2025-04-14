// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddNewFolderIcon from "../../assets/icons/AddNewFolder.svg?react";
import AddNewProjectIcon from "../../assets/icons/AddNewProject.svg?react";

import ProjectCard from "../../components/projects/ProjectCard";
import SeasonCard from "../../components/SeasonCard";
import SearchBar from "../../components/SearchBar";
import Modal from "../../components/common/Modal"; // Import Modal
// import AddSeasonForm from "../../components/modals/AddSeasonForm"; // Import AddSeasonForm
import AddSeasonForm from "../../components/common/modals/AddSeasonForm";
import apiService from "../../services/apiService";
import { AlertCircle } from "lucide-react"; // For error display

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState("seasons");
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // For page-level errors
  const [actionError, setActionError] = useState(null); // For specific action errors (like adding season)
  const [isAddSeasonModalOpen, setIsAddSeasonModalOpen] = useState(false); // State for modal
  const [isSubmittingSeason, setIsSubmittingSeason] = useState(false); // Loading state for form submission


  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setActionError(null); // Clear action errors on refresh
      try {
        const [seasonsData, projectsData] = await Promise.all([
          apiService.getSeasons(),
          apiService.getAllProjects(),
        ]);
        setSeasons(seasonsData ? seasonsData.sort((a, b) => b.year.localeCompare(a.year)) : []); // Sort seasons descending
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
       setActionError(null); // Clear previous action errors
       setIsAddSeasonModalOpen(true);
   };

   const handleCloseAddSeasonModal = () => {
       setIsAddSeasonModalOpen(false);
       // Optionally clear form state here if needed, but AddSeasonForm resets itself
   };

   const handleSeasonAdd = async (newSeasonYear) => {
        setIsSubmittingSeason(true);
        setActionError(null);
        console.log("Dashboard: Attempting to add season:", newSeasonYear);
        try {
            const addedSeason = await apiService.addSeason(newSeasonYear);
            console.log("Dashboard: Season added successfully via API:", addedSeason);
            // Add to state and re-sort
            setSeasons(prevSeasons =>
                [...prevSeasons, addedSeason].sort((a, b) => b.year.localeCompare(a.year))
            );
            handleCloseAddSeasonModal(); // Close modal on success
        } catch (err) {
             console.error("Dashboard: Failed to add season:", err);
             setActionError(`Failed to add season '${newSeasonYear}'. Please try again.`); // Show error to user
             // Keep modal open on error? Yes, allow retry.
        } finally {
             setIsSubmittingSeason(false);
        }
   };

   // --- Render Logic ---

  const renderContent = () => {
    if (loading) {
       return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    // Display page-level error first
    if (error) {
      return <div className="text-center text-red-500 p-4 bg-red-100 rounded-lg shadow-sm">{error}</div>;
    }

    // Display action-level error (e.g., failed add) above the content
     const renderActionError = () => actionError && (
         <div className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-lg flex items-center justify-center shadow-sm">
             <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> {actionError}
         </div>
     );


    if (viewMode === "projects") {
       if (projects.length === 0) {
           return <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">No projects found. Add a new project to get started.</div>;
       }
       if (filteredProjects.length === 0 && searchTerm) {
         return <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">No projects match your search term "{searchTerm}".</div>;
      }
      return (
        <>
          {renderActionError()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      );
    } else { // Seasons view
        if (seasons.length === 0) {
          return <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">No seasons found. Click 'Add New Folder' to create one.</div>;
        }
       if (filteredSeasons.length === 0 && searchTerm) {
         return <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">No seasons match your search term "{searchTerm}".</div>;
      }
      return (
         <>
          {renderActionError()}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeasons.map((season) => (
              <SeasonCard key={season.id} season={season} />
            ))}
          </div>
        </>
      );
    }
  };


  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
          {/* Title and Add Button */}
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-semibold mb-2">
              {viewMode === "projects"
                ? "Your Reforestation Projects"
                : "Your Reforestation Seasons"}
            </h1>
            {/* Conditionally render Add Button */}
            {viewMode === "seasons" ? (
              <button
                onClick={handleOpenAddSeasonModal} // Open modal onClick
                className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                 <AddNewFolderIcon className="w-5 h-5 mr-2 fill-current" />
                 Add New Folder
              </button>
            ) : (
               <button
                 // onClick={() => navigate('/admin/add-project')} // Add navigation later
                 className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  <AddNewProjectIcon className="w-5 h-5 mr-2 fill-current" />
                 Add New Project
               </button>
            )}
          </div>

          {/* View Mode Toggles */}
          <div className="flex space-x-2 self-start sm:self-center">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === "projects"
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => { setViewMode("projects"); setActionError(null); }} // Clear action error on view change
            >
              Projects
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                viewMode === "seasons"
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => { setViewMode("seasons"); setActionError(null); }} // Clear action error on view change
            >
              Seasons
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <SearchBar
              value={searchTerm}
              onChange={(value) => { setSearchTerm(value); setActionError(null); }} // Clear action error on search
              placeholder={viewMode === 'projects' ? "Search projects by name, address, landowner..." : "Search seasons by year..."}
          />
        </div>
      </div>

      {/* Content Area */}
      {renderContent()}

       {/* Add Season Modal */}
       <Modal
          isOpen={isAddSeasonModalOpen}
          onClose={!isSubmittingSeason ? handleCloseAddSeasonModal : () => {}} // Prevent closing while submitting
          title="Add New Season"
        >
          <AddSeasonForm
            onSubmit={handleSeasonAdd}
            onCancel={handleCloseAddSeasonModal}
            existingSeasons={seasons} // Pass existing seasons for validation
            isLoading={isSubmittingSeason} // Pass loading state to the form
          />
           {/* Display API error inside the modal */}
           {actionError && (
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
