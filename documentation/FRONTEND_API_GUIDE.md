# Frontend API Guide - Magic Tree House

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

## API Service (Vanilla JS)

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

### Update an Existing Project

```javascript
// Update specific fields of a project (partial update)
const updatedProject = await api.projects.update('rec1dp7COcr1qPsmj', {
  status: 'Consultation Scheduled',
  consultationDate: '2024-03-15',
  phone: '(512) 555-9999'
});

console.log('Updated project:', updatedProject.id);
console.log('New status:', updatedProject.status);
```

**Parameters**:

- `recordId` (string, required) - The Airtable record ID
- `projectData` (object, required) - Object containing fields to update

**Updatable Fields** (all optional - send only what you want to change):

- `season` - Change project season
- `ownerFirstName` - Update owner first name
- `ownerLastName` - Update owner last name
- `address` - Update property address
- `city` - Update city
- `zipCode` - Update ZIP code
- `county` - Update county
- `propertyId` - Update property ID
- `siteNumber` - Update site number
- `phone` - Update phone number
- `email` - Update email
- `status` - Update project status
- `landRegion` - Update land region
- `participationStatus` - Update participation status
- `contactDate` - Update contact date
- `consultationDate` - Update consultation date
- `applicationDate` - Update application date
- `flaggingDate` - Update flagging date
- `plantingDate` - Update planting date

**Returns**: `Project` - The complete updated project

**Notes**:

- This is a **partial update** - you only need to send the fields you want to change
- All other fields remain unchanged
- The response contains the complete project with all fields after the update
- File attachments (maps, photos) cannot be updated via the API

**Example - Update Multiple Fields**:
```javascript
// Move project to next stage and update contact info
const updated = await api.projects.update('rec1dp7COcr1qPsmj', {
  status: 'Site Visit Complete',
  flaggingDate: '2024-04-15',
  email: 'newemail@example.com'
});
```

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

### useUpdateProject()

Update an existing project with form state management.

```javascript
import { useUpdateProject } from './hooks/useMagicTreeHouse';
import { useState } from 'react';

function UpdateProjectForm({ projectId, currentProject }) {
  const { updateProject, loading, error, success, updatedProject } = useUpdateProject();

  const [formData, setFormData] = useState({
    status: currentProject.status || '',
    phone: currentProject.phone || '',
    email: currentProject.email || '',
    consultationDate: currentProject.consultationDate || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only send changed fields
    const updates = {};
    if (formData.status !== currentProject.status) updates.status = formData.status;
    if (formData.phone !== currentProject.phone) updates.phone = formData.phone;
    if (formData.email !== currentProject.email) updates.email = formData.email;
    if (formData.consultationDate !== currentProject.consultationDate) {
      updates.consultationDate = formData.consultationDate;
    }

    const result = await updateProject(projectId, updates);

    if (result) {
      console.log('Project updated successfully!', result.id);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Status</label>
        <select
          value={formData.status}
          onChange={e => setFormData({...formData, status: e.target.value})}
        >
          <option value="Initial Contact (call/email)">Initial Contact</option>
          <option value="Consultation Scheduled">Consultation Scheduled</option>
          <option value="Site Visit Complete">Site Visit Complete</option>
          <option value="Planting complete">Planting Complete</option>
        </select>
      </div>

      <div>
        <label>Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={e => setFormData({...formData, phone: e.target.value})}
        />
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={e => setFormData({...formData, email: e.target.value})}
        />
      </div>

      <div>
        <label>Consultation Date</label>
        <input
          type="date"
          value={formData.consultationDate}
          onChange={e => setFormData({...formData, consultationDate: e.target.value})}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Project'}
      </button>

      {success && <div className="success">Project updated successfully!</div>}
      {error && <div className="error">Error: {error}</div>}
    </form>
  );
}
```

**Parameters**:

- Takes no parameters on initialization

**Returns**:

- `updateProject` - Function to update a project (takes recordId and updates object)
- `loading` - Boolean
- `error` - Error message string (or null)
- `success` - Boolean indicating success
- `updatedProject` - The updated project object (or null)

**Quick Update Example**:

```javascript
import { useUpdateProject } from './hooks/useMagicTreeHouse';

function QuickStatusUpdate({ project }) {
  const { updateProject, loading } = useUpdateProject();

  const moveToNextStage = async () => {
    await updateProject(project.id, {
      status: 'Consultation Scheduled',
      consultationDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <button onClick={moveToNextStage} disabled={loading}>
      {loading ? 'Updating...' : 'Schedule Consultation'}
    </button>
  );
}
```

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
await api.projects.update('rec123...', { status: 'New Status', phone: '555-1234' });
```

**React Hooks:**

```javascript
import {
  useSeasons,
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject
} from './hooks/useMagicTreeHouse';

const { seasons, loading, error } = useSeasons();
const { projects } = useProjects('24-25');
const { project } = useProject('rec123...');
const { createProject } = useCreateProject();
const { updateProject } = useUpdateProject();
```