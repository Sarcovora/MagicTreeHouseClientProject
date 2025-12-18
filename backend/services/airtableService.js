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

const DEFAULT_AIRTABLE_API_HOST = 'https://api.airtable.com';
const resolveAirtableHost = (rawUrl) => {
    if (!rawUrl) {
        return DEFAULT_AIRTABLE_API_HOST;
    }
    try {
        return new URL(rawUrl).origin;
    } catch (error) {
        console.warn(`Invalid AIRTABLE_API_URL "${rawUrl}", falling back to ${DEFAULT_AIRTABLE_API_HOST}`);
        return DEFAULT_AIRTABLE_API_HOST;
    }
};

const airtableApiHost = resolveAirtableHost(AIRTABLE_API_URL);

// Configure Airtable client FOR DATA API
Airtable.configure({
    endpointUrl: airtableApiHost,
    apiKey: AIRTABLE_PAT
});

const base = Airtable.base(AIRTABLE_BASE_ID);
const table = base(AIRTABLE_TABLE_ID);

// --- Metadata API client ---
// Airtable Metadata API base URL: https://api.airtable.com/v0/meta/bases/{baseId}
const metadataApi = axios.create({
    baseURL: `${airtableApiHost}/v0/meta/bases/${AIRTABLE_BASE_ID}`,
    timeout: 20000,
    headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
    },
});

// --- Helper for Metadata API Calls ---
const resolveAttachmentFieldName = async (documentType) => {
    const preferred = DOCUMENT_FIELD_MAP[documentType];
    if (!preferred) {
        throw createServiceError(`Unsupported document type '${documentType}'.`, 400);
    }
    return preferred;
};

// --- Field Mappings (Keep as is, used by other functions) ---
const FIELD_MAP = {
    // Input: API Key -> Output: Airtable Field Name or ID
    apiToAirtable: {
        title: 'UniqueID',
        ownerFirstName: 'Owner First Name or Organization',
        ownerLastName: 'Owner Last Name or Site Name', // Used for display name
        address: 'Property Address',
        plantingDate: 'Planting Date',
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
        siteNumber: 'Site Number',
        wetlandAcres: 'Wetland Acres',
        uplandAcres: 'Upland Acres',
        wetlandTrees: 'Wetland Trees',
        uplandTrees: 'Upland Trees',
        quizScorePreConsultation: 'Quiz Score - Pre-consult',
        quizScorePostPlanting: 'Quiz Score - Post-planting',
        initialMap: 'Initial Map',
        draftMap: 'Draft Map',
        finalMap: 'Final Map',
        replantingMap: 'Replanting Map',
        otherAttachments: 'Other Attachments',
        activeCarbonShapefiles: 'Active Carbon Shapefiles',
        plantingPhotos: 'Planting Photos',
        propertyImages: 'Landowner Photo Submissions',
        participationStatus: 'Participation status',
        carbonDocs: 'Carbon docs (notarized)',
        postPlantingReports: 'Post-Planting Reports',
    },
    // Input: Airtable Field Name or ID -> Output: API Key
    airtableToApi: {
        'UniqueID': 'uniqueId', // Primary key, good to have
        'Owner Last Name or Site Name': 'ownerDisplayName',
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
        'Wetland Acres': 'wetlandAcres',
        'Upland Acres': 'uplandAcres',
        'Total Acres': 'totalAcres',
        'Wetland Trees': 'wetlandTrees',
        'Upland Trees': 'uplandTrees',
        'Total Trees': 'totalTrees',
        'Primary Phone Number': 'phone',
        'Email': 'email',
        'Initial Map': 'initialMapUrl',
        'Draft Map': 'draftMapUrl',
        'Final Map': 'finalMapUrl',
        'Replanting Map': 'replantingMapUrl',
        'Other Attachments': 'otherAttachments',
        'Active Carbon Shapefiles': 'activeCarbonShapefiles',
        'Planting Photos': 'plantingPhotoUrls',
        'Before Photos': 'beforePhotoUrls',
        'Landowner Photo Submissions': 'propertyImageUrls',
        'Land Region': 'landRegion',
        'Contact Date': 'contactDate',
        'Consultation Date': 'consultationDate',
        'Flagging Date': 'flaggingDate',
        'Site Number': 'siteNumber',
        'Participation status': 'participationStatus',
        'Quiz Score - Pre-consult': 'quizScorePreConsultation',
        'Quiz Score - Post-planting': 'quizScorePostPlanting',
        'Carbon docs (notarized)': 'carbonDocs',
        'Post-Planting Reports': 'postPlantingReports',
    }
};

