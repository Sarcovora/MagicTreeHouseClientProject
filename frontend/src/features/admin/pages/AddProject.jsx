// src/features/admin/pages/AddProject.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Plus, AlertCircle } from 'lucide-react';
import apiService from '../../../services/apiService';

// Helper hook to parse query parameters
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const AddProject = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const preselectedSeason = query.get('season'); // Get season from URL query param

  const [formData, setFormData] = useState({
    seasonYear: preselectedSeason || '',
    status: 'Pending',
    location: '',
    address: '',

    ownerFirstName: '',
    ownerDisplayName: '',
    contactEmail: '',
    contactPhone: '',
    applicationDate: '',
    consultationDate: '',
    flaggingDate: '',
    plantingDate: '',
    quizScorePreConsultation: '',
    quizScorePostPlanting: '',
    image: '',
  });
  const [beforePhotoUrls, setBeforePhotoUrls] = useState(['']);
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSeasons, setIsFetchingSeasons] = useState(true);
  const [error, setError] = useState(null);

  // Fetch seasons for the dropdown
  useEffect(() => {
    setIsFetchingSeasons(true);
    apiService.getSeasons()
      .then(data => {
        const normalizedSeasons = (data || [])
          .filter(Boolean)
          .map((year) => ({ id: year, year }));

        normalizedSeasons.sort((a, b) => b.year.localeCompare(a.year));
        setSeasons(normalizedSeasons);

        if (preselectedSeason && !normalizedSeasons.some(s => s.year === preselectedSeason)) {
          console.warn(`Preselected season ${preselectedSeason} not found in fetched seasons.`);
        }
      })
      .catch(err => {
        console.error("Failed to fetch seasons:", err);
        setError("Could not load season list. Please try again later.");
        setSeasons([]);
      })
      .finally(() => {
        setIsFetchingSeasons(false);
      });
  }, [preselectedSeason]); // Re-run if preselectedSeason changes (though it shouldn't normally)

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBeforePhotoChange = (index, value) => {
    setBeforePhotoUrls((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddBeforePhoto = () => {
    setBeforePhotoUrls((prev) => [...prev, '']);
  };

  const handleRemoveBeforePhoto = (index) => {
    setBeforePhotoUrls((prev) => {
      if (prev.length === 1) {
        return [''];
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    const trim = (value) => (value || '').trim();
    const hasOwnerName =
      trim(formData.ownerFirstName) !== '' || trim(formData.ownerDisplayName) !== '';

    if (trim(formData.seasonYear) === '' || !hasOwnerName) {
      setError("Season Year and at least one owner name field are required.");
      return;
    }

    const ownerFirstName = trim(formData.ownerFirstName);
    const ownerDisplayName = trim(formData.ownerDisplayName);
    const contactEmail = trim(formData.contactEmail);
    const contactPhone = trim(formData.contactPhone);
    const combinedOwnerName = [ownerFirstName, ownerDisplayName].filter(Boolean).join(' ').trim();
    const primaryContactDisplayName =
      ownerDisplayName || combinedOwnerName || ownerFirstName || 'Not specified';

    const sanitizedBeforePhotos = beforePhotoUrls
      .map((url) => trim(url))
      .filter(Boolean);

    setIsLoading(true);

    // Prepare data for API
    const projectData = {
      season: trim(formData.seasonYear), // Backend expects 'season'
      status: formData.status,
      location: trim(formData.location),
      address: trim(formData.address),

      ownerFirstName: ownerFirstName || null,
      ownerDisplayName: ownerDisplayName || null,
      landowner: primaryContactDisplayName,
      email: contactEmail || null,
      phone: contactPhone || null,
      applicationDate: formData.applicationDate || null,
      consultationDate: formData.consultationDate || null,
      flaggingDate: formData.flaggingDate || null,
      plantingDate: formData.plantingDate || null,
      quizScorePreConsultation: trim(formData.quizScorePreConsultation) || null,
      quizScorePostPlanting: trim(formData.quizScorePostPlanting) || null,
      image: trim(formData.image) || null,
      beforePhotoUrls: sanitizedBeforePhotos,
    };

    if (contactEmail || contactPhone) {
      projectData.contact = {
        email: contactEmail || undefined,
        phone: contactPhone || undefined,
      };
    }

    try {
      console.log("Submitting project data:", projectData);
      await apiService.addProject(projectData);
      console.log("Project added successfully!");
      // Navigate back to the main dashboard after success
      navigate('/admin/dashboard');
      // Consider showing a success toast/message instead of immediate redirect
    } catch (err) {
      console.error("Failed to add project:", err);
      setError(`Failed to add project: ${err.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto"> {/* Centered content */}
      {/* Back Button */}
      <Link
        to={preselectedSeason ? `/admin/seasons/${preselectedSeason}` : "/admin/dashboard"} // Go back to season or dashboard
        className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 w-fit" // w-fit for alignment
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Link>

      <h1 className="text-2xl font-bold mb-6">Add New Reforestation Project</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">

        {/* Season Year */}
        <div>
          <label htmlFor="seasonYear" className="block text-sm font-medium text-gray-700 mb-1">Season Year <span className="text-red-500">*</span></label>
          <select
            id="seasonYear"
            name="seasonYear"
            value={formData.seasonYear}
            onChange={handleInputChange}
            required
            disabled={isFetchingSeasons}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
          >
            <option value="" disabled>{isFetchingSeasons ? 'Loading seasons...' : 'Select a season'}</option>
            {seasons.map(season => (
              <option key={season.id || season.year} value={season.year}>{season.year}</option>
            ))}
            {preselectedSeason && !seasons.some(s => s.year === preselectedSeason) && (
              <option value={preselectedSeason}>{preselectedSeason} (New)</option>
            )}
          </select>
        </div>

        {/* Project Status */}
        <div className="border-t pt-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500"
          >
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Primary Contact */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Primary Contact</h3>
          <p className="text-xs text-gray-500 mb-4">Provide at least one owner name or organization so the detail view can show the contact card.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="ownerFirstName" className="block text-sm font-medium text-gray-700 mb-1">Owner First Name or Organization</label>
              <input
                type="text"
                id="ownerFirstName"
                name="ownerFirstName"
                value={formData.ownerFirstName}
                onChange={handleInputChange}
                placeholder="e.g., Annie or Green Parks Initiative"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="ownerDisplayName" className="block text-sm font-medium text-gray-700 mb-1">Owner Last Name or Site Name</label>
              <input
                type="text"
                id="ownerDisplayName"
                name="ownerDisplayName"
                value={formData.ownerDisplayName}
                onChange={handleInputChange}
                placeholder="e.g., Armstrong or Hill Country Preserve"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                placeholder="annie@example.com"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                placeholder="(512) 555-1234"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">General Location / Area</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="e.g., Travis County, Central Texas"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Specific Address</label>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="e.g., 123 Forest Ln, Austin, TX 78701"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>



        {/* Activity Dates */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Activity Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="applicationDate" className="block text-sm font-medium text-gray-700 mb-1">Application Date</label>
              <input
                type="date"
                id="applicationDate"
                name="applicationDate"
                value={formData.applicationDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="consultationDate" className="block text-sm font-medium text-gray-700 mb-1">Consultation Date</label>
              <input
                type="date"
                id="consultationDate"
                name="consultationDate"
                value={formData.consultationDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="flaggingDate" className="block text-sm font-medium text-gray-700 mb-1">Flagging Date</label>
              <input
                type="date"
                id="flaggingDate"
                name="flaggingDate"
                value={formData.flaggingDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="plantingDate" className="block text-sm font-medium text-gray-700 mb-1">Planting Date</label>
              <input
                type="date"
                id="plantingDate"
                name="plantingDate"
                value={formData.plantingDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Quiz Scores */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Quiz Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quizScorePreConsultation" className="block text-sm font-medium text-gray-700 mb-1">Quiz Score - Pre-consult</label>
              <input
                type="number"
                step="0.01"
                id="quizScorePreConsultation"
                name="quizScorePreConsultation"
                value={formData.quizScorePreConsultation}
                onChange={handleInputChange}
                placeholder="e.g., 81.25"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="quizScorePostPlanting" className="block text-sm font-medium text-gray-700 mb-1">Quiz Score - Post-planting</label>
              <input
                type="number"
                step="0.01"
                id="quizScorePostPlanting"
                name="quizScorePostPlanting"
                value={formData.quizScorePostPlanting}
                onChange={handleInputChange}
                placeholder="e.g., 92.5"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Project Media */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">Project Media</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Primary Image URL</label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="/images/project-images/your-image.jpg"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">If left blank we will display the first before photo (or a fallback image).</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Before Photo URLs</label>
              <p className="text-xs text-gray-500 mt-1">Provide one URL per image; these feed the carousel on the project detail page.</p>
              <div className="mt-3 space-y-3">
                {beforePhotoUrls.map((url, index) => (
                  <div key={index} className="flex flex-col gap-2 md:flex-row md:items-center">
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => handleBeforePhotoChange(index, e.target.value)}
                      placeholder="https://example.com/before-photo.jpg"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                    />
                    <div className="flex gap-2">
                      {beforePhotoUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBeforePhoto(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      )}
                      {index === beforePhotoUrls.length - 1 && (
                        <button
                          type="button"
                          onClick={handleAddBeforePhoto}
                          className="px-3 py-2 text-sm text-green-600 hover:text-green-700"
                        >
                          Add another
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
            <div className="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
            </div>
        )}

        {/* Submit Button */}
        <div className="border-t pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || isFetchingSeasons}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Adding Project...
                </>
            ) : (
                <>
                    <Plus className="w-5 h-5 mr-2" /> Add Project
                </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddProject;
