# Migration Guide - New API Service Layer

This guide helps transition from the old API service files to the new unified service layer.

## Summary of Changes

The new API service layer provides:
- ✅ Unified API wrapper (`magicTreeHouseAPI.js`)
- ✅ Ready-to-use React hooks (`useMagicTreeHouse.js`)
- ✅ Automatic caching (5 minutes)
- ✅ Better error handling
- ✅ Property Images support
- ✅ Comprehensive documentation

## Files Overview

### ✨ NEW Files (Keep These)

| File | Purpose | Status |
|------|---------|--------|
| `frontend/src/services/magicTreeHouseAPI.js` | Main API service wrapper | ✅ Use this |
| `frontend/src/hooks/useMagicTreeHouse.js` | React hooks for API | ✅ Use this |
| `frontend/src/services/testAPI.js` | Test script for API | ✅ Keep for testing |
| `frontend/test-api.html` | Interactive test page | ✅ Keep for testing |
| `documentation/API_DOCUMENTATION.md` | Backend API reference | ✅ Primary docs |
| `documentation/FRONTEND_API_GUIDE.md` | Frontend guide | ✅ Primary docs |
| `documentation/README.md` | Documentation index | ✅ Navigation |
| `CHANGELOG.md` | Version history | ✅ Track changes |

### 🔄 OLD Files (Candidates for Removal)

| File | Replaced By | Safe to Remove? |
|------|-------------|-----------------|
| `frontend/src/services/apiService.js` | `magicTreeHouseAPI.js` | ⚠️ After migration |
| `frontend/src/services/actualApiService.js` | `magicTreeHouseAPI.js` | ⚠️ After migration |
| `frontend/src/services/dummyUseExamples.js` | `useMagicTreeHouse.js` | ⚠️ After migration |
| `backend/API_DOCUMENTATION.md` | `documentation/API_DOCUMENTATION.md` | ✅ Yes (moved) |
| `frontend/FRONTEND_API_GUIDE.md` | `documentation/FRONTEND_API_GUIDE.md` | ✅ Yes (moved) |

## Migration Steps

### Step 1: Review Old Service Files

**Check if your code uses these old files:**

```bash
# Search for imports of old services
grep -r "from './services/apiService" frontend/src/
grep -r "from './services/actualApiService" frontend/src/
grep -r "from './services/dummyUseExamples" frontend/src/
```

### Step 2: Update Imports

**Before** (Old service):
```javascript
import { getProjectsBySeason, getProjectDetails } from './services/actualApiService';
```

**After** (New service):
```javascript
import api from './services/magicTreeHouseAPI';

// Or for React hooks
import { useProjects, useProject } from './hooks/useMagicTreeHouse';
```

### Step 3: Update Usage

#### Old Way (actualApiService.js)
```javascript
function MyComponent() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProjectsBySeason('24-25');
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ... rest of component
}
```

#### New Way (magicTreeHouseAPI.js - Vanilla)
```javascript
import api from './services/magicTreeHouseAPI';

function MyComponent() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.projects.getBySeason('24-25');
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ... rest of component
}
```

#### New Way (useMagicTreeHouse.js - Hooks) ⭐ RECOMMENDED
```javascript
import { useProjects } from './hooks/useMagicTreeHouse';

function MyComponent() {
  const { projects, loading, error, refresh } = useProjects('24-25');

  // That's it! Loading, error, and data are handled automatically
  // ... rest of component
}
```

### Step 4: Test Everything

1. **Run the test page**: Open `frontend/test-api.html`
2. **Verify all endpoints work**
3. **Check Property Images display**
4. **Test your existing components**

### Step 5: Remove Old Files (After Verification)

Once you've verified everything works with the new service layer:

```bash
# ONLY RUN AFTER CONFIRMING NO CODE USES THESE FILES

# Remove old service files
rm frontend/src/services/apiService.js
rm frontend/src/services/actualApiService.js
rm frontend/src/services/dummyUseExamples.js

# Documentation has been moved (these may already be deleted)
# backend/API_DOCUMENTATION.md → documentation/API_DOCUMENTATION.md
# frontend/FRONTEND_API_GUIDE.md → documentation/FRONTEND_API_GUIDE.md
```

## Comparison: Old vs New

### Old Service (actualApiService.js)

