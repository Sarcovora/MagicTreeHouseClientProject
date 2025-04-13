// /Users/sahils/Desktop/clientProject/clientProject/frontend/src/components/seasons/SeasonCard.jsx
import Folder from "../assets/icons/folder.svg?react";

const SeasonCard = ({ season }) => {
  return (
    <div className="cursor-pointer transform transition-transform hover:scale-105">
      <div className="bg-gray-100 rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6">
        <div className="flex items-center justify-center h-32 mb-4">
          <Folder className="w-40 h-40 text-gray-400" />
        </div>
        <h3 className="text-center text-lg font-semibold text-gray-800">
          {season.year}
        </h3>
        <p className="text-center text-sm text-gray-500">
          {season.projectCount} {season.projectCount === 1 ? "project" : "projects"}
        </p>
      </div>
    </div>
  );
};

export default SeasonCard;