import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';

const ProjectCard = ({ project }) => {

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      {/* Image at the top */}
      {project.imageUrl ? (
        <div className="relative h-48 w-full">
          <img 
            src={project.imageUrl} 
            alt={project.name} 
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="bg-gray-200 h-48 flex items-center justify-center">
          <p className="text-gray-500">No image available</p>
        </div>
      )}
      
      {/* Content below the image */}
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2">{project.name}</h3>
        
        {/* Address */}
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{project.address || "No address provided"}</span>
        </div>
        
        {/* Date */}
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <Calendar className="w-4 h-4 mr-1" />
          <span>{project.date || "No date specified"}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
        
        <Link 
          to={`/project/${project.id}`}
          className="inline-block px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;