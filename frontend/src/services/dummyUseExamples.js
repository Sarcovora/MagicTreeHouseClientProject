import React, { useState, useEffect } from 'react';
import {
  getAllSeasons,
  getProjectsBySeason,
  getProjectDetails,
  addSeason,
  addProject
} from './actualApiService'; // Adjust path as needed
//} from './services/actualApiService'; // Adjust path as needed

function MyComponent() {
  const [seasons, setSeasons] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeasons = async () => {
      setLoading(true);
      setError('');
      try {
        const fetchedSeasons = await getAllSeasons();
        setSeasons(fetchedSeasons);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSeasons();
  }, []);

  const handleSeasonClick = async (season) => {
    setLoading(true);
    setError('');
    setProjects([]); // Clear previous projects
    setSelectedProject(null);
    try {
      const fetchedProjects = await getProjectsBySeason(season);
      setProjects(fetchedProjects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectClick = async (recordId) => {
    setLoading(true);
    setError('');
    setSelectedProject(null);
    try {
      const details = await getProjectDetails(recordId);
      if (details) {
        setSelectedProject(details);
        // Now you have details like details.ownerFullName, details.status, details.plantingDate etc.
      } else {
        setError('Project not found.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewSeason = async (newSeasonName) => {
    setLoading(true);
    setError('');
    try {
      const result = await addSeason(newSeasonName);
      console.log(result.message); // Log success
      // Optionally re-fetch seasons
      const updatedSeasons = await getAllSeasons();
      setSeasons(updatedSeasons);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewProject = async () => {
    setLoading(true);
    setError('');
    const newProjectData = { // Gather this data from a form
      season: "24-25", // Example
      ownerLastName: "TestFrontend",
      ownerFirstName: "React",
      address: "123 UI Street",
      city: "Componentville",
      zipCode: "90210",
      propertyId: "PID-UI-001",
      siteNumber: 101, // Make sure siteNumber is included if needed for UniqueID
      status: "Planting Scheduled", // Use a valid status
      // ... other necessary fields
    };
    try {
      const createdProject = await addProject(newProjectData);
      console.log("Project created:", createdProject);
      // Optionally navigate or update project list
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  // Render UI using seasons, projects, selectedProject, error, loading states
  return (
    <div>
      {/* Your UI elements */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <h2>Seasons</h2>
      {seasons.map(s => <button key={s} onClick={() => handleSeasonClick(s)}>{s}</button>)}

      {/* Example button to add a season */}
      <button onClick={() => handleAddNewSeason('26-27')}>Add Season 26-27</button>
      {/* Example button to add a project */}
      <button onClick={handleAddNewProject}>Add Test Project</button>


      <h2>Projects</h2>
      {projects.map(p => (
        <div key={p.id} onClick={() => handleProjectClick(p.id)}>
          <h3>{p.ownerDisplayName || p.uniqueId || p.ownerFullName}</h3> {/* Display some identifier */}
          <p>{p.address}</p>
          {/* Display image if available */}
          {p.initialMapUrl && <img src={p.initialMapUrl} alt="Initial Map" width="100" />}
          {p.plantingPhotoUrls && p.plantingPhotoUrls.length > 0 && (
            <img src={p.plantingPhotoUrls[0]} alt="Planting Photo" width="100" />
          )}
        </div>
      ))}

      {selectedProject && (
        <div>
          <h2>Project Details ({selectedProject.uniqueId})</h2>
          <p>Owner: {selectedProject.ownerFullName}</p>
          <p>Status: {selectedProject.status}</p>
          <p>Planting Date: {selectedProject.plantingDate || 'N/A'}</p>
          <p>Contact: {selectedProject.phone || 'N/A'} / {selectedProject.email || 'N/A'}</p>
          {/* Display more details and images/docs */}
          {selectedProject.finalMapUrl && <img src={selectedProject.finalMapUrl} alt="Final Map" width="200" />}
          {/* etc */}
        </div>
      )}
    </div>
  );
}

export default MyComponent;