const DOCUMENT_FIELD_MAP = {
    carbonDocs: FIELD_MAP.apiToAirtable.carbonDocs || 'Carbon docs (notarized)',
    draftMap: FIELD_MAP.apiToAirtable.draftMap || 'Draft Map',
    finalMap: FIELD_MAP.apiToAirtable.finalMap || 'Final Map',
    replantingMap: FIELD_MAP.apiToAirtable.replantingMap || 'Replanting Map',
    otherAttachments: FIELD_MAP.apiToAirtable.otherAttachments || 'Other Attachments',
    postPlantingReports: FIELD_MAP.apiToAirtable.postPlantingReports || 'Post-Planting Reports',
    plantingPhotoUrls: FIELD_MAP.apiToAirtable.plantingPhotoUrls || 'Planting Photos',
    beforePhotoUrls: FIELD_MAP.apiToAirtable.beforePhotoUrls || 'Before Photos',
    propertyImageUrls: FIELD_MAP.apiToAirtable.propertyImageUrls || 'Landowner Photo Submissions',
    activeCarbonShapefiles: FIELD_MAP.apiToAirtable.activeCarbonShapefiles || 'Active Carbon Shapefiles',
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
                // Multi-image fields: always return as array
                if (['plantingPhotoUrls', 'beforePhotoUrls', 'propertyImageUrls', 'activeCarbonShapefiles'].includes(apiKey)) {
                    processed[apiKey] = value.map(att => att.url);
                } else if (value.length === 1) {
                    // Single attachment fields: return just the URL
                    processed[apiKey] = value[0].url;
                } else {
                    // Multiple attachments in a non-multi field: return array of URLs
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


const SEASON_FIELD_NAME = FIELD_MAP.apiToAirtable.season || 'Season';

const createServiceError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const escapeFormulaValue = (value = '') =>
    String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const buildSeasonFilterFormula = (seasonName) =>
    `{${SEASON_FIELD_NAME}} = "${escapeFormulaValue(seasonName)}"`;


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


// --- Update Project ---
const updateProject = async (recordId, projectData) => {
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

        // Basic validation - ensure we're not updating critical fields that shouldn't change
        if (Object.keys(airtableRecordData).length === 0) {
            throw new Error("No valid fields provided to update.");
        }

        console.log(`Updating Airtable record ${recordId} with data:`, airtableRecordData);

        // 2. Use the Airtable client to update the record
        const updatedRecords = await table.update([
            {
                id: recordId,
                fields: airtableRecordData
            }
        ], { typecast: true });

        if (!updatedRecords || updatedRecords.length === 0) {
            throw new Error('Record update failed, no record returned.');
        }

        console.log(`Successfully updated record ID: ${updatedRecords[0].id}`);
        // 3. Return the updated record (processed)
        return processRecord(updatedRecords[0]);

    } catch (error) {
        console.error(`Error updating project ${recordId}:`, error);
        const errMsg = error.message || 'Failed to update project.';
        if (errMsg.includes('UNKNOWN_FIELD_NAME')) {
            throw new Error(`Failed to update project: Invalid field name provided. Check FIELD_MAP. ${errMsg}`);
        }
        if (errMsg.includes('INVALID_VALUE_FOR_COLUMN')) {
            throw new Error(`Failed to update project: Invalid value for a field. ${errMsg}`);
        }
        if (errMsg.includes('NOT_FOUND')) {
            throw new Error(`Failed to update project: Record not found. ${errMsg}`);
        }
        throw new Error(`Failed to update project: ${errMsg}`);
    }
};


const normalizeSeasonName = (value = '') => {
    const dashed = String(value ?? '')
        .trim()
        .replace(/\s*-\s*/g, '-') // enforce simple hyphen only
        .replace(/\s+/g, ' '); // collapse internal whitespace
    return dashed.toLowerCase();
};

const deleteSeasonOption = async (seasonName) => {
    const trimmedSeason = String(seasonName || '').trim();
    if (!trimmedSeason) {
        throw createServiceError('Season name is required to delete option.', 400);
    }

    console.log(`Attempting to delete season option '${trimmedSeason}'`);

    let existingRecords = [];
    try {
        const ownerNameField = FIELD_MAP.apiToAirtable.ownerLastName || 'Owner Last Name or Site Name';
        const seasonFormula = buildSeasonFilterFormula(trimmedSeason);
        // Exclude dummy records from the count
        const filterFormula = `AND(${seasonFormula}, {${ownerNameField}} != '--- SEASON DUMMY RECORD ---')`;
        
        existingRecords = await table.select({
            maxRecords: 1,
            filterByFormula: filterFormula,
            fields: ['UniqueID'],
        }).firstPage();
    } catch (error) {
        console.error(`Error verifying existing projects for season '${trimmedSeason}':`, error);
        throw createServiceError(
            `Failed to verify projects for season '${trimmedSeason}': ${error.message}`,
            500
        );
    }

    if (Array.isArray(existingRecords) && existingRecords.length > 0) {
        throw createServiceError(
            `Cannot delete season '${trimmedSeason}' because it still has projects. Please reassign or delete those projects first.`,
            409
        );
    }

    let targetTable;
    let seasonField;
    try {
        console.log(`Fetching metadata to locate season options...`);
        const response = await metadataApi.get(`/tables`);
        const tablesData = response?.data?.tables ?? [];

        targetTable = tablesData.find(t => t.id === AIRTABLE_TABLE_ID) ||
            tablesData.find(t => t.name === "Application, status, and GIS data");

        if (!targetTable) {
            throw createServiceError(
                `Table with ID ${AIRTABLE_TABLE_ID} or name 'Application, status, and GIS data' not found in metadata.`,
                500
            );
        }

        seasonField = targetTable.fields.find(f => f.id === AIRTABLE_SEASON_FIELD_ID || f.name === SEASON_FIELD_NAME);
        if (!seasonField) {
            throw createServiceError(
                `'Season' field (ID: ${AIRTABLE_SEASON_FIELD_ID} or name '${SEASON_FIELD_NAME}') not found in table ${targetTable.id}.`,
                500
            );
        }
        console.log(`Season field metadata:`, JSON.stringify(seasonField.options, null, 2));
    } catch (error) {
        if (error.statusCode) {
            throw error;
        }
        console.error(`Error fetching metadata for season deletion '${trimmedSeason}':`, error.response?.data || error.message);
        throw createServiceError(
            `Failed to fetch Airtable metadata for season deletion: ${error.message}`,
            500
        );
    }

    const existingChoices = seasonField.options?.choices ?? [];
    const normalizedTargetName = normalizeSeasonName(trimmedSeason);
    const targetChoice = existingChoices.find(choice => normalizeSeasonName(choice?.name) === normalizedTargetName);

    if (!targetChoice) {
        throw createServiceError(
            `Season option '${trimmedSeason}' does not exist in Airtable.`,
            404
        );
    }

    const originalChoices = Array.isArray(seasonField.options?.choices)
        ? seasonField.options.choices
        : [];

    // Deep clone the entire options object so we preserve Airtable-specific flags.
    const updatedOptions = JSON.parse(JSON.stringify(seasonField.options || {}));

    // Remove the target choice while preserving id/name/color/icon/etc.
    updatedOptions.choices = originalChoices
        .filter(choice => choice.id !== targetChoice.id)
        .map(choice => ({ ...choice }));

    if (updatedOptions.choices.length !== originalChoices.length - 1) {
        throw createServiceError(
            `Failed to prepare updated options for season '${trimmedSeason}'.`,
            500
        );
    }

    // Remove the choice from choiceOrder if Airtable has it defined.
    if (Array.isArray(updatedOptions.choiceOrder)) {
        updatedOptions.choiceOrder = updatedOptions.choiceOrder.filter(choiceId => choiceId !== targetChoice.id);
        if (!updatedOptions.choiceOrder.length) {
            delete updatedOptions.choiceOrder;
        }
    }

    console.log(
        `Updated season options payload (removing '${trimmedSeason}'):`,
        JSON.stringify(updatedOptions, null, 2)
    );

    try {
        const metadataPayload = {
            name: seasonField.name,
            type: seasonField.type,
            description: seasonField.description ?? undefined,
            options: updatedOptions,
        };
        console.log('Metadata PATCH payload:', JSON.stringify({ fields: [metadataPayload] }, null, 2));
        await metadataApi.patch(`/tables/${targetTable.id}`, {
            fields: [
                {
                    id: seasonField.id,
                    ...metadataPayload,
                },
            ],
        });

        console.log(`Season option '${trimmedSeason}' removed from Airtable.`);
        return {
            success: true,
            season: trimmedSeason,
            message: `Season option '${trimmedSeason}' removed from Airtable.`,
        };
    } catch (error) {
        const responseData = error.response?.data;
        console.error(`Error removing season option '${trimmedSeason}':`, responseData || error.message);
        const responseMessage =
            responseData?.message ||
            responseData?.error?.message ||
            responseData?.error?.type;
        const detailedMessage = responseMessage
            ? `${responseMessage} | full payload: ${JSON.stringify(responseData)}`
            : error.message;
        throw createServiceError(
            `Failed to delete season option '${trimmedSeason}': ${detailedMessage}`,
            error.response?.status || 500
        );
    }
};

const attachDocumentToProject = async (recordId, documentType, attachment) => {
    const fieldName = await resolveAttachmentFieldName(documentType);
    const apiKeyForField = FIELD_MAP.airtableToApi[fieldName] || documentType;
    if (!attachment?.url) {
        throw createServiceError('Attachment URL is required.', 400);
    }

    try {
        const isLikelyLargeDoc = /pdf|doc|xls|ppt|zip|shp/i.test(
            String(attachment?.contentType || attachment?.filename || '')
        );
        const hostWaitMs = Number(
            process.env.AIRTABLE_ATTACHMENT_HOST_WAIT_MS ||
            (isLikelyLargeDoc ? 20000 : 12000)
        );
        const shouldAppend =
            documentType === 'plantingPhotoUrls' ||
            documentType === 'beforePhotoUrls' ||
            documentType === 'propertyImageUrls';

        let existingAttachments = [];
        if (shouldAppend) {
            try {
                const currentRecord = await table.find(recordId);
                const currentFieldValue = currentRecord?.get(fieldName);
                if (Array.isArray(currentFieldValue)) {
                    existingAttachments = currentFieldValue
                        .filter(att => att?.id)
                        .map(att => ({ id: att.id }));
                }
            } catch (lookupError) {
                throw createServiceError(
                    lookupError?.message || `Failed to read existing attachments for '${fieldName}'.`,
                    lookupError?.statusCode || 500
                );
            }
        }

        const attachmentPayload = shouldAppend
            ? [
                ...existingAttachments,
                {
                    url: attachment.url,
                    filename: attachment.filename,
                },
            ]
            : [
                {
                    url: attachment.url,
                    filename: attachment.filename,
                },
            ];

        const updatePayload = [{
            id: recordId,
            fields: {
                [fieldName]: attachmentPayload,
            },
        }];

        const updatedRecords = await table.update(updatePayload, { typecast: true });
        if (!updatedRecords || updatedRecords.length === 0) {
            throw new Error('Record update failed, no record returned.');
        }
        const updatedRecord = updatedRecords[0];

        // For single-file fields, wait briefly for Airtable to host the attachment and return the CDN URL.
        if (!shouldAppend) {
            const delayMs = isLikelyLargeDoc ? 1500 : 1000;
            const maxAttempts = Math.max(1, Math.ceil(hostWaitMs / delayMs));
            const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const fieldValue = updatedRecord.get(fieldName);
                const firstAttachment = Array.isArray(fieldValue) ? fieldValue[0] : null;
                const url = firstAttachment?.url;
                if (url && url.includes('airtableusercontent.com')) {
                    break;
                }
                await wait(delayMs);
                const latest = await table.find(recordId);
                updatedRecord.fields = latest.fields;
            }
            if (maxAttempts > 1) {
                console.log(
                    `Attachment host wait complete for ${recordId}/${fieldName} after ${maxAttempts} attempt(s)`
                );
            }
        }

        const fieldValue = updatedRecord.get(fieldName);
        const firstAttachment = Array.isArray(fieldValue) ? fieldValue[0] : null;
        const attachmentUrl = firstAttachment?.url || null;
        const hosted = Boolean(attachmentUrl && attachmentUrl.includes('airtableusercontent.com'));
        const processedProject = processRecord(updatedRecord);

        return {
            project: processedProject,
            apiKey: apiKeyForField,
            attachmentUrl,
            hosted,
        };
    } catch (error) {
        console.error(`Error attaching document (${documentType}) to record ${recordId}:`, error);

        if (error.statusCode) {
            throw error;
        }
        throw createServiceError(error.message || 'Failed to attach document to project.');
    }
};

const detachDocumentFromProject = async (recordId, documentType) => {
    const fieldName = await resolveAttachmentFieldName(documentType);
    try {
        const updatePayload = [{
            id: recordId,
            fields: {
                [fieldName]: [],
            },
        }];

        const updatedRecords = await table.update(updatePayload, { typecast: true });
        if (!updatedRecords || updatedRecords.length === 0) {
            throw new Error('Record update failed, no record returned.');
        }
        return processRecord(updatedRecords[0]);
    } catch (error) {
        console.error(`Error removing document (${documentType}) from record ${recordId}:`, error);
        if (error.statusCode) {
            throw error;
        }
        throw createServiceError(error.message || 'Failed to remove document from project.');
    }
};


// --- Exports ---
module.exports = {
    getAllSeasons,
    getProjectsBySeason,
    getProjectDetails,
    addSeasonOption, // Export the new workaround function
    addProject,
    updateProject,
    deleteSeasonOption,
    attachDocumentToProject,
    detachDocumentFromProject,
};
