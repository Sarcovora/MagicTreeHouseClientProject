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
    name: '',
    landowner: '',
    landownerEmail: '',
    landownerPhone: '',
    location: '', // General location/area
    address: '', // Specific address
    description: '',
    startDate: '',
    status: 'Pending', // Default status
    seasonYear: preselectedSeason || '', // Pre-select if available
    image: '', // Text input for image path for now
  });
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSeasons, setIsFetchingSeasons] = useState(true);
  const [error, setError] = useState(null);

  // Fetch seasons for the dropdown
  useEffect(() => {
    setIsFetchingSeasons(true);
    apiService.getSeasons()
      .then(data => {
        setSeasons(data ? data.sort((a, b) => b.year.localeCompare(a.year)) : []); // Sort desc
        // If preselectedSeason exists but isn't in fetched seasons, maybe add it? Or clear selection?
        // For now, we'll just keep the preselection if it came from the URL
        if (preselectedSeason && !data.some(s => s.year === preselectedSeason)) {
            console.warn(`Preselected season ${preselectedSeason} not found in fetched seasons.`);
            // Optionally add it to the list for selection:
            // setSeasons(prev => [...prev, { year: preselectedSeason, id: 'temp', projectCount: 0 }].sort((a, b) => b.year.localeCompare(a.year)));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic validation
    if (!formData.name || !formData.seasonYear || !formData.landowner) {
      setError("Project Name, Season Year, and Landowner Name are required.");
      return;
    }

    setIsLoading(true);

    // Prepare data for API
    const projectData = {
      name: formData.name,
      landowner: formData.landowner,
      contact: { // Nest contact info
        email: formData.landownerEmail,
        phone: formData.landownerPhone,
      },
      location: formData.location,
      address: formData.address,
      description: formData.description,
      startDate: formData.startDate,
      status: formData.status,
      seasonYear: formData.seasonYear,
      image: formData.image || null, // Send null if empty
    };

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

        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
        </div>

        {/* Season Year */}
        <div>
           <label htmlFor="seasonYear" className="block text-sm font-medium text-gray-700 mb-1">Season Year <span className="text-red-500">*</span></label>
           <select id="seasonYear" name="seasonYear" value={formData.seasonYear} onChange={handleInputChange} required disabled={isFetchingSeasons} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100">
             <option value="" disabled>{isFetchingSeasons ? 'Loading seasons...' : 'Select a season'}</option>
             {seasons.map(season => (
               <option key={season.id || season.year} value={season.year}>{season.year}</option>
             ))}
              {/* Add option for preselected season if it wasn't in the fetched list but came from URL */}
              {preselectedSeason && !seasons.some(s => s.year === preselectedSeason) && (
                  <option value={preselectedSeason}>{preselectedSeason} (New)</option>
              )}
           </select>
         </div>


        {/* Landowner Info */}
        <div className="border-t pt-4">
             <h3 className="text-lg font-medium text-gray-800 mb-3">Landowner Information</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="landowner" className="block text-sm font-medium text-gray-700 mb-1">Landowner Name <span className="text-red-500">*</span></label>
                  <input type="text" id="landowner" name="landowner" value={formData.landowner} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                 <div>
                  <label htmlFor="landownerEmail" className="block text-sm font-medium text-gray-700 mb-1">Landowner Email</label>
                  <input type="email" id="landownerEmail" name="landownerEmail" value={formData.landownerEmail} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                 <div>
                  <label htmlFor="landownerPhone" className="block text-sm font-medium text-gray-700 mb-1">Landowner Phone</label>
                  <input type="tel" id="landownerPhone" name="landownerPhone" value={formData.landownerPhone} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
             </div>
        </div>


        {/* Location & Address */}
        <div className="border-t pt-4">
             <h3 className="text-lg font-medium text-gray-800 mb-3">Location Details</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">General Location / Area</label>
                  <input type="text" id="location" name="location" placeholder="e.g., Travis County, Central Texas" value={formData.location} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Specific Address</label>
                  <input type="text" id="address" name="address" placeholder="e.g., 123 Forest Ln, Austin, TX 78701" value={formData.address} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
            </div>
        </div>

         {/* Description */}
         <div className="border-t pt-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Describe the project goals, scope, and any relevant details..." className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"></textarea>
         </div>

         {/* Other Details */}
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500">
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                 <option value="Cancelled">Cancelled</option>
              </select>
            </div>
             <div>
               <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Image Path (Optional)</label>
               <input type="text" id="image" name="image" value={formData.image} onChange={handleInputChange} placeholder="/images/project-images/your-image.jpg" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
               <p className="text-xs text-gray-500 mt-1">Enter the path to an image in the public folder. Actual upload TBD.</p>
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
