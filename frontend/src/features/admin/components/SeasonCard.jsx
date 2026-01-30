// src/features/admin/components/SeasonCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Folder from "../../../assets/icons/folder.svg?react";

/**
 * SeasonCard - Displays a season folder with project count
 * 
 * Includes optional delete action for the season.
 * 
 * @param {object} props
 * @param {object} props.season - Season data object { year, projectCount, id }
 * @param {function} [props.onDelete] - Optional callback to delete the season
 */
const SeasonCard = ({ season, onDelete }) => {
  const linkPath = `/admin/seasons/${season.year}`;

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent the Link navigation
    e.preventDefault(); // Prevent default anchor behavior if any slipped through
    console.log(`Delete button clicked for season: ${season.year} (ID: ${season.id})`);
    // Call the onDelete function passed from the parent (AdminDashboard)
    if (onDelete) {
        onDelete(); // The parent handler will manage confirmation and API call
    } else {
        console.error("onDelete prop not provided to SeasonCard for season:", season.year);
    }
  };

  return (
    // Link wraps the main card structure, but not the delete button interaction area
    <div className="relative group transform transition-transform hover:scale-105    rounded-2xl">
       {/* Delete Button - Positioned absolutely */}
       {/* Show only if onDelete prop is provided */}
       {onDelete && (
         <button
           onClick={handleDeleteClick}
           className="absolute top-2 right-2 z-10 p-1.5 bg-white/70 hover:bg-red-100 text-red-500 hover:text-red-700 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
           title={`Delete season ${season.year}`}
           aria-label={`Delete season ${season.year}`}
         >
           <Trash2 size={16} />
         </button>
       )}

      <Link
         to={linkPath}
         state={{ expectedProjectCount: season.projectCount }}
         className="block focus:outline-none" // block ensures link covers card area
         aria-label={`View projects for season ${season.year}`}
        >
          <div className="bg-gray-100 rounded-2xl shadow-md group-hover:shadow-lg transition-shadow p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-center h-32 mb-4">
              <Folder className="w-32 h-auto text-gray-400" />
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                Season {season.year}
                </h3>
                <p className="text-sm text-gray-500">
                {season.projectCount} {season.projectCount === 1 ? "project" : "projects"}
                </p>
            </div>
          </div>
      </Link>
    </div>
  );
};

export default SeasonCard;
