// src/components/modals/AddSeasonForm.jsx
import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

const AddSeasonForm = ({ onSubmit, onCancel, existingSeasons = [], isLoading }) => {
  const [seasonYear, setSeasonYear] = useState('');
  const [error, setError] = useState('');

  const validateYearFormat = (year) => {
    // Basic format check: YY-YY or YYYY
    // Allow simple year for flexibility now, API should standardize later if needed
    // return /^\d{2}-\d{2}$/.test(year) || /^\d{4}$/.test(year);
    return /^\d{4}$/.test(year); // Enforce 4-digit year for now
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    const trimmedYear = seasonYear.trim();

    if (!trimmedYear) {
      setError('Season year cannot be empty.');
      return;
    }

    if (!validateYearFormat(trimmedYear)) {
        //setError('Invalid format. Please use YYYY (e.g., 2025).');
        // Let's allow any non-empty string for now and let the backend/API handle format standardization if needed,
        // or adjust validation here based on strict requirements.
        // For now, just check if it exists.
    }

    // Check if season already exists
    if (existingSeasons.some(season => season.year === trimmedYear)) {
      setError(`Season '${trimmedYear}' already exists.`);
      return;
    }

    // Pass the validated year up to the parent component
    onSubmit(trimmedYear);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="seasonYear" className="block text-sm font-medium text-gray-700 mb-1">
          Season Year <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="seasonYear"
          value={seasonYear}
          onChange={(e) => setSeasonYear(e.target.value)}
          placeholder="Enter year (e.g., 2025)"
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          required
          disabled={isLoading} // Disable input while submitting
        />
         <p className="text-xs text-gray-500 mt-1">Enter the primary year for the season (e.g., 2025 for the 2025-2026 season).</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading} // Disable button while submitting
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Adding...
            </>
          ) : (
            'Add Season'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddSeasonForm;