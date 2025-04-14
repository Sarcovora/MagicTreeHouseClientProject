// controllers/airtableController.js
const airtableService = require('../services/airtableService');

// Helper for handling async route errors
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next); // Pass errors to global handler
};

const handleGetAllSeasons = asyncHandler(async (req, res) => {
    const seasons = await airtableService.getAllSeasons();
    res.json(seasons);
});

const handleGetProjectsBySeason = asyncHandler(async (req, res) => {
    const { season } = req.params;
    if (!season) {
        return res.status(400).json({ message: 'Season parameter is required.' });
    }
    // Basic sanitization/validation could go here
    const encodedSeason = decodeURIComponent(season); // Handle URL encoding like %20 if needed
    const projects = await airtableService.getProjectsBySeason(encodedSeason);
    res.json(projects);
});

const handleGetProjectDetails = asyncHandler(async (req, res, next) => {
    const { recordId } = req.params;
    if (!recordId) {
        return res.status(400).json({ message: 'Record ID parameter is required.' });
    }
    try {
        const projectDetails = await airtableService.getProjectDetails(recordId);
        if (!projectDetails) {
            // This case might be handled by the service throwing an error now
            return res.status(404).json({ message: 'Project not found.' });
        }
        res.json(projectDetails);
    } catch (error) {
        // Catch specific 'Project not found' error from service
        if (error.message === 'Project not found.') {
            return res.status(404).json({ message: 'Project not found.' });
        }
        next(error); // Pass other errors to global handler
    }
});

//const handleAddSeason = asyncHandler(async (req, res) => {
//    const { seasonName } = req.body;
//    if (!seasonName || typeof seasonName !== 'string' || seasonName.trim() === '') {
//        return res.status(400).json({ message: 'Valid seasonName (string) is required in the request body.' });
//    }
//    const result = await airtableService.addSeasonOption(seasonName.trim());
//     // Check if the service indicated it already exists
//     if (result?.message?.includes('already exists')) {
//        return res.status(200).json(result); // Or maybe 409 Conflict? 200 is okay here.
//    }
//    res.status(201).json({ message: `Season option "${seasonName.trim()}" added successfully.`, details: result });
//});

const handleAddSeason = asyncHandler(async (req, res) => {
    const { seasonName } = req.body;
    if (!seasonName || typeof seasonName !== 'string' || seasonName.trim() === '') {
        return res.status(400).json({ message: 'Valid seasonName (string) is required in the request body.' });
    }
    try {
        const result = await airtableService.addSeasonOption(seasonName.trim());
        // Success is now indicated by the message, not checking for existing
        res.status(200).json(result); // Send the success message from the service
    } catch (error) {
        // Catch specific errors if needed, otherwise let the global handler manage
        console.error(`Controller error adding season '${seasonName}':`, error.message);
        // Send a generic error or pass to global handler
        res.status(500).json({ message: error.message || 'Failed to process season addition request.' });
        // Or just use next(error);
    }
});

const handleAddProject = asyncHandler(async (req, res) => {
    const projectData = req.body;

    // Basic validation (can be more sophisticated)
    if (!projectData || typeof projectData !== 'object' || Object.keys(projectData).length === 0) {
        return res.status(400).json({ message: 'Project data is required in the request body.' });
    }
    // You might add more specific checks here based on required fields from FIELD_MAP.apiToAirtable

    const newProject = await airtableService.addProject(projectData);
    res.status(201).json(newProject); // Respond with the newly created project data
});

module.exports = {
    handleGetAllSeasons,
    handleGetProjectsBySeason,
    handleGetProjectDetails,
    handleAddSeason,
    handleAddProject,
};
