// services/airtableService.js
require('dotenv').config();
const Airtable = require('airtable');
const axios = require('axios'); // For Metadata API calls

// --- Configuration ---
const {
    AIRTABLE_PAT,
    AIRTABLE_BASE_ID,
    AIRTABLE_TABLE_ID,
    AIRTABLE_SEASON_FIELD_ID,
    AIRTABLE_API_URL
} = process.env;

// Configure Airtable client FOR DATA API
Airtable.configure({
    endpointUrl: AIRTABLE_API_URL, // Usually https://api.airtable.com
    apiKey: AIRTABLE_PAT // Use PAT as the API key
});

const base = Airtable.base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_ID); // Reference the specific table by ID

// --- Helper for Metadata API Calls ---
const metadataApi = axios.create({
    baseURL: `${AIRTABLE_API_URL}/v0/meta/bases/${AIRTABLE_BASE_ID}`,
    headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`
    }
});

// --- Field Mappings (Airtable Field Name/ID -> Desired API JSON Key) ---
// Adjust these based on EXACT field names/IDs in your base and desired output
const FIELD_MAP = {
    // Input: API Key -> Output: Airtable Field Name or ID
    apiToAirtable: {
        title: 'UniqueID', // Or map to a more appropriate title field if UniqueID isn't it
        ownerFirstName: 'Owner First Name or Organization',
        ownerLastName: 'Owner Last Name or Site Name', // Used for display name
        address: 'Property Address',
        date: 'Planting Date', // Or Application Date? Choose the most relevant date
        description: 'Description of property and condition of riparian/floodplain area (by applicant)',
        season: 'Season', // Field name for filtering/creating
        city: 'City',
        zipCode: 'Zip Code',
        propertyId: 'Property ID Number(s)',
        status: 'Current Status',
        landRegion: 'Land Region',
        contactDate: 'Contact Date',
        consultationDate: 'Consultation Date',
        flaggingDate: 'Flagging Date',
        // Add other fields you want to create/update
        initialMap: 'Initial Map', // Attachment field example
        draftMap: 'Draft Map',
        finalMap: 'Final Map',
        plantingPhotos: 'Planting Photos',
    },
    // Input: Airtable Field Name or ID -> Output: API Key
    airtableToApi: {
        'UniqueID': 'uniqueId', // Primary key, good to have
        'Owner Last Name or Site Name': 'ownerDisplayName', // Combine first/last if needed
        'Owner First Name or Organization': 'ownerFirstName',
        'Property Address': 'address',
        'Planting Date': 'plantingDate',
        'Application Date': 'applicationDate',
        'Description of property and condition of riparian/floodplain area (by applicant)': 'description',
        'Current Status': 'status',
        'Season': 'season',
        'City': 'city',
        'Zip Code': 'zipCode',
        'Property ID Number(s)': 'propertyId',
        'County': 'county',
        'Total Acres': 'totalAcres',
        'Total Trees': 'totalTrees',
        'Primary Phone Number': 'phone',
        'Email': 'email',
        // Map attachment fields - we'll extract the URL
        'Initial Map': 'initialMapUrl',
        'Draft Map': 'draftMapUrl',
        'Final Map': 'finalMapUrl',
        'Planting Photos': 'plantingPhotoUrls', // Can be multiple
        'Before Photos': 'beforePhotoUrls',
        // Add any other fields you want returned by GetProjectDetails
        'Land Region': 'landRegion',
        'Contact Date': 'contactDate',
        'Consultation Date': 'consultationDate',
        'Flagging Date': 'flaggingDate',
    }
};

// --- Helper Function to Process Records ---
const processRecord = (record) => {
    const processed = { id: record.id }; // Always include the Airtable record ID
    for (const airtableField in FIELD_MAP.airtableToApi) {
        const apiKey = FIELD_MAP.airtableToApi[airtableField];
        const value = record.get(airtableField);

        if (value !== undefined) {
            // Handle attachments specifically: extract URL(s)
            if (Array.isArray(value) && value[0]?.url) { // Check if it looks like an attachment array
                if (value.length === 1) {
                    // If only one attachment, return just the URL (unless it's a designated multi-photo field)
                    if (['plantingPhotoUrls', 'beforePhotoUrls'].includes(apiKey)) {
                        processed[apiKey] = value.map(att => att.url);
                    } else {
                        processed[apiKey] = value[0].url;
                    }
                } else {
                    // If multiple attachments, return array of URLs
                    processed[apiKey] = value.map(att => att.url);
                }
            } else {
                processed[apiKey] = value;
            }
        }
    }
    // Combine owner names if desired
    if (processed.ownerFirstName || processed.ownerDisplayName) {
        processed.ownerFullName = [processed.ownerFirstName, processed.ownerDisplayName].filter(Boolean).join(' ').trim();
    }
    return processed;
};


// --- Service Functions ---

/**
 * Fetches the available choices from the 'Season' single-select field.
 */
//const getAllSeasons = async () => {
//    try {
//        console.log(`Fetching metadata for table ${AIRTABLE_TABLE_ID}`);
//        const response = await metadataApi.get(`/tables`); // Gets all tables, easier than finding field directly sometimes
//        const tablesData = response.data.tables;
//
//        const targetTable = tablesData.find(t => t.id === AIRTABLE_TABLE_ID || t.name === "Application, status, and GIS data"); // Find by ID or Name
//        if (!targetTable) {
//            throw new Error(`Table with ID ${AIRTABLE_TABLE_ID} not found in metadata.`);
//        }
//
//        const seasonField = targetTable.fields.find(f => f.id === AIRTABLE_SEASON_FIELD_ID || f.name === 'Season'); // Find field by ID or Name
//        if (!seasonField || seasonField.type !== 'singleSelect') {
//            throw new Error(`'Season' field (ID: ${AIRTABLE_SEASON_FIELD_ID}) not found or is not a singleSelect.`);
//        }
//
//        const choices = seasonField.options?.choices?.map(choice => choice.name) || [];
//        console.log(`Found Seasons: ${choices.join(', ')}`);
//        return choices;
//    } catch (error) {
//        console.error('Error fetching seasons from metadata:', error.response?.data || error.message);
//        throw new Error(`Failed to fetch seasons: ${error.message}`); // Re-throw for controller
//    }
//};

const getAllSeasons = async () => {
    try {
        console.log(`Fetching metadata via /tables for table ${AIRTABLE_TABLE_ID} to get seasons`);
        const response = await metadataApi.get(`/tables`); // Gets all tables
        const tablesData = response.data.tables;

        const targetTable = tablesData.find(t => t.id === AIRTABLE_TABLE_ID);
        if (!targetTable) {
            throw new Error(`Table with ID ${AIRTABLE_TABLE_ID} not found in metadata.`);
        }

        const seasonField = targetTable.fields.find(f => f.id === AIRTABLE_SEASON_FIELD_ID || f.name === 'Season'); // Find field by ID or Name
        if (!seasonField) {
            throw new Error(`'Season' field (ID: ${AIRTABLE_SEASON_FIELD_ID} or name 'Season') not found in table ${AIRTABLE_TABLE_ID}.`);
        }
        if (seasonField.type !== 'singleSelect') {
            throw new Error(`'Season' field (ID: ${seasonField.id}) is not a singleSelect.`);
        }

        const choices = seasonField.options?.choices?.map(choice => choice.name) || [];
        console.log(`Found Seasons: ${choices.join(', ')}`);
        return choices;
    } catch (error) {
        console.error('Error fetching seasons from metadata (/tables):', error.response?.data || error.message);
        throw new Error(`Failed to fetch seasons: ${error.message}`); // Re-throw for controller
    }
};

/**
 * Fetches projects (records) filtered by a specific season.
 */
const getProjectsBySeason = async (season) => {
    return new Promise((resolve, reject) => {
        const projects = [];
        // Only select fields that are needed for the list view
        const fieldsToSelect = Object.keys(FIELD_MAP.airtableToApi).filter(fName => [
            'UniqueID',
            'Owner First Name or Organization',
            'Owner Last Name or Site Name',
            'Primary Phone Number',
            'Email',
            'Property Address',
            'City',
            'Zip Code',
            'Property ID Number(s)',
            'Land Region',
            'County',
            'Application Date',
            'Contact Date',
            'Planting Date', // Or another relevant date
            'Consultation Date',
            'Flagging Date',
            'Season', // Needed for verification, though filtered
            'Initial Map', // Get first map for preview
            'Planting Photos', // Get first photo for preview
        ].includes(fName));

        console.log(`Fetching projects for season: ${season} with fields: ${fieldsToSelect.join(', ')}`);

        table.select({
            // maxRecords: 100, // Consider pagination for large bases
            view: "All status and property notes", // Optional: Use a specific view if pre-filtered/sorted
            filterByFormula: `{Season} = '${season}'`, // Ensure 'Season' is the correct field name
            fields: fieldsToSelect // Only fetch necessary fields
        }).eachPage(
            (records, fetchNextPage) => {
                records.forEach((record) => {
                    projects.push(processRecord(record)); // Use helper to format
                });
                fetchNextPage(); // IMPORTANT: Call this to get the next page
            },
            (err) => {
                if (err) {
                    console.error('Error fetching projects by season:', err);
                    return reject(new Error(`Failed to fetch projects for season ${season}: ${err.message}`));
                }
                console.log(`Found ${projects.length} projects for season ${season}`);
                resolve(projects); // Resolve the promise when done
            }
        );
    });
};

/**
 * Fetches detailed information for a single project by its Airtable record ID.
 */
const getProjectDetails = async (recordId) => {
    try {
        console.log(`Fetching details for record: ${recordId}`);
        const record = await table.find(recordId);
        if (!record) {
            throw new Error('Project not found.'); // Or return null? Depends on desired API behavior
        }
        return processRecord(record); // Use helper to format
    } catch (error) {
        console.error(`Error fetching project details for ${recordId}:`, error);
        // Handle Airtable's specific "NOT_FOUND" error
        if (error.message && error.message.includes('NOT_FOUND')) {
            throw new Error('Project not found.'); // Throw a clearer error for the controller
        }
        throw new Error(`Failed to fetch project details: ${error.message}`);
    }
};

/**
 * Adds a new option (like '25-26') to the 'Season' single-select field choices.
 * NOTE: This uses the METADATA API and is more complex/potentially disruptive.
 *       Requires 'schema.bases:write' scope for the PAT.
 */
//const addSeasonOption = async (newSeasonName) => {
//    if (!AIRTABLE_SEASON_FIELD_ID) {
//        throw new Error("AIRTABLE_SEASON_FIELD_ID is not configured in .env");
//    }
//    try {
//        console.log(`Attempting to add season option: ${newSeasonName}`);
//
//        // 1. Get current field definition
//        console.log(`Fetching current options for field ${AIRTABLE_SEASON_FIELD_ID}`);
//        console.log("--------HERE!!!!");
//        const fieldGetResponse = await metadataApi.get(`/tables/${AIRTABLE_TABLE_ID}/fields/${AIRTABLE_SEASON_FIELD_ID}`);
//        console.log("--------HERE222222!!!!");
//        const currentField = fieldGetResponse.data;
//
//
//        if (currentField.type !== 'singleSelect') {
//            throw new Error(`Field ${AIRTABLE_SEASON_FIELD_ID} is not a singleSelect field.`);
//        }
//
//        const currentChoices = currentField.options?.choices || [];
//
//        // 2. Check if option already exists
//        if (currentChoices.some(choice => choice.name === newSeasonName)) {
//            console.log(`Season option "${newSeasonName}" already exists.`);
//            return { message: `Season option "${newSeasonName}" already exists.` }; // Or throw error? Indicate success?
//        }
//
//        // 3. Prepare new choices array
//        const newChoices = [
//            ...currentChoices,
//            { name: newSeasonName } // Airtable usually assigns ID and color automatically on PATCH
//            // If you needed to specify color: { name: newSeasonName, color: 'blueLight2' }
//        ];
//
//        // 4. PATCH the field with the updated options
//        console.log(`Patching field ${AIRTABLE_SEASON_FIELD_ID} with new choices...`);
//        const patchPayload = {
//            // id: AIRTABLE_SEASON_FIELD_ID, // ID not needed in payload usually
//            name: currentField.name, // Best practice to include name
//            description: currentField.description || null, // Include description if it exists
//            type: 'singleSelect', // Must specify type
//            options: { // Must send the *entire* options object
//                choices: newChoices
//            }
//        };
//
//        const patchResponse = await metadataApi.patch(`/tables/${AIRTABLE_TABLE_ID}/fields/${AIRTABLE_SEASON_FIELD_ID}`, patchPayload);
//
//        console.log(`Successfully added season option: ${newSeasonName}`);
//        return patchResponse.data; // Return the updated field definition
//
//    } catch (error) {
//        console.error('Error adding season option:', error.response?.data || error.message);
//        const errMsg = error.response?.data?.error?.message || error.message;
//        // Check for permission errors
//        if (errMsg.includes('update field')) {
//            throw new Error(`Failed to add season option: Permission denied. Ensure PAT has 'schema.bases:write' scope.`);
//        }
//        throw new Error(`Failed to add season option: ${errMsg}`);
//    }
//};

/**
 * Adds a new option (like '25-26') to the 'Season' single-select field choices.
 * NOTE: This uses the METADATA API and modifies the schema.
 *       Requires PAT scope 'schema.bases:write' for the PATCH operation.
 *       Uses the /tables endpoint to retrieve current field options as an alternative.
 */
const addSeasonOption = async (newSeasonName) => {
    if (!AIRTABLE_SEASON_FIELD_ID) {
        throw new Error("AIRTABLE_SEASON_FIELD_ID is not configured in .env");
    }
    if (!AIRTABLE_TABLE_ID) {
        throw new Error("AIRTABLE_TABLE_ID is not configured in .env");
    }

    try {
        console.log(`Attempting to add season option: ${newSeasonName}`);

        // 1. Get current table schemas for the base
        console.log(`Fetching table schemas for base ${AIRTABLE_BASE_ID}...`);
        const tablesResponse = await metadataApi.get(`/tables`);
        const tablesData = tablesResponse.data.tables;

        // 2. Find the target table
        const targetTable = tablesData.find(t => t.id === AIRTABLE_TABLE_ID);
        if (!targetTable) {
            throw new Error(`Table with ID ${AIRTABLE_TABLE_ID} not found in base metadata.`);
        }

        // 3. Find the target field within the table schema
        // services/airtableService.js
        // ... inside addSeasonOption function ...

        // 3. Find the target field within the table schema
        let currentField = targetTable.fields.find(f => f.id === AIRTABLE_SEASON_FIELD_ID); // Use 'let' so we can potentially reassign

        if (!currentField) {
            // If not found by ID, try finding by name as a fallback
            console.log(`Field with ID ${AIRTABLE_SEASON_FIELD_ID} not found, trying by name 'Season'...`);
            const fieldByName = targetTable.fields.find(f => f.name === 'Season');

            if (!fieldByName) {
                // If still not found even by name, throw the error
                throw new Error(`Field with ID ${AIRTABLE_SEASON_FIELD_ID} (or name 'Season') not found in table ${AIRTABLE_TABLE_ID}.`);
            } else {
                // If found by name, log a warning and use this field object
                console.warn(`Warning: Found 'Season' field by name, but configured ID ${AIRTABLE_SEASON_FIELD_ID} might be incorrect. Using field ID: ${fieldByName.id}`);
                currentField = fieldByName; // Assign the field found by name to currentField
                // Consider updating AIRTABLE_SEASON_FIELD_ID in memory if needed, though usually not necessary here
                // AIRTABLE_SEASON_FIELD_ID = fieldByName.id;
            }
        }

        // Now continue checks using the potentially reassigned currentField
        if (!currentField) {
            // This check is now redundant due to the throw above, but safe to keep
            throw new Error(`Could not identify the 'Season' field in table ${AIRTABLE_TABLE_ID}.`);
        }

        if (currentField.type !== 'singleSelect') {
            throw new Error(`Field ${currentField.name} (ID: ${currentField.id}) is not a singleSelect field.`);
        }

        const currentChoices = currentField.options?.choices || [];
        console.log(`Current choices for '${currentField.name}':`, currentChoices.map(c => c.name).join(', '));

        // services/airtableService.js
        // ... inside addSeasonOption function, after finding currentField and currentChoices ...

        // 4. Check if option already exists
        if (currentChoices.some(choice => choice.name === newSeasonName)) {
            console.log(`Season option "${newSeasonName}" already exists.`);
            return { message: `Season option "${newSeasonName}" already exists.`, field: currentField };
        }

        // 5. Prepare new choices array - **KEEP NAME/COLOR FOR EXISTING (NO ID), ADD NEW WITH NAME/COLOR**
        const newChoicesPayload = currentChoices.map(choice => ({
            name: choice.name,      // Keep name
            color: choice.color     // Keep color
            // DO NOT include choice.id here
        }));
        newChoicesPayload.push({ name: newSeasonName, color: 'blueLight2' }); // Add new with name and color

        // 6. PATCH the specific field endpoint - Include name, type, AND options (without existing IDs)
        console.log(`Patching field ${currentField.id} ('${currentField.name}') removing IDs from existing choices...`);
        const patchPayload = {
            name: currentField.name,         // Include the current field name
            type: 'singleSelect',            // Include the field type
            options: {
                choices: newChoicesPayload   // Use the array where existing choices lack 'id'
            }
            // description: currentField.description || undefined
        };

        // Construct the specific field URL for the PATCH request
        const fieldPatchUrl = `/tables/${AIRTABLE_TABLE_ID}/fields/${currentField.id}`;
        console.log("Attempting PATCH to:", metadataApi.defaults.baseURL + fieldPatchUrl);
        console.log("PATCH Payload:", JSON.stringify(patchPayload, null, 2));

        const patchResponse = await metadataApi.patch(fieldPatchUrl, patchPayload);

        console.log(`Successfully added season option: ${newSeasonName}`);
        return patchResponse.data; // Return the updated field definition

    } catch (error) {
        // ... keep existing catch block ...
        console.error('Error adding season option:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', error.response.headers);
            const errMsg = error.response?.data?.error?.message || error.response?.data?.error || `Request failed with status code ${error.response.status}`;
            if (error.response.status === 403 || (typeof errMsg === 'string' && (errMsg.includes('permission') || errMsg.includes('update field')))) {
                throw new Error(`Failed to update season option: Permission denied. Ensure PAT has 'schema.bases:write' scope.`);
            }
            if (error.response.status === 404) {
                throw new Error(`Failed to update season option: Field or Table not found (404). Check IDs used for PATCH: Table=${AIRTABLE_TABLE_ID}, Field=${currentField?.id || AIRTABLE_SEASON_FIELD_ID}`);
            }
            if (error.response.status === 422) {
                throw new Error(`Failed to update season option: Invalid payload structure or data (422). ${errMsg}`);
            }
            throw new Error(`Failed to add season option: ${errMsg}`);
        } else if (error.request) {
            console.error('Network Error: No response received from Airtable.');
            throw new Error('Failed to add season option: Network Error');
        } else {
            console.error('Request Setup Error:', error.message);
            throw new Error(`Failed to add season option: ${error.message}`);
        }
    }
};
//        // 4. Check if option already exists
//        if (currentChoices.some(choice => choice.name === newSeasonName)) {
//            console.log(`Season option "${newSeasonName}" already exists.`);
//            // Return the current field definition maybe? Or just a success message.
//            return { message: `Season option "${newSeasonName}" already exists.`, field: currentField };
//        }
//
//        // 5. Prepare new choices array
//        const newChoices = [
//            ...currentChoices,
//            { name: newSeasonName } // Airtable assigns ID and color automatically on PATCH
//        ];
//
//        // 6. PATCH the specific field endpoint with the updated options
//        // NOTE: We STILL use the specific field endpoint for the PATCH operation,
//        // as that's the correct way to update a single field's schema.
//        console.log(`Patching field ${currentField.id} ('${currentField.name}') with new choices...`);
//        const patchPayload = {
//            // id: currentField.id, // Usually not needed in payload
//            name: currentField.name, // Best practice to include name
//            description: currentField.description || undefined, // Include description if it exists, otherwise undefined (don't send null if it wasn't there)
//            type: 'singleSelect', // Must specify type
//            options: { // Must send the *entire* options object
//                choices: newChoices
//            }
//        };
//
//        // Construct the specific field URL for the PATCH request
//        const fieldPatchUrl = `/tables/${AIRTABLE_TABLE_ID}/fields/${currentField.id}`;
//        console.log("Attempting PATCH to:", metadataApi.defaults.baseURL + fieldPatchUrl);
//        console.log("PATCH Payload:", JSON.stringify(patchPayload, null, 2));
//
//
//        const patchResponse = await metadataApi.patch(fieldPatchUrl, patchPayload);
//
//        console.log(`Successfully added season option: ${newSeasonName}`);
//        return patchResponse.data; // Return the updated field definition
//
//    } catch (error) {
//        console.error('Error adding season option:');
//        if (error.response) {
//            console.error('Status:', error.response.status);
//            console.error('Data:', JSON.stringify(error.response.data, null, 2));
//            console.error('Headers:', error.response.headers);
//            const errMsg = error.response?.data?.error?.message || error.response?.data?.error || `Request failed with status code ${error.response.status}`;
//            // Check for permission errors specifically on the PATCH
//            if (error.response.status === 403 || (typeof errMsg === 'string' && (errMsg.includes('permission') || errMsg.includes('update field')))) {
//                throw new Error(`Failed to update season option: Permission denied. Ensure PAT has 'schema.bases:write' scope.`);
//            }
//            // Check for 404 on PATCH (could still mean ID issue)
//            if (error.response.status === 404) {
//                throw new Error(`Failed to update season option: Field or Table not found (404). Check IDs used for PATCH: Table=${AIRTABLE_TABLE_ID}, Field=${currentField?.id || AIRTABLE_SEASON_FIELD_ID}`);
//            }
//            // Handle validation errors (e.g., 422 Unprocessable Entity)
//            if (error.response.status === 422) {
//                throw new Error(`Failed to update season option: Invalid data (422). ${errMsg}`);
//            }
//            throw new Error(`Failed to add season option: ${errMsg}`);
//        } else if (error.request) {
//            console.error('Network Error: No response received from Airtable.');
//            throw new Error('Failed to add season option: Network Error');
//        } else {
//            console.error('Request Setup Error:', error.message);
//            throw new Error(`Failed to add season option: ${error.message}`);
//        }
//    }
//};


// --- Also update getAllSeasons to use the same logic ---


/**
 * Adds a new project (record) to the Airtable table.
 */
const addProject = async (projectData) => {
    try {
        // 1. Map incoming API data to Airtable field names/IDs
        const airtableRecordData = {};
        for (const apiKey in projectData) {
            const airtableField = FIELD_MAP.apiToAirtable[apiKey];
            if (airtableField) {
                // Basic validation/transformation could happen here
                // e.g., ensure dates are in correct format if needed
                airtableRecordData[airtableField] = projectData[apiKey];
            } else if (apiKey === 'season') { // Handle season specifically if not directly mapped
                airtableRecordData[FIELD_MAP.apiToAirtable.season || 'Season'] = projectData.season;
            }
        }

        // Basic validation
        if (!airtableRecordData[FIELD_MAP.apiToAirtable.season || 'Season']) {
            throw new Error("Season is required to add a project.");
        }
        if (!airtableRecordData[FIELD_MAP.apiToAirtable.ownerLastName || 'Owner Last Name or Site Name']) {
            throw new Error("Owner Last Name/Site Name is required.");
        }
        if (!airtableRecordData[FIELD_MAP.apiToAirtable.address || 'Property Address']) {
            throw new Error("Property Address is required.");
        }
        // Add more required field checks as needed

        console.log('Creating Airtable record with data:', airtableRecordData);

        // 2. Use the Airtable client to create the record
        // Airtable library expects an array of records, even for a single creation
        const createdRecords = await table.create([{ fields: airtableRecordData }], { typecast: true });
        // { typecast: true } attempts to automatically convert string values etc.

        if (!createdRecords || createdRecords.length === 0) {
            throw new Error('Record creation failed, no record returned.');
        }

        console.log(`Successfully created record ID: ${createdRecords[0].id}`);
        // 3. Return the newly created record (processed)
        return processRecord(createdRecords[0]);

    } catch (error) {
        console.error('Error adding project:', error);
        // Provide more specific error feedback if possible
        const errMsg = error.message || 'Failed to add project.';
        if (errMsg.includes('UNKNOWN_FIELD_NAME')) {
            throw new Error(`Failed to add project: Invalid field name provided. Check FIELD_MAP. ${errMsg}`);
        }
        if (errMsg.includes('INVALID_VALUE_FOR_COLUMN')) {
            throw new Error(`Failed to add project: Invalid value for a field. ${errMsg}`);
        }
        throw new Error(`Failed to add project: ${errMsg}`);
    }
};


//module.exports = {
//    getAllSeasons,
//    getProjectsBySeason,
//    getProjectDetails,
//    addSeasonOption,
//    addProject,
//};


// --- Make sure to export it ---
module.exports = {
    getAllSeasons, // Assuming this uses the same /tables logic now
    getProjectsBySeason,
    getProjectDetails,
    addSeasonOption, // Export the modified function
    addProject,
};
