// src/pages/admin/ProjectDetail.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  User, MapPin, Phone, Mail, ArrowLeft, Edit, Trash2, AlertCircle
} from "lucide-react";
import apiService from "../../services/apiService";

const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
          setError("Project ID is missing.");
          setLoading(false);
          return;
      };
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
        setError("Could not load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  // Handle Delete Project
  const handleDeleteProject = async () => {
      if (!projectId) return;
      if (window.confirm(`Are you sure you want to delete project "${project?.name || projectId}"? This action cannot be undone.`)) {
          setError(null);
          try {
              await apiService.deleteProject(projectId);
              console.log("Project deleted successfully");
              // Navigate back to the project's season list or dashboard if season unknown
              if (project?.seasonYear) {
                  navigate(`/admin/seasons/${project.seasonYear}`);
              } else {
                  navigate('/admin/dashboard');
              }
          } catch (err) {
              console.error("Failed to delete project:", err);
              setError(`Failed to delete project: ${err.message || 'Please try again.'}`);
          }
      }
  }

  // --- UPDATED BACK BUTTON FUNCTION ---
  const handleGoBack = () => {
      // Navigate explicitly to the season list if project data is available
      if (project?.seasonYear) {
          console.log(`Back button clicked. Navigating to season: /admin/seasons/${project.seasonYear}`);
          navigate(`/admin/seasons/${project.seasonYear}`);
      } else {
          // Fallback to dashboard if seasonYear is unknown or project not loaded
          console.log("Back button clicked. Project/season unknown, navigating to dashboard.");
          navigate('/admin/dashboard');
      }
  };
  // --- END UPDATED BACK BUTTON FUNCTION ---

  // --- Render Logic ---
  // ... (loading, error rendering) ...
  if (loading) { /* ... loading JSX ... */
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error && !project) { /* ... error JSX ... */
    return (
       <div className="max-w-7xl mx-auto px-8 py-6 text-center">
           <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
           <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Project</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
                onClick={() => navigate('/admin/dashboard')}
                className="mt-6 flex items-center justify-center mx-auto px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </button>
       </div>
    );
  }

  if (!project) { /* ... not found JSX ... */
    return <div className="text-center p-8">Project data not found.</div>;
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Back button uses the explicit navigation handler */}
          <button
            onClick={handleGoBack}
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
            title={project?.seasonYear ? `Back to Season ${project.seasonYear}` : "Back to Dashboard"} // Dynamic tooltip
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <div className="flex space-x-2">
            <Link
              to={`/admin/project/${projectId}/edit`}
              className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Link>
            <button
              onClick={handleDeleteProject}
              className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
             >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Display project details (content remains the same) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
         {error && ( /* Display delete/update error */
            <div className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-lg flex items-center justify-center shadow-sm">
               <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" /> {error}
            </div>
         )}
        {/* Project Image */}
        {project.image ? ( <div className="mb-8 rounded-lg overflow-hidden shadow-sm aspect-video max-h-[500px]"><img src={project.image} alt={project.name} className="w-full h-full object-cover" /></div> ) : ( <div className="mb-8 rounded-lg shadow-sm aspect-video max-h-[400px] bg-gray-200 flex items-center justify-center"><p className="text-gray-500">No project image available</p></div> )}
        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8"><div><h1 className="text-3xl font-bold mb-2">{project.name}</h1><div className="flex items-center text-gray-600 mb-4"><MapPin className="w-5 h-5 mr-2 flex-shrink-0" /><span>{project.address || project.location || "No location specified"}</span></div></div></div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Project Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm"><h2 className="text-lg font-semibold mb-4">Project Description</h2><p className="text-gray-600 whitespace-pre-wrap">{project.description || "No description provided."}</p></div>
            {/* Key Metrics */}
            {project.metrics && (<div className="bg-white rounded-lg p-6 shadow-sm"><h2 className="text-lg font-semibold mb-4">Key Metrics</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{Object.entries(project.metrics).map(([key, value]) => ( <div key={key} className="bg-gray-50 p-4 rounded-lg"><div className="text-sm text-gray-600 mb-1 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</div><div className="text-xl font-semibold">{value ?? 'N/A'}</div></div>))}{Object.keys(project.metrics).length === 0 && (<p className="text-gray-500 col-span-1 sm:col-span-2 text-center py-4">No metrics recorded yet.</p>)}</div></div>)}
          </div>
          {/* Right Column */}
          <div className="space-y-8">
            {/* Landowner Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm"><h2 className="text-lg font-semibold mb-4">Landowner Information</h2><div className="space-y-3"><div className="flex items-center"><User className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" /><span>{project.landowner || 'N/A'}</span></div>{project.contact ? (<><div className="flex items-center"><Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />{project.contact.phone ? (<a href={`tel:${project.contact.phone}`} className="hover:text-green-600">{project.contact.phone}</a>) : (<span>N/A</span>)}</div><div className="flex items-center"><Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />{project.contact.email ? (<a href={`mailto:${project.contact.email}`} className="hover:text-green-600 break-all">{project.contact.email}</a>) : (<span>N/A</span>)}</div></>) : <p className='text-sm text-gray-500'>No contact details available.</p>}</div></div>
            {/* Project Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm"><h2 className="text-lg font-semibold mb-4">Project Status</h2><div className="space-y-3"><div><div className="text-sm text-gray-600 mb-1">Status</div><div className={`font-semibold ${project.status === 'Active' ? 'text-green-600' : project.status === 'Completed' ? 'text-blue-600' : 'text-gray-700'}`}>{project.status || 'N/A'}</div></div><div><div className="text-sm text-gray-600 mb-1">Start Date</div><div className="font-semibold">{project.startDate ? new Date(project.startDate + 'T00:00:00').toLocaleDateString() : 'N/A'}</div></div><div><div className="text-sm text-gray-600 mb-1">Season</div><div className="font-semibold">{project.seasonYear || 'N/A'}</div></div><div><div className="text-sm text-gray-600 mb-1">Last Updated</div><div className="font-semibold">{project.lastUpdated ? new Date(project.lastUpdated + 'T00:00:00').toLocaleDateString() : 'N/A'}</div></div></div></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;