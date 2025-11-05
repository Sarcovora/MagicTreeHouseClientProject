<!-- # Welcome to the backend
Run `node index.js` to start the server


How to Use the API Endpoints:
- Get All Seasons: `GET http://localhost:3000/api/seasons`
- Get Projects for Season '24-25': `GET http://localhost:3000/api/projects/season/24-25`
- Get Details for Project with Record ID 'recXXXXXXXXXXXXXX': `GET http://localhost:3000/api/projects/details/recXXXXXXXXXXXXXX` (Replace with a real record ID)
- Add New Season Option '25-26': `POST http://localhost:3000/api/seasons`
    - Request Body (JSON): `{ "seasonName": "25-26" }`
    - Requires PAT with `schema.bases:write scope`.
- Add New Project: `POST http://localhost:3000/api/projects`
    - Request Body (JSON - use keys defined in `FIELD_MAP.apiToAirtable`):
        ```json{
          "season": "24-25", // REQUIRED (or the correct field name from map)
          "ownerLastName": "Gupta", // REQUIRED (or the correct field name from map)
          "address": "21 Lane", // REQUIRED (or the correct field name from map)
          "ownerFirstName": "Drishti",
          "city": "Austin",
          "zipCode": "78701",
          "propertyId": "PID12345",
          "date": "2024-05-28", // Send dates in a format Airtable understands (YYYY-MM-DD often works)
          "description": "My awesome crib",
          "status": "Initial Contact (call/email)" // Use a valid choice name
        }
        ```
 -->

# Magic Tree House Backend

## Overview
The backend is a lightweight Node.js/Express service that exposes Airtable data to the frontend. It boots from `index.js`, loads configuration from `.env`, and uses a shared `FIELD_MAP` to translate between API field names and Airtable columns.

## How Requests Flow
- **Routes** (`backend/routes/airtableRoutes.js`): Declare Express endpoints for seasons, projects, and project details.
- **Controllers** (`backend/controllers/airtableController.js`): Validate input, call the service layer, and shape responses.
- **Services** (`backend/services/airtableService.js`): Handle Airtable queries and mutations using the Personal Access Token (PAT) and base/endpoint IDs.
- **Utilities**: Shared helpers (e.g., field mapping) ensure consistent naming across the API and Airtable.

## Environment & Startup
1. Create `backend/.env` with Airtable credentials (`AIRTABLE_PAT`, base IDs, table names, etc.).
2. Install dependencies (`npm install`) if needed.
3. Run `node server.js` while in the backend folder.

## Documentation Map
- `backend/API_DOCUMENTATION.md`: Authoritative reference for all backend endpoints, including payloads, query parameters, and sample responses.
- `documentation/FRONTEND_API_GUIDE.md`: Frontend-oriented usage notes and integration examples for consuming the backend.
- `documentation/MIGRATION_GUIDE.md`: Steps for evolving Airtable schema and updating field mappings without breaking the API.
- `CHANGELOG.md`: Release history and notable backend changes.

Refer to these docs before extending routes, adjusting Airtable schemas, or updating clients.
