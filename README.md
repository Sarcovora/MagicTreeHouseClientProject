# 🌳 Magic Tree House - Tree Planting Project Tracker

A full-stack application for tracking tree planting projects with Airtable integration.

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Testing
Open `frontend/test-api.html` in your browser to test all API endpoints interactively.

## 📁 Project Structure

```
MagicTreeHouseClientProject/
├── backend/               # Node.js + Express API server
├── frontend/              # React + Vite application
├── documentation/         # All project documentation
├── CHANGELOG.md          # Version history
└── README.md             # This file
```

## 📖 Documentation

All documentation is centralized in the [`/documentation`](./documentation) folder:

- **[Documentation Index](./documentation/README.md)** - Start here!
- **[Backend API Docs](./documentation/API_DOCUMENTATION.md)** - Complete API reference
- **[Frontend Guide](./documentation/FRONTEND_API_GUIDE.md)** - How to use the API in React
- **[Migration Guide](./documentation/MIGRATION_GUIDE.md)** - Migrate from old services
- **[Cleanup Summary](./documentation/CLEANUP_SUMMARY.md)** - Recent changes

## ✨ Features

### Backend (Node.js + Express)
- ✅ RESTful API with Airtable integration
- ✅ Season management
- ✅ Project CRUD operations
- ✅ Property Images support (multiple images per project)
- ✅ Automatic field mapping
- ✅ Error handling

### Frontend (React + Vite)
- ✅ Modern API service with automatic caching
- ✅ React hooks for easy data fetching
- ✅ Property Images gallery support
- ✅ Loading and error states handled automatically
- ✅ TypeScript type definitions

### Testing
- ✅ Interactive browser-based test page
- ✅ Comprehensive test script
- ✅ Visual image display
- ✅ All endpoints covered

## 🔧 API Service

The project includes a modern, easy-to-use API service:

### Using React Hooks (Recommended)
```javascript
import { useProjects } from './hooks/useMagicTreeHouse';

function MyComponent() {
  const { projects, loading, error } = useProjects('24-25');

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

### Using Vanilla API
```javascript
import api from './services/magicTreeHouseAPI';

// Get all seasons
const seasons = await api.seasons.getAll();

// Get projects for a season
const projects = await api.projects.getBySeason('24-25');

// Get specific project with Property Images
const project = await api.projects.getById('recngkmjhSrvnJECr');
console.log(project.propertyImageUrls); // Array of image URLs
```

## 🖼️ Property Images

Projects now support multiple property images:

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

**Test Data**: Annie Armstrong (`recngkmjhSrvnJECr`) in season `25-26` has 3 images.

## 🧪 Testing

### Interactive Test Page
1. Make sure backend is running on port 3000
2. Open `frontend/test-api.html` in your browser
3. Click "Run All Tests" or test individual endpoints
4. See Property Images displayed as thumbnails!

### Backend Health Check
```bash
curl http://localhost:3000/api/seasons
```

## 📚 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Airtable (via API)
- **API Style**: REST

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **API Client**: Fetch API (native)
- **State**: React Hooks

## 🔄 Recent Updates

### Latest (2025-10-14)
- ✨ Added Property Images field support
- 📁 Centralized all documentation
- 🚀 New API service with caching
- 🎣 React hooks for easy integration
- 🧪 Enhanced test suite with visual images
- 📖 Comprehensive documentation

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history.

## 📝 Environment Setup

### Backend `.env`
```bash
# Airtable
AIRTABLE_PAT=your_personal_access_token
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_ID=your_table_id
AIRTABLE_SEASON_FIELD_ID=your_season_field_id
AIRTABLE_API_URL=https://api.airtable.com

# Firebase Admin (single-line JSON string)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"treefolks-db",...}

# Server
PORT=3000
```

### Frontend `.env`
```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api
```

## 🔐 Authentication Workflow
1. **Firebase project** – Enable Email/Password auth and Firestore. The client SDK is initialized in `frontend/src/firebase.js`; update the config there if you change Firebase projects.
2. **Seed users** – Every signup creates a Firestore doc (`users/{uid}`) with `username`, `email`, and `isAdmin`. The UID `v0uqBwBApQVhBTLSaweNTonHnnH2` is whitelisted as the initial admin, but you can add more UIDs to `ADMIN_UIDS` in `firebase.js` or flip the `isAdmin` flag directly in Firestore.
3. **Backend verification** – Set `FIREBASE_SERVICE_ACCOUNT_JSON` so the Express API can verify `Authorization: Bearer <idToken>` headers. All routes require authentication; mutating routes additionally require `isAdmin`.
4. **Handoff** – Grant future developers Owner access in Firebase console and share `.env` files/service-account JSON so they can maintain auth without touching end-user credentials.

## 🛠️ Development

### Available Commands

**Backend:**
```bash
npm start          # Start server
```

**Frontend:**
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

## 📖 Documentation Quick Links

| Document | Description |
|----------|-------------|
| [Documentation Index](./documentation/README.md) | Start here - Navigation to all docs |
| [Backend API](./documentation/API_DOCUMENTATION.md) | Complete API endpoint reference |
| [Frontend Guide](./documentation/FRONTEND_API_GUIDE.md) | React hooks & API usage examples |
| [Migration Guide](./documentation/MIGRATION_GUIDE.md) | How to migrate from old services |
| [Backend README](./backend/README.md) | Backend-specific information |
| [Frontend README](./frontend/README.md) | Frontend-specific information |
| [Cleanup Summary](./documentation/CLEANUP_SUMMARY.md) | Recent reorganization details |

## 🤝 Contributing

1. Review the [Documentation Index](./documentation/README.md)
2. Check the [Migration Guide](./documentation/MIGRATION_GUIDE.md) if updating old code
3. Test changes using `frontend/test-api.html`
4. Update relevant documentation
5. Add entry to [CHANGELOG.md](./CHANGELOG.md)

## 📦 Deployment

### Backend
- Configured for Vercel (`backend/vercel.json`)
- Ensure environment variables are set

### Frontend
- Build with `npm run build`
- Deploy `dist/` folder
- Update `VITE_API_BASE_URL` for production

## 🆘 Support

### Common Issues

**Backend not responding:**
- Check if server is running: `lsof -i :3000`
- Verify `.env` file exists in `backend/`
- Check Airtable credentials

**API errors:**
- Open `frontend/test-api.html` to diagnose
- Check browser console for errors
- Verify backend URL in frontend `.env`

**Missing Property Images:**
- Ensure record has images in Airtable
- Check `propertyImageUrls` field in response
- Test with Annie Armstrong (`recngkmjhSrvnJECr`)

### Getting Help

1. Check [Documentation](./documentation/README.md)
2. Review [Frontend Guide](./documentation/FRONTEND_API_GUIDE.md) examples
3. Test with [test-api.html](./frontend/test-api.html)
4. Check [Migration Guide](./documentation/MIGRATION_GUIDE.md) if using old services

## 📄 License

[Add your license here]

## 👥 Team

[Add team members here]

---

**Documentation**: [./documentation](./documentation) | **Changelog**: [CHANGELOG.md](./CHANGELOG.md) | **Test Page**: [test-api.html](./frontend/test-api.html)
