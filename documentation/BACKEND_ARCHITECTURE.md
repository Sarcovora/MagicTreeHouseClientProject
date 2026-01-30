# Magic Tree House - Backend Architecture Guide

## Architecture Patterns

### Layer Responsibilities

1. **Routes** (`routes/airtableRoutes.js`)
   - Define HTTP endpoints (GET, POST, PATCH, DELETE)
   - Apply middleware (authentication, admin checks)
   - Map URLs to controller handlers

2. **Controllers** (`controllers/airtableController.js`)
   - Validate request parameters
   - Handle business logic coordination
   - Format responses
   - Call service layer functions

3. **Services** (`services/`)
   - Direct communication with external APIs
   - Data transformation (Airtable ↔ API format)
   - Complex operations (file uploads, permission lookups)

4. **Middleware** (`middleware/authMiddleware.js`)
   - Firebase token verification
   - User profile enrichment
   - Admin permission checks

---

## Directory Structure

```
backend/
├── server.js                      # Entry point - Express app setup
├── .env                           # Environment variables (NOT in git)
├── package.json                   # Dependencies
├── README.md                      # Backend-specific docs
│
├── routes/
│   └── airtableRoutes.js          # API endpoint definitions
│
├── controllers/
│   └── airtableController.js      # Request handlers & validation
│
├── services/
│   ├── airtableService.js         # Airtable CRUD operations
│   └── cloudinaryService.js       # File upload/delete helpers
│
├── middleware/
│   └── authMiddleware.js          # Firebase auth & admin checks
│
└── uploads/                       # Temporary local file storage (auto-created)
```

---

## Core Components

### 1. Server Setup (`server.js`)

**Responsibilities:**
- Initialize Express app
- Load environment variables
- Configure middleware (CORS, JSON parsing, static files)
- Mount routes
- Start HTTP server
- Global error handling

**Key Middleware:**
```javascript
// CORS - Allow frontend requests
app.use(cors());

// JSON body parsing with 50MB limit (for base64 images)
app.use(express.json({ limit: '50mb' }));

// Cache control headers (prevent stale data)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    // ...
});

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});
```

---

### 2. Routes (`routes/airtableRoutes.js`)

**Authentication Strategy:**
- ALL routes require valid Firebase token (`authenticateRequest` middleware)
- Admin-only routes additionally require `requireAdmin` middleware

**Route Categories:**

**Seasons (Admin)**
```javascript
GET    /api/seasons              // List all season options
POST   /api/seasons              // Add new season (Admin only)
DELETE /api/seasons/:seasonId    // Delete season (Admin only)
```

**Projects (Admin)**
```javascript
GET    /api/projects/season/:season           // Get projects by season
GET    /api/projects/details/:recordId        // Get single project (permission-checked)
POST   /api/projects                          // Create project (Admin only)
PATCH  /api/projects/:recordId                // Update project (Admin only)
```

**Landowner Access**
```javascript
GET    /api/projects/my-project      // Get landowner's first project (legacy)
GET    /api/projects/my-projects     // Get ALL landowner's projects
```

**File Operations**
```javascript
POST   /api/projects/:recordId/documents                  // Upload document/photo
DELETE /api/projects/:recordId/documents/:documentType    // Delete document (Admin only)
```

**Comments**
```javascript
POST   /api/projects/:recordId/draft-map/comments    // Landowner adds comment
```

---

### 3. Authentication & Authorization (`middleware/authMiddleware.js`)

#### Firebase Integration

**Initialization:**
```javascript
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
```

#### `authenticateRequest` Middleware

**Flow:**
1. Extract `Authorization: Bearer <token>` header
2. Verify JWT token with Firebase Admin SDK
3. Fetch user profile from Firestore (`users` collection)
4. Attach `req.user` object with:
   - `uid`: Firebase user ID
   - `email`: User's email
   - `admin`: Boolean from Firestore `isAdmin` field

#### `requireAdmin` Middleware

**Flow:**
1. Check `req.user.uid` exists
2. Re-fetch Firestore document
3. Verify `isAdmin === true`
4. Deny access (403) if not admin

**Security Note:** Admin status is stored in Firestore, NOT in the JWT token. This prevents privilege escalation via token manipulation.

---

### 4. Airtable Service (`services/airtableService.js`)

#### Configuration

**Two APIs Used:**
1. **Data API** (via Airtable SDK): CRUD operations on records
2. **Metadata API** (via Axios): Schema modifications (seasons, field info)

```javascript
// Data API
const base = Airtable.base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_ID);

// Metadata API
const metadataApi = axios.create({
    baseURL: `${airtableApiHost}/v0/meta/bases/${AIRTABLE_BASE_ID}`,
    headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
});
```

#### Field Mapping System

**Problem:** Airtable field names are human-readable ("Owner Last Name or Site Name"). API uses camelCase (`ownerDisplayName`).

**Solution:** Single source of truth mapping:

```javascript
const FIELD_DEFINITIONS = [
    { api: 'ownerDisplayName', airtable: 'Owner Last Name or Site Name' },
    { api: 'email', airtable: 'Email' },
    { api: 'season', airtable: 'Season' },
    // ... 60+ fields
];

// Auto-generate bidirectional maps
const FIELD_MAP = buildFieldMaps(); // { apiToAirtable, airtableToApi }
```

**Usage:**
- **Reads:** Convert Airtable field names → API keys (`processRecord()`)
- **Writes:** Convert API keys → Airtable field names (`addProject`, `updateProject`)

