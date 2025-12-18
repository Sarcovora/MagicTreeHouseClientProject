import React from "react";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const ProjectCard = ({ project }) => {
  const displayName =
    project.ownerDisplayName ||
    project.ownerFirstName ||
    project.landowner ||
    "Untitled Project";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h3 className="font-medium text-lg text-gray-900">{displayName}</h3>

        <div className="flex items-center text-gray-500 text-sm">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{project.address || "No address provided"}</span>
        </div>

        {project.description && (
          <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
        )}

        <div className="pt-2 mt-auto">
          <Link
            to={`/admin/project/${project.id}`}
            className="flex w-full items-center justify-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
