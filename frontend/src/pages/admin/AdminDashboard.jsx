import { useState } from "react";
import AddNewFolder from "../../assets/icons/AddNewFolder.svg?react";
import AddNewProject from "../../assets/icons/AddNewProject.svg?react";

import ProjectCard from "../../components/projects/ProjectCard";
import SeasonCard from "../../components/SeasonCard";
import SearchBar from "../../components/SearchBar";

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState("seasons");
  const [searchTerm, setSearchTerm] = useState("");

  // Sample data - replace with actual data later
  const projectsData = [
    {
      id: 1,
      name: "ABCD Park",
      location: "123 Rio Grande St, Austin TX",
      landowner: "John Doe",
      date: null,
    },
    {
      id: 2,
      name: "Forest Revival",
      location: "123 Rio Grande St, Austin TX",
      landowner: "Jane Smith",
      date: null,
    },
    {
      id: 3,
      name: "Green Future",
      location: "123 Rio Grande St, Austin TX",
      landowner: "Bob Wilson",
      date: null,
    },
  ];

  // Sample seasons data
  const seasonsData = [
    { id: 1, year: "2019", projectCount: 0 },
    { id: 2, year: "2020", projectCount: 0 },
    { id: 3, year: "2021", projectCount: 0 },
    { id: 4, year: "2022", projectCount: 0 },
    { id: 5, year: "2023", projectCount: 0 },
    { id: 6, year: "2024", projectCount: 0 },
  ];

  // Filter projects based on search term
  const filteredProjects = projectsData.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.landowner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">
              {viewMode === "projects"
                ? "Your Reforestation Projects"
                : "Your Reforestation Seasons"}
            </h1>
            <div className="mt-4">
              {viewMode === "seasons" ? (
                <AddNewFolder className="h-10 w-auto cursor-pointer" />
              ) : (
                <AddNewProject className="h-10 w-auto cursor-pointer" />
              )}
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded-lg ${
                viewMode === "projects"
                  ? "bg-green-600 text-white"
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
          </div>
        </div>

        <div className="mt-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {viewMode === "projects"
          ? filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          : seasonsData.map((season) => (
              <SeasonCard key={season.id} season={season} />
            ))}
      </div>
    </>
  );
};

export default AdminDashboard;