#### Attachment Handling

**Special Logic for Attachments:**
- Airtable stores attachments as array of objects: `[{ url, filename, id, type }]`
- Photos (`plantingPhotoUrls`, `beforePhotoUrls`, `propertyImageUrls`): Return full metadata array
- Documents (`draftMapUrl`, `finalMapUrl`): Return full metadata array (supports versioning)

**Document Upload Flow:**
1. Upload to Cloudinary (temporary storage)
2. Send URL to Airtable (Airtable downloads and hosts)
3. Wait for Airtable to host file (polling with retries)
4. Schedule Cloudinary cleanup (60s for images, 300s for PDFs)

---

### 5. File Upload System (`controllers/airtableController.js` + `services/cloudinaryService.js`)

#### Architecture

**Why Cloudinary?**
- Airtable requires publicly accessible URLs for attachments
- Cannot upload base64 directly to Airtable
- Cloudinary provides temporary hosting until Airtable mirrors the file

#### Upload Flow (`handleUploadProjectDocument`)

```
1. Frontend sends base64 file data
2. Controller validates permissions (landowners can only upload draftMap/photos)
3. Auto-rename draft maps: [OwnerName]_DraftMap_v[N].pdf
4. Upload buffer to Cloudinary (public URL returned)
5. Attach URL to Airtable record
6. Poll Airtable until file is hosted on airtableusercontent.com
7. Schedule Cloudinary cleanup (setTimeout)
8. Return updated project to frontend
```

#### Permission Enforcement

**Landowner Restrictions:**
```javascript
const allowedTypes = ['draftMap', 'plantingPhotoUrls', 'beforePhotoUrls', 'propertyImageUrls'];
if (!req.user.admin && !allowedTypes.includes(documentType)) {
    return res.status(403).json({ message: "Access denied" });
}
```

**Admin:** Can upload any document type

#### Versioning (Draft Maps)

**Auto-versioning:**
- Fetch current project
- Count existing draft map attachments
- New version = count + 1
- Filename: `Galinsky_DraftMap_v2.pdf`

**Append Mode:**
- `draftMap`, `plantingPhotoUrls`, `beforePhotoUrls`, `propertyImageUrls` → Append new files
- Other fields → Replace existing file

---

### 6. Permission System

#### Two User Roles

1. **Admin**
   - `isAdmin: true` in Firestore
   - Full CRUD access
   - Can upload/delete any document
   - Can create projects and seasons

2. **Landowner**
   - `isAdmin: false` (or field missing)
   - Read access to OWN projects only
   - Can upload draft maps and photos
   - Can add comments
   - CANNOT delete documents

#### Permission Checks in Controllers

**Pattern:**
```javascript
if (req.user && !req.user.admin) {
    // Landowner - verify ownership
    const landownerProjects = await airtableService.findAllProjectsByEmail(req.user.email);
    const hasAccess = landownerProjects.some(p => p.id === recordId);
    if (!hasAccess) {
        return res.status(403).json({ message: "Access denied" });
    }
}
```

**Email Matching:**
- Landowner email in JWT token (`req.user.email`)
- Project email field in Airtable (`project.email`)
- Case-insensitive, trimmed comparison
- Supports multiple projects per email

---

## Troubleshooting

### Authentication Errors

**Issue:** `401 Unauthorized` on all requests
**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is valid JSON
- Check Firebase project matches frontend configuration
- Ensure token is sent in `Authorization: Bearer <token>` header

**Issue:** `500: Firebase admin is not initialized`
**Solution:** Verify service account JSON is properly formatted (must be valid JSON string)

---

### File Upload Failures

**Issue:** `500: Cloudinary is not configured`
**Solution:** Set `CLOUDINARY_URL` or individual credentials in `.env`

**Issue:** Uploads succeed but files don't appear in Airtable
**Solution:**
- Check Airtable field names match `DOCUMENT_FIELD_MAP`
- Ensure URL is publicly accessible
- Increase `AIRTABLE_ATTACHMENT_HOST_WAIT_MS` for slow connections

**Issue:** Cloudinary files not deleted (accumulating storage)
**Solution:**
- Verify Cloudinary credentials have delete permissions
- Check server doesn't restart during cleanup timeout period
- Consider implementing webhook-based cleanup

---

### Airtable Errors

**Issue:** `404: Table not found`
**Solution:** Verify `AIRTABLE_TABLE_ID` matches table in base

**Issue:** `422: Invalid value for column`
**Solution:**
- Check field types in Airtable (text, number, date, etc.)
- Verify `FIELD_MAP` has correct field names
- Use `typecast: true` in Airtable operations (already enabled)

**Issue:** Season addition/deletion fails with Metadata API error
**Solution:**
- Ensure PAT has `schema.bases:write` scope
- Check field ID is correct (`AIRTABLE_SEASON_FIELD_ID`)
- Verify season field type is `singleSelect`

---

### Schema Changes

**Adding a New Field:**

1. Add to Airtable table
2. Update `FIELD_DEFINITIONS` in `airtableService.js`:
   ```javascript
   { api: 'newField', airtable: 'New Field Name' }
   ```
3. If attachment field, add to `DOCUMENT_FIELD_MAP`
4. Update API documentation
5. Restart server

**Renaming a Field:**

1. Update `airtable` key in `FIELD_DEFINITIONS`
2. Keep `api` key unchanged (maintains API compatibility)
3. Restart server