**Limitations:**
- ❌ No built-in caching
- ❌ Manual error handling in every component
- ❌ Manual loading state management
- ❌ Verbose axios configuration
- ❌ No React hooks
- ❌ Scattered documentation

**Example:**
```javascript
import { getProjectsBySeason } from './services/actualApiService';

// Manually handle everything
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [data, setData] = useState([]);

useEffect(() => {
  const fetch = async () => {
    setLoading(true);
    try {
      const result = await getProjectsBySeason('24-25');
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);
```

### New Service (magicTreeHouseAPI.js + hooks)

**Benefits:**
- ✅ Automatic caching (5 minutes, configurable)
- ✅ Automatic error handling
- ✅ Automatic loading states
- ✅ Simple fetch-based implementation
- ✅ React hooks included
- ✅ Comprehensive documentation
- ✅ Property Images support
- ✅ TypeScript types included

**Example (with hooks):**
```javascript
import { useProjects } from './hooks/useMagicTreeHouse';

const { projects, loading, error, refresh } = useProjects('24-25');

// Done! Everything is handled automatically
```

## API Method Mapping

| Old Method | New Method | Hook Alternative |
|------------|-----------|------------------|
| `getAllSeasons()` | `api.seasons.getAll()` | `useSeasons()` |
| `getProjectsBySeason(season)` | `api.projects.getBySeason(season)` | `useProjects(season)` |
| `getProjectDetails(id)` | `api.projects.getById(id)` | `useProject(id)` |
| `addProject(data)` | `api.projects.create(data)` | `useCreateProject()` |
| `addSeason(name)` | `api.seasons.add(name)` | `useAddSeason()` |

## New Features Not in Old Service

### 1. Caching
```javascript
// Automatic 5-minute cache
const projects1 = await api.projects.getBySeason('24-25'); // API call
const projects2 = await api.projects.getBySeason('24-25'); // From cache!

// Skip cache when needed
const fresh = await api.projects.getBySeason('24-25', { skipCache: true });
```

### 2. Property Images Support
```javascript
const project = await api.projects.getById('recngkmjhSrvnJECr');

// New field available!
console.log(project.propertyImageUrls); // Array of image URLs
```

### 3. Combined Hooks
```javascript
// Get seasons AND projects in one hook!
const { seasons, selectedSeason, setSelectedSeason, projects } =
  useSeasonsAndProjects('24-25');
```

### 4. Health Check
```javascript
// Check if backend is online
const isOnline = await api.utils.healthCheck();
```

### 5. Cache Management
```javascript
// Clear all caches
api.utils.clearAllCaches();

// Clear specific cache
api.projects.clearSeasonCache('24-25');
```

## Troubleshooting Migration

### Issue: "Cannot find module 'magicTreeHouseAPI'"

**Solution**: Update import path
```javascript
// Make sure path is correct
import api from './services/magicTreeHouseAPI'; // ✅
import api from '../services/magicTreeHouseAPI'; // Adjust based on location
```

### Issue: "Hook can only be called inside a function component"

**Solution**: Make sure you're in a React component
```javascript
// ✅ Correct
function MyComponent() {
  const { projects } = useProjects('24-25');
  return <div>...</div>;
}

// ❌ Wrong
const projects = useProjects('24-25'); // Outside component
```

### Issue: "Environment variable not defined"

**Solution**: Set `VITE_API_BASE_URL` in your `.env` file
```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Rollback Plan

If you need to rollback to the old service:

1. **Keep the old files** (don't delete yet)
2. **Change imports back** to `actualApiService.js`
3. **Report issues** so we can fix the new service

## Next Steps

1. ✅ Review this migration guide
2. ✅ Search for old service imports in your code
3. ✅ Update one component at a time
4. ✅ Test each component after migration
5. ✅ Once all components migrated, remove old files
6. ✅ Update team documentation/wikis

## Questions?

- 📖 [Frontend API Guide](./FRONTEND_API_GUIDE.md) - Complete examples
- 📖 [API Documentation](./API_DOCUMENTATION.md) - Backend reference
- 🧪 [Test Page](../frontend/test-api.html) - Interactive testing

---

**Note**: This migration is **non-breaking**. Both old and new services can coexist during the transition period. Take your time to migrate components one by one.

**Recommendation**: Start by migrating one small component, verify it works, then proceed with others.
