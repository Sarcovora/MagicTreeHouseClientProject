// src/pages/admin/SeasonProjectList.jsx
import { useState, useEffect } from 'react'; // Restore useState, useEffect
import { useParams, Link, useNavigate } from 'react-router-dom'; // Restore Link
import { ArrowLeft, FolderOpen, Plus, AlertCircle } from 'lucide-react'; // Restore Icons
import apiService from '../../services/apiService'; // Restore apiService
import ProjectCard from '../../components/projects/ProjectCard'; // Restore ProjectCard
import SearchBar from '../../components/SearchBar'; // Restore SearchBar

const SeasonProjectList = () => {
  const { seasonYear } = useParams();
  const navigate = useNavigate();
  // Restore state variables
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Restore useEffect for data fetching
  useEffect(() => {
    // Add console log for effect start
    console.log(`[SeasonProjectList - Restored] useEffect triggered. Season: ${seasonYear}`);
    const fetchProjects = async () => {
      if (!seasonYear) {
        console.error("[SeasonProjectList - Restored] Season year is undefined in params.");
        setError("Season year not specified in URL.");
        setLoading(false);
        return;
      }
      // Reset state before fetching
      setLoading(true);
      setError(null);
      setProjects([]); // Clear previous projects

      try {
        console.log(`[SeasonProjectList - Restored] Calling API for season: ${seasonYear}`);
        const seasonProjects = await apiService.getProjectsBySeason(seasonYear);
        console.log(`[SeasonProjectList - Restored] API returned ${seasonProjects?.length ?? 0} projects for ${seasonYear}.`);
        setProjects(seasonProjects || []); // Set fetched projects, ensure array
      } catch (err) {
        console.error(`[SeasonProjectList - Restored] Failed to fetch projects for season ${seasonYear}:`, err);
        setError(`Could not load projects for season ${seasonYear}. Please try again.`);
        setProjects([]); // Ensure empty array on error
      } finally {
        setLoading(false);
         console.log(`[SeasonProjectList - Restored] Finished loading data for ${seasonYear}. Loading state: false`);
      }
    };

    fetchProjects();
  }, [seasonYear]); // Dependency array ensures re-fetch if URL changes

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.address && project.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.landowner && project.landowner.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Restore the renderContent function
  const renderContent = () => {
    console.log(`[SeasonProjectList - Restored] renderContent called. Loading: ${loading}, Error: ${!!error}, Projects Found: ${projects.length}, Filtered Count: ${filteredProjects.length}`);
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className='ml-4 text-gray-600'>Loading projects...</p> {/* Added text */}
        </div>
      );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg flex items-center justify-center shadow-sm">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> {error}
            </div>
        );
    }

     // Handle case where API returns empty array (no projects for this season)
     if (!loading && projects.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="font-medium text-lg">No projects found for the {seasonYear} season.</p>
          <p className="text-sm mt-1 mb-4">You can add a new project to this season.</p>
           <button
              // onClick={() => navigate(`/admin/add-project?season=${seasonYear}`)} // Will implement Add New Project later
              className="mt-4 flex items-center justify-center mx-auto px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Project to {seasonYear}
            </button>
        </div>
      );
    }

    // Handle case where projects exist, but filter yields no results
    if (filteredProjects.length === 0 && searchTerm) {
        return <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">No projects match your search term "{searchTerm}" for this season.</div>;
    }

    // Render the project cards if projects exist and filters match
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  // Restore the full JSX structure
  return (
    // Use AdminLayout's padding or add conditional padding here
    // Removed explicit padding to rely on AdminLayout
    <>
       {/* Header */}
       <div className="mb-8">
         <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
             {/* Back Button and Title */}
            <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/admin/dashboard')} // Navigate back to dashboard
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-semibold">
                  Projects for Season {seasonYear}
                </h1>
            </div>
             {/* Add Project Button */}
             <button
                 // onClick={() => navigate(`/admin/add-project?season=${seasonYear}`)} // Add functionality later
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm self-start sm:self-center"
             >
                 <Plus className="w-4 h-4 mr-2" /> Add Project to {seasonYear}
             </button>
         </div>
          {/* Search Bar */}
          <div className="mt-6">
              <SearchBar
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder={`Search projects within ${seasonYear} season...`}
              />
          </div>
       </div>

        {/* Project Grid Area */}
        {renderContent()}
    </>
  );
};

export default SeasonProjectList;