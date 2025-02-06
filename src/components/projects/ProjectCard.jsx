import { TreePine} from 'lucide-react';
import { Sidebar } from '../layouts/SideBar';
import PropTypes from 'prop-types'; // Add this import

// Define ProjectCard with PropTypes
const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <TreePine className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-medium text-xl mb-4">{project.name}</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Landowner:</span>
                <span className="ml-2">{project.landowner}</span>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <span className="ml-2">{project.location}</span>
              </div>
              {project.canopyGrowth && (
                <div>
                  <span className="text-gray-600">Key Metrics:</span>
                  <ul className="mt-2 ml-4 list-disc">
                    <li>Canopy growth: {project.canopyGrowth}</li>
                    <li>Biodiversity: {project.biodiversity}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={(e) => {
            e.stopPropagation();
            // Handle edit action
          }}
        >
          Edit
        </button>
      </div>
      {project.image && (
        <div className="mt-4">
          <span className="text-gray-600">Image Preview:</span>
          <div className="mt-2 h-40 bg-gray-100 rounded-lg">
            <img 
              src={project.image} 
              alt={project.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Add PropTypes validation
ProjectCard.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    landowner: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    canopyGrowth: PropTypes.string,
    biodiversity: PropTypes.string,
    image: PropTypes.string
  }).isRequired
};

// Update Dashboard component with complete project data
const Dashboard = () => {
  const projects = [
    {
      id: 1,
      name: 'ABCD Park',
      landowner: 'John Doe',
      location: 'California',
      canopyGrowth: '15% increase',
      biodiversity: '24 species',
      image: '/path-to-image.jpg'
    },
    {
      id: 2,
      name: 'Forest Revival',
      landowner: 'Jane Smith',
      location: 'Oregon',
      canopyGrowth: '22% increase',
      biodiversity: '31 species',
      image: '/path-to-image.jpg'
    },
    {
      id: 3,
      name: 'Green Future',
      landowner: 'Bob Wilson',
      location: 'Washington',
      canopyGrowth: '18% increase',
      biodiversity: '27 species',
      image: '/path-to-image.jpg'
    }
  ];

  // Rest of the Dashboard component remains the same
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Your Reforestation Projects</h1>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Create New
            </button>
          </div>
          <div className="mt-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
