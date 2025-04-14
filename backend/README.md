# Welcome to the backend
Run `node index.js` to start the server


How to Use the API Endpoints:
- Get All Seasons: `GET http://localhost:3001/api/seasons`
- Get Projects for Season '24-25': `GET http://localhost:3001/api/projects/season/24-25`
- Get Details for Project with Record ID 'recXXXXXXXXXXXXXX': `GET http://localhost:3001/api/projects/details/recXXXXXXXXXXXXXX` (Replace with a real record ID)
- Add New Season Option '25-26': `POST http://localhost:3001/api/seasons`
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
Important Considerations
- PAT Scopes:
    - Reading data (GET requests): Requires data.records:read scope.
    - Creating/Updating records (POST /projects): Requires data.records:write scope.
    - Adding a season option (POST /seasons): Requires schema.bases:write scope (modifies table structure). Be careful with this one!
- Error Handling: The provided error handling is basic. You'll want to enhance it for production, potentially logging errors to a file or service.
- Field Mapping (FIELD_MAP): This is crucial. Double-check that the Airtable field names/IDs in services/airtableService.js exactly match your base. Adjust the API keys (like ownerDisplayName, plantingDate) to what makes sense for your frontend/API contract.
- Attachments: The processRecord function extracts the URL of the first attachment for most fields, and an array for specifically named fields like plantingPhotoUrls. Adjust this logic if you need different behavior. Creating records with attachments via the API requires providing an array of objects with url properties pointing to publicly accessible locations where Airtable can fetch the file.
- Security: Keep your .env file out of version control (.gitignore). Consider rate limiting and input validation for production APIs.
- "Folder" Concept: Remember that POST /api/seasons modifies the choices available in the "Season" field, it doesn't create a physical folder. Filtering by season (GET /api/projects/season/:season) is how you view projects "within" that conceptual folder.
- UniqueID Field: Your primary field UniqueID is a formula. You cannot set the value of a formula field when creating a record. Airtable calculates it automatically based on the fields it references (fldG5fMU5zBDDNCVg, fldwz14Kb3oKYSg4l, fldpTIED5r4n8Ks03). Ensure you provide values for those fields when creating a project. I've mapped ownerLastName to fldG5fMU5zBDDNCVg and propertyId to fldwz14Kb3oKYSg4l. You'll also need to map and provide data for fldpTIED5r4n8Ks03 ("Site Number") when creating a project for the UniqueID to calculate correctly.
