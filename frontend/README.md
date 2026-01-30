# TreeFolks User Portal - Frontend

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
frontend/
├── src/
│   ├── services/
│   │   └── apiService.js           # Centralized API client (currently returns mock data)
│   ├── components/
│   │   └── ...                     # Shared UI building blocks
│   ├── pages/
│   │   └── ...                     # Admin & landowner screens
│   └── assets/                     # Icons, images, etc.
└── README.md                       # This file
```

## API Service

### Current API Service

All frontend data access flows through `src/services/apiService.js`. At the moment it still returns mock data while the Airtable integration is being wired in. As you replace mocks with live endpoints, update the functions inside that file so every component automatically benefits.

**Example usage:**
```javascript
import apiService from './services/apiService';

const seasons = await apiService.getSeasons();
const projects = await apiService.getProjectsBySeason('24-25');
```

> **Heads-up:** Older helper files (`magicTreeHouseAPI`, `actualApiService`, example hooks, etc.) have been removed because they were unused and causing confusion. If you still have local imports referencing them, switch to the functions exported from `apiService.js`.

## Property Images

Projects can have multiple property images. Once `apiService.getProjectDetails(recordId)` is wired to the backend it will return a `propertyImageUrls` array you can render:

```javascript
import { useEffect, useState } from 'react';
import apiService from './services/apiService';

function PropertyGallery({ recordId }) {
  const [project, setProject] = useState(null);

  useEffect(() => {
    apiService.getProjectDetails(recordId).then(setProject);
  }, [recordId]);

  return (
    <div>
      {project?.propertyImageUrls?.map((url, i) => (
        <img key={i} src={url} alt={`Property ${i + 1}`} />
      ))}
    </div>
  );
}
```

## Documentation

- **[Frontend API Guide](../documentation/FRONTEND_API_GUIDE.md)** - Complete guide with examples
- **[Backend API Docs](../documentation/API_DOCUMENTATION.md)** - Backend API reference

## Configuration

Create a `.env` file for environment variables:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api

# For production
# VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **API Client**: Fetch API (native)
- **State Management**: React Hooks
- **Styling**: (your choice)

## Available Scripts

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## Useful Links

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)