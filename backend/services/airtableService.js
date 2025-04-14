// services/airtableService.js
require('dotenv').config();
const Airtable = require('airtable');
const axios = require('axios'); // For Metadata API calls

// --- Configuration ---
const {
    AIRTABLE_PAT,
    AIRTABLE_BASE_ID,
    AIRTABLE_TABLE_ID,
    AIRTABLE_SEASON_FIELD_ID, // Still useful for getAllSeasons
    AIRTABLE_API_URL
} = process.env;

// Configure Airtable client FOR DATA API
Airtable.configure({
    endpointUrl: AIRTABLE_API_URL,
    apiKey: AIRTABLE_PAT
});

const base = Airtable.base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_ID);

// --- Helper for Metadata API Calls ---
const metadataApi = axios.create({
    baseURL: `${AIRTABLE_API_URL}/v0/meta/bases/${AIRTABLE_BASE_ID}`,
    headers: {
        'Authorization': `Bearer ${AIRTABLE_PAT}`
    }
});

// --- Field Mappings (Keep as is, used by other functions) ---
const FIELD_MAP = {
    // Input: API Key -> Output: Airtable Field Name or ID
    apiToAirtable: {
        title: 'UniqueID', // Or map to a more appropriate title field if UniqueID isn't it
        ownerFirstName: 'Owner First Name or Organization',
        ownerLastName: 'Owner Last Name or Site Name', // Used for display name
        address: 'Property Address',
        plantingDate: 'Planting Date', // Or Application Date? Choose the most relevant date
        phone: 'Primary Phone Number',
        email: 'Email',
        season: 'Season', // Field name for filtering/creating
        city: 'City',
        zipCode: 'Zip Code',
        county: 'County',
        propertyId: 'Property ID Number(s)',
        status: 'Current Status',
        landRegion: 'Land Region',
        contactDate: 'Contact Date',
        consultationDate: 'Consultation Date',
        flaggingDate: 'Flagging Date',
        applicationDate: 'Application Date',
        siteNumber: 'Site Number', // **Added Site Number for UniqueID**
        // Add other fields you want to create/update
        initialMap: 'Initial Map', // Attachment field example
        draftMap: 'Draft Map',
        finalMap: 'Final Map',
        plantingPhotos: 'Planting Photos',
        participationStatus: 'Participation status',
    },
    // Input: Airtable Field Name or ID -> Output: API Key
    airtableToApi: {
        'UniqueID': 'uniqueId', // Primary key, good to have
        'Owner Last Name or Site Name': 'ownerDisplayName', // Combine first/last if needed
        'Owner First Name or Organization': 'ownerFirstName',
        'Property Address': 'address',
        'Planting Date': 'plantingDate',
        'Application Date': 'applicationDate',
        //'Description of property and condition of riparian/floodplain area (by applicant)': 'description',
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
        'Site Number': 'siteNumber', // **Added Site Number for UniqueID**
        'Participation status': 'participationStatus',
    }
};

// --- Helper Function to Process Records (Keep as is) ---
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

