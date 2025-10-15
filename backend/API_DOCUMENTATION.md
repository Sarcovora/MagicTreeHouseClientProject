# Magic Tree House - Backend API Documentation

## Base URL
```
http://localhost:3000/api
```
**Production URL**: Update this with your deployed backend URL

---

## Table of Contents
1. [Get All Seasons](#1-get-all-seasons)
2. [Get Projects by Season](#2-get-projects-by-season)
3. [Get Project Details](#3-get-project-details)
4. [Create New Project](#4-create-new-project)
5. [Add New Season](#5-add-new-season)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)

---

## Endpoints

### 1. Get All Seasons

Retrieves all available season options from Airtable.

**Endpoint**: `GET /api/seasons`

**Authentication**: None required (uses backend PAT)

**Request Parameters**: None

**Response**:
```json
[
  "25-26",
  "24-25",
  "23-24",
  "22-23",
  "21-22",
  "20-21",
  "19-20",
  "17-18"
]
```

**Response Type**: `Array<string>`

**Status Codes**:
- `200 OK` - Success
- `500 Internal Server Error` - Failed to fetch seasons from Airtable

**Example Usage**:
```javascript
// JavaScript/React
const response = await fetch('http://localhost:3000/api/seasons');
const seasons = await response.json();
console.log(seasons); // ["25-26", "24-25", ...]
```

---

### 2. Get Projects by Season

Retrieves all projects for a specific season.

**Endpoint**: `GET /api/projects/season/:season`

**Authentication**: None required (uses backend PAT)

**URL Parameters**:
- `season` (string, required) - The season identifier (e.g., "24-25")

**Request Example**:
```
GET /api/projects/season/24-25
```

**Response**:
```json
[
  {
    "id": "rec1dp7COcr1qPsmj",
    "uniqueId": "Galinsky22330987 Site 1",
    "ownerDisplayName": "Galinsky",
    "ownerFirstName": "Gilda",
    "ownerFullName": "Gilda Galinsky",
    "address": "101 West End Road",
    "city": "Bastrop",
    "zipCode": "78602",
    "county": "Bastrop",
    "propertyId": "22330987",
    "siteNumber": 1,
    "phone": "915) 555-6789",
    "email": "gilda.galinsky@examplemail.com",
    "status": "Planting complete",
    "season": "24-25",
    "landRegion": "Piney",
    "participationStatus": "Participant",
    "totalAcres": 0,
    "totalTrees": 0,
    "contactDate": "2024-03-04",
    "consultationDate": "2024-03-29",
    "applicationDate": "2024-03-01",
    "flaggingDate": "2024-04-30",
    "plantingDate": "2024-12-11",
    "initialMapUrl": "https://...",
    "draftMapUrl": "https://...",
    "finalMapUrl": "https://...",
    "plantingPhotoUrls": ["https://...", "https://..."],
    "beforePhotoUrls": ["https://...", "https://..."]
  }
]
```

**Response Type**: `Array<Project>` (see [Data Models](#data-models))

**Status Codes**:
- `200 OK` - Success (returns empty array if no projects found)
- `400 Bad Request` - Season parameter missing
- `500 Internal Server Error` - Failed to fetch projects

**Notes**:
- URL-encoded seasons (e.g., `24-25` or `24%2D25`) are both supported
- Returns all projects matching the season filter
- Excludes dummy records automatically

**Example Usage**:
```javascript
// JavaScript/React
const season = '24-25';
const response = await fetch(`http://localhost:3000/api/projects/season/${season}`);
const projects = await response.json();

// Display in a table or list
projects.forEach(project => {
  console.log(`${project.ownerFullName} - ${project.status}`);
});
```

---

### 3. Get Project Details

Retrieves detailed information for a specific project by its Airtable Record ID.

**Endpoint**: `GET /api/projects/details/:recordId`

**Authentication**: None required (uses backend PAT)

**URL Parameters**:
- `recordId` (string, required) - The Airtable record ID (starts with "rec")

**Request Example**:
```
GET /api/projects/details/rec1dp7COcr1qPsmj
```

**Response**:
```json
{
  "id": "rec1dp7COcr1qPsmj",
  "uniqueId": "Galinsky22330987 Site 1",
  "ownerDisplayName": "Galinsky",
  "ownerFirstName": "Gilda",
  "ownerFullName": "Gilda Galinsky",
  "address": "101 West End Road",
  "city": "Bastrop",
  "zipCode": "78602",
  "county": "Bastrop",
  "propertyId": "22330987",
  "siteNumber": 1,
  "phone": "915) 555-6789",
  "email": "gilda.galinsky@examplemail.com",
  "status": "Planting complete",
  "season": "24-25",
  "landRegion": "Piney",
  "participationStatus": "Participant",
  "totalAcres": 0,
  "totalTrees": 0,
  "contactDate": "2024-03-04",
  "consultationDate": "2024-03-29",
  "applicationDate": "2024-03-01",
  "flaggingDate": "2024-04-30",
  "plantingDate": "2024-12-11"
}
```

**Response Type**: `Project` (see [Data Models](#data-models))

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Record ID parameter missing
- `404 Not Found` - Project not found
- `500 Internal Server Error` - Failed to fetch project details

**Notes**:
- Returns the same data structure as individual items in the projects array
- Use the `id` field from the projects list to fetch details
- This endpoint returns the exact same data as the season query but for a single project

**Example Usage**:
```javascript
// JavaScript/React
const recordId = 'rec1dp7COcr1qPsmj';
const response = await fetch(`http://localhost:3000/api/projects/details/${recordId}`);

if (response.status === 404) {
  console.log('Project not found');
} else {
  const project = await response.json();
  console.log(project.ownerFullName, project.address);
}
```

---

### 4. Create New Project

Creates a new project record in Airtable.

**Endpoint**: `POST /api/projects`

**Authentication**: None required (uses backend PAT)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "season": "24-25",
  "ownerFirstName": "John",
  "ownerLastName": "Doe",
  "address": "123 Main Street",
  "city": "Austin",
  "zipCode": "78701",
  "county": "Travis",
  "propertyId": "PID12345",
  "siteNumber": 1,
  "phone": "(512) 555-1234",
  "email": "john.doe@example.com",
  "status": "Initial Contact (call/email)",
  "landRegion": "Piney",
  "contactDate": "2024-01-15",
  "consultationDate": "2024-02-20",
  "applicationDate": "2024-03-01",
  "flaggingDate": "2024-04-15",
  "plantingDate": "2024-12-01",
  "participationStatus": "Participant"
}
```

**Required Fields**:
- `season` (string) - Must be a valid season from the seasons list
- `ownerLastName` (string) - Owner last name or site name
- `address` (string) - Property address
- `propertyId` (string) - Property ID number(s)
- `siteNumber` (number) - Site number

**Optional Fields**:
- `ownerFirstName` (string)
- `city` (string)
- `zipCode` (string)
- `county` (string)
- `phone` (string)
- `email` (string)
- `status` (string) - Must be a valid status option
- `landRegion` (string)
- `contactDate` (string, YYYY-MM-DD format)
- `consultationDate` (string, YYYY-MM-DD format)
- `applicationDate` (string, YYYY-MM-DD format)
- `flaggingDate` (string, YYYY-MM-DD format)
- `plantingDate` (string, YYYY-MM-DD format)
- `participationStatus` (string)

**Response**:
```json
{
  "id": "recXXXXXXXXXXXXXX",
  "uniqueId": "Doe PID12345 Site 1",
  "ownerDisplayName": "Doe",
  "ownerFirstName": "John",
  "ownerFullName": "John Doe",
  "address": "123 Main Street",
  "city": "Austin",
  "zipCode": "78701",
  "county": "Travis",
  "propertyId": "PID12345",
  "siteNumber": 1,
  "phone": "(512) 555-1234",
  "email": "john.doe@example.com",
  "status": "Initial Contact (call/email)",
  "season": "24-25",
  "landRegion": "Piney",
  "participationStatus": "Participant",
  "contactDate": "2024-01-15",
  "consultationDate": "2024-02-20",
  "applicationDate": "2024-03-01",
  "flaggingDate": "2024-04-15",
  "plantingDate": "2024-12-01"
}
```

**Response Type**: `Project` (see [Data Models](#data-models))

**Status Codes**:
- `201 Created` - Project successfully created
- `400 Bad Request` - Missing or invalid project data
- `500 Internal Server Error` - Failed to create project

**Notes**:
- The `uniqueId` is automatically generated by Airtable based on owner name, property ID, and site number
- Dates should be in `YYYY-MM-DD` format
- `ownerFullName` is automatically generated from first and last names
- File attachments (maps, photos) cannot be uploaded via this endpoint currently

**Example Usage**:
```javascript
// JavaScript/React
const newProject = {
  season: '24-25',
  ownerFirstName: 'John',
  ownerLastName: 'Doe',
  address: '123 Main Street',
  city: 'Austin',
  zipCode: '78701',
  propertyId: 'PID12345',
  siteNumber: 1,
  phone: '(512) 555-1234',
  email: 'john.doe@example.com',
  status: 'Initial Contact (call/email)'
};

const response = await fetch('http://localhost:3000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newProject)
});

if (response.status === 201) {
  const createdProject = await response.json();
  console.log('Project created:', createdProject.id);
}
```

---

### 5. Add New Season

Adds a new season option to Airtable. This uses a workaround that creates and immediately deletes a dummy record.

**Endpoint**: `POST /api/seasons`

**Authentication**: None required (uses backend PAT with write permissions)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "seasonName": "25-26"
}
```

**Required Fields**:
- `seasonName` (string) - The new season identifier to add

**Response**:
```json
{
  "message": "Season option '25-26' potentially added via dummy record. Please verify in Airtable UI."
}
```

**Status Codes**:
- `200 OK` - Season addition attempted successfully
- `400 Bad Request` - Invalid or missing seasonName
- `500 Internal Server Error` - Failed to add season

**Notes**:
- **IMPORTANT**: Requires the PAT to have `data.records:write` scope
- This endpoint uses a workaround by creating and deleting a dummy record
- Always verify in the Airtable UI that the season was added successfully
- If the dummy record deletion fails, manual cleanup may be required
- Season names should follow the existing pattern (e.g., "YY-YY")

**Example Usage**:
```javascript
// JavaScript/React
const response = await fetch('http://localhost:3000/api/seasons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ seasonName: '25-26' })
});

const result = await response.json();
console.log(result.message);

// Refresh seasons list to confirm
const seasonsResponse = await fetch('http://localhost:3000/api/seasons');
const updatedSeasons = await seasonsResponse.json();
```

---

## Data Models

### Project Object

```typescript
interface Project {
  // Identifiers
  id: string;                      // Airtable record ID (e.g., "rec1dp7COcr1qPsmj")
  uniqueId: string;                // Auto-generated unique ID (e.g., "Galinsky22330987 Site 1")

  // Owner Information
  ownerFirstName?: string;         // First name or organization name
  ownerDisplayName?: string;       // Last name or site name
  ownerFullName?: string;          // Auto-generated: "FirstName LastName"

  // Property Information
  address: string;                 // Property address
  city?: string;                   // City
  zipCode?: string;                // ZIP code
  county?: string;                 // County name
  propertyId: string;              // Property ID number(s)
  siteNumber: number;              // Site number

  // Contact Information
  phone?: string;                  // Primary phone number
  email?: string;                  // Email address

  // Project Details
  status?: string;                 // Current status (e.g., "Planting complete")
  season: string;                  // Season identifier (e.g., "24-25")
  landRegion?: string;             // Land region (e.g., "Piney")
  participationStatus?: string;    // Participation status (e.g., "Participant")

  // Metrics
  totalAcres?: number;             // Total acres
  totalTrees?: number;             // Total trees planted

  // Important Dates (YYYY-MM-DD format)
  contactDate?: string;            // Initial contact date
  consultationDate?: string;       // Consultation date
  applicationDate?: string;        // Application submission date
  flaggingDate?: string;           // Site flagging date
  plantingDate?: string;           // Planting completion date

  // File Attachments (URLs)
  initialMapUrl?: string;          // URL to initial map attachment
  draftMapUrl?: string;            // URL to draft map attachment
  finalMapUrl?: string;            // URL to final map attachment
  plantingPhotoUrls?: string[];    // Array of planting photo URLs
  beforePhotoUrls?: string[];      // Array of before photo URLs
}
```

### Field Name Mapping

When sending data to the API (POST requests), use these field names:

| API Field Name | Airtable Field Name | Type | Required for POST |
|----------------|---------------------|------|-------------------|
| `season` | Season | string | Yes |
| `ownerFirstName` | Owner First Name or Organization | string | No |
| `ownerLastName` | Owner Last Name or Site Name | string | Yes |
| `address` | Property Address | string | Yes |
| `city` | City | string | No |
| `zipCode` | Zip Code | string | No |
| `county` | County | string | No |
| `propertyId` | Property ID Number(s) | string | Yes |
| `siteNumber` | Site Number | number | Yes |
| `phone` | Primary Phone Number | string | No |
| `email` | Email | string | No |
| `status` | Current Status | string | No |
| `landRegion` | Land Region | string | No |
| `participationStatus` | Participation status | string | No |
| `contactDate` | Contact Date | string | No |
| `consultationDate` | Consultation Date | string | No |
| `applicationDate` | Application Date | string | No |
| `flaggingDate` | Flagging Date | string | No |
| `plantingDate` | Planting Date | string | No |
| `initialMap` | Initial Map | attachment | No* |
| `draftMap` | Draft Map | attachment | No* |
| `finalMap` | Final Map | attachment | No* |
| `plantingPhotos` | Planting Photos | attachment | No* |

*File attachments are not currently supported via the API

---

## Error Handling

### Error Response Format

All errors return a JSON object with a `message` field:

```json
{
  "message": "Error description here",
  "error": {} // Only in development mode
}
```

### Common Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters or missing required fields
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server or Airtable error

### Common Error Messages

**400 Bad Request**:
```json
{
  "message": "Season parameter is required."
}
```
```json
{
  "message": "Project data is required in the request body."
}
```
```json
{
  "message": "Valid seasonName (string) is required in the request body."
}
```

**404 Not Found**:
```json
{
  "message": "Project not found."
}
```

**500 Internal Server Error**:
```json
{
  "message": "Failed to fetch seasons: [error details]"
}
```
```json
{
  "message": "Failed to add project: Invalid value for a field."
}
```

### Error Handling Best Practices

```javascript
// Always check response status
const response = await fetch('http://localhost:3000/api/projects/season/24-25');

if (!response.ok) {
  const error = await response.json();
  console.error('API Error:', error.message);

  switch (response.status) {
    case 400:
      // Handle bad request (validation error)
      alert('Invalid request: ' + error.message);
      break;
    case 404:
      // Handle not found
      alert('Resource not found');
      break;
    case 500:
      // Handle server error
      alert('Server error, please try again later');
      break;
    default:
      alert('An unexpected error occurred');
  }
  return;
}

const data = await response.json();
// Process data...
```

---

## Environment & Configuration

### Server Information
- **Local Port**: 3000 (configurable via `PORT` environment variable)
- **CORS**: Enabled for all origins
- **Request Logging**: All requests are logged with timestamp

### Rate Limiting
Currently, there is no rate limiting implemented on the backend. Be mindful of Airtable's API rate limits:
- **5 requests per second per base**
- Consider implementing caching on the frontend for frequently accessed data

---

## Testing & Development

### Quick Test Commands

Test all endpoints with cURL:

```bash
# Get all seasons
curl http://localhost:3000/api/seasons

# Get projects for a season
curl "http://localhost:3000/api/projects/season/24-25"

# Get project details
curl http://localhost:3000/api/projects/details/rec1dp7COcr1qPsmj

# Create a new project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "season": "24-25",
    "ownerFirstName": "Test",
    "ownerLastName": "User",
    "address": "123 Test St",
    "propertyId": "TEST123",
    "siteNumber": 1
  }'

# Add a new season
curl -X POST http://localhost:3000/api/seasons \
  -H "Content-Type: application/json" \
  -d '{"seasonName": "26-27"}'
```

---

## Frontend Integration Examples

### React Hooks Example

```javascript
// useSeasons.js
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

export function useSeasons() {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/seasons`)
      .then(res => res.json())
      .then(data => {
        setSeasons(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { seasons, loading, error };
}

// useProjects.js
export function useProjects(season) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!season) return;

    setLoading(true);
    fetch(`${API_BASE_URL}/projects/season/${season}`)
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [season]);

  return { projects, loading, error };
}

// Usage in component
function ProjectsList() {
  const { seasons } = useSeasons();
  const [selectedSeason, setSelectedSeason] = useState('24-25');
  const { projects, loading, error } = useProjects(selectedSeason);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <select value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)}>
        {seasons.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <ul>
        {projects.map(p => (
          <li key={p.id}>{p.ownerFullName} - {p.status}</li>
        ))}
      </ul>
    </div>
  );
}
```

### API Service Class

```javascript
// apiService.js
class MagicTreeHouseAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  }

  // GET /api/seasons
  async getSeasons() {
    return this.request('/seasons');
  }

  // GET /api/projects/season/:season
  async getProjectsBySeason(season) {
    return this.request(`/projects/season/${season}`);
  }

  // GET /api/projects/details/:recordId
  async getProjectDetails(recordId) {
    return this.request(`/projects/details/${recordId}`);
  }

  // POST /api/projects
  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(projectData)
    });
  }

  // POST /api/seasons
  async addSeason(seasonName) {
    return this.request('/seasons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seasonName })
    });
  }
}

// Export singleton instance
export const api = new MagicTreeHouseAPI();

// Usage
import { api } from './apiService';

const seasons = await api.getSeasons();
const projects = await api.getProjectsBySeason('24-25');
```

---

## Notes for Frontend Developers

1. **Always handle loading states** - API calls may take time, especially with large datasets
2. **Implement proper error handling** - Check response status codes and display user-friendly error messages
3. **Cache data when appropriate** - Season lists rarely change, consider caching them
4. **Validate input before sending** - Check required fields before making POST requests
5. **Use the `id` field for keys** - When rendering lists, use the Airtable `id` as the React key
6. **Date formatting** - Dates are returned as strings in YYYY-MM-DD format, format them for display
7. **Photo/Map URLs** - These are direct Airtable CDN URLs, can be used directly in `<img>` tags
8. **UniqueID vs ID** - `id` is the Airtable record ID (needed for API calls), `uniqueId` is human-readable
9. **Filter dummy records** - The API already filters these out, but be aware they exist in Airtable

---

## Support & Troubleshooting

### Server Not Responding
- Check that the server is running: `node server.js` in the backend directory
- Verify the port (default 3000) is not in use by another process
- Check console logs for error messages

### Authentication Errors
- Verify `AIRTABLE_PAT` is set correctly in `.env`
- Ensure the PAT has not expired
- For write operations (POST), confirm PAT has `data.records:write` scope

### Data Not Updating
- Airtable may take a moment to propagate changes
- Check the Airtable UI directly to confirm changes were saved
- Clear frontend cache if data appears stale

### Missing Fields in Response
- Check that fields are mapped in `FIELD_MAP` in `airtableService.js`
- Verify the field names in Airtable match the mapping
- Some fields may be `undefined` if not set in Airtable

---

**Last Updated**: 2025-10-14
**Backend Version**: 1.0.0
**Maintainer**: [Your Name/Team]
