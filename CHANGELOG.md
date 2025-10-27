# Changelog - Magic Tree House API

## [Latest] - 2025-10-27

### Added

- ✨ **Update Project Endpoint**
  - Added `PATCH /api/projects/:recordId` endpoint for updating existing projects
  - Supports partial updates - only send the fields you want to change
  - All project fields can be updated except file attachments
  - Proper error handling for missing records (404) and validation errors (400)

### Backend Changes

**New Service Function** (`backend/services/airtableService.js`):

- Added `updateProject(recordId, projectData)` function (lines 376-427)
- Maps API field names to Airtable field names using existing `FIELD_MAP`
- Uses Airtable's `table.update()` method with typecast enabled
- Returns processed record with all fields after update

**New Controller** (`backend/controllers/airtableController.js`):

- Added `handleUpdateProject` controller (lines 90-112)
- Validates recordId and projectData presence
- Handles 404 errors for missing projects
- Returns updated project data on success

**New Route** (`backend/routes/airtableRoutes.js`):

- Added `PATCH /projects/:recordId` route (line 28)
- Connects to `handleUpdateProject` controller

### Documentation Updates

- Updated `documentation/API_DOCUMENTATION.md` with full PATCH endpoint documentation
- Added update examples in cURL commands section
- Added `updateProject()` method to API service class example
- Updated table of contents

### Testing

- Tested with record `recSxNW2UhgirhCXU`
- Verified partial updates work correctly
- Confirmed updates persist to Airtable

### API Usage Example

```javascript
// Update project status and consultation date
const response = await fetch(`http://localhost:3000/api/projects/${recordId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'Consultation Scheduled',
    consultationDate: '2024-03-15'
  })
});
```

### Migration Notes

- ✅ No breaking changes
- ✅ Backward compatible
- ✅ Existing endpoints continue to work
- ✅ New endpoint is optional to use

---

## [2025-10-14]

### Added
- ✨ **Property Images Field Support**
  - Added `Property Images` field mapping in backend (`propertyImageUrls`)
  - Backend automatically converts Airtable attachments to URL arrays
  - Always returns as array (even with single image) for consistency

### Changed
- 📁 **Documentation Organization**
  - Created `/documentation` folder in root directory
  - Moved `backend/API_DOCUMENTATION.md` → `documentation/API_DOCUMENTATION.md`
  - Moved `frontend/FRONTEND_API_GUIDE.md` → `documentation/FRONTEND_API_GUIDE.md`
  - Added `documentation/README.md` with navigation guide

### Enhanced
- 🧪 **Test Suite Improvements**
  - Updated `frontend/test-api.html` to display Property Images as thumbnails
  - Changed default test season to `25-26` (has image data)
  - Changed default test record to Annie Armstrong (`recngkmjhSrvnJECr`)
  - Added image count display in project summaries
  - Visual image gallery in test results

- 📚 **Documentation Updates**
  - Updated all data models to include `propertyImageUrls?: string[]`
  - Added Property Images examples in all code samples
  - Updated field mapping tables
  - Added visual examples for displaying images in React

### Technical Details

#### Backend Changes
**File**: `backend/services/airtableService.js`

1. Added field mapping (line 59):
   ```javascript
   propertyImages: 'Property Images',
   ```

2. Added reverse mapping (line 86):
   ```javascript
   'Property Images': 'propertyImageUrls',
   ```

3. Updated attachment handling (line 107):
   ```javascript
   if (['plantingPhotoUrls', 'beforePhotoUrls', 'propertyImageUrls'].includes(apiKey)) {
       processed[apiKey] = value.map(att => att.url);
   }
   ```

#### Frontend Changes
- No code changes required! The API service automatically handles the new field
- Documentation updated with usage examples
- Test files enhanced to display images

### Test Data
- **Project**: Annie Armstrong
- **Record ID**: `recngkmjhSrvnJECr`
- **Season**: `25-26`
- **Property Images**: 3 images uploaded
- **Test URL**: `http://localhost:3000/api/projects/details/recngkmjhSrvnJECr`

### API Response Example
```json
{
  "id": "recngkmjhSrvnJECr",
  "ownerFullName": "Annie Armstrong",
  "propertyImageUrls": [
    "https://v5.airtableusercontent.com/v3/u/46/46/...",
    "https://v5.airtableusercontent.com/v3/u/46/46/...",
    "https://v5.airtableusercontent.com/v3/u/46/46/..."
  ]
}
```

### Migration Notes
- ✅ No breaking changes
- ✅ Backward compatible (field is optional)
- ✅ Existing code continues to work
- ✅ Property Images field only appears when data exists

### Documentation Links
- 📖 [Full API Documentation](./documentation/API_DOCUMENTATION.md)
- 📖 [Frontend Developer Guide](./documentation/FRONTEND_API_GUIDE.md)
- 📖 [Documentation README](./documentation/README.md)

---

## Previous Updates

### Initial Release
- Backend API with Airtable integration
- Frontend API service wrapper
- React hooks for easy integration
- Comprehensive documentation
- Test suite (HTML + JS)

#### Features
- Get all seasons
- Get projects by season
- Get project details
- Create new projects
- Automatic caching (5 minutes)
- Error handling
- Loading states

#### Supported Fields
- Owner information (name, contact)
- Property details (address, location)
- Project status and dates
- Maps (Initial, Draft, Final)
- Photos (Planting, Before)
- **Property Images** (NEW!)

---

**Maintained by**: Magic Tree House Team
**Repository**: MagicTreeHouseClientProject
**Backend**: Node.js + Express + Airtable
**Frontend**: React + Custom Hooks
