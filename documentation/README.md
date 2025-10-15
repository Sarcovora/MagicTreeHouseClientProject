# Magic Tree House - Documentation

This folder contains all the documentation for the Magic Tree House project.

## 📚 Documentation Files

### Backend Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete backend API reference
  - All API endpoints (GET /seasons, GET /projects, etc.)
  - Request/response formats
  - Data models and field mappings
  - Error handling
  - cURL test examples

### Frontend Documentation
- **[FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md)** - Frontend developer guide
  - How to use the API service wrapper
  - React hooks documentation
  - Complete code examples
  - Error handling best practices
  - TypeScript type definitions

## 🚀 Quick Links

### For Backend Developers
Start with [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) to understand:
- What endpoints are available
- What data each endpoint returns
- How to add new fields (like Property Images)

### For Frontend Developers
Start with [FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md) to learn:
- How to use the API service (`src/services/magicTreeHouseAPI.js`)
- How to use React hooks (`src/hooks/useMagicTreeHouse.js`)
- See complete working examples

## 🧪 Testing

### Browser-Based Testing
Open `frontend/test-api.html` in your browser to:
- Test all API endpoints interactively
- View Property Images
- See formatted responses
- Check if backend is online

### Command-Line Testing
Use `frontend/src/services/testAPI.js` in your browser console or Node.js

## 🖼️ Property Images Field

The **Property Images** field was recently added to store multiple images for each property.

### Backend Mapping
- **Airtable Field**: `Property Images` (attachment field)
- **API Field**: `propertyImageUrls` (array of URL strings)
- **Location**: `backend/services/airtableService.js` (lines 59, 86, 107)

### Usage Example
```javascript
// React component
import { useProject } from './hooks/useMagicTreeHouse';

function ProjectGallery({ recordId }) {
  const { project } = useProject(recordId);

  return (
    <div>
      {project.propertyImageUrls && project.propertyImageUrls.map((url, i) => (
        <img key={i} src={url} alt={`Property ${i + 1}`} />
      ))}
    </div>
  );
}
```

### Test Data
- **Annie Armstrong** (`recngkmjhSrvnJECr`) in season `25-26` has 3 Property Images
- Use this record to test the Property Images feature

## 📁 Project Structure

```
MagicTreeHouseClientProject/
├── backend/
│   ├── services/airtableService.js   # Field mappings including Property Images
│   ├── controllers/
│   ├── routes/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── magicTreeHouseAPI.js  # API service wrapper
│   │   │   └── testAPI.js            # Test script
│   │   └── hooks/
│   │       └── useMagicTreeHouse.js  # React hooks
│   └── test-api.html                 # Interactive test page
└── documentation/                    # 📍 You are here
    ├── README.md                     # This file
    ├── API_DOCUMENTATION.md          # Backend API docs
    └── FRONTEND_API_GUIDE.md         # Frontend guide
```

## 🔧 Recent Updates

### Property Images Field Added
- **Date**: Today
- **Changes**:
  - Added `Property Images` → `propertyImageUrls` mapping in backend
  - Updated all documentation to include Property Images examples
  - Enhanced test files to display Property Images as thumbnails
  - Test data: Annie Armstrong (season 25-26) has 3 images

## 📝 Contributing

When adding new fields to Airtable:

1. **Update Backend**: Add field mapping in `backend/services/airtableService.js`
   - Add to `apiToAirtable` for input mapping
   - Add to `airtableToApi` for output mapping
   - If it's an attachment field with multiple files, add to the multi-image array

2. **Update Documentation**: Update both documentation files
   - Add to data models/interfaces
   - Add usage examples
   - Update field mapping tables

3. **Update Tests**: Enhance test files to show the new field
   - Update test expectations
   - Add example data

4. **Restart Backend**: Always restart the backend server after code changes

## 🆘 Support

- **Backend Issues**: Check `backend/README.md` or backend logs
- **Frontend Issues**: See React component examples in Frontend API Guide
- **API Not Working**: Run `test-api.html` to diagnose
- **Missing Fields**: Verify field names match exactly in Airtable

---

**Last Updated**: 2025-10-14
**Project**: Magic Tree House Tree Planting Tracker
**Airtable Base**: Application, status, and GIS data
