// src/components/SeasonCard.jsx
import { Link } from 'react-router-dom'; // Import Link
import Folder from "../assets/icons/folder.svg?react";

const SeasonCard = ({ season }) => {
  // Construct the link path based on the season year
  const linkPath = `/admin/seasons/${season.year}`;

  return (
    // Wrap the entire card content with the Link component
    <Link to={linkPath} className="block transform transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded-2xl">
      <div className="bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 h-full flex flex-col justify-between">
        <div className="flex items-center justify-center h-32 mb-4">
          <Folder className="w-32 h-auto text-gray-400" /> {/* Adjusted size slightly */}
        </div>
        <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800">
            Season {season.year} {/* Added "Season" prefix for clarity */}
            </h3>
            <p className="text-sm text-gray-500">
            {season.projectCount} {season.projectCount === 1 ? "project" : "projects"}
            </p>
        </div>
      </div>
    </Link>
  );
};

export default SeasonCard;