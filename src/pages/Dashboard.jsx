import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Sidebar from "../components/layouts/SideBar";
import ProjectCard from "../components/projects/ProjectCard";
import projectsData from "../data/projectsData";
import Folder from "../assets/icons/folder.svg?react";

/**
 * Dashboard component displays reforestation projects organized by season
 */
const Dashboard = () => {
  const [viewMode, setViewMode] = useState("projects"); // 'projects' or 'seasons'
  const [searchTerm, setSearchTerm] = useState("");

  // Group projects by season
  const projectsBySeasons = {
    "2024": [],
    "2023": [],
    "2022": [],
    "2021": [],
    "2020": [],
    "2019": [],
  };

  // Assign projects to seasons (in a real app, this would come from the database)
  projectsData.forEach((project) => {
    const date = new Date(project.startDate);
    const year = date.getFullYear();
    const month = date.getMonth();

    let season;
    if (month >= 2 && month <= 4) season = `Spring ${year}`;
    else if (month >= 5 && month <= 7) season = `Summer ${year}`;
    else if (month >= 8 && month <= 10) season = `Fall ${year}`;
    else season = `Winter ${year}`;

    if (projectsBySeasons[season]) {
      projectsBySeasons[season].push(project);
    }
  });

  // Filter projects based on search term
  const filteredProjects = projectsData.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.landowner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">
              {viewMode === "projects"
                ? "Your Reforestation Projects"
                : "Your Reforestation Seasons"}
            </h1>
            <div className="flex space-x-4">
              <button
                className={`px-4 py-2 rounded-lg ${
                  viewMode === "projects"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-gray-100 text-gray-600"
                }`}
                onClick={() => setViewMode("projects")}
              >
                Projects
              </button>
              <button
                className={`px-4 py-2 rounded-lg ${
                  viewMode === "seasons"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
                onClick={() => setViewMode("seasons")}
              >
                Seasons
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add New Folder
              </button>
            </div>
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 border border-gray-300 rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Projects View */}
        {viewMode === "projects" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Link to={`/project/${project.id}`} key={project.id}>
                <ProjectCard project={project} />
              </Link>
            ))}
          </div>
        )}

        {/* Seasons View */}
        {viewMode === "seasons" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(projectsBySeasons).map(([season, projects]) => (
              <div
                key={season}
                className="cursor-pointer transform transition-transform hover:scale-105"
              >
                <div className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md">
                  <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center mb-3">
                    <Folder className="w-32 h-32 text-gray-400" />
                  </div>
                  <h3 className="text-center font-medium">{season}</h3>
                  <p className="text-center text-sm text-gray-500">
                    {projects.length} projects
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
