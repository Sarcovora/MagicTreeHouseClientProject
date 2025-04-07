import { useNavigate, useParams } from "react-router-dom";
import {
  TreePine,
  User,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react";
import projectsData from "../data/projectsData";

/**
 * ProjectDetail component displays detailed information about a specific project
 */
const ProjectDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Find the project with the matching id
  const project =
    projectsData.find((p) => p.id === parseInt(id)) || projectsData[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-500 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
              <Edit className="w-5 h-5 mr-2" />
              Edit Project
            </button>
            <button className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-5 h-5 mr-2" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Project Image - Moved to the top */}
        {project.image && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-sm">
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Project Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{project.location || "No location specified"}</span>
            </div>
          </div>
          
          {/* Rest of your project content */}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Project Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Project Description
              </h2>
              <p className="text-gray-600">{project.description}</p>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(project.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 mb-1">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="text-xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Landowner Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                Landowner Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{project.landowner}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{project.contact.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span>{project.contact.email}</span>
                </div>
              </div>
            </div>

            {/* Project Status */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Project Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-gray-600 mb-1">Status</div>
                  <div className="font-semibold">{project.status}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Start Date</div>
                  <div className="font-semibold">{project.startDate}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Last Updated</div>
                  <div className="font-semibold">{project.lastUpdated}</div>
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
