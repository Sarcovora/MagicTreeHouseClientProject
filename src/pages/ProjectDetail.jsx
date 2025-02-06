import { useNavigate } from 'react-router-dom';
import { TreePine, User, MapPin, Phone, Mail, ArrowLeft, Edit, Trash2 } from 'lucide-react';

const ProjectDetail = () => {
  const navigate = useNavigate();

  // Mock data - in a real app, you'd fetch this based on the id
  const project = {
    id: 1,
    name: 'ABCD Park',
    landowner: 'John Doe',
    location: 'California',
    contact: {
      phone: '+1 234 567 8900',
      email: 'john@example.com'
    },
    metrics: {
      canopyGrowth: '15% increase',
      biodiversity: '24 species',
      carbonOffset: '150 tons',
      treesSurvival: '92%'
    },
    imageUrl: '../public/images/project-images/abcd.jpg',
    description: 'A comprehensive reforestation project aimed at restoring native woodland...',
    status: 'Active',
    startDate: '2023-01-15',
    lastUpdated: '2024-01-20'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Projects
          </button>
          <div className="flex space-x-4">
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="col-span-2 space-y-8">
            {/* Project Header */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start space-x-4">
                <TreePine className="w-12 h-12 text-green-600" />
                <div>
                  <h1 className="text-2xl font-semibold mb-2">{project.name}</h1>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {project.location}
                  </div>
                </div>
              </div>
            </div>

            {/* Project Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Project Description</h2>
              <p className="text-gray-600">{project.description}</p>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(project.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-gray-600 mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-xl font-semibold">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Image */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Project Image</h2>
              <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                {/* Replace with actual image */}
                <div className="w-full h-full bg-gray-200"></div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Landowner Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Landowner Information</h2>
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
