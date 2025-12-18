// src/features/admin/pages/EditProject.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import apiService from '../../../services/apiService';

const EditProject = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  // ... (useState, useEffect, handleInputChange, handleMetricsChange remain the same) ...
  const [formData, setFormData] = useState({
    name: '',
    landowner: '',
    landownerEmail: '',
    landownerPhone: '',
    location: '', // General location/area
    address: '', // Specific address
    description: '',
    status: '', // Default status
    seasonYear: '', // Pre-select if available
    image: '', // Text input for image path for now
    // Add metrics state
    metrics: {
      canopyGrowth: '',
      biodiversity: '',
      carbonOffset: '',
      treesSurvival: '',
    },
  });
  const [seasons, setSeasons] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading for form submission
  const [isFetchingData, setIsFetchingData] = useState(true); // Loading for initial data fetch
  const [error, setError] = useState(null);
  const [originalProjectName, setOriginalProjectName] = useState(''); // To display in title

  // Fetch project details and seasons
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        setError("Project ID is missing.");
        setIsFetchingData(false);
        return;
      }
      setIsFetchingData(true);
      setError(null);
      try {
        const [projectData, seasonsData] = await Promise.all([
          apiService.getProjectDetails(projectId),
          apiService.getSeasons()
        ]);

        if (projectData) {
          setOriginalProjectName(projectData.name);
          setFormData({
            name: projectData.name || '',
            landowner: projectData.landowner || '',
            landownerEmail: projectData.contact?.email || '',
            landownerPhone: projectData.contact?.phone || '',
            location: projectData.location || '',
            address: projectData.address || '',
            description: projectData.description || '',
            status: projectData.status || 'Pending',
            seasonYear: projectData.seasonYear || '',
            image: projectData.image || '',
            metrics: {
              canopyGrowth: projectData.metrics?.canopyGrowth || '',
              biodiversity: projectData.metrics?.biodiversity || '',
              carbonOffset: projectData.metrics?.carbonOffset || '',
              treesSurvival: projectData.metrics?.treesSurvival || '',
            },
          });
        } else {
          setError(`Project with ID ${projectId} not found.`);
        }

        const normalizedSeasons = (seasonsData || [])
          .filter(Boolean)
          .map((year) => ({ id: year, year }))
          .sort((a, b) => b.year.localeCompare(a.year));
        setSeasons(normalizedSeasons);
      } catch (err) {
        console.error("Failed to fetch project or season data:", err);
        setError(err?.message || "Could not load project data. Please try again later.");
      } finally {
        setIsFetchingData(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMetricsChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        metrics: {
            ...prev.metrics,
            [name]: value,
        }
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.seasonYear || !formData.landowner) {
      setError("Project Name, Season Year, and Landowner Name are required.");
      return;
    }

    setIsLoading(true);

    const projectDataToUpdate = {
      name: formData.name,
      landowner: formData.landowner,
      contact: {
        email: formData.landownerEmail,
        phone: formData.landownerPhone,
      },
      location: formData.location,
      address: formData.address,
      description: formData.description,
      status: formData.status,
      seasonYear: formData.seasonYear,
      image: formData.image || null,
      metrics: formData.metrics,
    };

    try {
      console.log("Updating project data:", projectDataToUpdate);
      await apiService.updateProject(projectId, projectDataToUpdate);
      console.log("Project updated successfully!");

      // --- CHANGE NAVIGATION HERE ---
      // Use replace: true to remove the edit page from history
      navigate(`/admin/project/${projectId}`, { replace: true });
      // --- END CHANGE ---

    } catch (err) {
      console.error("Failed to update project:", err);
      setError(`Failed to update project: ${err.message || 'Please try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---
  // ... (loading, error, and form JSX remain the same) ...
  if (isFetchingData) {
     return (
        <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
           <p className="ml-4 text-gray-600">Loading project data...</p>
        </div>
     );
  }

   if (error && !formData.name) {
     return (
       <div className="p-8 max-w-4xl mx-auto text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Project</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
             to="/admin/dashboard"
             className="flex items-center justify-center mx-auto px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg w-fit"
          >
             <ArrowLeft className="w-4 h-4 mr-2" />
             Back to Dashboard
          </Link>
       </div>
     );
  }


  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Back Button to Project Detail */}
      <Link
        to={`/admin/project/${projectId}`}
        className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-6 w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Project Details
      </Link>

      <h1 className="text-2xl font-bold mb-1">Edit Project</h1>
       <p className="text-gray-500 mb-6 text-lg">{originalProjectName || `ID: ${projectId}`}</p>


      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">

        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
        </div>

        {/* Season Year */}
        <div>
           <label htmlFor="seasonYear" className="block text-sm font-medium text-gray-700 mb-1">Season Year <span className="text-red-500">*</span></label>
           <select id="seasonYear" name="seasonYear" value={formData.seasonYear} onChange={handleInputChange} required disabled={isFetchingData} className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100">
             <option value="" disabled>{isFetchingData ? 'Loading seasons...' : 'Select a season'}</option>
             {seasons.map(season => (
               <option key={season.id || season.year} value={season.year}>{season.year}</option>
             ))}
              {formData.seasonYear && !seasons.some(s => s.year === formData.seasonYear) && (
                  <option value={formData.seasonYear}>{formData.seasonYear}</option>
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

         {/* Other Details (Status, Image) */}
          <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
               <p className="text-xs text-gray-500 mt-1">Enter the path to an image in the public folder.</p>
             </div>
         </div>

        {/* --- Key Metrics --- */}
        <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Key Metrics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="canopyGrowth" className="block text-sm font-medium text-gray-700 mb-1">Canopy Growth</label>
                    <input type="text" id="canopyGrowth" name="canopyGrowth" value={formData.metrics.canopyGrowth} onChange={handleMetricsChange} placeholder="e.g., 15% increase" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                 <div>
                    <label htmlFor="biodiversity" className="block text-sm font-medium text-gray-700 mb-1">Biodiversity</label>
                    <input type="text" id="biodiversity" name="biodiversity" value={formData.metrics.biodiversity} onChange={handleMetricsChange} placeholder="e.g., 24 species" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                 <div>
                    <label htmlFor="carbonOffset" className="block text-sm font-medium text-gray-700 mb-1">Carbon Offset</label>
                    <input type="text" id="carbonOffset" name="carbonOffset" value={formData.metrics.carbonOffset} onChange={handleMetricsChange} placeholder="e.g., 150 tons" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
                 <div>
                    <label htmlFor="treesSurvival" className="block text-sm font-medium text-gray-700 mb-1">Tree Survival Rate</label>
                    <input type="text" id="treesSurvival" name="treesSurvival" value={formData.metrics.treesSurvival} onChange={handleMetricsChange} placeholder="e.g., 92%" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" />
                </div>
            </div>
        </div>
        {/* --- End Key Metrics --- */}

        {/* Error Display for submission errors */}
        {error && !isFetchingData && ( // Show submit error only if not fetching initial data
            <div className="my-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                {error}
            </div>
        )}

        {/* Submit Button */}
        <div className="border-t pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading || isFetchingData}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving Changes...
                </>
            ) : (
                <>
                    <Save className="w-5 h-5 mr-2" /> Save Changes
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
