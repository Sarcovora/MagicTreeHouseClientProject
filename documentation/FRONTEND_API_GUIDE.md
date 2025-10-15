# Frontend API Guide - Magic Tree House

This guide shows you how to use the **super simple** API service layer for the Magic Tree House project. No complexity, just import and use!

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [API Service (Vanilla JS)](#api-service-vanilla-js)
3. [React Hooks](#react-hooks)
4. [Complete Examples](#complete-examples)
5. [Error Handling](#error-handling)
6. [Caching](#caching)
7. [TypeScript Support](#typescript-support)

---

## Quick Start

### Installation
No installation needed! The files are already in your project:
- `src/services/magicTreeHouseAPI.js` - Main API service
- `src/hooks/useMagicTreeHouse.js` - React hooks

### Basic Usage (React)

```javascript
import { useSeasons, useProjects } from './hooks/useMagicTreeHouse';

function MyComponent() {
  const { seasons, loading } = useSeasons();
  const { projects } = useProjects('24-25');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Seasons: {seasons.join(', ')}</h2>
      <h2>Projects: {projects.length}</h2>
    </div>
  );
}
```

**That's it!** Loading states, error handling, and caching are all automatic.

---

## API Service (Vanilla JS)

Use this if you're not using React hooks, or need more control.

### Import

```javascript
import api from './services/magicTreeHouseAPI';

// Or import specific modules
import { seasons, projects, utils } from './services/magicTreeHouseAPI';
```

### Get All Seasons

```javascript
// Get all available seasons
const seasons = await api.seasons.getAll();
console.log(seasons); // ["25-26", "24-25", "23-24", ...]

// Skip cache to get fresh data
const freshSeasons = await api.seasons.getAll({ skipCache: true });
```

**Returns**: `string[]` - Array of season identifiers

### Add a New Season

```javascript
// Add a new season
const result = await api.seasons.add('26-27');
console.log(result.message); // "Season option '26-27' potentially added..."
```

**Parameters**:
- `seasonName` (string, required) - Season identifier (e.g., "26-27")

**Returns**: `{ message: string }` - Success message

### Get Projects by Season

```javascript
// Get all projects for a season
const projects = await api.projects.getBySeason('24-25');

projects.forEach(project => {
  console.log(project.ownerFullName);  // "Gilda Galinsky"
  console.log(project.address);        // "101 West End Road"
  console.log(project.status);         // "Planting complete"
  console.log(project.city);           // "Bastrop"
  console.log(project.phone);          // "(915) 555-6789"
});

// Skip cache
const freshProjects = await api.projects.getBySeason('24-25', { skipCache: true });
```

**Parameters**:
- `season` (string, required) - Season identifier

**Returns**: `Project[]` - Array of project objects (see [Data Structure](#project-data-structure))

### Get Project by ID

```javascript
// Get detailed info for a specific project
const project = await api.projects.getById('rec1dp7COcr1qPsmj');

if (project) {
  console.log(project.ownerFullName);    // "Gilda Galinsky"
  console.log(project.totalTrees);       // 0
  console.log(project.plantingDate);     // "2024-12-11"
  console.log(project.initialMapUrl);    // URL to map file
  console.log(project.plantingPhotoUrls); // Array of photo URLs
  console.log(project.propertyImageUrls); // Array of property image URLs
} else {
  console.log('Project not found');
}
```

**Parameters**:
- `recordId` (string, required) - Airtable record ID (starts with "rec")

**Returns**: `Project | null` - Project object or null if not found

### Create a New Project

```javascript
// Create a new project
const newProject = await api.projects.create({
  // Required fields
  season: '24-25',
  ownerLastName: 'Doe',
  address: '123 Main Street',
  propertyId: 'PID12345',
  siteNumber: 1,

  // Optional fields
  ownerFirstName: 'John',
  city: 'Austin',
  zipCode: '78701',
  county: 'Travis',
  phone: '(512) 555-1234',
  email: 'john@example.com',
  status: 'Initial Contact (call/email)',
  landRegion: 'Piney',
  participationStatus: 'Participant',
  contactDate: '2024-01-15',
  consultationDate: '2024-02-20',
  applicationDate: '2024-03-01',
});

console.log('Created project:', newProject.id);
console.log('Unique ID:', newProject.uniqueId); // "Doe PID12345 Site 1"
```

**Parameters**: Object with project data (see [Required Fields](#required-fields))

**Returns**: `Project` - The newly created project

### Utility Functions

```javascript
// Clear all caches
api.utils.clearAllCaches();

// Check backend health
const isOnline = await api.utils.healthCheck();
console.log(isOnline ? 'Backend is online' : 'Backend is offline');

// Get cache state (for debugging)
const cacheState = api.utils.getCacheState();
console.log(cacheState);
```

---

## React Hooks

React hooks make everything even easier! They handle loading, errors, and re-rendering automatically.

### useSeasons()

Get all available seasons.

```javascript
import { useSeasons } from './hooks/useMagicTreeHouse';

function SeasonSelector() {
  const { seasons, loading, error, refresh } = useSeasons();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <select>
        {seasons.map(season => (
          <option key={season} value={season}>{season}</option>
        ))}
      </select>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

**Returns**:
- `seasons` - Array of season strings
- `loading` - Boolean indicating if data is loading
- `error` - Error message string (or null)
- `refresh` - Function to reload data

### useProjects(season)

Get all projects for a specific season.

```javascript
import { useProjects } from './hooks/useMagicTreeHouse';

function ProjectsList({ season }) {
  const { projects, loading, error, refresh } = useProjects(season);

  if (loading) return <div>Loading projects...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            {project.ownerFullName} - {project.address} - {project.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Parameters**:
- `season` (string, required) - Season identifier
- `options` (object, optional):
  - `skipCache` (boolean) - Skip cache, default: false
  - `enabled` (boolean) - Enable auto-fetching, default: true

**Returns**:
- `projects` - Array of project objects
- `loading` - Boolean
- `error` - Error message string (or null)
- `refresh` - Function to reload data

### useProject(recordId)

Get a specific project by ID.

```javascript
import { useProject } from './hooks/useMagicTreeHouse';

function ProjectDetails({ recordId }) {
  const { project, loading, error, refresh } = useProject(recordId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <h1>{project.ownerFullName}</h1>
      <p><strong>Address:</strong> {project.address}</p>
      <p><strong>City:</strong> {project.city}, {project.county} County</p>
      <p><strong>Status:</strong> {project.status}</p>
      <p><strong>Phone:</strong> {project.phone}</p>
      <p><strong>Email:</strong> {project.email}</p>

      {project.plantingDate && (
        <p><strong>Planted:</strong> {new Date(project.plantingDate).toLocaleDateString()}</p>
      )}

      {project.initialMapUrl && (
        <a href={project.initialMapUrl} target="_blank">View Initial Map</a>
      )}

      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

**Parameters**:
- `recordId` (string, required) - Airtable record ID
- `options` (object, optional):
  - `skipCache` (boolean) - Skip cache, default: false
  - `enabled` (boolean) - Enable auto-fetching, default: true

**Returns**:
- `project` - Project object (or null if not found)
- `loading` - Boolean
- `error` - Error message string (or null)
- `refresh` - Function to reload data

### useCreateProject()

Create a new project.

```javascript
import { useCreateProject } from './hooks/useMagicTreeHouse';
import { useState } from 'react';

function CreateProjectForm() {
  const { createProject, loading, error, success, createdProject } = useCreateProject();

  const [formData, setFormData] = useState({
    season: '24-25',
    ownerFirstName: '',
    ownerLastName: '',
    address: '',
    city: '',
    zipCode: '',
    propertyId: '',
    siteNumber: 1,
    phone: '',
    email: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createProject(formData);

    if (result) {
      console.log('Created project:', result.id);
      // Optionally redirect or reset form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.ownerFirstName}
        onChange={e => setFormData({...formData, ownerFirstName: e.target.value})}
        placeholder="First Name"
      />
      <input
        value={formData.ownerLastName}
        onChange={e => setFormData({...formData, ownerLastName: e.target.value})}
        placeholder="Last Name *"
        required
      />
      <input
        value={formData.address}
        onChange={e => setFormData({...formData, address: e.target.value})}
        placeholder="Address *"
        required
      />
      {/* More fields... */}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Project'}
      </button>

      {success && <div className="success">Project created: {createdProject.id}</div>}
      {error && <div className="error">Error: {error}</div>}
    </form>
  );
}
```

**Returns**:
- `createProject` - Function to create a project (takes project data object)
- `loading` - Boolean
- `error` - Error message string (or null)
- `success` - Boolean indicating success
- `createdProject` - The created project object (or null)

### useAddSeason()

Add a new season.

```javascript
import { useAddSeason } from './hooks/useMagicTreeHouse';
import { useState } from 'react';

function AddSeasonForm() {
  const { addSeason, loading, error, success } = useAddSeason();
  const [seasonName, setSeasonName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addSeason(seasonName);
    if (result) {
      setSeasonName(''); // Clear form
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={seasonName}
        onChange={e => setSeasonName(e.target.value)}
        placeholder="e.g., 26-27"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Season'}
      </button>

      {success && <div className="success">Season added successfully!</div>}
      {error && <div className="error">Error: {error}</div>}
    </form>
  );
}
```

**Returns**:
- `addSeason` - Function to add a season (takes season name string)
- `loading` - Boolean
- `error` - Error message string (or null)
- `success` - Boolean indicating success

### useSeasonsAndProjects()

Combined hook for season selector + project list (most common use case!).

```javascript
import { useSeasonsAndProjects } from './hooks/useMagicTreeHouse';

function ProjectsPage() {
  const {
    seasons,
    selectedSeason,
    setSelectedSeason,
    projects,
    refreshProjects,
    loading,
    error
  } = useSeasonsAndProjects('24-25'); // Optional initial season

  return (
    <div>
      <h1>Projects</h1>

      {/* Season Selector */}
      <select value={selectedSeason || ''} onChange={e => setSelectedSeason(e.target.value)}>
        <option value="">Select a season</option>
        {seasons.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <button onClick={refreshProjects}>Refresh Projects</button>

      {/* Loading & Error States */}
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}

      {/* Projects List */}
      <ul>
        {projects.map(p => (
          <li key={p.id}>
            <strong>{p.ownerFullName}</strong>
            <br />
            {p.address}, {p.city}
            <br />
            Status: {p.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Parameters**:
- `initialSeason` (string, optional) - Season to load initially

**Returns**:
- `seasons` - Array of all seasons
- `selectedSeason` - Currently selected season
- `setSelectedSeason` - Function to change selected season
- `projects` - Projects for selected season
- `refreshProjects` - Function to reload projects
- `loading` - Combined loading state
- `error` - Combined error state

### useBackendHealth()

Check if the backend is online.

```javascript
import { useBackendHealth } from './hooks/useMagicTreeHouse';

function StatusIndicator() {
  const { isHealthy, loading, checkHealth } = useBackendHealth();

  return (
    <div>
      {loading && <span>Checking...</span>}
      {!loading && (
        <span style={{ color: isHealthy ? 'green' : 'red' }}>
          {isHealthy ? '● Backend Online' : '● Backend Offline'}
        </span>
      )}
      <button onClick={checkHealth}>Recheck</button>
    </div>
  );
}
```

**Returns**:
- `isHealthy` - Boolean (true if backend is reachable)
- `loading` - Boolean
- `checkHealth` - Function to re-check health

---

## Complete Examples

### Example 1: Season Selector with Projects Table

```javascript
import { useSeasonsAndProjects } from './hooks/useMagicTreeHouse';

function ProjectsTable() {
  const {
    seasons,
    selectedSeason,
    setSelectedSeason,
    projects,
    loading,
    error
  } = useSeasonsAndProjects();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Tree Planting Projects</h1>

      <select value={selectedSeason || ''} onChange={e => setSelectedSeason(e.target.value)}>
        {seasons.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <table>
        <thead>
          <tr>
            <th>Owner</th>
            <th>Address</th>
            <th>City</th>
            <th>Status</th>
            <th>Trees</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id}>
              <td>{p.ownerFullName}</td>
              <td>{p.address}</td>
              <td>{p.city}</td>
              <td>{p.status}</td>
              <td>{p.totalTrees || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Example 2: Project Detail Page with Edit

```javascript
import { useProject } from './hooks/useMagicTreeHouse';
import { useParams } from 'react-router-dom';

function ProjectDetailPage() {
  const { recordId } = useParams();
  const { project, loading, error, refresh } = useProject(recordId);

  if (loading) return <div>Loading project...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="project-detail">
      <h1>{project.ownerFullName}</h1>

      <section>
        <h2>Property Information</h2>
        <p><strong>Address:</strong> {project.address}</p>
        <p><strong>City:</strong> {project.city}, {project.zipCode}</p>
        <p><strong>County:</strong> {project.county}</p>
        <p><strong>Property ID:</strong> {project.propertyId}</p>
        <p><strong>Site Number:</strong> {project.siteNumber}</p>
      </section>

      <section>
        <h2>Contact Information</h2>
        <p><strong>Phone:</strong> <a href={`tel:${project.phone}`}>{project.phone}</a></p>
        <p><strong>Email:</strong> <a href={`mailto:${project.email}`}>{project.email}</a></p>
      </section>

      <section>
        <h2>Project Status</h2>
        <p><strong>Current Status:</strong> {project.status}</p>
        <p><strong>Season:</strong> {project.season}</p>
        <p><strong>Land Region:</strong> {project.landRegion}</p>
      </section>

      <section>
        <h2>Important Dates</h2>
        {project.contactDate && <p><strong>Contact:</strong> {new Date(project.contactDate).toLocaleDateString()}</p>}
        {project.consultationDate && <p><strong>Consultation:</strong> {new Date(project.consultationDate).toLocaleDateString()}</p>}
        {project.applicationDate && <p><strong>Application:</strong> {new Date(project.applicationDate).toLocaleDateString()}</p>}
        {project.flaggingDate && <p><strong>Flagging:</strong> {new Date(project.flaggingDate).toLocaleDateString()}</p>}
        {project.plantingDate && <p><strong>Planting:</strong> {new Date(project.plantingDate).toLocaleDateString()}</p>}
      </section>

      <section>
        <h2>Maps & Photos</h2>
        {project.initialMapUrl && <div><a href={project.initialMapUrl} target="_blank">Initial Map</a></div>}
        {project.draftMapUrl && <div><a href={project.draftMapUrl} target="_blank">Draft Map</a></div>}
        {project.finalMapUrl && <div><a href={project.finalMapUrl} target="_blank">Final Map</a></div>}

        {project.plantingPhotoUrls && project.plantingPhotoUrls.length > 0 && (
          <div>
            <h3>Planting Photos</h3>
            {project.plantingPhotoUrls.map((url, i) => (
              <img key={i} src={url} alt={`Planting photo ${i + 1}`} style={{width: 200, margin: 10}} />
            ))}
          </div>
        )}

        {project.propertyImageUrls && project.propertyImageUrls.length > 0 && (
          <div>
            <h3>Property Images</h3>
            {project.propertyImageUrls.map((url, i) => (
              <img key={i} src={url} alt={`Property image ${i + 1}`} style={{width: 200, margin: 10}} />
            ))}
          </div>
        )}
      </section>

      <button onClick={refresh}>Refresh Data</button>
    </div>
  );
}
```

### Example 3: Create Project with Validation

```javascript
import { useCreateProject } from './hooks/useMagicTreeHouse';
import { useSeasons } from './hooks/useMagicTreeHouse';
import { useState } from 'react';

function CreateProjectPage() {
  const { seasons } = useSeasons();
  const { createProject, loading, error, success, createdProject } = useCreateProject();

  const [formData, setFormData] = useState({
    season: '',
    ownerFirstName: '',
    ownerLastName: '',
    address: '',
    city: '',
    zipCode: '',
    county: '',
    propertyId: '',
    siteNumber: 1,
    phone: '',
    email: '',
    status: '',
    landRegion: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.season) {
      alert('Please select a season');
      return;
    }

    const result = await createProject(formData);

    if (result) {
      alert(`Project created successfully! ID: ${result.id}`);
      // Reset form or redirect
      window.location.href = `/projects/${result.id}`;
    }
  };

  return (
    <div>
      <h1>Create New Project</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Season *</label>
          <select
            value={formData.season}
            onChange={e => handleChange('season', e.target.value)}
            required
          >
            <option value="">Select season</option>
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label>First Name</label>
          <input
            value={formData.ownerFirstName}
            onChange={e => handleChange('ownerFirstName', e.target.value)}
          />
        </div>

        <div>
          <label>Last Name *</label>
          <input
            value={formData.ownerLastName}
            onChange={e => handleChange('ownerLastName', e.target.value)}
            required
          />
        </div>

        <div>
          <label>Property Address *</label>
          <input
            value={formData.address}
            onChange={e => handleChange('address', e.target.value)}
            required
          />
        </div>

        <div>
          <label>City</label>
          <input
            value={formData.city}
            onChange={e => handleChange('city', e.target.value)}
          />
        </div>

        <div>
          <label>ZIP Code</label>
          <input
            value={formData.zipCode}
            onChange={e => handleChange('zipCode', e.target.value)}
          />
        </div>

        <div>
          <label>County</label>
          <input
            value={formData.county}
            onChange={e => handleChange('county', e.target.value)}
          />
        </div>

        <div>
          <label>Property ID *</label>
          <input
            value={formData.propertyId}
            onChange={e => handleChange('propertyId', e.target.value)}
            required
          />
        </div>

        <div>
          <label>Site Number *</label>
          <input
            type="number"
            value={formData.siteNumber}
            onChange={e => handleChange('siteNumber', parseInt(e.target.value))}
            required
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => handleChange('phone', e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => handleChange('email', e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Project'}
        </button>

        {success && (
          <div className="success">
            Project created successfully! ID: {createdProject.id}
          </div>
        )}

        {error && <div className="error">Error: {error}</div>}
      </form>
    </div>
  );
}
```

---

## Error Handling

All errors are automatically caught and formatted into user-friendly messages.

### Handling Errors in Vanilla JS

```javascript
import api from './services/magicTreeHouseAPI';

try {
  const projects = await api.projects.getBySeason('24-25');
  console.log(projects);
} catch (error) {
  console.error('Error:', error.message);

  // Check specific error types
  if (error.status === 404) {
    console.log('Not found');
  } else if (error.status === 500) {
    console.log('Server error');
  } else {
    console.log('Network error or other issue');
  }
}
```

### Handling Errors in React Hooks

```javascript
function MyComponent() {
  const { projects, loading, error } = useProjects('24-25');

  if (loading) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="error">
        <h3>Error Loading Projects</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return <div>{/* Render projects */}</div>;
}
```

### Common Error Messages

- `"Network error: Unable to reach the server. Is the backend running?"` - Backend is offline
- `"season parameter is required"` - Missing required parameter
- `"Missing required fields: season, ownerLastName"` - Validation error when creating
- `"HTTP 404: Not Found"` - Resource doesn't exist
- `"HTTP 500: Internal Server Error"` - Backend/Airtable error

---

## Caching

The API service automatically caches data for 5 minutes to reduce API calls and improve performance.

### Cache Behavior

- **Seasons**: Cached for 5 minutes (seasons rarely change)
- **Projects by season**: Cached per season for 5 minutes
- **Project details**: Cached per project for 5 minutes
- **Cache is automatically invalidated** when creating new data

### Skipping Cache

```javascript
// Vanilla JS
const freshSeasons = await api.seasons.getAll({ skipCache: true });
const freshProjects = await api.projects.getBySeason('24-25', { skipCache: true });

// React Hooks
const { seasons } = useSeasons({ skipCache: true });
const { projects } = useProjects('24-25', { skipCache: true });
```

### Manual Cache Control

```javascript
import api from './services/magicTreeHouseAPI';

// Clear all caches
api.utils.clearAllCaches();

// Clear specific caches
api.seasons.clearCache();
api.projects.clearCache();
api.projects.clearSeasonCache('24-25');
api.projects.clearProjectCache('rec1dp7COcr1qPsmj');

// Check cache state (for debugging)
const cacheState = api.utils.getCacheState();
console.log(cacheState);
// {
//   seasons: { cached: true, valid: true, expiresIn: 245000 },
//   projects: { cachedSeasons: ['24-25', '23-24'], count: 2 },
//   projectDetails: { cachedRecords: ['rec123...'], count: 1 }
// }
```

---

## Data Structures

### Project Data Structure

```javascript
{
  // Identifiers
  id: "rec1dp7COcr1qPsmj",              // Airtable record ID
  uniqueId: "Galinsky22330987 Site 1",  // Human-readable unique ID

  // Owner Information
  ownerFirstName: "Gilda",
  ownerDisplayName: "Galinsky",
  ownerFullName: "Gilda Galinsky",      // Auto-generated

  // Property Information
  address: "101 West End Road",
  city: "Bastrop",
  zipCode: "78602",
  county: "Bastrop",
  propertyId: "22330987",
  siteNumber: 1,

  // Contact Information
  phone: "(915) 555-6789",
  email: "gilda.galinsky@examplemail.com",

  // Project Details
  status: "Planting complete",
  season: "24-25",
  landRegion: "Piney",
  participationStatus: "Participant",

  // Metrics
  totalAcres: 0,
  totalTrees: 0,

  // Dates (YYYY-MM-DD format)
  contactDate: "2024-03-04",
  consultationDate: "2024-03-29",
  applicationDate: "2024-03-01",
  flaggingDate: "2024-04-30",
  plantingDate: "2024-12-11",

  // File Attachments (URLs)
  initialMapUrl: "https://...",         // Single URL
  draftMapUrl: "https://...",           // Single URL
  finalMapUrl: "https://...",           // Single URL
  plantingPhotoUrls: ["https://..."],   // Array of URLs
  beforePhotoUrls: ["https://..."],     // Array of URLs
  propertyImageUrls: ["https://..."]    // Array of URLs
}
```

### Required Fields

When creating a new project, these fields are **required**:

- `season` (string) - Must be a valid season from the seasons list
- `ownerLastName` (string) - Owner last name or site name
- `address` (string) - Property address
- `propertyId` (string) - Property ID number
- `siteNumber` (number) - Site number

All other fields are optional.

---

## TypeScript Support

If you're using TypeScript, you can create type definitions:

```typescript
// types/magicTreeHouse.ts

export interface Project {
  // Identifiers
  id: string;
  uniqueId: string;

  // Owner Information
  ownerFirstName?: string;
  ownerDisplayName?: string;
  ownerFullName?: string;

  // Property Information
  address: string;
  city?: string;
  zipCode?: string;
  county?: string;
  propertyId: string;
  siteNumber: number;

  // Contact Information
  phone?: string;
  email?: string;

  // Project Details
  status?: string;
  season: string;
  landRegion?: string;
  participationStatus?: string;

  // Metrics
  totalAcres?: number;
  totalTrees?: number;

  // Dates
  contactDate?: string;
  consultationDate?: string;
  applicationDate?: string;
  flaggingDate?: string;
  plantingDate?: string;

  // Attachments
  initialMapUrl?: string;
  draftMapUrl?: string;
  finalMapUrl?: string;
  plantingPhotoUrls?: string[];
  beforePhotoUrls?: string[];
  propertyImageUrls?: string[];
}

export interface CreateProjectData {
  // Required
  season: string;
  ownerLastName: string;
  address: string;
  propertyId: string;
  siteNumber: number;

  // Optional
  ownerFirstName?: string;
  city?: string;
  zipCode?: string;
  county?: string;
  phone?: string;
  email?: string;
  status?: string;
  landRegion?: string;
  participationStatus?: string;
  contactDate?: string;
  consultationDate?: string;
  applicationDate?: string;
  flaggingDate?: string;
  plantingDate?: string;
}
```

---

## Configuration

### Environment Variables

Create a `.env` file in your frontend directory:

```bash
# Backend API URL (defaults to http://localhost:3000/api)
VITE_API_BASE_URL=http://localhost:3000/api

# For production:
# VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

### Cache Duration

To change the cache duration, edit `magicTreeHouseAPI.js`:

```javascript
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (change this)
```

---

## Best Practices

1. **Use React Hooks for React components** - They're simpler and handle re-rendering automatically
2. **Use the combined `useSeasonsAndProjects()` hook** for season selector + project list pages
3. **Always handle loading and error states** - Provide good UX feedback
4. **Use cache wisely** - Skip cache only when you need fresh data (e.g., after creating/updating)
5. **Display user-friendly error messages** - Don't show raw error objects to users
6. **Format dates for display** - Convert "2024-12-11" to "December 11, 2024" or use your preferred format
7. **Validate forms before submitting** - Check required fields client-side before API calls
8. **Use `ownerFullName`** instead of concatenating first + last name manually

---

## Troubleshooting

### Backend Not Responding

```javascript
import { useBackendHealth } from './hooks/useMagicTreeHouse';

function App() {
  const { isHealthy } = useBackendHealth();

  if (!isHealthy) {
    return <div>Backend is offline. Please start the server.</div>;
  }

  return <YourApp />;
}
```

### Cache Issues

```javascript
// If data seems stale, clear all caches
import api from './services/magicTreeHouseAPI';

function handleRefresh() {
  api.utils.clearAllCaches();
  window.location.reload();
}
```

### CORS Errors

If you see CORS errors in the console, make sure:
1. Backend server is running
2. Backend has CORS enabled (it should be)
3. You're using the correct API URL

---

## Summary

**Vanilla JS:**
```javascript
import api from './services/magicTreeHouseAPI';

const seasons = await api.seasons.getAll();
const projects = await api.projects.getBySeason('24-25');
const project = await api.projects.getById('rec123...');
await api.projects.create({ season: '24-25', ... });
```

**React Hooks:**
```javascript
import { useSeasons, useProjects, useProject, useCreateProject } from './hooks/useMagicTreeHouse';

const { seasons, loading, error } = useSeasons();
const { projects } = useProjects('24-25');
const { project } = useProject('rec123...');
const { createProject } = useCreateProject();
```

**That's it!** You now have everything you need to interact with the Magic Tree House backend. Happy coding! 🌳

---

**Questions?** Check the backend API documentation at `backend/API_DOCUMENTATION.md` for more details on what the backend returns.
