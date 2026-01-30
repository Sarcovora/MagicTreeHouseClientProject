import React from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

const ProjectSelector = ({ 
  projects = [], 
  currentProjectId, 
  onSelectProject 
}) => {
  if (!projects || projects.length <= 1) return null;

  const currentIndex = projects.findIndex(p => p.id === currentProjectId);
  const currentProject = projects[currentIndex];

  const handlePrev = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
    onSelectProject(projects[newIndex].id);
  };

  const handleNext = () => {
    const newIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;
    onSelectProject(projects[newIndex].id);
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 shadow-sm mb-0">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-8">
        <div className="flex items-center justify-between">
            {/* Selector Control - Centered */}
            <div className="flex-1 flex items-center justify-center max-w-2xl mx-auto">
                <button 
                    onClick={handlePrev}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors"
                    aria-label="Previous project"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex-1 px-4 text-center">
                    <div className="text-xs text-green-600 font-bold tracking-wider uppercase mb-1">
                        Project {currentIndex + 1} of {projects.length}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-900 text-lg truncate">
                            {currentProject?.siteName || currentProject?.address || `Project #${currentProject?.siteNumber || currentIndex + 1}`}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={handleNext}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-colors"
                    aria-label="Next project"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
        
        {/* Progress indicators */}
        <div className="flex justify-center space-x-1.5 mt-2">
            {projects.map((_, idx) => (
                <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === currentIndex ? 'w-6 bg-green-500' : 'w-1.5 bg-gray-200'
                    }`}
                />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectSelector;
