// src/pages/admin/ProjectDetail.jsx
import { useState, useEffect } from "react"; // Import hooks
import { useNavigate, useParams } from "react-router-dom";
import {
  // TreePine, // Icon not used directly?
  User,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Edit,
  Trash2,
  AlertCircle // For error display
} from "lucide-react";
import apiService from "../../services/apiService"; // Import API service

/**
 * ProjectDetail component displays detailed information about a specific project
 */
const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get project ID from URL
  const [project, setProject] = useState(null); // State for project data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch project details when component mounts or ID changes
  useEffect(() => {
    const fetchProject = async () => {
      if (!id) {
          setError("Project ID is missing.");
          setLoading(false);
          return;
      };
      setLoading(true);
      setError(null);
      try {
        const data = await apiService.getProjectDetails(id);
        if (data) {
          setProject(data);
        } else {
          setError(`Project with ID ${id} not found.`);
        }
      } catch (err) {
        console.error("Failed to fetch project details:", err);
        setError("Could not load project details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]); // Re-run effect if ID changes

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
       <div className="max-w-7xl mx-auto px-8 py-6 text-center">
           <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
           <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Project</h2>
            <p className="text-gray-600">{error}</p>
            <button
                onClick={() => navigate('/admin/dashboard')} // Navigate back to dashboard
                className="mt-6 flex items-center justify-center mx-auto px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </button>
       </div>
    );
  }

  if (!project) {
    // This case might be covered by error handling, but good as a fallback
    return <div className="text-center p-8">Project data is not available.</div>;
  }

  // Main component return once data is loaded successfully
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-8 py-3"> {/* Adjusted padding */}
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)} // Go back to the previous page
            className="flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <div className="flex space-x-2">
            {/* Edit and Delete buttons - Functionality TBD */}
            <button className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* Project Image */}
         {project.image ? (
          <div className="mb-8 rounded-lg overflow-hidden shadow-sm aspect-video max-h-[500px]"> {/* Added aspect ratio & max height */}
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-full object-cover" // Ensure image covers the area
            />
          </div>
        ) : (
            <div className="mb-8 rounded-lg shadow-sm aspect-video max-h-[400px] bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No project image available</p>
            </div>
        )}


        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2 flex-shrink-0" /> {/* Added flex-shrink-0 */}
              {/* Display specific address if available, fallback to general location */}
              <span>{project.address || project.location || "No location specified"}</span>
            </div>
          </div>
          {/* Potential placeholder for actions or badges */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Project Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Project Description
              </h2>
              <p className="text-gray-600 whitespace-pre-wrap">{project.description || "No description provided."}</p> {/* Added whitespace-pre-wrap */}
            </div>

            {/* Key Metrics */}
            {project.metrics && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Responsive grid */}
                  {Object.entries(project.metrics).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1 capitalize"> {/* Capitalize key */}
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                      <div className="text-xl font-semibold">{value ?? 'N/A'}</div> {/* Handle null/undefined */}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Landowner Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Landowner Information
              </h2>
              <div className="space-y-3"> {/* Adjusted spacing */}
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                  <span>{project.landowner || 'N/A'}</span>
                </div>
                {project.contact && (
                    <>
                     <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                        {project.contact.phone ? (
                            <a href={`tel:${project.contact.phone}`} className="hover:text-green-600">{project.contact.phone}</a>
                        ) : (
                            <span>N/A</span>
                        )}
                        </div>
                        <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                         {project.contact.email ? (
                            <a href={`mailto:${project.contact.email}`} className="hover:text-green-600 break-all">{project.contact.email}</a>
                         ) : (
                            <span>N/A</span>
                         )}
                        </div>
                    </>
                )}
              </div>
            </div>

            {/* Project Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Project Status</h2>
              <div className="space-y-3"> {/* Adjusted spacing */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className={`font-semibold ${project.status === 'Active' ? 'text-green-600' : project.status === 'Completed' ? 'text-blue-600' : 'text-gray-700'}`}>
                    {project.status || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Start Date</div>
                  <div className="font-semibold">{project.startDate ? new Date(project.startDate + 'T00:00:00').toLocaleDateString() : 'N/A'}</div> {/* Format date */}
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                  <div className="font-semibold">{project.lastUpdated ? new Date(project.lastUpdated + 'T00:00:00').toLocaleDateString() : 'N/A'}</div> {/* Format date */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;