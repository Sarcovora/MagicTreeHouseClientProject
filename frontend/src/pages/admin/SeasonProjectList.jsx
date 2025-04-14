// src/pages/admin/SeasonProjectList.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Ensure Link is imported
import { ArrowLeft, FolderOpen, Plus, AlertCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import ProjectCard from '../../components/projects/ProjectCard';
import SearchBar from '../../components/SearchBar';

const SeasonProjectList = () => {
  const { seasonYear } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // console.log(`[SeasonProjectList - Restored] useEffect triggered. Season: ${seasonYear}`);
    const fetchProjects = async () => {
      if (!seasonYear) {
        console.error("[SeasonProjectList - Restored] Season year is undefined in params.");
        setError("Season year not specified in URL.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      setProjects([]);

      try {
        console.log(`[SeasonProjectList - Restored] Calling API for season: ${seasonYear}`);
        const seasonProjects = await apiService.getProjectsBySeason(seasonYear);
        console.log(`[SeasonProjectList - Restored] API returned ${seasonProjects?.length ?? 0} projects for ${seasonYear}.`);
        setProjects(seasonProjects || []);
      } catch (err) {
        console.error(`[SeasonProjectList - Restored] Failed to fetch projects for season ${seasonYear}:`, err);
        setError(`Could not load projects for season ${seasonYear}. Please try again.`);
        setProjects([]);
      } finally {
        setLoading(false);
         console.log(`[SeasonProjectList - Restored] Finished loading data for ${seasonYear}. Loading state: false`);
      }
    };

    fetchProjects();
  }, [seasonYear]);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.address && project.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (project.landowner && project.landowner.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderContent = () => {
    console.log(`[SeasonProjectList - Restored] renderContent called. Loading: ${loading}, Error: ${!!error}, Projects Found: ${projects.length}, Filtered Count: ${filteredProjects.length}`);
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className='ml-4 text-gray-600'>Loading projects...</p>
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

     if (!loading && projects.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="font-medium text-lg">No projects found for the {seasonYear} season.</p>
          {/* --- REMOVED DUPLICATE BUTTON --- */}
          <p className="text-sm mt-1 mb-4">You can add a new project to this season using the button above.</p>
          {/* <button ... >Add Project to {seasonYear}</button> <-- REMOVED */}
        </div>
      );
    }

    if (filteredProjects.length === 0 && searchTerm) {
        return <div className="text-center text-gray-500 py-10 bg-white rounded-lg shadow-sm p-8">No projects match your search term "{searchTerm}" for this season.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <>
       {/* Header */}
       <div className="mb-8">
         <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            {/* Back Button and Title */}
            <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-semibold">
                  Projects for Season {seasonYear}
                </h1>
            </div>
             {/* --- CHANGE BUTTON TO LINK --- */}
             <Link
                  to={`/admin/add-project?season=${seasonYear}`} // Link to add page with query param
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap text-sm self-start sm:self-center"
             >
                 <Plus className="w-4 h-4 mr-2" /> Add Project to {seasonYear}
             </Link>
             {/* --- END LINK CHANGE --- */}
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