// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link
import AddNewFolderIcon from "../../assets/icons/addNewFolder.svg?react";
import AddNewProjectIcon from "../../assets/icons/addNewProject.svg?react";

import ProjectCard from "../../components/projects/ProjectCard";
import SeasonCard from "../../components/SeasonCard"; // Corrected path assumption
import SearchBar from "../../components/SearchBar"; // Corrected path assumption
import apiService from "../../services/apiService"; // Import the api service

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState("seasons"); // Default to seasons view
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [seasonsData, projectsData] = await Promise.all([
          apiService.getSeasons(),
          apiService.getAllProjects(), // Fetch all projects initially for the 'Projects' view
        ]);
        setSeasons(seasonsData || []); // Ensure array
        setProjects(projectsData || []); // Ensure array
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Could not load data. Please try again later.");
        setSeasons([]); // Set to empty array on error
        setProjects([]); // Set to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Filter projects based on search term (only when viewMode is 'projects')
  const filteredProjects = viewMode === 'projects'
    ? projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.address && project.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (project.landowner && project.landowner.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    : []; // No filtering needed for seasons view based on project details

  // Filter seasons based on search term (simple year match)
  const filteredSeasons = viewMode === 'seasons'
    ? seasons.filter(
      (season) =>
        season.year.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-red-500">{error}</div>;
    }

    if (viewMode === "projects") {
      if (filteredProjects.length === 0 && searchTerm) {
        return <div className="text-center text-gray-500">No projects match your search.</div>;
      }
      if (projects.length === 0) {
        return <div className="text-center text-gray-500">No projects found. <Link to="/admin/add-project" className="text-green-600 hover:underline">Add a new project</Link> to get started.</div>; // Added link suggestion
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      );
    } else { // Seasons view
      if (filteredSeasons.length === 0 && searchTerm) {
        return <div className="text-center text-gray-500">No seasons match your search.</div>;
      }
      if (seasons.length === 0) {
        return <div className="text-center text-gray-500">No seasons found. Click 'Add New Folder' to create one.</div>;
      }
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeasons.map((season) => (
            // Pass season data to SeasonCard
            // Wrap with Link later when implementing navigation
            <SeasonCard key={season.id} season={season} />
          ))}
        </div>
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
            {/* Conditionally render Add Button - Will add functionality later */}
            {viewMode === "seasons" ? (
              <button className="flex items-center px-3 py-2 bg-green-800 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                <AddNewFolderIcon className="w-5 h-5 mr-2 fill-current" />
                Add New Folder
              </button>
              // <AddNewFolderIcon className="h-10 w-auto cursor-pointer" title="Add New Season Folder"/> // Simple icon button
            ) : (
              <button className="flex items-center px-3 py-2 bg-green-800 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                <AddNewProjectIcon className="w-5 h-5 mr-2 fill-current" />
                Add New Project
              </button>
              // <AddNewProjectIcon className="h-10 w-auto cursor-pointer" title="Add New Project"/> // Simple icon button
            )}
          </div>

          {/* View Mode Toggles */}
          <div className="flex space-x-2 self-start sm:self-center">
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === "projects"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              onClick={() => setViewMode("projects")}
            >
              Projects
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-sm font-medium ${viewMode === "seasons"
                ? "bg-green-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              onClick={() => setViewMode("seasons")}
            >
              Seasons
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={viewMode === 'projects' ? "Search projects by name, address, landowner..." : "Search seasons by year..."}
          />
        </div>
      </div>

      {/* Content Area */}
      {renderContent()}
    </>
  );
};

export default AdminDashboard;
