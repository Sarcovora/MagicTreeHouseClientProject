# TreeFolks User Portal - Backend

**Complete Documentation:** [Backend Architecture Guide](../documentation/BACKEND_ARCHITECTURE.md)

---

## Quick Start

```bash
cd backend
npm install
node server.js
# Server runs on http://localhost:3000
```

---

## Environment Setup

Create `.env` file:

```bash
AIRTABLE_PAT=your_token
AIRTABLE_BASE_ID=your_base_id
AIRTABLE_TABLE_ID=your_table_id
AIRTABLE_SEASON_FIELD_ID=your_field_id
AIRTABLE_API_URL=https://api.airtable.com

FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

CLOUDINARY_URL=cloudinary://key:secret@cloud_name

PORT=3000
```

**Getting Airtable IDs:** https://support.airtable.com/docs/finding-airtable-ids

---

## API Endpoints

All require `Authorization: Bearer <token>` header.

```
GET    /api/seasons
POST   /api/seasons                                    (Admin)
DELETE /api/seasons/:seasonId                          (Admin)

GET    /api/projects/season/:season
GET    /api/projects/details/:recordId
POST   /api/projects                                   (Admin)
PATCH  /api/projects/:recordId                         (Admin)

GET    /api/projects/my-projects                       (Landowner)

POST   /api/projects/:recordId/documents
DELETE /api/projects/:recordId/documents/:type         (Admin)
DELETE /api/projects/:recordId/documents/:type/:index  (Admin - Delete specific file)
PUT    /api/projects/:recordId/documents/:type/:index  (Admin - Replace specific file)

POST   /api/projects/:recordId/draft-map/comments      (Landowner)
```

**Complete reference:** [Frontend API Guide](../documentation/FRONTEND_API_GUIDE.md)

---

## Common Commands

### Test Endpoints
```bash
curl http://localhost:3000/api/seasons
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/projects/season/25-26
```

### Add Airtable Field
```bash
# 1. Add field in Airtable UI
# 2. Edit services/airtableService.js:
{ api: 'newField', airtable: 'New Field Name' }
# 3. Restart server
```

### Update Dependencies
```bash
npm update
npm audit fix
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Server won't start | `npm install`, check `.env` exists |
| Auth errors (401/403) | Verify `FIREBASE_SERVICE_ACCOUNT_JSON`, check Firestore `isAdmin` |
| File uploads fail | Verify `CLOUDINARY_URL`, check quota |
| Airtable errors | Check IDs match, verify PAT scopes, field names exact match |

---

## File Handling (Cloudinary)

Files uploaded via the API are temporarily stored in Cloudinary before being attached to Airtable.
- **Auto-Deletion**: Cloudinary assets are **automatically deleted** after the upload is confirmed (default: 60s delay, or 5m for slower files).
- **Configuration**: `CLOUDINARY_DELETE_DELAY_MS` in `.env` controls this delay.
- **Logic**: See `controllers/airtableController.js` (lines 184+) and `services/cloudinaryService.js`.


**Detailed solutions:** [Architecture Guide - Troubleshooting](../documentation/BACKEND_ARCHITECTURE.md#troubleshooting)

---

## File Structure

```
backend/
├── server.js                      # Express app entry
├── routes/airtableRoutes.js       # API endpoints
├── controllers/airtableController.js  # Request handlers
├── middleware/authMiddleware.js   # Firebase auth
└── services/
    ├── airtableService.js         # Database ops, field mapping
    └── cloudinaryService.js       # File uploads
```

---

## Documentation

- **[Backend Architecture Guide](../documentation/BACKEND_ARCHITECTURE.md)** - Complete technical guide
- **[Frontend API Guide](../documentation/FRONTEND_API_GUIDE.md)** - How to use the API in React

---

**For everything else, see the [Backend Architecture Guide](../documentation/BACKEND_ARCHITECTURE.md)**