// --- Keep getAllSeasons (uses Metadata API) ---
const getAllSeasons = async () => {
    try {
        console.log(`Fetching metadata via /tables for table ${AIRTABLE_TABLE_ID} to get seasons`);
        const response = await metadataApi.get(`/tables`); // Gets all tables
        const tablesData = response.data.tables;

        const targetTable = tablesData.find(t => t.id === AIRTABLE_TABLE_ID);
        if (!targetTable) {
            // Try finding by name if ID fails (less reliable)
            const tableByName = tablesData.find(t => t.name === "Application, status, and GIS data");
            if (!tableByName) {
                throw new Error(`Table with ID ${AIRTABLE_TABLE_ID} or name 'Application, status, and GIS data' not found in metadata.`);
            }
            console.warn(`Warning: Found table by name, configured ID ${AIRTABLE_TABLE_ID} might be incorrect.`);
            // If you want to proceed using the name match, uncomment below
            // targetTable = tableByName;
            // else { // If still not found
            //throw new Error(`Table with ID ${AIRTABLE_TABLE_ID} or name 'Application, status, and GIS data' not found in metadata.`);
            //}
        }


        const seasonField = targetTable.fields.find(f => f.id === AIRTABLE_SEASON_FIELD_ID || f.name === 'Season'); // Find field by ID or Name
        if (!seasonField) {
            throw new Error(`'Season' field (ID: ${AIRTABLE_SEASON_FIELD_ID} or name 'Season') not found in table ${targetTable.id}.`);
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


// --- Keep getProjectsBySeason (uses Data API) ---
const getProjectsBySeason = async (season) => {
    return new Promise((resolve, reject) => {
        const projects = [];
        // Select fields needed for list view - update based on your FIELD_MAP.airtableToApi
        const fieldsToSelect = Object.keys(FIELD_MAP.airtableToApi); // Select all mapped fields for simplicity or curate as before

        console.log(`Fetching projects for season: ${season}`); // Removed long fields list log

        table.select({
            // maxRecords: 100, // Consider pagination for large bases
            view: "All status and property notes", // Optional: Use a specific view if pre-filtered/sorted
            filterByFormula: `{Season} = '${season}'`, // Ensure 'Season' is the correct field name
            fields: fieldsToSelect // Only fetch necessary fields
        }).eachPage(
            (records, fetchNextPage) => {
                records.forEach((record) => {
                    // Skip dummy records if they somehow persist
                    if (record.get('Owner Last Name or Site Name') !== '--- SEASON DUMMY RECORD ---') {
                        projects.push(processRecord(record));
                    }
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

// --- Keep getProjectDetails (uses Data API) ---
const getProjectDetails = async (recordId) => {
    try {
        console.log(`Fetching details for record: ${recordId}`);
        const record = await table.find(recordId);
        if (!record) {
            throw new Error('Project not found.');
        }
        // Optional: Check if it's the dummy record before processing
        if (record.get('Owner Last Name or Site Name') === '--- SEASON DUMMY RECORD ---') {
            console.warn(`Attempted to fetch details for a dummy record: ${recordId}`);
            throw new Error('Project not found.'); // Treat dummy as not found
        }
        return processRecord(record);
    } catch (error) {
        console.error(`Error fetching project details for ${recordId}:`, error);
        if (error.message && error.message.includes('NOT_FOUND')) {
            throw new Error('Project not found.');
        }
        throw new Error(`Failed to fetch project details: ${error.message}`);
    }
};

/**
 * Attempts to add a new season option by creating and deleting a dummy record.
 * Requires 'data.records:write' scope for the PAT.
 */
const addSeasonOption = async (newSeasonName) => {
    let dummyRecordId = null;
    try {
        console.log(`Attempting to add season '${newSeasonName}' via dummy record workaround...`);

        // Define fields for the dummy record. Include MINIMUM required fields.
        // **Crucially, include fields needed for the UniqueID formula**
        const dummyRecordFields = {
            // The new season name is the key part
            [FIELD_MAP.apiToAirtable.season || 'Season']: newSeasonName,

            // Placeholders for fields required by UniqueID formula or table rules
            [FIELD_MAP.apiToAirtable.ownerLastName || 'Owner Last Name or Site Name']: '--- SEASON DUMMY RECORD ---',
            [FIELD_MAP.apiToAirtable.propertyId || 'Property ID Number(s)']: 'DUMMY',
            [FIELD_MAP.apiToAirtable.siteNumber || 'Site Number']: 0, // Or another placeholder number

            // Add any other fields marked as REQUIRED in your Airtable table settings
            [FIELD_MAP.apiToAirtable.address || 'Property Address']: '--- DO NOT USE ---', // Likely required
            // Intentionally omit description and other non-essential fields
        };

        console.log('Creating dummy record with fields:', dummyRecordFields);

        // Create the dummy record
        const createdRecords = await table.create([{ fields: dummyRecordFields }], { typecast: true });

        if (!createdRecords || createdRecords.length === 0) {
            throw new Error('Dummy record creation failed, no record returned.');
        }
        dummyRecordId = createdRecords[0].id;
        console.log(`Successfully created dummy record ID: ${dummyRecordId} for season '${newSeasonName}'`);

        // Immediately delete the dummy record
        console.log(`Deleting dummy record ID: ${dummyRecordId}`);
        const deletedRecord = await table.destroy(dummyRecordId);

        // Check if deletion was successful (optional, destroy returns the deleted record)
        if (deletedRecord?.id !== dummyRecordId) {
            console.warn(`Potential issue deleting dummy record ${dummyRecordId}. Manual check may be needed.`);
        } else {
            console.log(`Successfully deleted dummy record ID: ${dummyRecordId}`);
        }

        return { message: `Season option '${newSeasonName}' potentially added via dummy record. Please verify in Airtable UI.` };

    } catch (error) {
        console.error(`Error in dummy record workaround for season '${newSeasonName}':`, error);

        // Attempt to clean up the dummy record if creation succeeded but deletion failed
        if (dummyRecordId) {
            console.warn(`Attempting cleanup: Deleting potentially orphaned dummy record ${dummyRecordId}`);
            try {
                await table.destroy(dummyRecordId);
                console.log(`Cleanup successful for dummy record ${dummyRecordId}`);
            } catch (cleanupError) {
                console.error(`Cleanup failed for dummy record ${dummyRecordId}:`, cleanupError);
                // Log this prominently - requires manual deletion in Airtable
                console.error(`!!! MANUAL ACTION REQUIRED: Delete dummy record ${dummyRecordId} in Airtable !!!`);
            }
        }
        // Rethrow a user-friendly error
        const errMsg = error.message || 'Unknown error during season add workaround.';
        if (errMsg.includes('INVALID_VALUE_FOR_COLUMN')) {
            throw new Error(`Failed to add season: Invalid value for a required field in dummy record. ${errMsg}`);
        }
        if (errMsg.includes('INVALID_MULTIPLE_CHOICE_OPTION')) { // Or similar for select
            throw new Error(`Failed to add season: '${newSeasonName}' might already exist or is invalid. ${errMsg}`);
        }
        throw new Error(`Failed to add season option using workaround: ${errMsg}`);
    }
};


// --- Keep addProject (uses Data API) ---
const addProject = async (projectData) => {
    try {
        // 1. Map incoming API data to Airtable field names/IDs
        const airtableRecordData = {};
        for (const apiKey in projectData) {
            const airtableField = FIELD_MAP.apiToAirtable[apiKey];
            if (airtableField) {
                airtableRecordData[airtableField] = projectData[apiKey];
            } else if (apiKey === 'season') { // Handle season specifically if not directly mapped
                airtableRecordData[FIELD_MAP.apiToAirtable.season || 'Season'] = projectData.season;
            }
        }

        // Basic validation
        if (!airtableRecordData[FIELD_MAP.apiToAirtable.season || 'Season']) {
            throw new Error("Season is required to add a project.");
        }
        // Ensure fields needed for UniqueID are present if creating
        if (!airtableRecordData[FIELD_MAP.apiToAirtable.ownerLastName || 'Owner Last Name or Site Name']) {
            throw new Error("Owner Last Name/Site Name is required.");
        }
        if (!airtableRecordData[FIELD_MAP.apiToAirtable.propertyId || 'Property ID Number(s)']) {
            console.warn("Warning: 'Property ID Number(s)' is missing, UniqueID may not calculate correctly.");
            // Consider throwing error if it's strictly required for UniqueID:
            // throw new Error("Property ID Number(s) is required.");
        }
        if (airtableRecordData[FIELD_MAP.apiToAirtable.siteNumber || 'Site Number'] === undefined) { // Check for undefined specifically
            console.warn("Warning: 'Site Number' is missing, UniqueID may not calculate correctly.");
            // Consider throwing error if it's strictly required for UniqueID:
            // throw new Error("Site Number is required.");
        }
        // Add other required field checks as needed based on Airtable UI
        if (!airtableRecordData[FIELD_MAP.apiToAirtable.address || 'Property Address']) {
            throw new Error("Property Address is required."); // Example check
        }


        console.log('Creating Airtable record with data:', airtableRecordData);

        // 2. Use the Airtable client to create the record
        const createdRecords = await table.create([{ fields: airtableRecordData }], { typecast: true });

        if (!createdRecords || createdRecords.length === 0) {
            throw new Error('Record creation failed, no record returned.');
        }

        console.log(`Successfully created record ID: ${createdRecords[0].id}`);
        // 3. Return the newly created record (processed)
        return processRecord(createdRecords[0]);

    } catch (error) {
        console.error('Error adding project:', error);
        const errMsg = error.message || 'Failed to add project.';
        if (errMsg.includes('UNKNOWN_FIELD_NAME')) {
            throw new Error(`Failed to add project: Invalid field name provided. Check FIELD_MAP. ${errMsg}`);
        }
        if (errMsg.includes('INVALID_VALUE_FOR_COLUMN')) {
            throw new Error(`Failed to add project: Invalid value for a field. ${errMsg}`);
        }
        if (errMsg.includes('REQUIRED_FIELD_MISSING')) { // Common Airtable error type
            throw new Error(`Failed to add project: A required field is missing. ${errMsg}`);
        }
        throw new Error(`Failed to add project: ${errMsg}`);
    }
};


// --- Exports ---
module.exports = {
    getAllSeasons,
    getProjectsBySeason,
    getProjectDetails,
    addSeasonOption, // Export the new workaround function
    addProject,
};
