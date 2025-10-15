# Magic Tree House - Frontend

React + Vite frontend for the Magic Tree House tree planting project tracker.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── services/
│   │   ├── magicTreeHouseAPI.js    # ✨ Main API service (USE THIS)
│   │   ├── testAPI.js              # Test script
│   │   ├── actualApiService.js     # ⚠️ OLD - See migration guide
│   │   ├── apiService.js           # ⚠️ OLD - Mock data
│   │   └── dummyUseExamples.js     # ⚠️ OLD - Example code
│   ├── hooks/
│   │   └── useMagicTreeHouse.js    # ✨ React hooks for API
│   └── components/
│       └── ... (your components)
├── test-api.html                   # Interactive API test page
└── README.md                       # This file
```

## 🔧 API Service

### Using the New API Service (Recommended)

**Import the service:**
```javascript
import api from './services/magicTreeHouseAPI';
```

**Use in your code:**
```javascript
// Get all seasons
const seasons = await api.seasons.getAll();

// Get projects for a season
const projects = await api.projects.getBySeason('24-25');

// Get specific project (with Property Images!)
const project = await api.projects.getById('rec1dp7COcr1qPsmj');
console.log(project.propertyImageUrls); // Array of image URLs
```

### Using React Hooks (Even Better!)

```javascript
import { useProjects, useProject } from './hooks/useMagicTreeHouse';

function MyComponent() {
  // Automatic loading, error handling, and caching!
  const { projects, loading, error, refresh } = useProjects('24-25');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {projects.map(p => (
        <li key={p.id}>{p.ownerFullName}</li>
      ))}
    </ul>
  );
}
```

## 🖼️ Property Images

Projects can have multiple property images. Access them via `propertyImageUrls`:

```javascript
function PropertyGallery({ recordId }) {
  const { project } = useProject(recordId);

  return (
    <div>
      {project?.propertyImageUrls?.map((url, i) => (
        <img key={i} src={url} alt={`Property ${i+1}`} />
      ))}
    </div>
  );
}
```

## 🧪 Testing

### Interactive Test Page
Open `test-api.html` in your browser to test all API endpoints with a nice UI.

### Backend Health Check
```javascript
import api from './services/magicTreeHouseAPI';

const isOnline = await api.utils.healthCheck();
console.log(isOnline ? 'Backend online!' : 'Backend offline');
```

## 📖 Documentation

- **[Frontend API Guide](../documentation/FRONTEND_API_GUIDE.md)** - Complete guide with examples
- **[Backend API Docs](../documentation/API_DOCUMENTATION.md)** - Backend API reference
- **[Migration Guide](../documentation/MIGRATION_GUIDE.md)** - Migrate from old service
- **[Documentation Index](../documentation/README.md)** - All docs

## 🔄 Migration from Old Service

If your code uses `actualApiService.js` or other old services, see the **[Migration Guide](../documentation/MIGRATION_GUIDE.md)** for step-by-step instructions.

**Quick migration:**
```javascript
// OLD
import { getProjectsBySeason } from './services/actualApiService';
const projects = await getProjectsBySeason('24-25');

// NEW (Vanilla)
import api from './services/magicTreeHouseAPI';
const projects = await api.projects.getBySeason('24-25');

// NEW (Hooks - Recommended!)
import { useProjects } from './hooks/useMagicTreeHouse';
const { projects } = useProjects('24-25');
```

## ⚙️ Configuration

Create a `.env` file for environment variables:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api

# For production
# VITE_API_BASE_URL=https://your-backend.vercel.app/api
```

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **API Client**: Fetch API (native)
- **State Management**: React Hooks
- **Styling**: (your choice)

## 📝 Available Scripts

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔗 Useful Links

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Project Changelog](../CHANGELOG.md)

---

**Need help?** Check the [Frontend API Guide](../documentation/FRONTEND_API_GUIDE.md) for detailed examples.
