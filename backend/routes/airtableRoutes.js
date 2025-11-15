// routes/airtableRoutes.js
const express = require('express');
const router = express.Router();
const airtableController = require('../controllers/airtableController');

// GET all available seasons (options from the 'Season' field)
// Corresponds to: GetAllSeason()
router.get('/seasons', airtableController.handleGetAllSeasons);

// POST a new season option (adds choice to 'Season' field)
// Corresponds to: AddNewFolder("24-25") - *Note: Modifies schema*
router.post('/seasons', airtableController.handleAddSeason);

// DELETE an existing season option (removes choice from 'Season' field)
// Corresponds to: DeleteFolder("24-25")
router.delete('/seasons/:seasonId', airtableController.handleDeleteSeason);

// GET projects filtered by a specific season
// Corresponds to: GetProjectsForSeason("24-25")
router.get('/projects/season/:season', airtableController.handleGetProjectsBySeason);

// GET detailed information for a specific project by its Airtable Record ID
// Corresponds to: GetLandownerInformation(), GetProjectStatus() (combined)
router.get('/projects/details/:recordId', airtableController.handleGetProjectDetails);

// POST a new project (creates a new record in Airtable)
// Corresponds to: AddNewProject(...)
router.post('/projects', airtableController.handleAddProject);

// PATCH an existing project (updates a record in Airtable by its Record ID)
// Corresponds to: UpdateProject(recordId, projectData)
router.patch('/projects/:recordId', airtableController.handleUpdateProject);

// Upload/replace a project document (attachments)
router.post('/projects/:recordId/documents', airtableController.handleUploadProjectDocument);

module.exports = router;
