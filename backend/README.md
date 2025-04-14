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
