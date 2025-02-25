import { TreePine } from "lucide-react";
import PropTypes from "prop-types";

/**
 * ProjectCard component displays a card with project information
 * @param {Object} project - The project data to display
 */
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
              <div>
                <span className="text-gray-600">Address:</span>
                <span className="ml-2">
                  {project.address || "123 Rio Grande St, Austin TX"}
                </span>
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
    address: PropTypes.string,
    canopyGrowth: PropTypes.string,
    biodiversity: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
};

export default ProjectCard;
